from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ....database import get_db
from ....models.maturity import MaturityAssessment
from ....models.entity import Entity
from ....schemas.maturity import MaturityAssessment as MaturitySchema, MaturityAssessmentCreate, MaturityAssessmentUpdate, MATURITY_LEVELS

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
def create_assessment(assessment: MaturityAssessmentCreate, db: Session = Depends(get_db)):
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
def update_assessment(assessment_id: int, assessment: MaturityAssessmentUpdate, db: Session = Depends(get_db)):
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
def delete_assessment(assessment_id: int, db: Session = Depends(get_db)):
    """Delete an assessment"""
    db_assessment = db.query(MaturityAssessment).filter(MaturityAssessment.id == assessment_id).first()
    if not db_assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    db.delete(db_assessment)
    db.commit()
    return None