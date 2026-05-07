from typing import Any, Dict, List, Optional
import re

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ....database import get_db
from ....models.service import Service
from ....models.entity import Entity
from ....models.maturity import MaturityAssessment
from ....schemas.service import Service as ServiceSchema, ServiceCreate, ServiceUpdate, ServiceList
from ....security import require_admin, get_current_user

router = APIRouter()


def _sanitize_token(value: Optional[str], max_len: int = 8, fallback: str = "GEN") -> str:
    raw = (value or "").strip().upper()
    cleaned = re.sub(r"[^A-Z0-9]", "", raw)
    if not cleaned:
        return fallback
    return cleaned[:max_len]


def build_official_service_code(entity: Entity, category: Optional[str], seq: int) -> str:
    """
    Convención oficial:
    CO-{ENTITY_ID_4D}-{ACRONYM_8}-{CATEGORY_3}-{SEQ_3}
    Ejemplo: CO-0001-DAPRE-INT-001
    """
    acronym = _sanitize_token(entity.acronym or entity.name, max_len=8, fallback=f"ENT{entity.id}")
    category_token = _sanitize_token(category, max_len=3, fallback="GEN")
    return f"CO-{entity.id:04d}-{acronym}-{category_token}-{seq:03d}"


def build_default_service_description(entity: Entity, category: Optional[str], protocol: Optional[str]) -> str:
    category_label = (category or "integración").strip().lower()
    protocol_label = (protocol or "REST").strip().upper()
    return (
        f"Servicio de {category_label} de {entity.name} para interoperabilidad "
        f"{protocol_label} con intercambio seguro de información institucional."
    )


def next_service_sequence(db: Session, entity_id: int, category: Optional[str]) -> int:
    count = db.query(Service).filter(
        Service.entity_id == entity_id,
        Service.category == category
    ).count()
    return count + 1


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
    
    payload = service.model_dump()

    if not payload.get("code"):
        seq = next_service_sequence(db, entity.id, payload.get("category"))
        payload["code"] = build_official_service_code(entity, payload.get("category"), seq)

    existing = db.query(Service).filter(Service.code == payload["code"]).first()
    if existing:
        raise HTTPException(status_code=400, detail="Service code already exists")

    if not payload.get("description"):
        payload["description"] = build_default_service_description(
            entity,
            payload.get("category"),
            payload.get("protocol")
        )

    db_service = Service(**payload)
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

    if "code" in update_data and update_data["code"]:
        existing = db.query(Service).filter(
            Service.code == update_data["code"],
            Service.id != service_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Service code already exists")

    if "code" in update_data and (update_data["code"] is None or str(update_data["code"]).strip() == ""):
        seq = next_service_sequence(db, db_service.entity_id, update_data.get("category", db_service.category))
        update_data["code"] = build_official_service_code(
            db_service.entity,
            update_data.get("category", db_service.category),
            seq
        )

    if "description" in update_data and (update_data["description"] is None or str(update_data["description"]).strip() == ""):
        update_data["description"] = build_default_service_description(
            db_service.entity,
            update_data.get("category", db_service.category),
            update_data.get("protocol", db_service.protocol)
        )

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
            code = build_official_service_code(entity, svc["category"], i + 1)
            
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
                description=build_default_service_description(entity, svc["category"], svc["protocol"]),
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