from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class EntityBase(BaseModel):
    name: str
    acronym: Optional[str] = None
    nit: str
    sector_id: int
    department: Optional[str] = None
    municipality: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    xroad_status: str = "not_connected"
    xroad_member_code: Optional[str] = None
    cio_name: Optional[str] = None
    cio_email: Optional[str] = None
    cio_phone: Optional[str] = None
    is_active: bool = True
    notes: Optional[str] = None


class EntityCreate(EntityBase):
    pass


class EntityUpdate(BaseModel):
    name: Optional[str] = None
    acronym: Optional[str] = None
    nit: Optional[str] = None
    sector_id: Optional[int] = None
    department: Optional[str] = None
    municipality: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    xroad_status: Optional[str] = None
    xroad_member_code: Optional[str] = None
    cio_name: Optional[str] = None
    cio_email: Optional[str] = None
    cio_phone: Optional[str] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class Entity(EntityBase):
    id: int
    xroad_connection_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    sector_name: Optional[str] = None
    services_count: Optional[int] = 0
    maturity_level: Optional[int] = None

    class Config:
        from_attributes = True


class EntityList(BaseModel):
    items: list[Entity]
    total: int
    page: int
    page_size: int