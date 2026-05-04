from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    entity_id = Column(Integer, ForeignKey("entities.id"), nullable=False)
    
    # Service Information
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True)
    description = Column(Text)
    category = Column(String(100))  # e.g., "Consulta", "Validación", "Trámite"
    
    # Technical Details
    protocol = Column(String(50), default="REST")  # REST, SOAP, X-Road
    endpoint_url = Column(String(500))
    api_version = Column(String(20))
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Standards Compliance
    data_standard = Column(String(100))  # e.g., "NTC-6195", "ISO-27001"
    semantic_standard = Column(String(100))
    security_standard = Column(String(100))
    
    # Status
    status = Column(String(20), default="active")  # active, inactive, development
    is_public = Column(Boolean, default=False)
    
    # Metadata
    documentation_url = Column(String(500))
    last_test_date = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    entity = relationship("Entity", back_populates="services")