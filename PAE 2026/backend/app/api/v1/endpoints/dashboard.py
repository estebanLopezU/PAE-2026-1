from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from typing import Dict, List, Optional
from ....database import get_db
from ....models.entity import Entity
from ....models.sector import Sector
from ....models.service import Service
from ....models.maturity import MaturityAssessment
from ....security import get_current_user
from typing import Any

router = APIRouter()


@router.get("/kpis")
def get_dashboard_kpis(
    sector: Optional[str] = Query(None, description="Filter by sector name"),
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Get main dashboard KPIs with optional sector filter"""
    query = db.query(Entity).filter(Entity.is_active == True)
    
    if sector:
        query = query.join(Sector).filter(Sector.name == sector)
    
    total_entities = query.count()
    
    xroad_connected = query.filter(Entity.xroad_status == "connected").count()
    
    xroad_pending = query.filter(Entity.xroad_status == "pending").count()
    
    services_query = db.query(Service).filter(Service.status == "active")
    if sector:
        services_query = services_query.join(Entity).join(Sector).filter(Sector.name == sector)
    total_services = services_query.count()
    
    maturity_query = db.query(MaturityAssessment).join(Entity)
    if sector:
        maturity_query = maturity_query.join(Sector).filter(Sector.name == sector)
    avg_maturity = db.query(func.avg(MaturityAssessment.overall_score)).scalar() or 0
    
    maturity_distribution = db.query(
        MaturityAssessment.overall_level,
        func.count(func.distinct(MaturityAssessment.entity_id))
    ).group_by(MaturityAssessment.overall_level).all()
    
    maturity_by_level = {1: 0, 2: 0, 3: 0, 4: 0}
    for level, count in maturity_distribution:
        if level in maturity_by_level:
            maturity_by_level[level] = count
    
    return {
        "total_entities": total_entities,
        "xroad_connected": xroad_connected,
        "xroad_pending": xroad_pending,
        "xroad_not_connected": total_entities - xroad_connected - xroad_pending,
        "xroad_connection_rate": round((xroad_connected / total_entities * 100) if total_entities > 0 else 0, 1),
        "total_services": total_services,
        "average_maturity_score": round(avg_maturity, 1),
        "maturity_distribution": maturity_by_level
    }


@router.get("/by-sector")
def get_entities_by_sector(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Get entities count grouped by sector"""
    results = db.query(
        Sector.name,
        Sector.color,
        func.count(Entity.id).label("count")
    ).join(Entity, Sector.id == Entity.sector_id, isouter=True).filter(
        Entity.is_active == True
    ).group_by(Sector.id, Sector.name, Sector.color).all()
    
    return [
        {"sector": name, "color": color, "count": count}
        for name, color, count in results
    ]


@router.get("/by-department")
def get_entities_by_department(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Get entities count grouped by department"""
    results = db.query(
        Entity.department,
        func.count(Entity.id).label("count")
    ).filter(
        Entity.is_active == True,
        Entity.department.isnot(None)
    ).group_by(Entity.department).order_by(func.count(Entity.id).desc()).limit(15).all()
    
    return [
        {"department": dept, "count": count}
        for dept, count in results
    ]


@router.get("/by-xroad-status")
def get_xroad_status_distribution(
    sector: Optional[str] = Query(None, description="Filter by sector name"),
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Get X-Road connection status distribution"""
    query = db.query(
        Entity.xroad_status,
        func.count(Entity.id).label("count")
    ).filter(Entity.is_active == True)
    
    if sector:
        query = query.join(Sector).filter(Sector.name == sector)
    
    results = query.group_by(Entity.xroad_status).all()
    
    return [
        {"status": status, "count": count}
        for status, count in results
    ]


@router.get("/services-by-protocol")
def get_services_by_protocol(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Get services count by protocol"""
    results = db.query(
        Service.protocol,
        func.count(Service.id).label("count")
    ).filter(Service.status == "active").group_by(Service.protocol).all()
    
    return [
        {"protocol": protocol, "count": count}
        for protocol, count in results
    ]


@router.get("/top-mature-entities")
def get_top_mature_entities(
    limit: int = 10, 
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Get top entities by maturity score"""
    from sqlalchemy import desc
    
    # Get latest assessment for each entity
    subquery = db.query(
        MaturityAssessment.entity_id,
        func.max(MaturityAssessment.assessment_date).label("latest_date")
    ).group_by(MaturityAssessment.entity_id).subquery()
    
    results = db.query(
        Entity.id,
        Entity.name,
        Entity.acronym,
        Sector.name.label("sector_name"),
        MaturityAssessment.overall_level,
        MaturityAssessment.overall_score
    ).join(
        subquery, Entity.id == subquery.c.entity_id
    ).join(
        MaturityAssessment, 
        (MaturityAssessment.entity_id == subquery.c.entity_id) & 
        (MaturityAssessment.assessment_date == subquery.c.latest_date)
    ).join(
        Sector, Entity.sector_id == Sector.id
    ).filter(
        Entity.is_active == True
    ).order_by(
        desc(MaturityAssessment.overall_score)
    ).limit(limit).all()
    
    return [
        {
            "id": id,
            "name": name,
            "acronym": acronym,
            "sector": sector_name,
            "maturity_level": level,
            "maturity_score": score
        }
        for id, name, acronym, sector_name, level, score in results
    ]


@router.get("/maturity-radar/{entity_id}")
def get_entity_maturity_radar(
    entity_id: int, 
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Get maturity radar data for a specific entity"""
    # Verify entity exists
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        return {"error": "Entity not found", "entity_id": entity_id}
    
    assessment = db.query(MaturityAssessment).filter(
        MaturityAssessment.entity_id == entity_id
    ).order_by(MaturityAssessment.assessment_date.desc()).first()
    
    if not assessment:
        return {
            "error": "No assessment found",
            "entity_id": entity_id,
            "entity_name": entity.name,
            "overall_level": 0,
            "overall_score": 0,
            "domains": {
                "legal": 0,
                "organizational": 0,
                "semantic": 0,
                "technical": 0
            },
            "criteria": {
                "api_documentation": 0,
                "standard_protocols": 0,
                "data_quality": 0,
                "security_standards": 0,
                "interoperability_policy": 0,
                "trained_personnel": 0
            }
        }
    
    criteria_values = {
        "api_documentation": assessment.has_api_documentation,
        "standard_protocols": assessment.uses_standard_protocols,
        "data_quality": assessment.has_data_quality,
        "security_standards": assessment.has_security_standards,
        "interoperability_policy": assessment.has_interoperability_policy,
        "trained_personnel": assessment.has_trained_personnel
    }

    # Compatibilidad con datos históricos/seed donde criterios quedaron en 0.
    # Si todos están en cero pero la entidad sí tiene nivel de madurez,
    # usamos el nivel general como valor base de criterios para visualización.
    if assessment.overall_level and all((value or 0) == 0 for value in criteria_values.values()):
        fallback_value = max(1, min(4, int(assessment.overall_level)))
        criteria_values = {key: fallback_value for key in criteria_values.keys()}

    return {
        "entity_id": entity_id,
        "entity_name": entity.name,
        "overall_level": assessment.overall_level,
        "overall_score": assessment.overall_score,
        "domains": {
            "legal": assessment.legal_domain_score,
            "organizational": assessment.organizational_domain_score,
            "semantic": assessment.semantic_domain_score,
            "technical": assessment.technical_domain_score
        },
        "criteria": criteria_values,
        "assessment_date": assessment.assessment_date,
        "assessor_name": assessment.assessor_name
    }
