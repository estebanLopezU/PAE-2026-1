from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class Relacionamiento(Base):
    """Interacciones y relacionamiento con actores."""
    __tablename__ = "relacionamientos"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("actores.id"), nullable=False)
    tipo = Column(String(50), nullable=False)  # reunion, consulta, delegacion, acuerdo, participacion
    descripcion = Column(Text)
    resultado = Column(Text)
    fecha = Column(DateTime(timezone=True), server_default=func.now())
    registrado_por = Column(String(100))

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    actor = relationship("Actor", back_populates="relacionamientos")