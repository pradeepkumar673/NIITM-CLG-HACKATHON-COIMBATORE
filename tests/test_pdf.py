import pytest
from backend.app.services.pdf import generate_pdf_report
from datetime import datetime
from pypdf import PdfReader
import io

@pytest.fixture
def dummy_study_data():
    return {
        "study": {
            "id": 999,
            "body_part": "chest",
            "modality_hint": "XR",
            "status": "completed",
            "created_at": datetime.now(),
            "sha256": "abcdef123456"
        },
        "patient": None,
        "result": {
            "needs_human_review": True,
            "review_reasons": ["quality_check_failed"],
            "findings": {
                "Pneumonia": {
                    "probability": 0.85,
                    "tier": "high",
                    "ci_95": [0.80, 0.90]
                }
            }
        }
    }

def extract_text_from_pdf(pdf_bytes):
    reader = PdfReader(io.BytesIO(pdf_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

def test_pdf_generation_en(dummy_study_data):
    pdf = generate_pdf_report(dummy_study_data, "en")
    assert pdf.startswith(b"%PDF")
    
    text = extract_text_from_pdf(pdf)
    assert "Pneumonia" in text
    assert "Decision support only" in text

def test_pdf_generation_ta(dummy_study_data):
    pdf = generate_pdf_report(dummy_study_data, "ta")
    assert pdf.startswith(b"%PDF")
    
    text = extract_text_from_pdf(pdf)
    assert "நிமோனியா" in text
    assert "முடிவு ஆதரவு மட்டுமே" in text

def test_pdf_generation_hi(dummy_study_data):
    pdf = generate_pdf_report(dummy_study_data, "hi")
    assert pdf.startswith(b"%PDF")
    
    text = extract_text_from_pdf(pdf)
    assert "निमोनिया" in text
    assert "निर्णय समर्थन" in text
