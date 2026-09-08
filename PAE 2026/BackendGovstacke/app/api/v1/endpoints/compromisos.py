from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ....database import get_db
from ....models import Compromiso, Actor
from ....schemas import CompromisoCreate, CompromisoUpdate, CompromisoList
from ....security import get_current_user, require_admin


router = APIRouter()


def _serialize(c: Compromiso):
    return {
        "id": c.id,
        "actor_id": c.actor_id,
        "actor_nombre": c.actor.nombre if c.actor else None,
        "titulo": c.titulo,
        "descripcion": c.descripcion,
        "estado": c.estado,
        "prioridad": c.prioridad,
        "fecha_compromiso": c.fecha_compromiso,
        "fecha_vencimiento": c.fecha_vencimiento,
        "creado_por": c.creado_por,
        "created_at": c.created_at,
        "updated_at": c.updated_at,
    }


@router.get("", response_model=CompromisoList)
def list_compromisos(
    actor_id: Optional[int] = None,
    estado: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(Compromiso)
    if actor_id:
        query = query.filter(Compromiso.actor_id == actor_id)
    if estado:
        query = query.filter(Compromiso.estado == estado)
    compromisos = query.order_by(Compromiso.fecha_vencimiento.asc().nullslast()).all()
    return {"items": [_serialize(c) for c in compromisos], "total": len(compromisos)}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_compromiso(payload: CompromisoCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    actor = db.query(Actor).filter(Actor.id == payload.actor_id).first()
    if not actor:
        raise HTTPException(status_code=404, detail="Actor no encontrado")
    c = Compromiso(**payload.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return _serialize(c)


@router.put("/{compromiso_id}")
def update_compromiso(compromiso_id: int, payload: CompromisoUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    c = db.query(Compromiso).filter(Compromiso.id == compromiso_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Compromiso no encontrado")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return _serialize(c)


@router.delete("/{compromiso_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_compromiso(compromiso_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    c = db.query(Compromiso).filter(Compromiso.id == compromiso_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Compromiso no encontrado")
    db.delete(c)
    db.commit()
    return None