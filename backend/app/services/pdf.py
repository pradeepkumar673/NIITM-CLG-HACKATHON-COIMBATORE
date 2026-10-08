import os
import json
from datetime import datetime
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics

from backend.app.services.i18n import get_pack, translate_finding, translate_tier, translate

FONT_DIR = os.path.join("backend", "assets", "fonts")
# Register fonts
try:
    pdfmetrics.registerFont(TTFont('NotoSans', os.path.join(FONT_DIR, 'NotoSans-Regular.ttf')))
    pdfmetrics.registerFont(TTFont('NotoSansTamil', os.path.join(FONT_DIR, 'NotoSansTamil-Regular.ttf')))
    pdfmetrics.registerFont(TTFont('NotoSansDevanagari', os.path.join(FONT_DIR, 'NotoSansDevanagari-Regular.ttf')))
    
    from reportlab.lib.fonts import addMapping
    for f in ['NotoSans', 'NotoSansTamil', 'NotoSansDevanagari']:
        addMapping(f, 0, 0, f)
        addMapping(f, 1, 0, f)
        addMapping(f, 0, 1, f)
        addMapping(f, 1, 1, f)

except Exception as e:
    print(f"Font loading error: {e}")

def get_font_name(lang):
    if lang == "ta": return "NotoSansTamil"
    if lang == "hi": return "NotoSansDevanagari"
    return "NotoSans"

def generate_pdf_report(study_data: dict, lang: str = "en") -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    story = []
    
    font_name = get_font_name(lang)
    styles = getSampleStyleSheet()
    
    # Custom styles to support unicode
    title_style = ParagraphStyle('CustomTitle', parent=styles['Title'], fontName=font_name, fontSize=18, spaceAfter=12)
    normal_style = ParagraphStyle('CustomNormal', parent=styles['Normal'], fontName=font_name, fontSize=10, spaceAfter=6)
    heading_style = ParagraphStyle('CustomHeading', parent=styles['Heading2'], fontName=font_name, fontSize=14, spaceAfter=10)
    
    pack = get_pack(lang)
    
    # Translation Status Banner if machine drafted
    if pack.get("metadata", {}).get("review_status") == "machine_drafted":
        banner_text = translate("review_banners.machine_drafted", lang)
        story.append(Paragraph(f'<font color="red">{banner_text}</font>', normal_style))
        story.append(Spacer(1, 10))
        
    # Header
    story.append(Paragraph("Study Analysis Report", title_style))
    story.append(Spacer(1, 10))
    
    # Generate Skeleton Image
    try:
        import subprocess
        import tempfile
        import json
        
        findings = study_data.get('result', {}).get('findings', {})
        findings_json = json.dumps(findings)
        
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp_path = tmp.name
            
        script_path = os.path.join("frontend", "scripts", "capture_skeleton.mjs")
        subprocess.run(["node", script_path, findings_json, tmp_path], check=True)
        
        if os.path.exists(tmp_path):
            story.append(Image(tmp_path, width=200, height=400))
            story.append(Spacer(1, 10))
    except Exception as e:
        print(f"Skeleton rendering failed: {e}")
        
    # Metadata
    study_id = study_data['study']['id']
    study_status = study_data['study']['status']
    created_at = study_data['study']['created_at'].isoformat() if hasattr(study_data['study']['created_at'], 'isoformat') else study_data['study']['created_at']
    
    meta_table = Table([
        ["Study ID", f"STU-{study_id}"],
        ["Modality", study_data['study']['body_part']],
        ["Date", created_at],
        ["Checksum (SHA256)", study_data['study']['sha256'][:16] + "..."]
    ], colWidths=[120, 300])
    meta_table.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), font_name),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('TEXTCOLOR', (0,0), (0,-1), colors.grey),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 20))
    
    # Findings
    story.append(Paragraph("Findings", heading_style))
    findings = study_data.get('result', {}).get('findings', {})
    
    if findings:
        data = [["Finding", "Probability", "95% CI", "Tier"]]
        for k, v in findings.items():
            if isinstance(v, dict):
                p = f"{v.get('probability', 0)*100:.1f}%"
                ci = f"[{v.get('ci_95', [0,0])[0]*100:.1f}% - {v.get('ci_95', [0,0])[1]*100:.1f}%]" if 'ci_95' in v else "N/A"
                t = v.get('tier_label', translate_tier(v.get('tier', 'low'), lang))
            else:
                p = f"{v*100:.1f}%"
                ci = "N/A"
                t = "N/A"
            f_name = translate_finding(k, lang)
            data.append([f_name, p, ci, t])
            
        t = Table(data, colWidths=[150, 80, 100, 80])
        t.setStyle(TableStyle([
            ('FONTNAME', (0,0), (-1,-1), font_name),
            ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (1,0), (-1,-1), 'CENTER'),
            ('GRID', (0,0), (-1,-1), 1, colors.black),
            ('FONTSIZE', (0,0), (-1,-1), 9),
        ]))
        story.append(t)
    else:
        story.append(Paragraph("No findings.", normal_style))
        
    story.append(Spacer(1, 20))
    
    # Triage and Needs Human Review
    if study_data.get('result', {}).get('needs_human_review'):
        story.append(Paragraph('<font color="red">' + translate("review_banners.needs_human_review", lang) + '</font>', heading_style))
        reasons = study_data.get('result', {}).get('review_reasons', [])
        for r in reasons:
            story.append(Paragraph(f"- {r}", normal_style))
        story.append(Spacer(1, 10))
    
    # Disclaimer
    story.append(Spacer(1, 30))
    disclaimer = translate("disclaimer", lang)
    story.append(Paragraph(f'{disclaimer}', normal_style))
    story.append(Paragraph(f'<font size="8">Generated at {datetime.now().isoformat()}</font>', normal_style))
    
    doc.build(story)
    return buffer.getvalue()
