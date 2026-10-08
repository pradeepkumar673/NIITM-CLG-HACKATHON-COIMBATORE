from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks, Query
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import select, desc, or_, func, String
from typing import List, Optional
import os
from pathlib import Path
import json
import asyncio
from datetime import datetime, date

from backend.app.db.session import get_db
from backend.app.db.models import Study, User, BodyPart, StudyStatus, Review, Patient, Result
from backend.app.api.auth import get_current_user
from backend.app.services.pipeline import run_analysis_task, subscribe_events
from backend.app.services.longitudinal.engine import LongitudinalEngine

router = APIRouter(prefix="/studies", tags=["studies"])

STORAGE_DIR = Path("data/storage")
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

from pydantic import BaseModel

class StudyListItem(BaseModel):
    id: int
    patient_ext_ref: Optional[str]
    patient_age: Optional[int]
    patient_sex: Optional[str]
    body_part: str
    modality_hint: Optional[str]
    status: str
    created_at: datetime
    needs_human_review: bool
    findings: Optional[dict]
    review_reasons: Optional[dict]

class StudyListResponse(BaseModel):
    items: List[StudyListItem]
    total: int
    page: int
    size: int

@router.get("", response_model=StudyListResponse)
def list_studies(
    page: int = 1,
    size: int = 50,
    status: Optional[str] = None,
    body_part: Optional[str] = None,
    tier: Optional[str] = None,
    date_filter: Optional[date] = Query(None, alias="date"),
    search: Optional[str] = None,
    patient_id: Optional[int] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    query = select(Study, Patient, Result).outerjoin(Patient, Study.patient_id == Patient.id).outerjoin(Result, Study.id == Result.study_id)
    
    if status and status != "all":
        query = query.where(Study.status == StudyStatus(status))
    if body_part and body_part != "all":
        query = query.where(Study.body_part == BodyPart(body_part))
    if search:
        query = query.where(or_(
            Study.id.cast(String).ilike(f"%{search}%"),
            Patient.external_ref.ilike(f"%{search}%")
        ))
    if date_filter:
        query = query.where(func.date(Study.created_at) == date_filter)
    if patient_id:
        query = query.where(Study.patient_id == patient_id)

    # Sort by created_at desc
    query = query.order_by(desc(Study.created_at))

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    results = db.execute(query.offset((page - 1) * size).limit(size)).all()

    items = []
    for study, patient, result in results:
        findings = result.findings_json if result else None
        
        # If tier filter is applied, skip if not matching
        if tier and tier != "all" and findings:
            is_tier1 = any(isinstance(v, dict) and v.get("tier") == "high" for v in findings.values())
            is_tier2 = any(isinstance(v, dict) and v.get("tier") == "medium" for v in findings.values())
            is_tier3 = not is_tier1 and not is_tier2
            if tier == "tier1" and not is_tier1: continue
            if tier == "tier2" and not is_tier2: continue
            if tier == "tier3" and not is_tier3: continue

        items.append(StudyListItem(
            id=study.id,
            patient_ext_ref=patient.external_ref if patient else None,
            patient_age=patient.age if patient else None,
            patient_sex=patient.sex if patient else None,
            body_part=study.body_part.value,
            modality_hint=study.modality_hint,
            status=study.status.value,
            created_at=study.created_at,
            needs_human_review=result.needs_human_review if result else False,
            findings=findings,
            review_reasons=result.review_reasons_json if result else None
        ))
        
    # Python-level sort for triage (tier 1 > tier 2 > tier 3) then needs_human_review
    def sort_key(item):
        tier_val = 3
        if item.findings:
            if any(isinstance(v, dict) and v.get("tier") == "high" for v in item.findings.values()):
                tier_val = 1
            elif any(isinstance(v, dict) and v.get("tier") == "medium" for v in item.findings.values()):
                tier_val = 2
        return (tier_val, 0 if item.needs_human_review else 1, -item.created_at.timestamp())
        
    items.sort(key=sort_key)

    return StudyListResponse(items=items, total=total, page=page, size=size)

@router.post("")
async def create_study(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    body_part: Optional[str] = Form(None),
    age: Optional[int] = Form(None),
    sex: Optional[str] = Form(None),
    history_flags: Optional[str] = Form("{}"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    flags = json.loads(history_flags)
    
    # Save file
    safe_name = file.filename.replace(" ", "_")
    image_path = STORAGE_DIR / safe_name
    with open(image_path, "wb") as f:
        f.write(await file.read())
        
    from PIL import Image
    from backend.app.services.gate.gatekeeper import evaluate_gate
    
    img = Image.open(image_path)
    gate_res = evaluate_gate(img)
    
    study = Study(
        uploaded_by=user.id,
        original_filename=file.filename,
        image_path=str(image_path),
        sha256="dummy_sha" # simplified for now
    )
    
    if gate_res["action"] == "reject":
        study.status = StudyStatus.rejected
        study.quality_json = {"reasons": gate_res["reasons"]}
        db.add(study)
        db.commit()
        return JSONResponse(status_code=422, content={"detail": "Image rejected by quality gate", "reasons": gate_res["reasons"]})
        
    bp = BodyPart.unknown
    if body_part and body_part in [e.value for e in BodyPart]:
        bp = BodyPart(body_part)
    elif gate_res["body_part_guess"] != "unknown":
        bp = BodyPart(gate_res["body_part_guess"])
        
    if bp == BodyPart.unknown:
        return JSONResponse(status_code=422, content={"detail": "Could not determine body part. Please specify."})
        
    study.body_part = bp
    study.status = StudyStatus.uploaded
    study.quality_json = {"passed": True}
    db.add(study)
    db.commit()
    db.refresh(study)
    
    # Queue analysis
    background_tasks.add_task(run_analysis_task, study.id, flags, age, sex)
    
    return {"id": study.id, "status": study.status, "body_part": study.body_part}

@router.get("/{id}/events")
async def study_events(id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # Check if already completed to avoid race condition
    study = db.query(Study).filter(Study.id == id).first()
    if not study:
        raise HTTPException(404)
        
    async def event_generator():
        if study.status == StudyStatus.completed:
            yield f"data: {json.dumps({'event': 'complete'})}\n\n"
            await asyncio.sleep(0.1)
            return
            
        queue = subscribe_events(id)
        try:
            while True:
                msg = await queue.get()
                if msg.get("event") == "close":
                    yield f"data: {json.dumps({'event': 'complete'})}\n\n"
                    await asyncio.sleep(0.1)
                    break
                yield f"data: {json.dumps(msg)}\n\n"
        except asyncio.CancelledError:
            pass
    return StreamingResponse(
        event_generator(), 
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    )

@router.get("/{id}/result")
def get_study_result(id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    study = db.query(Study).filter(Study.id == id).first()
    if not study:
        raise HTTPException(404, "Study not found")
    
    patient = db.query(Patient).filter(Patient.id == study.patient_id).first() if study.patient_id else None
    res = db.query(Result).filter(Result.study_id == id).first()
    reviews = db.query(Review).filter(Review.study_id == id).all()
    
    return {
        "study": {
            "id": study.id,
            "body_part": study.body_part.value,
            "modality_hint": study.modality_hint,
            "status": study.status.value,
            "created_at": study.created_at,
            "sha256": study.sha256
        },
        "patient": {
            "id": patient.id if patient else None,
            "external_ref": patient.external_ref if patient else None,
            "age": patient.age if patient else None,
            "sex": patient.sex if patient else None
        } if patient else None,
        "result": {
            "findings": res.findings_json if res else None,
            "interactions": res.interactions_json if res else None,
            "review_reasons": res.review_reasons_json if res else None,
            "needs_human_review": res.needs_human_review if res else False,
            "model_versions": res.model_versions_json if res else None
        } if res else None,
        "reviews": [
            {
                "id": r.id,
                "decision": r.decision,
                "notes": r.notes,
                "created_at": r.created_at,
                "doctor_id": r.doctor_id
            } for r in reviews
        ]
    }

@router.post("/{id}/compare/{other_id}")
def compare_studies(id: int, other_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    study_a = db.query(Study).filter(Study.id == id).first()
    study_b = db.query(Study).filter(Study.id == other_id).first()
    if not study_a or not study_b:
        raise HTTPException(404)
        
    engine = LongitudinalEngine()
    import cv2
    img_a = cv2.imread(study_a.image_path, cv2.IMREAD_GRAYSCALE)
    img_b = cv2.imread(study_b.image_path, cv2.IMREAD_GRAYSCALE)
    
    from backend.app.services.longitudinal.engine import register_images
    H, ncc = register_images(img_a, img_b, engine.config)
    mismatch = engine.check_mismatch(ncc)
    
    return {"mismatch": bool(mismatch), "ncc": float(ncc)}

@router.get("/{id}/image.png")
def get_study_image(id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    study = db.query(Study).filter(Study.id == id).first()
    if not study:
        raise HTTPException(404)
    if study.uploaded_by != user.id and user.role not in ["admin", "doctor"]:
        raise HTTPException(403)
    return FileResponse(study.image_path)

@router.get("/{id}/heatmap_{label}.png")
def get_heatmap(id: int, label: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    study = db.query(Study).filter(Study.id == id).first()
    if not study:
        raise HTTPException(404)
    if study.uploaded_by != user.id and user.role not in ["admin", "doctor"]:
        raise HTTPException(403)
    
    hm_path = Path(study.image_path).parent / f"study_{study.id}_heatmaps" / f"heatmap_{label}.png"
    if not hm_path.exists():
        raise HTTPException(404)
    return FileResponse(str(hm_path))

from pydantic import BaseModel
class ReviewRequest(BaseModel):
    decision: str
    notes: Optional[str] = None

@router.post("/{id}/review")
def review_study(id: int, req: ReviewRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    study = db.query(Study).filter(Study.id == id).first()
    if not study:
        raise HTTPException(404)
    if study.uploaded_by != user.id and user.role not in ["admin", "doctor"]:
        raise HTTPException(403)
        
    review = Review(study_id=id, doctor_id=user.id, decision=req.decision, notes=req.notes)
    db.add(review)
    
    from backend.app.db.models import AuditLog
    audit = AuditLog(user_id=user.id, action="review", entity="Study", entity_id=id)
    db.add(audit)
    db.commit()
    return {"status": "ok"}
