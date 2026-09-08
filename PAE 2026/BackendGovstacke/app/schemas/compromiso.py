from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CompromisoBase(BaseModel):
    actor_id: int
    titulo: str
    descripcion: Optional[str] = None
    estado: str = "pendiente"
    prioridad: str = "media"
    fecha_compromiso: Optional[datetime] = None
    fecha_vencimiento: Optional[datetime] = None
    creado_por: Optional[str] = None


class CompromisoCreate(CompromisoBase):
    pass


class CompromisoUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[str] = None
    prioridad: Optional[str] = None
    fecha_compromiso: Optional[datetime] = None
    fecha_vencimiento: Optional[datetime] = None


class Compromiso(CompromisoBase):
    id: int
    actor_nombre: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CompromisoList(BaseModel):
    items: list[Compromiso]
    total: int