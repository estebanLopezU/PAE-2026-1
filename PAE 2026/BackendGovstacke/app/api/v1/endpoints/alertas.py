from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ....database import get_db
from ....models import Alerta, Actor
from ....schemas import AlertaCreate, AlertaUpdate, AlertaList
from ....security import get_current_user


router = APIRouter()


def _serialize(a: Alerta):
    return {
        "id": a.id,
        "actor_id": a.actor_id,
        "actor_nombre": a.actor.nombre if a.actor else None,
        "tipo": a.tipo,
        "titulo": a.titulo,
        "descripcion": a.descripcion,
        "nivel": a.nivel,
        "leida": a.leida,
        "created_at": a.created_at,
    }


@router.get("", response_model=AlertaList)
def list_alertas(
    leida: Optional[bool] = None,
    nivel: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(Alerta)
    if leida is not None:
        query = query.filter(Alerta.leida == leida)
    if nivel:
        query = query.filter(Alerta.nivel == nivel)
    alertas = query.order_by(Alerta.created_at.desc()).all()
    no_leidas = db.query(Alerta).filter(Alerta.leida == False).count()
    return {"items": [_serialize(a) for a in alertas], "total": len(alertas), "no_leidas": no_leidas}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_alerta(payload: AlertaCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    actor = db.query(Actor).filter(Actor.id == payload.actor_id).first()
    if not actor:
        raise HTTPException(status_code=404, detail="Actor no encontrado")
    a = Alerta(**payload.model_dump())
    db.add(a)
    db.commit()
    db.refresh(a)
    return _serialize(a)


@router.patch("/{alerta_id}")
def update_alerta(alerta_id: int, payload: AlertaUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    a = db.query(Alerta).filter(Alerta.id == alerta_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    if payload.leida is not None:
        a.leida = payload.leida
    db.commit()
    db.refresh(a)
    return _serialize(a)


@router.post("/marcar-todas")
def marcar_todas_leidas(db: Session = Depends(get_db), _=Depends(get_current_user)):
    db.query(Alerta).filter(Alerta.leida == False).update({"leida": True})
    db.commit()
    return {"ok": True}