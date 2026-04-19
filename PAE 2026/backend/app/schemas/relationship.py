from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class RelationshipBase(BaseModel):
    source_id: int
    target_id: int
    service_id: Optional[int] = None
    description: Optional[str] = None
    protocol: Optional[str] = "X-Road"
    status: Optional[str] = "active"

class RelationshipCreate(RelationshipBase):
    pass

class RelationshipUpdate(RelationshipBase):
    pass

class Relationship(RelationshipBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class GraphNode(BaseModel):
    id: int
    name: str
    acronym: Optional[str]
    sector: str
    val: int = 1 # Size multiplier

class GraphLink(BaseModel):
    source: int
    target: int
    protocol: str
    status: str
    description: Optional[str]

class GraphData(BaseModel):
    nodes: list[GraphNode]
    links: list[GraphLink]
