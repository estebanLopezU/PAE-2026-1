from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import csv
import io
from ....database import get_db
from ....models.entity import Entity
from ....models.service import Service
from ....models.maturity import MaturityAssessment
from ....models.sector import Sector

router = APIRouter()


@router.get("/entities/csv")
def download_entities_csv(db: Session = Depends(get_db)):
    """Download entities report as CSV"""
    # Get all entities with their sector information
    entities = db.query(
        Entity.name,
        Entity.acronym,
        Entity.nit,
        Entity.department,
        Entity.xroad_status,
        Sector.name.label('sector_name')
    ).join(Sector, Entity.sector_id == Sector.id, isouter=True).filter(
        Entity.is_active == True
    ).all()
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        'Nombre', 'Acrónimo', 'NIT', 'Departamento', 
        'Estado X-Road', 'Sector'
    ])
    
    # Write data
    for entity in entities:
        writer.writerow([
            entity.name,
            entity.acronym,
            entity.nit,
            entity.department,
            entity.xroad_status,
            entity.sector_name
        ])
    
    # Prepare response
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=reporte_entidades.csv"}
    )


@router.get("/services/csv")
def download_services_csv(db: Session = Depends(get_db)):
    """Download services report as CSV"""
    # Get all services with entity information
    services = db.query(
        Service.name,
        Service.code,
        Service.description,
        Service.protocol,
        Service.category,
        Service.status,
        Entity.name.label('entity_name')
    ).join(Entity, Service.entity_id == Entity.id).filter(
        Service.status == "active"
    ).all()
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        'Nombre Servicio', 'Código', 'Descripción', 
        'Protocolo', 'Categoría', 'Estado', 'Entidad'
    ])
    
    # Write data
    for service in services:
        writer.writerow([
            service.name,
            service.code,
            service.description,
            service.protocol,
            service.category,
            service.status,
            service.entity_name
        ])
    
    # Prepare response
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=reporte_servicios.csv"}
    )


@router.get("/maturity/csv")
def download_maturity_csv(db: Session = Depends(get_db)):
    """Download maturity assessments report as CSV"""
    # Get all assessments with entity information
    assessments = db.query(
        MaturityAssessment.id,
        Entity.name.label('entity_name'),
        MaturityAssessment.overall_level,
        MaturityAssessment.overall_score,
        MaturityAssessment.legal_domain_score,
        MaturityAssessment.organizational_domain_score,
        MaturityAssessment.semantic_domain_score,
        MaturityAssessment.technical_domain_score,
        MaturityAssessment.has_api_documentation,
        MaturityAssessment.uses_standard_protocols,
        MaturityAssessment.has_data_quality,
        MaturityAssessment.has_security_standards,
        MaturityAssessment.has_interoperability_policy,
        MaturityAssessment.has_trained_personnel,
        MaturityAssessment.assessor_name,
        MaturityAssessment.assessment_date
    ).join(Entity, MaturityAssessment.entity_id == Entity.id).all()
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        'ID', 'Entidad', 'Nivel General', 'Puntuación General',
        'Dominio Legal', 'Dominio Organizacional', 'Dominio Semántico', 'Dominio Técnico',
        'Documentación APIs', 'Protocolos Estándar', 'Calidad Datos',
        'Seguridad', 'Política Interoperabilidad', 'Personal Capacitado',
        'Evaluador', 'Fecha Evaluación'
    ])
    
    # Write data
    for assessment in assessments:
        writer.writerow([
            assessment.id,
            assessment.entity_name,
            assessment.overall_level,
            assessment.overall_score,
            assessment.legal_domain_score,
            assessment.organizational_domain_score,
            assessment.semantic_domain_score,
            assessment.technical_domain_score,
            assessment.has_api_documentation,
            assessment.uses_standard_protocols,
            assessment.has_data_quality,
            assessment.has_security_standards,
            assessment.has_interoperability_policy,
            assessment.has_trained_personnel,
            assessment.assessor_name,
            assessment.assessment_date
        ])
    
    # Prepare response
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=reporte_madurez.csv"}
    )