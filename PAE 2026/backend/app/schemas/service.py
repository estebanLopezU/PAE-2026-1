from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ServiceBase(BaseModel):
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    protocol: str = "REST"
    endpoint_url: Optional[str] = None
    api_version: Optional[str] = None
    data_standard: Optional[str] = None
    semantic_standard: Optional[str] = None
    security_standard: Optional[str] = None
    status: str = "active"
    is_public: bool = False
    documentation_url: Optional[str] = None


class ServiceCreate(ServiceBase):
    entity_id: int


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    protocol: Optional[str] = None
    endpoint_url: Optional[str] = None
    api_version: Optional[str] = None
    data_standard: Optional[str] = None
    semantic_standard: Optional[str] = None
    security_standard: Optional[str] = None
    status: Optional[str] = None
    is_public: Optional[bool] = None
    documentation_url: Optional[str] = None


class Service(ServiceBase):
    id: int
    entity_id: int
    entity_name: Optional[str] = None
    last_test_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ServiceList(BaseModel):
    items: list[Service]
    total: int
    page: int
    page_size: int