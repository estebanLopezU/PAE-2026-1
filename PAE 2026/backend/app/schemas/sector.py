from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SectorBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    color: str = "#3B82F6"
    icon: str = "building"


class SectorCreate(SectorBase):
    pass


class SectorUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None


class Sector(SectorBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    entities_count: Optional[int] = 0

    class Config:
        from_attributes = True


class SectorList(BaseModel):
    items: list[Sector]
    total: int