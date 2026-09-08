from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RelacionamientoBase(BaseModel):
    actor_id: int
    tipo: str
    descripcion: Optional[str] = None
    resultado: Optional[str] = None
    fecha: Optional[datetime] = None
    registrado_por: Optional[str] = None


class RelacionamientoCreate(RelacionamientoBase):
    pass


class RelacionamientoUpdate(BaseModel):
    tipo: Optional[str] = None
    descripcion: Optional[str] = None
    resultado: Optional[str] = None
    fecha: Optional[datetime] = None


class Relacionamiento(RelacionamientoBase):
    id: int
    actor_nombre: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RelacionamientoList(BaseModel):
    items: list[Relacionamiento]
    total: int