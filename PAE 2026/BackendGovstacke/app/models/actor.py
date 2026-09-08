from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class Actor(Base):
    """Grupo de interés público - entidad principal del dominio GOVStake."""
    __tablename__ = "actores"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False, index=True)
    tipo = Column(String(50), nullable=False, index=True)  # ciudadania, organizaciones, veedurias, etc.
    descripcion = Column(Text)
    institucion = Column(String(255))
    cargo = Column(String(255))
    departamento = Column(String(100))
    municipio = Column(String(100))
    email = Column(String(100))
    telefono = Column(String(20))
    canales = Column(Text)  # canales preferidos de relacionamiento (JSON o texto)
    notas = Column(Text)
    es_interno = Column(Boolean, default=False)  # si pertenece a la entidad
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    variables = relationship("ActorVariables", back_populates="actor", uselist=False, cascade="all, delete-orphan")
    compromisos = relationship("Compromiso", back_populates="actor", cascade="all, delete-orphan")
    alertas = relationship("Alerta", back_populates="actor", cascade="all, delete-orphan")
    relacionamientos = relationship("Relacionamiento", back_populates="actor", cascade="all, delete-orphan")