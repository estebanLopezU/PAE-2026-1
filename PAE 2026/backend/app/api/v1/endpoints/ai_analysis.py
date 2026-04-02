"""
AI Analysis endpoints for X-Road Interoperability Mapper
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from ....database import get_db
from ....models.entity import Entity
from ....models.maturity import MaturityAssessment
from ....services.ai_analyzer import ai_analyzer, convert_numpy_types
from pydantic import BaseModel


router = APIRouter()


class EntityAnalysisRequest(BaseModel):
    entity_id: int


class SectorAnalysisRequest(BaseModel):
    sector_id: Optional[int] = None


class TrainModelsRequest(BaseModel):
    force_retrain: bool = False


@router.post("/analyze/entity")
async def analyze_entity(
    request: EntityAnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Perform advanced AI analysis on a specific entity
    Returns maturity prediction, cluster assignment, recommendations, and action plan
    """
    # Get entity
    entity = db.query(Entity).filter(Entity.id == request.entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    
    # Get latest assessment if exists
    latest_assessment = db.query(MaturityAssessment).filter(
        MaturityAssessment.entity_id == entity.id
    ).order_by(MaturityAssessment.assessment_date.desc()).first()
    
    # Prepare entity data for AI analysis
    entity_data = {
        'id': entity.id,
        'name': entity.name,
        'sector_id': entity.sector_id,
        'website': entity.website,
        'email': entity.email,
        'phone': entity.phone,
        'xroad_status': entity.xroad_status,
        'services_count': len(entity.services) if entity.services else 0,
        'maturity_level': latest_assessment.overall_level if latest_assessment else 1,
        'maturity_score': latest_assessment.overall_score if latest_assessment else 0,
        'description': entity.notes,
        'address': entity.address,
        'latitude': entity.latitude,
        'longitude': entity.longitude
    }
    
    # Perform AI analysis using AI analyzer
    analysis = ai_analyzer.analyze_entity(entity_data)
    
    # Convert numpy types to native Python types
    analysis = convert_numpy_types(analysis)
    
    return {
        "success": True,
        "data": analysis
    }


@router.post("/analyze/sector")
async def analyze_sector(
    request: SectorAnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Generate AI insights for a sector or all entities
    Returns aggregated analysis and recommendations
    """
    # Get entities
    query = db.query(Entity).filter(Entity.is_active == True)
    
    if request.sector_id:
        query = query.filter(Entity.sector_id == request.sector_id)
    
    entities = query.all()
    
    if not entities:
        raise HTTPException(status_code=404, detail="No entities found")
    
    # Prepare entities data
    entities_data = []
    for entity in entities:
        latest_assessment = db.query(MaturityAssessment).filter(
            MaturityAssessment.entity_id == entity.id
        ).order_by(MaturityAssessment.assessment_date.desc()).first()
        
        entities_data.append({
            'id': entity.id,
            'name': entity.name,
            'sector_id': entity.sector_id,
            'website': entity.website,
            'email': entity.email,
            'phone': entity.phone,
            'xroad_status': entity.xroad_status,
            'services_count': len(entity.services) if entity.services else 0,
            'maturity_level': latest_assessment.overall_level if latest_assessment else 1,
            'maturity_score': latest_assessment.overall_score if latest_assessment else 0
        })
    
    # Generate sector insights (using advanced method if available)
    insights = ai_analyzer.generate_sector_insights(entities_data)
    
    # Convert numpy types to native Python types
    insights = convert_numpy_types(insights)
    
    return {
        "success": True,
        "data": insights
    }


@router.post("/train")
async def train_models(
    request: TrainModelsRequest,
    db: Session = Depends(get_db)
):
    """
    Train AI models with current data
    """
    # Get all entities
    entities = db.query(Entity).filter(Entity.is_active == True).all()
    
    # Get all assessments
    assessments = db.query(MaturityAssessment).all()
    
    if len(entities) < 10:
        raise HTTPException(
            status_code=400,
            detail="Insufficient data for training. Need at least 10 entities."
        )
    
    # Prepare data
    entities_data = []
    for entity in entities:
        entities_data.append({
            'id': entity.id,
            'name': entity.name,
            'sector_id': entity.sector_id,
            'website': entity.website,
            'email': entity.email,
            'phone': entity.phone,
            'xroad_status': entity.xroad_status,
            'services_count': len(entity.services) if entity.services else 0
        })
    
    assessments_data = []
    for assessment in assessments:
        assessments_data.append({
            'entity_id': assessment.entity_id,
            'overall_level': assessment.overall_level,
            'overall_score': assessment.overall_score
        })
    
    # Train models
    try:
        ai_analyzer.train_models(entities_data, assessments_data)
        return {
            "success": True,
            "message": "AI models trained successfully",
            "entities_count": len(entities_data),
            "assessments_count": len(assessments_data)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error training models: {str(e)}"
        )


@router.get("/recommendations/{entity_id}")
async def get_recommendations(
    entity_id: int,
    db: Session = Depends(get_db)
):
    """
    Get AI-powered recommendations for an entity
    """
    # Get entity
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    
    # Get latest assessment
    latest_assessment = db.query(MaturityAssessment).filter(
        MaturityAssessment.entity_id == entity.id
    ).order_by(MaturityAssessment.assessment_date.desc()).first()
    
    # Prepare entity data
    entity_data = {
        'id': entity.id,
        'name': entity.name,
        'sector_id': entity.sector_id,
        'website': entity.website,
        'email': entity.email,
        'phone': entity.phone,
        'xroad_status': entity.xroad_status,
        'services_count': len(entity.services) if entity.services else 0,
        'maturity_level': latest_assessment.overall_level if latest_assessment else 1,
        'maturity_score': latest_assessment.overall_score if latest_assessment else 0
    }
    
    # Generate recommendations
    from ...services.ai_analyzer import RecommendationEngine
    engine = RecommendationEngine()
    recommendations = engine.generate_recommendations(entity_data)
    
    return {
        "success": True,
        "entity_id": entity_id,
        "entity_name": entity.name,
        "recommendations": recommendations,
        "current_maturity_level": entity_data['maturity_level'],
        "current_maturity_score": entity_data['maturity_score']
    }


@router.get("/clusters")
async def get_cluster_insights(
    sector_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get insights about entity clusters
    """
    # Get entities
    query = db.query(Entity).filter(Entity.is_active == True)
    
    if sector_id:
        query = query.filter(Entity.sector_id == sector_id)
    
    entities = query.all()
    
    if not entities:
        raise HTTPException(status_code=404, detail="No entities found")
    
    # Prepare entities data
    entities_data = []
    for entity in entities:
        latest_assessment = db.query(MaturityAssessment).filter(
            MaturityAssessment.entity_id == entity.id
        ).order_by(MaturityAssessment.assessment_date.desc()).first()
        
        entities_data.append({
            'id': entity.id,
            'name': entity.name,
            'sector_id': entity.sector_id,
            'website': entity.website,
            'email': entity.email,
            'phone': entity.phone,
            'xroad_status': entity.xroad_status,
            'services_count': len(entity.services) if entity.services else 0,
            'maturity_level': latest_assessment.overall_level if latest_assessment else 1,
            'maturity_score': latest_assessment.overall_score if latest_assessment else 0
        })
    
    # Get cluster insights
    from ....services.ai_analyzer import EntityClusterer
    clusterer = EntityClusterer()
    clusterer.fit(entities_data)
    insights = clusterer.get_cluster_insights(entities_data)
    
    # Convert numpy types to native Python types
    insights = convert_numpy_types(insights)
    
    return {
        "success": True,
        "total_entities": len(entities_data),
        "clusters": insights
    }


@router.get("/predict/{entity_id}")
async def predict_maturity(
    entity_id: int,
    db: Session = Depends(get_db)
):
    """
    Predict maturity level for an entity using AI
    """
    # Get entity
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    
    # Get latest assessment
    latest_assessment = db.query(MaturityAssessment).filter(
        MaturityAssessment.entity_id == entity.id
    ).order_by(MaturityAssessment.assessment_date.desc()).first()
    
    # Prepare entity data
    entity_data = {
        'id': entity.id,
        'name': entity.name,
        'sector_id': entity.sector_id,
        'website': entity.website,
        'email': entity.email,
        'phone': entity.phone,
        'xroad_status': entity.xroad_status,
        'services_count': len(entity.services) if entity.services else 0,
        'maturity_level': latest_assessment.overall_level if latest_assessment else 1,
        'maturity_score': latest_assessment.overall_score if latest_assessment else 0
    }
    
    # Predict maturity
    prediction = ai_analyzer.maturity_predictor.predict(entity_data)
    
    # Convert numpy types to native Python types
    prediction = convert_numpy_types(prediction)
    
    return {
        "success": True,
        "entity_id": entity_id,
        "entity_name": entity.name,
        "current_level": entity_data['maturity_level'],
        "current_score": entity_data['maturity_score'],
        "predicted_level": prediction['predicted_level'],
        "predicted_score": prediction['predicted_score'],
        "confidence": prediction['confidence'],
        "recommendations": prediction['recommendations']
    }
