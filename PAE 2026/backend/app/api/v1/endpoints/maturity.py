from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ....database import get_db
from ....models.maturity import MaturityAssessment
from ....models.entity import Entity
from ....schemas.maturity import MaturityAssessment as MaturitySchema, MaturityAssessmentCreate, MaturityAssessmentUpdate, MATURITY_LEVELS
from ....security import require_admin

router = APIRouter()


@router.get("/levels")
def get_maturity_levels():
    """Get all maturity levels"""
    return MATURITY_LEVELS


@router.get("/assessments", response_model=List[MaturitySchema])
def list_assessments(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    entity_id: Optional[int] = None,
    min_level: Optional[int] = None,
    max_level: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """List maturity assessments"""
    query = db.query(MaturityAssessment)
    
    if entity_id:
        query = query.filter(MaturityAssessment.entity_id == entity_id)
    if min_level:
        query = query.filter(MaturityAssessment.overall_level >= min_level)
    if max_level:
        query = query.filter(MaturityAssessment.overall_level <= max_level)
    
    query = query.order_by(MaturityAssessment.assessment_date.desc())
    assessments = query.offset(skip).limit(limit).all()
    
    # Enrich with entity name
    for assessment in assessments:
        assessment.entity_name = assessment.entity.name if assessment.entity else None
    
    return assessments


@router.get("/assessments/{assessment_id}", response_model=MaturitySchema)
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    """Get a specific assessment"""
    assessment = db.query(MaturityAssessment).filter(MaturityAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    assessment.entity_name = assessment.entity.name if assessment.entity else None
    return assessment


@router.get("/entity/{entity_id}/latest", response_model=MaturitySchema)
def get_latest_assessment(entity_id: int, db: Session = Depends(get_db)):
    """Get latest assessment for an entity"""
    # Verify entity exists
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    
    assessment = db.query(MaturityAssessment).filter(
        MaturityAssessment.entity_id == entity_id
    ).order_by(MaturityAssessment.assessment_date.desc()).first()
    
    if not assessment:
        raise HTTPException(status_code=404, detail="No assessments found for this entity")
    
    assessment.entity_name = entity.name
    return assessment


@router.post("/assessments", response_model=MaturitySchema, status_code=201)
def create_assessment(
    assessment: MaturityAssessmentCreate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_admin),
):
    """Create a new maturity assessment"""
    # Verify entity exists
    entity = db.query(Entity).filter(Entity.id == assessment.entity_id).first()
    if not entity:
        raise HTTPException(status_code=400, detail="Entity not found")
    
    # Validate overall level
    if assessment.overall_level < 1 or assessment.overall_level > 4:
        raise HTTPException(status_code=400, detail="Overall level must be between 1 and 4")
    
    # Validate scores
    if assessment.overall_score < 0 or assessment.overall_score > 100:
        raise HTTPException(status_code=400, detail="Overall score must be between 0 and 100")
    
    db_assessment = MaturityAssessment(**assessment.model_dump())
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    
    db_assessment.entity_name = entity.name
    return db_assessment


@router.put("/assessments/{assessment_id}", response_model=MaturitySchema)
def update_assessment(
    assessment_id: int,
    assessment: MaturityAssessmentUpdate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_admin),
):
    """Update an assessment"""
    db_assessment = db.query(MaturityAssessment).filter(MaturityAssessment.id == assessment_id).first()
    if not db_assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    update_data = assessment.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_assessment, field, value)
    
    db.commit()
    db.refresh(db_assessment)
    db_assessment.entity_name = db_assessment.entity.name if db_assessment.entity else None
    
    return db_assessment


@router.delete("/assessments/{assessment_id}", status_code=204)
def delete_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_admin),
):
    """Delete an assessment"""
    db_assessment = db.query(MaturityAssessment).filter(MaturityAssessment.id == assessment_id).first()
    if not db_assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    db.delete(db_assessment)
    db.commit()
    return None


@router.post("/assessments/generate-all")
def generate_all_assessments(
    overwrite: bool = False,
    db: Session = Depends(get_db),
):
    """
    Generate automatic maturity assessments for all entities that don't have one.
    Uses entity data (xroad_status, services_count, etc.) to calculate maturity level.
    """
    entities = db.query(Entity).filter(Entity.is_active == True).all()
    
    created_count = 0
    skipped_count = 0
    
    for entity in entities:
        # Check if entity already has assessment
        existing = db.query(MaturityAssessment).filter(
            MaturityAssessment.entity_id == entity.id
        ).order_by(MaturityAssessment.assessment_date.desc()).first()
        
        if existing and not overwrite:
            skipped_count += 1
            continue
        
        # Calculate maturity based on entity attributes
        # Base score from 0-100
        score = 0
        
        # X-Road status contributes 25 points max
        if entity.xroad_status == 'connected':
            score += 25
        elif entity.xroad_status == 'pending':
            score += 10
        
        # Services count contributes 25 points max (4+ services = 25 points)
        services_count = len(entity.services) if entity.services else 0
        score += min(services_count * 6.25, 25)
        
        # Website/email/phone contributes 20 points max
        if entity.website:
            score += 7
        if entity.email:
            score += 7
        if entity.phone:
            score += 6
        
        # Sector assignment contributes 15 points
        if entity.sector_id:
            score += 15
        
        # Coordinates contribute 15 points
        if entity.latitude and entity.longitude:
            score += 15
        
        # Determine level
        if score >= 75:
            level = 4
        elif score >= 50:
            level = 3
        elif score >= 25:
            level = 2
        else:
            level = 1
        
        # Domain scores (simplified calculation)
        technical_score = min(100, (score // 4) * 3 + (25 if entity.xroad_status == 'connected' else 0))
        semantic_score = min(100, (services_count * 15) + (25 if entity.email else 0))
        organizational_score = min(100, 50 + (25 if entity.sector_id else 0))
        legal_score = min(100, 40 + (25 if entity.website else 0))
        
        # Create assessment
        assessment = MaturityAssessment(
            entity_id=entity.id,
            overall_level=level,
            overall_score=score,
            legal_domain_score=legal_score,
            organizational_domain_score=organizational_score,
            semantic_domain_score=semantic_score,
            technical_domain_score=technical_score,
            has_api_documentation=level,
            uses_standard_protocols=level,
            has_data_quality=level - 1 if level > 1 else 1,
            has_security_standards=level,
            has_interoperability_policy=level - 1 if level > 1 else 1,
            has_trained_personnel=level - 1 if level > 1 else 1,
            assessor_name="Sistema Automático",
            assessor_notes="Evaluación automática basada en datos de la entidad"
        )
        db.add(assessment)
        created_count += 1
    
    db.commit()
    
    return {
        "success": True,
        "message": f"Evaluaciones generadas: {created_count}, omitidas: {skipped_count}",
        "created": created_count,
        "skipped": skipped_count,
        "total_entities": len(entities)
    }