from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Relationship(Base):
    __tablename__ = "relationships"
    
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("entities.id"), nullable=False)
    target_id = Column(Integer, ForeignKey("entities.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=True)
    description = Column(String(255), nullable=True)
    protocol = Column(String(50), default="X-Road") # X-Road, REST, SOAP, Manual
    status = Column(String(20), default="active") # active, inactive, pending
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    source = relationship("Entity", foreign_keys=[source_id])
    target = relationship("Entity", foreign_keys=[target_id])
    service = relationship("Service", foreign_keys=[service_id])
