"""SQLAlchemy 2.x models."""
from __future__ import annotations

import enum
from datetime import datetime, timezone

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class UserRole(str, enum.Enum):
    health_worker = "health_worker"
    doctor = "doctor"
    admin = "admin"


class StudyStatus(str, enum.Enum):
    uploaded = "uploaded"
    rejected = "rejected"
    processing = "processing"
    done = "done"
    failed = "failed"


class BodyPart(str, enum.Enum):
    chest = "chest"
    bone = "bone"
    knee = "knee"
    unknown = "unknown"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"), nullable=False
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    studies: Mapped[list["Study"]] = relationship("Study", back_populates="uploader")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="doctor")
    audit_logs: Mapped[list["AuditLog"]] = relationship("AuditLog", back_populates="user")


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    # No names, no phone numbers (R1/R10)
    external_ref: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sex: Mapped[str | None] = mapped_column(String(8), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    studies: Mapped[list["Study"]] = relationship("Study", back_populates="patient")


class Study(Base):
    __tablename__ = "studies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    patient_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("patients.id"), nullable=True
    )
    uploaded_by: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    body_part: Mapped[BodyPart] = mapped_column(
        Enum(BodyPart, name="body_part"), default=BodyPart.unknown, nullable=False
    )
    modality_hint: Mapped[str | None] = mapped_column(String(64), nullable=True)
    image_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(512), nullable=False)
    sha256: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    quality_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    status: Mapped[StudyStatus] = mapped_column(
        Enum(StudyStatus, name="study_status"),
        default=StudyStatus.uploaded,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    patient: Mapped["Patient | None"] = relationship("Patient", back_populates="studies")
    uploader: Mapped["User"] = relationship("User", back_populates="studies")
    results: Mapped[list["Result"]] = relationship("Result", back_populates="study")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="study")
    comparisons_a: Mapped[list["Comparison"]] = relationship(
        "Comparison", foreign_keys="Comparison.study_a", back_populates="study_a_ref"
    )
    comparisons_b: Mapped[list["Comparison"]] = relationship(
        "Comparison", foreign_keys="Comparison.study_b", back_populates="study_b_ref"
    )


class Result(Base):
    __tablename__ = "results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    study_id: Mapped[int] = mapped_column(Integer, ForeignKey("studies.id"), nullable=False)
    model_versions_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    findings_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    uncertainty_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    explanation_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    interactions_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    needs_human_review: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    review_reasons_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    study: Mapped["Study"] = relationship("Study", back_populates="results")


class Comparison(Base):
    __tablename__ = "comparisons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    study_a: Mapped[int] = mapped_column(
        Integer, ForeignKey("studies.id"), nullable=False
    )
    study_b: Mapped[int] = mapped_column(
        Integer, ForeignKey("studies.id"), nullable=False
    )
    result_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    study_a_ref: Mapped["Study"] = relationship(
        "Study", foreign_keys=[study_a], back_populates="comparisons_a"
    )
    study_b_ref: Mapped["Study"] = relationship(
        "Study", foreign_keys=[study_b], back_populates="comparisons_b"
    )


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    study_id: Mapped[int] = mapped_column(Integer, ForeignKey("studies.id"), nullable=False)
    doctor_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    decision: Mapped[str] = mapped_column(String(64), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    study: Mapped["Study"] = relationship("Study", back_populates="reviews")
    doctor: Mapped["User"] = relationship("User", back_populates="reviews")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )
    action: Mapped[str] = mapped_column(String(128), nullable=False)
    entity: Mapped[str | None] = mapped_column(String(128), nullable=True)
    entity_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    ip: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    user: Mapped["User | None"] = relationship("User", back_populates="audit_logs")
