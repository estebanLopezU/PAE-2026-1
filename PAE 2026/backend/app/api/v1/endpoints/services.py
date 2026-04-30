from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ....database import get_db
from ....models.service import Service
from ....models.entity import Entity
from ....models.maturity import MaturityAssessment
from ....schemas.service import Service as ServiceSchema, ServiceCreate, ServiceUpdate, ServiceList
from ....security import require_admin, get_current_user

router = APIRouter()


@router.get("/", response_model=ServiceList)
def list_services(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    entity_id: Optional[int] = None,
    protocol: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
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
def get_service(
    service_id: int, 
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
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


@router.post("/purge-all")
def purge_all_services(
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_admin),
):
    """Delete all services (use with caution)"""
    count = db.query(Service).delete()
    db.commit()
    return {
        "success": True,
        "message": f"Se eliminaron {count} servicios",
        "deleted": count
    }


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


@router.post("/generate-all")
def generate_all_services(
    overwrite: bool = False,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_admin),
):
    """
    Generate standard services for entities that are connected to X-Road.
    """
    entities = db.query(Entity).filter(
        Entity.is_active == True,
        Entity.xroad_status == 'connected'
    ).all()
    
    created_count = 0
    skipped_count = 0
    
    for entity in entities:
        existing_count = db.query(Service).filter(Service.entity_id == entity.id).count()
        
        if existing_count > 0 and not overwrite:
            skipped_count += 1
            continue
        
        assessment = db.query(MaturityAssessment).filter(
            MaturityAssessment.entity_id == entity.id
        ).order_by(MaturityAssessment.assessment_date.desc()).first()
        
        if assessment:
            num_services = assessment.overall_level
        else:
            num_services = 2
        
        services_to_create = [
            {"name": "Consulta de Identificación", "category": "Consulta", "protocol": "REST"},
            {"name": "Validación de Datos", "category": "Validación", "protocol": "REST"},
            {"name": "Consulta de Estados", "category": "Consulta", "protocol": "REST"},
            {"name": "Autenticación de Usuarios", "category": "Autenticación", "protocol": "X-Road"},
        ]
        
        for i in range(min(num_services, len(services_to_create))):
            svc = services_to_create[i]
            code = f"{entity.id}-{entity.acronym or entity.name[:3].upper()}-{svc['category'][:3].upper()}-{i+1:03d}"
            
            existing = db.query(Service).filter(
                Service.entity_id == entity.id,
                Service.code == code
            ).first()
            
            if existing:
                continue
            
            service = Service(
                entity_id=entity.id,
                name=svc["name"],
                code=code,
                description=f"Servicio de {svc['category'].lower()} para {entity.name}",
                protocol=svc["protocol"],
                category=svc["category"],
                status="active"
            )
            db.add(service)
            created_count += 1
    
    db.commit()
    
    return {
        "success": True,
        "message": f"Servicios generados: {created_count}, omitidos: {skipped_count}",
        "created": created_count,
        "skipped": skipped_count
    }


@router.delete("/purge-all")
def purge_all_services(
    db: Session = Depends(get_db),
):
    """Delete all services (use with caution)"""
    count = db.query(Service).delete()
    db.commit()
    return {
        "success": True,
        "message": f"Se eliminaron {count} servicios",
        "deleted": count
    }