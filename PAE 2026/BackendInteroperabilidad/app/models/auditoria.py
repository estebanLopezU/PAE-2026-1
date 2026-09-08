from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from ..database import Base


class Auditoria(Base):
    """Registro de auditoría de seguridad (logins y acciones de escritura)."""
    __tablename__ = "auditoria"

    id = Column(Integer, primary_key=True, index=True)
    usuario = Column(String(255), nullable=False, index=True)
    accion = Column(String(100), nullable=False)          # login_ok | login_fallido | cuenta_bloqueada | crear | actualizar | eliminar
    detalle = Column(String(500), nullable=True)
    ip = Column(String(64), nullable=True)
    fecha = Column(DateTime(timezone=True), server_default=func.now(), index=True)