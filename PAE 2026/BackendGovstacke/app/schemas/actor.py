from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class ActorVariablesBase(BaseModel):
    poder: float = 0
    legitimidad: float = 0
    influencia: float = 0
    interes: float = 0
    dependencia: float = 0
    capacidad_movilizacion: float = 0
    posicion: float = 0
    historial_participacion: float = 0
    riesgo_conflicto: float = 0
    canales_relacionamiento: float = 0


class ActorVariablesCreate(ActorVariablesBase):
    pass


class ActorVariablesUpdate(BaseModel):
    poder: Optional[float] = None
    legitimidad: Optional[float] = None
    influencia: Optional[float] = None
    interes: Optional[float] = None
    dependencia: Optional[float] = None
    capacidad_movilizacion: Optional[float] = None
    posicion: Optional[float] = None
    historial_participacion: Optional[float] = None
    riesgo_conflicto: Optional[float] = None
    canales_relacionamiento: Optional[float] = None


class ActorVariables(ActorVariablesBase):
    id: int
    actor_id: int

    class Config:
        from_attributes = True


class ActorBase(BaseModel):
    nombre: str
    tipo: str
    descripcion: Optional[str] = None
    institucion: Optional[str] = None
    cargo: Optional[str] = None
    departamento: Optional[str] = None
    municipio: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    canales: Optional[str] = None
    notas: Optional[str] = None
    es_interno: bool = False
    is_active: bool = True


class ActorCreate(ActorBase):
    variables: Optional[ActorVariablesCreate] = None


class ActorUpdate(BaseModel):
    nombre: Optional[str] = None
    tipo: Optional[str] = None
    descripcion: Optional[str] = None
    institucion: Optional[str] = None
    cargo: Optional[str] = None
    departamento: Optional[str] = None
    municipio: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    canales: Optional[str] = None
    notas: Optional[str] = None
    es_interno: Optional[bool] = None
    is_active: Optional[bool] = None


class Actor(ActorBase):
    id: int
    variables: Optional[ActorVariables] = None

    # Campos calculados
    indice_priorizacion: Optional[float] = 0
    indice_relacionamiento: Optional[float] = 0
    nivel_prioridad: Optional[str] = None
    compromisos_count: int = 0
    alertas_count: int = 0

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ActorList(BaseModel):
    items: list[Actor]
    total: int
    page: int
    page_size: int