from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from pathlib import Path
import json
import asyncio

from backend.app.db.session import get_db
from backend.app.db.models import Study, User, BodyPart, StudyStatus, Review
from backend.app.api.auth import get_current_user
from backend.app.services.pipeline import run_analysis_task, subscribe_events
from backend.app.services.longitudinal.engine import LongitudinalEngine

router = APIRouter(prefix="/studies", tags=["studies"])

STORAGE_DIR = Path("data/storage")
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

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
async def study_events(id: int, user: User = Depends(get_current_user)):
    # SSE
    queue = subscribe_events(id)
    async def event_generator():
        try:
            while True:
                msg = await queue.get()
                if msg.get("event") == "close":
                    break
                yield f"data: {json.dumps(msg)}\n\n"
        except asyncio.CancelledError:
            pass
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/{id}/result")
def get_study_result(id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    study = db.query(Study).filter(Study.id == id).first()
    if not study:
        raise HTTPException(404, "Study not found")
    if study.uploaded_by != user.id and user.role != "admin":
        raise HTTPException(403, "Not authorized")
    from backend.app.db.models import Result
    res = db.query(Result).filter(Result.study_id == id).first()
    if not res:
        return {}
    return {
        "findings": res.findings_json,
        "interactions": res.interactions_json,
        "review_reasons": res.review_reasons_json
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
