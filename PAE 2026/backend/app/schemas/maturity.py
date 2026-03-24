from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MaturityAssessmentBase(BaseModel):
    entity_id: int
    overall_level: int
    overall_score: float
    legal_domain_score: float = 0
    organizational_domain_score: float = 0
    semantic_domain_score: float = 0
    technical_domain_score: float = 0
    has_api_documentation: int = 0
    uses_standard_protocols: int = 0
    has_data_quality: int = 0
    has_security_standards: int = 0
    has_interoperability_policy: int = 0
    has_trained_personnel: int = 0
    assessor_name: Optional[str] = None
    assessor_notes: Optional[str] = None
    recommendations: Optional[str] = None


class MaturityAssessmentCreate(MaturityAssessmentBase):
    pass


class MaturityAssessmentUpdate(BaseModel):
    overall_level: Optional[int] = None
    overall_score: Optional[float] = None
    legal_domain_score: Optional[float] = None
    organizational_domain_score: Optional[float] = None
    semantic_domain_score: Optional[float] = None
    technical_domain_score: Optional[float] = None
    has_api_documentation: Optional[int] = None
    uses_standard_protocols: Optional[int] = None
    has_data_quality: Optional[int] = None
    has_security_standards: Optional[int] = None
    has_interoperability_policy: Optional[int] = None
    has_trained_personnel: Optional[int] = None
    assessor_name: Optional[str] = None
    assessor_notes: Optional[str] = None
    recommendations: Optional[str] = None


class MaturityAssessment(MaturityAssessmentBase):
    id: int
    entity_name: Optional[str] = None
    assessment_date: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MaturityLevelInfo(BaseModel):
    level: int
    name: str
    description: str
    color: str


MATURITY_LEVELS = [
    MaturityLevelInfo(level=1, name="Inicial", description="Sin estándares definidos", color="#EF4444"),
    MaturityLevelInfo(level=2, name="Básico", description="APIs básicas, datos no estandarizados", color="#F59E0B"),
    MaturityLevelInfo(level=3, name="Intermedio", description="APIs REST, datos semiestructurados", color="#3B82F6"),
    MaturityLevelInfo(level=4, name="Avanzado", description="X-Road completo, estándares semánticos", color="#10B981"),
]