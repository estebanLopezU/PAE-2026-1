from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ....database import get_db
from ....models import Relacionamiento, Actor
from ....schemas import RelacionamientoCreate, RelacionamientoUpdate, RelacionamientoList
from ....security import get_current_user, require_admin


router = APIRouter()


def _serialize(r: Relacionamiento):
    return {
        "id": r.id,
        "actor_id": r.actor_id,
        "actor_nombre": r.actor.nombre if r.actor else None,
        "tipo": r.tipo,
        "descripcion": r.descripcion,
        "resultado": r.resultado,
        "fecha": r.fecha,
        "registrado_por": r.registrado_por,
        "created_at": r.created_at,
    }


@router.get("", response_model=RelacionamientoList)
def list_relacionamientos(
    actor_id: Optional[int] = None,
    tipo: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(Relacionamiento)
    if actor_id:
        query = query.filter(Relacionamiento.actor_id == actor_id)
    if tipo:
        query = query.filter(Relacionamiento.tipo == tipo)
    items = query.order_by(Relacionamiento.fecha.desc()).all()
    return {"items": [_serialize(r) for r in items], "total": len(items)}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_relacionamiento(payload: RelacionamientoCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    actor = db.query(Actor).filter(Actor.id == payload.actor_id).first()
    if not actor:
        raise HTTPException(status_code=404, detail="Actor no encontrado")
    r = Relacionamiento(**payload.model_dump())
    db.add(r)
    db.commit()
    db.refresh(r)
    return _serialize(r)


@router.put("/{relacionamiento_id}")
def update_relacionamiento(relacionamiento_id: int, payload: RelacionamientoUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    r = db.query(Relacionamiento).filter(Relacionamiento.id == relacionamiento_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Relacionamiento no encontrado")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(r, k, v)
    db.commit()
    db.refresh(r)
    return _serialize(r)


@router.delete("/{relacionamiento_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_relacionamiento(relacionamiento_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    r = db.query(Relacionamiento).filter(Relacionamiento.id == relacionamiento_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Relacionamiento no encontrado")
    db.delete(r)
    db.commit()
    return None