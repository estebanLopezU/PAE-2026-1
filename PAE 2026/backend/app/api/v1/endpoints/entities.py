from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from ....database import get_db
from ....models.entity import Entity
from ....models.sector import Sector
from ....models.maturity import MaturityAssessment
from ....schemas.entity import Entity as EntitySchema, EntityCreate, EntityUpdate, EntityList
from ....security import require_admin

router = APIRouter()


@router.get("/", response_model=EntityList)
def list_entities(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=200),
    sector_id: Optional[int] = None,
    xroad_status: Optional[str] = None,
    department: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all entities with filters"""
    query = db.query(Entity)
    
    if sector_id:
        query = query.filter(Entity.sector_id == sector_id)
    if xroad_status:
        query = query.filter(Entity.xroad_status == xroad_status)
    if department:
        query = query.filter(Entity.department == department)
    if search:
        query = query.filter(
            (Entity.name.ilike(f"%{search}%")) |
            (Entity.acronym.ilike(f"%{search}%")) |
            (Entity.nit.ilike(f"%{search}%"))
        )
    
    total = query.count()
    entities = query.offset(skip).limit(limit).all()
    
    # Enrich with related data
    for entity in entities:
        entity.sector_name = entity.sector.name if entity.sector else None
        entity.services_count = len(entity.services) if entity.services else 0
        # Get latest maturity level
        latest_maturity = db.query(MaturityAssessment).filter(
            MaturityAssessment.entity_id == entity.id
        ).order_by(MaturityAssessment.assessment_date.desc()).first()
        entity.maturity_level = latest_maturity.overall_level if latest_maturity else None
    
    return EntityList(
        items=entities,
        total=total,
        page=skip // limit + 1,
        page_size=limit
    )


@router.get("/{entity_id}", response_model=EntitySchema)
def get_entity(entity_id: int, db: Session = Depends(get_db)):
    """Get a specific entity"""
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    
    entity.sector_name = entity.sector.name if entity.sector else None
    entity.services_count = len(entity.services) if entity.services else 0
    latest_maturity = db.query(MaturityAssessment).filter(
        MaturityAssessment.entity_id == entity.id
    ).order_by(MaturityAssessment.assessment_date.desc()).first()
    entity.maturity_level = latest_maturity.overall_level if latest_maturity else None
    
    return entity


@router.post("/", response_model=EntitySchema, status_code=201)
def create_entity(
    entity: EntityCreate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_admin),
):
    """Create a new entity"""
    # Check if NIT already exists
    existing = db.query(Entity).filter(Entity.nit == entity.nit).first()
    if existing:
        raise HTTPException(status_code=400, detail="NIT already exists")
    
    # Verify sector exists
    sector = db.query(Sector).filter(Sector.id == entity.sector_id).first()
    if not sector:
        raise HTTPException(status_code=400, detail="Sector not found")
    
    db_entity = Entity(**entity.model_dump())
    db.add(db_entity)
    db.commit()
    db.refresh(db_entity)
    
    db_entity.sector_name = sector.name
    db_entity.services_count = 0
    db_entity.maturity_level = None
    
    return db_entity


@router.put("/{entity_id}", response_model=EntitySchema)
def update_entity(
    entity_id: int,
    entity: EntityUpdate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_admin),
):
    """Update an entity"""
    db_entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not db_entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    
    update_data = entity.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_entity, field, value)
    
    db.commit()
    db.refresh(db_entity)
    
    db_entity.sector_name = db_entity.sector.name if db_entity.sector else None
    db_entity.services_count = len(db_entity.services) if db_entity.services else 0
    
    return db_entity


@router.delete("/{entity_id}", status_code=204)
def delete_entity(
    entity_id: int,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_admin),
):
    """Delete an entity"""
    db_entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not db_entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    
    db.delete(db_entity)
    db.commit()
    return None