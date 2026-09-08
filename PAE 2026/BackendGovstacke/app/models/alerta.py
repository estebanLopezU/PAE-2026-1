from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class Alerta(Base):
    """Alertas relacionales: cambios de posición, tensiones, riesgos de conflicto, vencimientos."""
    __tablename__ = "alertas"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("actores.id"), nullable=False)
    tipo = Column(String(50), nullable=False)  # cambio_posicion, tension, riesgo_conflicto, vencimiento
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text)
    nivel = Column(String(20), default="warning")  # info, warning, critical
    leida = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    actor = relationship("Actor", back_populates="alertas")