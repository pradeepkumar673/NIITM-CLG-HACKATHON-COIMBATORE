from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator

class Rule(BaseModel):
    id: str = Field(..., description="Unique identifier for the rule")
    title: str = Field(..., description="Short title of the rule")
    trigger: str = Field(..., description="Boolean expression over findings and history flags")
    statement_template: str = Field(..., description="Neutral decision-support wording")
    quantity: Optional[str] = Field(None, description="The exact figure reported")
    source: str = Field(..., description="Full citation, DOI, URL, access date, section")
    evidence_quality: str = Field(..., description="e.g. meta-analysis, cohort, guideline")
    triage_level: Literal["routine", "soon", "urgent"] = Field(..., description="Triage level")
    follow_up_suggestions: str = Field(..., description="Generic suggestions for clinician")
    review_status: Literal["draft", "reviewed"] = Field(..., description="Status of clinical review")
    reviewed_by: Optional[str] = Field(None, description="Name of reviewing clinician")

    @field_validator('source')
    @classmethod
    def check_source_contains_doi_or_url(cls, v):
        if "doi:" not in v.lower() and "http" not in v.lower():
            raise ValueError("source must contain a DOI or URL")
        return v

    @field_validator('review_status')
    @classmethod
    def check_review_status_is_valid(cls, v):
        if v not in ['draft', 'reviewed']:
            raise ValueError("review_status must be draft or reviewed")
        return v

class RuleList(BaseModel):
    rules: List[Rule]
