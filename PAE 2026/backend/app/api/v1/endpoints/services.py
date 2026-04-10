from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ....database import get_db
from ....models.service import Service
from ....models.entity import Entity
from ....schemas.service import Service as ServiceSchema, ServiceCreate, ServiceUpdate, ServiceList
from ....security import require_admin

router = APIRouter()


@router.get("/", response_model=ServiceList)
def list_services(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    entity_id: Optional[int] = None,
    protocol: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all services with filters"""
    query = db.query(Service)
    
    if entity_id:
        query = query.filter(Service.entity_id == entity_id)
    if protocol:
        query = query.filter(Service.protocol == protocol)
    if status:
        query = query.filter(Service.status == status)
    if category:
        query = query.filter(Service.category == category)
    
    total = query.count()
    services = query.offset(skip).limit(limit).all()
    
    # Enrich with entity name
    for service in services:
        service.entity_name = service.entity.name if service.entity else None
    
    return ServiceList(
        items=services,
        total=total,
        page=skip // limit + 1,
        page_size=limit
    )


@router.get("/{service_id}", response_model=ServiceSchema)
def get_service(service_id: int, db: Session = Depends(get_db)):
    """Get a specific service"""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    service.entity_name = service.entity.name if service.entity else None
    return service


@router.post("/", response_model=ServiceSchema, status_code=201)
def create_service(
    service: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_admin),
):
    """Create a new service"""
    # Verify entity exists
    entity = db.query(Entity).filter(Entity.id == service.entity_id).first()
    if not entity:
        raise HTTPException(status_code=400, detail="Entity not found")
    
    # Check if code already exists (if provided)
    if service.code:
        existing = db.query(Service).filter(Service.code == service.code).first()
        if existing:
            raise HTTPException(status_code=400, detail="Service code already exists")
    
    db_service = Service(**service.model_dump())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    
    db_service.entity_name = entity.name
    return db_service


@router.put("/{service_id}", response_model=ServiceSchema)
def update_service(
    service_id: int,
    service: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_admin),
):
    """Update a service"""
    db_service = db.query(Service).filter(Service.id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    update_data = service.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_service, field, value)
    
    db.commit()
    db.refresh(db_service)
    db_service.entity_name = db_service.entity.name if db_service.entity else None
    
    return db_service


@router.delete("/{service_id}", status_code=204)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_admin),
):
    """Delete a service"""
    db_service = db.query(Service).filter(Service.id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    db.delete(db_service)
    db.commit()
    return None