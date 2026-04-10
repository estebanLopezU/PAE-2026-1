from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ....database import get_db
from ....models.sector import Sector
from ....schemas.sector import Sector as SectorSchema, SectorCreate, SectorUpdate, SectorList
from ....security import require_admin

router = APIRouter()


@router.get("/", response_model=SectorList)
def list_sectors(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List all sectors"""
    query = db.query(Sector)
    total = query.count()
    sectors = query.offset(skip).limit(limit).all()
    
    # Add entities count
    for sector in sectors:
        sector.entities_count = len(sector.entities) if sector.entities else 0
    
    return SectorList(items=sectors, total=total)


@router.get("/{sector_id}", response_model=SectorSchema)
def get_sector(sector_id: int, db: Session = Depends(get_db)):
    """Get a specific sector"""
    sector = db.query(Sector).filter(Sector.id == sector_id).first()
    if not sector:
        raise HTTPException(status_code=404, detail="Sector not found")
    sector.entities_count = len(sector.entities) if sector.entities else 0
    return sector


@router.post("/", response_model=SectorSchema, status_code=201)
def create_sector(
    sector: SectorCreate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_admin),
):
    """Create a new sector"""
    # Check if code already exists
    existing = db.query(Sector).filter(Sector.code == sector.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Sector code already exists")
    
    db_sector = Sector(**sector.model_dump())
    db.add(db_sector)
    db.commit()
    db.refresh(db_sector)
    db_sector.entities_count = 0
    return db_sector


@router.put("/{sector_id}", response_model=SectorSchema)
def update_sector(
    sector_id: int,
    sector: SectorUpdate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_admin),
):
    """Update a sector"""
    db_sector = db.query(Sector).filter(Sector.id == sector_id).first()
    if not db_sector:
        raise HTTPException(status_code=404, detail="Sector not found")
    
    update_data = sector.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_sector, field, value)
    
    db.commit()
    db.refresh(db_sector)
    db_sector.entities_count = len(db_sector.entities) if db_sector.entities else 0
    return db_sector


@router.delete("/{sector_id}", status_code=204)
def delete_sector(
    sector_id: int,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_admin),
):
    """Delete a sector"""
    db_sector = db.query(Sector).filter(Sector.id == sector_id).first()
    if not db_sector:
        raise HTTPException(status_code=404, detail="Sector not found")
    
    db.delete(db_sector)
    db.commit()
    return None