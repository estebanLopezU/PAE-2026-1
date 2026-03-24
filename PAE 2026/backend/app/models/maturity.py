from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class MaturityAssessment(Base):
    __tablename__ = "maturity_assessments"

    id = Column(Integer, primary_key=True, index=True)
    entity_id = Column(Integer, ForeignKey("entities.id"), nullable=False)
    
    # Overall Assessment
    overall_level = Column(Integer, nullable=False)  # 1-4
    overall_score = Column(Float, nullable=False)  # 0-100
    
    # Domain Scores (Marco MinTIC)
    legal_domain_score = Column(Float, default=0)  # Dominio Legal
    organizational_domain_score = Column(Float, default=0)  # Dominio Organizacional
    semantic_domain_score = Column(Float, default=0)  # Dominio Semántico
    technical_domain_score = Column(Float, default=0)  # Dominio Técnico
    
    # Detailed Criteria
    has_api_documentation = Column(Integer, default=0)  # 0-4
    uses_standard_protocols = Column(Integer, default=0)
    has_data_quality = Column(Integer, default=0)
    has_security_standards = Column(Integer, default=0)
    has_interoperability_policy = Column(Integer, default=0)
    has_trained_personnel = Column(Integer, default=0)
    
    # Assessment Metadata
    assessment_date = Column(DateTime(timezone=True), server_default=func.now())
    assessor_name = Column(String(255))
    assessor_notes = Column(Text)
    
    # Recommendations
    recommendations = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    entity = relationship("Entity", back_populates="maturity_assessments")