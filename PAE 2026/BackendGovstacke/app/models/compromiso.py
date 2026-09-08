from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class Compromiso(Base):
    """Compromisos institucionales adquiridos con actores."""
    __tablename__ = "compromisos"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("actores.id"), nullable=False)
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text)
    estado = Column(String(30), default="pendiente")  # pendiente, en_progreso, cumplido, vencido
    prioridad = Column(String(20), default="media")   # baja, media, alta
    fecha_compromiso = Column(DateTime(timezone=True))
    fecha_vencimiento = Column(DateTime(timezone=True))
    creado_por = Column(String(100))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    actor = relationship("Actor", back_populates="compromisos")