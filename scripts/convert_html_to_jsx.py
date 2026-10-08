import os
import re

def html_to_jsx(html_str):
    # Basic replacements
    jsx = html_str.replace('class="', 'className="')
    jsx = jsx.replace('for="', 'htmlFor="')
    jsx = jsx.replace('onclick="', 'onClick="')
    jsx = jsx.replace('onchange="', 'onChange="')
    jsx = jsx.replace('onsubmit="', 'onSubmit="')
    jsx = jsx.replace('oninput="', 'onInput="')
    jsx = jsx.replace('tabindex="', 'tabIndex="')
    jsx = jsx.replace('readonly', 'readOnly')
    jsx = jsx.replace('maxlength="', 'maxLength="')
    jsx = jsx.replace('minlength="', 'minLength="')
    jsx = jsx.replace('autocomplete="', 'autoComplete="')
    jsx = jsx.replace('autofocus', 'autoFocus')
    jsx = jsx.replace('colspan="', 'colSpan="')
    jsx = jsx.replace('rowspan="', 'rowSpan="')
    jsx = jsx.replace('datetime="', 'dateTime="')
    
    # Self close tags (void elements in HTML5)
    for tag in ['input', 'img', 'br', 'hr', 'col']:
        # Match <tag ... > but avoid <tag ... />
        pattern = re.compile(f'<{tag}\\b([^>]*?)(?<!/)>', re.IGNORECASE)
        jsx = pattern.sub(f'<{tag}\\1 />', jsx)
        
    # SVG attributes
    jsx = jsx.replace('stroke-linecap="', 'strokeLinecap="')
    jsx = jsx.replace('stroke-width="', 'strokeWidth="')
    jsx = jsx.replace('stroke-dasharray="', 'strokeDasharray="')
    jsx = jsx.replace('stroke-linejoin="', 'strokeLinejoin="')
    jsx = jsx.replace('fill-rule="', 'fillRule="')
    jsx = jsx.replace('clip-rule="', 'clipRule="')
    jsx = jsx.replace('clip-path="', 'clipPath="')
    jsx = jsx.replace('viewbox="', 'viewBox="')
    jsx = jsx.replace('xmlns:xlink="', 'xmlnsXlink="')
    jsx = jsx.replace('xml:space="', 'xmlSpace="')
    jsx = jsx.replace('radialgradient', 'radialGradient')
    jsx = jsx.replace('fegaussianblur', 'feGaussianBlur')
    jsx = jsx.replace('fecomposite', 'feComposite')
    jsx = jsx.replace('lineargradient', 'linearGradient')
    jsx = jsx.replace('patternunits="', 'patternUnits="')
    jsx = jsx.replace('markerheight="', 'markerHeight="')
    jsx = jsx.replace('markerwidth="', 'markerWidth="')
    jsx = jsx.replace('refx="', 'refX="')
    jsx = jsx.replace('refy="', 'refY="')
    jsx = jsx.replace('onmouseleave="', 'onMouseLeave="')
    jsx = jsx.replace('onmousemove="', 'onMouseMove="')
    
    # Boolean attributes
    jsx = jsx.replace('disabled=""', 'disabled')
    jsx = jsx.replace('selected=""', 'selected')
    jsx = jsx.replace('checked=""', 'checked')
    
    # Remove old inline scripts that got converted incorrectly (e.g. onmousemove="")
    jsx = re.sub(r'onMouseLeave="[^"]+"', '', jsx)
    jsx = re.sub(r'onMouseMove="[^"]+"', '', jsx)
    
    # Custom fix for style={{...}}

    def style_replacer(match):
        style_str = match.group(1)
        styles = [s.strip() for s in style_str.split(';') if s.strip()]
        obj_props = []
        for s in styles:
            parts = s.split(':')
            if len(parts) == 2:
                key = parts[0].strip()
                val = parts[1].strip()
                # camelCase key
                parts_k = key.split('-')
                cc_key = parts_k[0] + ''.join(x.capitalize() for x in parts_k[1:])
                obj_props.append(f"{cc_key}: '{val}'")
        return 'style={{' + ', '.join(obj_props) + '}}'
        
    jsx = re.sub(r'style="([^"]*)"', style_replacer, jsx)
    
    # Fix broken quotes in fontVariationSettings
    jsx = jsx.replace("''FILL' 1'", "\"'FILL' 1\"")
    
    # Remove HTML comments
    jsx = re.sub(r'<!--.*?-->', '', jsx, flags=re.DOTALL)
    
    # Remove script tags
    jsx = re.sub(r'<script.*?</script>', '', jsx, flags=re.DOTALL | re.IGNORECASE)
    
    # Wrap in Fragment to ensure single root
    jsx = f"<>\n{jsx}\n</>"
    
    return jsx

screens = [
    ('xray_assistant_my_studies_history', 'frontend/src/pages/MyStudiesHistory.tsx'),
    ('xray_assistant_doctor_review_queue', 'frontend/src/pages/DoctorReviewQueue.tsx'),
    ('xray_assistant_study_result_uncertainty_viewer', 'frontend/src/pages/StudyResult.tsx'),
    ('xray_assistant_doctor_study_review_sign_off', 'frontend/src/pages/DoctorReviewSignOff.tsx'),
    ('xray_assistant_longitudinal_comparison_fracture_healing_viewer', 'frontend/src/pages/LongitudinalComparison.tsx'),
    ('xray_assistant_model_user_management', 'frontend/src/pages/AdminDashboard.tsx')
]

for src_folder, target_file in screens:
    src_path = f"docs/stitch/{src_folder}/code.html"
    if not os.path.exists(src_path):
        continue
    
    with open(src_path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Extract <main>...</main> content or <div class="pl-60...">...
    # The actual content usually starts inside <main class="...">...
    match = re.search(r'<main[^>]*>(.*?)</main>', html, re.DOTALL)
    if not match:
        match = re.search(r'<div class="pl-60[^>]*>.*?<header[^>]*>.*?</header>(.*?)</div>', html, re.DOTALL)
    
    if match:
        inner_html = match.group(1)
        jsx_content = html_to_jsx(inner_html)
        
        # Write to a generated partial to be assembled later
        out_name = f"scratch/{src_folder}_partial.tsx"
        os.makedirs("scratch", exist_ok=True)
        with open(out_name, 'w', encoding='utf-8') as f:
            f.write(jsx_content)
        print(f"Generated {out_name}")
