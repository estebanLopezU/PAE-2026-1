from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AlertaBase(BaseModel):
    actor_id: int
    tipo: str
    titulo: str
    descripcion: Optional[str] = None
    nivel: str = "warning"
    leida: bool = False


class AlertaCreate(AlertaBase):
    pass


class Alerta(AlertaBase):
    id: int
    actor_nombre: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AlertaUpdate(BaseModel):
    leida: Optional[bool] = None


class AlertaList(BaseModel):
    items: list[Alerta]
    total: int
    no_leidas: int