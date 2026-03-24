from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class Entity(Base):
    __tablename__ = "entities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    acronym = Column(String(50))
    nit = Column(String(20), unique=True, index=True)
    sector_id = Column(Integer, ForeignKey("sectors.id"), nullable=False)
    
    # Location
    department = Column(String(100))
    municipality = Column(String(100))
    address = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Contact
    website = Column(String(255))
    email = Column(String(100))
    phone = Column(String(20))
    
    # X-Road Status
    xroad_status = Column(String(20), default="not_connected")  # not_connected, pending, connected
    xroad_member_code = Column(String(50))
    xroad_connection_date = Column(DateTime(timezone=True))
    
    # CIO Information
    cio_name = Column(String(255))
    cio_email = Column(String(100))
    cio_phone = Column(String(20))
    
    # Metadata
    is_active = Column(Boolean, default=True)
    notes = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    sector = relationship("Sector", back_populates="entities")
    services = relationship("Service", back_populates="entity")
    maturity_assessments = relationship("MaturityAssessment", back_populates="entity")