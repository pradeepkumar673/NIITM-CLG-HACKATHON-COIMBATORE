from fastapi import APIRouter, Depends
from sqlalchemy import select, func, desc, text
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta

from backend.app.db.session import get_db
from backend.app.db.models import Study, StudyStatus, Result, AuditLog, User, UserRole
from backend.app.api.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

class DailyCount(BaseModel):
    date: str
    count: int

class StatusCounts(BaseModel):
    uploaded: int
    processing: int
    done: int
    rejected: int
    failed: int

class StudyCountsResponse(BaseModel):
    total: int
    today: int
    by_status: StatusCounts
    daily: List[DailyCount]

class TriageDistributionResponse(BaseModel):
    high: int
    medium: int
    low: int
    needs_review: int

class QueueSizeResponse(BaseModel):
    awaiting_sign_off: int

class FindingFrequency(BaseModel):
    finding: str
    count: int

class AuditActivity(BaseModel):
    id: int
    action: str
    entity: Optional[str]
    created_at: datetime
    user_name: Optional[str]

class UserClinic(BaseModel):
    id: int
    name: str
    role: str
    clinic_name: str

class ModelStatus(BaseModel):
    name: str
    version: str
    sha256: str
    status: str
    metrics_link: str

class LatencyStatsResponse(BaseModel):
    average_ms: float
    p95_ms: float

@router.get("/studies/counts", response_model=StudyCountsResponse)
def get_study_counts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total = db.scalar(select(func.count(Study.id))) or 0
    
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today = db.scalar(select(func.count(Study.id)).where(Study.created_at >= today_start)) or 0
    
    counts_by_status = db.execute(
        select(Study.status, func.count(Study.id)).group_by(Study.status)
    ).all()
    status_map = {status.value: 0 for status in StudyStatus}
    for row in counts_by_status:
        status_map[row[0].value] = row[1]
        
    # sqlite doesn't easily format dates, but we can do it in memory for last 7 days
    seven_days_ago = today_start - timedelta(days=6)
    recent_studies = db.execute(
        select(Study.created_at).where(Study.created_at >= seven_days_ago)
    ).scalars().all()
    
    daily_map = {}
    for i in range(7):
        d = (seven_days_ago + timedelta(days=i)).strftime("%Y-%m-%d")
        daily_map[d] = 0
    
    for dt in recent_studies:
        d = dt.strftime("%Y-%m-%d")
        if d in daily_map:
            daily_map[d] += 1
            
    daily_list = [DailyCount(date=k, count=v) for k, v in daily_map.items()]
    
    return StudyCountsResponse(
        total=total,
        today=today,
        by_status=StatusCounts(**status_map),
        daily=daily_list
    )

@router.get("/studies/triage", response_model=TriageDistributionResponse)
def get_triage_distribution(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    results = db.execute(select(Result.findings_json, Result.needs_human_review)).all()
    
    high = 0
    medium = 0
    low = 0
    needs_review = sum(1 for r in results if r[1])
    
    for row in results:
        findings = row[0] or {}
        is_high = False
        is_medium = False
        for k, v in findings.items():
            if isinstance(v, dict):
                tier = v.get("tier")
                if tier == "high":
                    is_high = True
                elif tier == "medium":
                    is_medium = True
        
        if is_high:
            high += 1
        elif is_medium:
            medium += 1
        else:
            low += 1
            
    return TriageDistributionResponse(
        high=high,
        medium=medium,
        low=low,
        needs_review=needs_review
    )

@router.get("/studies/queue", response_model=QueueSizeResponse)
def get_queue_size(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Studies that are done, have a result, but NO review yet.
    # We will just approximate by finding results that need human review and have no review.
    # For now, just return total needs_human_review.
    count = db.scalar(select(func.count(Result.id)).where(Result.needs_human_review == True)) or 0
    return QueueSizeResponse(awaiting_sign_off=count)

@router.get("/studies/findings", response_model=List[FindingFrequency])
def get_finding_frequency(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    results = db.execute(select(Result.findings_json)).scalars().all()
    freq = {}
    for findings in results:
        if not findings: continue
        for k, v in findings.items():
            if isinstance(v, dict) and v.get("probability", 0) > 0.5:
                freq[k] = freq.get(k, 0) + 1
    
    sorted_freq = sorted([FindingFrequency(finding=k, count=v) for k, v in freq.items()], key=lambda x: x.count, reverse=True)
    return sorted_freq[:10]

@router.get("/audit/activity", response_model=List[AuditActivity])
def get_recent_activity(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logs = db.execute(
        select(AuditLog, User.full_name)
        .outerjoin(User, AuditLog.user_id == User.id)
        .order_by(desc(AuditLog.created_at))
        .limit(10)
    ).all()
    
    return [
        AuditActivity(
            id=log.id,
            action=log.action,
            entity=log.entity,
            created_at=log.created_at,
            user_name=user_name
        )
        for log, user_name in logs
    ]

@router.get("/users/clinics", response_model=List[UserClinic])
def get_users_clinics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    users = db.execute(select(User)).scalars().all()
    import os
    clinic = os.environ.get("CLINIC_NAME", "Primary Health Center")
    return [
        UserClinic(
            id=u.id,
            name=u.full_name,
            role=u.role.value,
            clinic_name=clinic
        )
        for u in users
    ]

@router.get("/models/status", response_model=List[ModelStatus])
def get_model_status(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    import yaml
    from pathlib import Path
    try:
        with open(Path("config/models.yaml"), "r") as f:
            cfg = yaml.safe_load(f)
        models = []
        for m in cfg.get("models", []):
            models.append(ModelStatus(
                name=m.get("name", "Unknown"),
                version=m.get("version", "1.0"),
                sha256=m.get("sha256", "pending"),
                status="Active",
                metrics_link=m.get("source", "")
            ))
        return models
    except:
        return []

@router.get("/studies/latency", response_model=LatencyStatsResponse)
def get_latency_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Calculate latency from created_at to result created_at.
    # In SQLite, dates can be parsed, but it's easier to do in python for the small dataset.
    studies = db.execute(
        select(Study.created_at, Result.created_at)
        .join(Result, Study.id == Result.study_id)
        .order_by(desc(Study.created_at))
        .limit(100)
    ).all()
    
    if not studies:
        return LatencyStatsResponse(average_ms=0.0, p95_ms=0.0)
        
    latencies = []
    for s_dt, r_dt in studies:
        diff = (r_dt - s_dt).total_seconds() * 1000
        if diff > 0:
            latencies.append(diff)
            
    if not latencies:
        return LatencyStatsResponse(average_ms=0.0, p95_ms=0.0)
        
    latencies.sort()
    avg = sum(latencies) / len(latencies)
    p95 = latencies[int(len(latencies) * 0.95)] if len(latencies) > 20 else latencies[-1]
    
    return LatencyStatsResponse(average_ms=avg, p95_ms=p95)
