from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ....database import get_db
from ....models.entity import Entity
from ....models.relationship import Relationship
from ....models.sector import Sector
from ....schemas.relationship import GraphData, GraphNode, GraphLink
from ....security import get_current_user
from typing import List, Any

router = APIRouter()

@router.get("/graph", response_model=GraphData)
def get_interaction_graph(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Get the complete entity interaction graph"""
    entities = db.query(Entity).join(Sector).all()
    relationships = db.query(Relationship).all()
    
    nodes = [
        GraphNode(
            id=e.id,
            name=e.name,
            acronym=e.acronym,
            sector=e.sector.name if e.sector else "Sin Sector",
            val=2 # Base size
        ) for e in entities
    ]
    
    links = [
        GraphLink(
            source=r.source_id,
            target=r.target_id,
            protocol=r.protocol,
            status=r.status,
            description=r.description
        ) for r in relationships
    ]
    
    return GraphData(nodes=nodes, links=links)
