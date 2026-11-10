from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class ActorVariables(Base):
    """Variables de análisis por actor. Escala 0-100 en cada variable."""
    __tablename__ = "actor_variables"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("actores.id"), nullable=False, unique=True)

    poder = Column(Float, default=0)              # capacidad de influir decisiones
    legitimidad = Column(Float, default=0)        # reconocimiento social / jurídico
    influencia = Column(Float, default=0)         # impacto real en decisiones
    interes = Column(Float, default=0)            # interés en decisiones públicas
    dependencia = Column(Float, default=0)        # dependencia frente a la entidad
    capacidad_movilizacion = Column(Float, default=0)  # capacidad de movilización
    posicion = Column(Float, default=0)           # posición frente a proyectos (0=oposición, 100=apoyo)
    historial_participacion = Column(Float, default=0)  # historial de participación
    riesgo_conflicto = Column(Float, default=0)   # riesgo de conflicto
    canales_relacionamiento = Column(Float, default=0)  # canales adecuados de relacionamiento
    urgencia = Column(Float, default=0, server_default="0", nullable=False)  # sensibilidad al tiempo y criticidad
    frecuencia_intentos = Column(Float, default=0, server_default="0", nullable=False)  # presión repetida del actor

    # Trazabilidad de la evaluación: quién valoró al stakeholder y cuándo.
    evaluado_por = Column(String(100), nullable=True)
    evaluado_en = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    actor = relationship("Actor", back_populates="variables")