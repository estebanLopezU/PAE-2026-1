"""Sincronización de entidades públicas desde la plataforma de interoperabilidad.

Convierte las entidades del sector público en actores de GOVStake 360, sin
sobreescribir la evaluación que ya haya realizado un gestor o líder.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ....config import get_settings
from ....database import get_db
from ....models import Actor, ActorVariables
from ....security import require_admin

router = APIRouter()


def _obtener_token(base_url: str, email: str, password: str, timeout: int) -> str:
    with httpx.Client(timeout=timeout) as client:
        response = client.post(
            f"{base_url}/auth/login",
            json={"email": email, "password": password},
        )
    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail="No fue posible autenticar contra el servicio de interoperabilidad",
        )
    data = response.json()
    token = data.get("access_token")
    if not token:
        raise HTTPException(status_code=502, detail="El servicio externo no devolvió token")
    return token


def _obtener_entidades(base_url: str, token: str, timeout: int) -> List[Dict[str, Any]]:
    entidades: List[Dict[str, Any]] = []
    skip = 0
    limit = 200

    with httpx.Client(timeout=timeout) as client:
        while True:
            response = client.get(
                f"{base_url}/entities/",
                params={"skip": skip, "limit": limit},
                headers={"Authorization": f"Bearer {token}"},
            )
            if response.status_code != 200:
                raise HTTPException(
                    status_code=502,
                    detail="No fue posible obtener las entidades públicas",
                )

            data = response.json()
            items = data.get("items", [])
            entidades.extend(items)

            total = data.get("total")
            if not items or (total is not None and len(entidades) >= total):
                break
            skip = len(entidades)

    return entidades
@router.post("/entidades-publicas")
def sincronizar_entidades_publicas(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    """Importa o actualiza entidades públicas como actores de GOVStake."""
    settings = get_settings()
    email_sync, password_sync = settings.interop_sync_credentials

    if not email_sync or not password_sync:
        raise HTTPException(
            status_code=500,
            detail=(
                "No hay credenciales configuradas para leer el catálogo de "
                "interoperabilidad. Define INTEROP_SYNC_EMAIL e "
                "INTEROP_SYNC_PASSWORD, o ADMIN_EMAIL y ADMIN_PASSWORD."
            ),
        )

    base_url = settings.INTEROP_API_URL.rstrip("/")
    try:
        token = _obtener_token(
            base_url,
            email_sync,
            password_sync,
            settings.INTEROP_TIMEOUT_SECONDS,
        )
        entidades = _obtener_entidades(
            base_url,
            token,
            settings.INTEROP_TIMEOUT_SECONDS,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Error inesperado durante la sincronización: {exc}",
        )

    ahora = datetime.now(timezone.utc)
    creados = 0
    actualizados = 0
    omitidos = 0
    errores: List[Dict[str, str]] = []

    for entidad in entidades:
        try:
            entidad_id = entidad.get("id")
            nombre = entidad.get("name")
            if entidad_id is None or not nombre:
                omitidos += 1
                continue

            nit = (entidad.get("nit") or "").strip() or None
            sector = entidad.get("sector_name") or "Sector no especificado"

            actor = None
            if entidad_id is not None:
                actor = (
                    db.query(Actor)
                    .filter(
                        Actor.fuente == "entidad_publica",
                        Actor.entidad_origen_id == entidad_id,
                    )
                    .first()
                )
            if not actor and nit:
                actor = db.query(Actor).filter(Actor.nit == nit).first()

            if actor:
                actor.fuente = "entidad_publica"
                actor.entidad_origen_id = entidad_id
                actor.nombre = nombre
                actor.tipo = "entidad_publica"
                actor.nit = nit
                actor.acronimo = entidad.get("acronym")
                actor.institucion = sector
                actor.departamento = entidad.get("department")
                actor.municipio = entidad.get("municipality")
                actor.email = entidad.get("email")
                actor.telefono = entidad.get("phone")
                actor.is_active = bool(entidad.get("is_active", True))
                actor.descripcion = (
                    f"Entidad pública del sector {sector}, sincronizada desde el "
                    "catálogo de interoperabilidad."
                )
                actor.notas = f"Estado X-Road: {entidad.get('xroad_status', 'not_connected')}"
                actor.ultima_sync = ahora
                actualizados += 1
            else:
                actor = Actor(
                    fuente="entidad_publica",
                    entidad_origen_id=entidad_id,
                    nit=nit,
                    acronimo=entidad.get("acronym"),
                    nombre=nombre,
                    tipo="entidad_publica",
                    institucion=sector,
                    descripcion=(
                        f"Entidad pública del sector {sector}, sincronizada desde el "
                        "catálogo de interoperabilidad."
                    ),
                    departamento=entidad.get("department"),
                    municipio=entidad.get("municipality"),
                    email=entidad.get("email"),
                    telefono=entidad.get("phone"),
                    notas=f"Estado X-Road: {entidad.get('xroad_status', 'not_connected')}",
                    is_active=bool(entidad.get("is_active", True)),
                    ultima_sync=ahora,
                )
                actor.variables = ActorVariables(
                    poder=0,
                    legitimidad=0,
                    urgencia=0,
                    frecuencia_intentos=0,
                )
                db.add(actor)
                creados += 1

        except Exception as exc:
            omitidos += 1
            errores.append({
                "entidad": str(entidad.get("name") or entidad.get("id") or "sin_nombre"),
                "error": str(exc),
            })

    db.commit()

    return {
        "mensaje": "Sincronización de entidades públicas finalizada",
        "creados": creados,
        "actualizados": actualizados,
        "omitidos": omitidos,
        "total_procesado": len(entidades),
        "errores": errores,
        "sincronizado_por": current_user.get("email"),
        "fecha": ahora.isoformat(),
    }

