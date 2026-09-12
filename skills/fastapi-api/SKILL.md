---
name: fastapi-api
description: Patrones para crear y mantener endpoints FastAPI en GOVStake 360 / Interoperabilidad. Cubre routers, schemas Pydantic, dependencias, versionado /api/v1, CORS y manejo de errores, alineados a la estructura real del repo.
---

# Skill: FastAPI API (BackendGovstacke / BackendInteroperabilidad)

Usa esta skill cada vez que crees, modifiques o revises endpoints del backend.

## Estructura obligatoria del backend

```
BackendGovstacke/app/
├── main.py                    # App FastAPI, CORS, rate-limit, seed de arranque
├── config.py                  # Settings Pydantic + .env
├── database.py                # engine, Base, SessionLocal, get_db
├── security.py                # JWT, bcrypt, roles, auditoría
├── models/                    # Modelos SQLAlchemy (ver skill sqlalchemy-models)
├── schemas/                   # Schemas Pydantic (ver skill sqlalchemy-models)
├── seeds/seed_data.py         # Datos de ejemplo
└── api/v1/
    ├── router.py              # Registro de todos los módulos de endpoints
    └── endpoints/             # Un archivo por dominio (actors, matriz, alertas…)
```

## Convenciones de endpoints

1. **Un archivo por dominio** en `app/api/v1/endpoints/` (p. ej. `actors.py`,
   `alertas.py`). Evita exprimir muchos dominios en un solo archivo.

2. **Router local y registro centralizado**:
   ```python
   from fastapi import APIRouter, Depends
   router = APIRouter()

   @router.get("/todos")
   def listar(db: Session = Depends(get_db), _=Depends(get_current_user)):
       ...
   ```
   Luego regístralo en `api/v1/router.py`:
   ```python
   api_router.include_router(mi_modulo.router, prefix="/midominio", tags=["Mi dominio"])
   ```

3. **Versionado**: toda la API vive bajo `/api/v1` (prefijo global en `main.py`).
   NO añadas `/v1` en los prefixes de cada router.

4. **Autenticación por omisión**: todos los endpoints protegidos deben declarar
   `_=Depends(get_current_user)`. Para acciones de administración usa
   `current_user: dict = Depends(require_admin)`.

5. **Dependencia de sesión**: usa siempre `db: Session = Depends(get_db)` (de
   `app/database.py`), nunca importar `Session` global.

6. **Schemas Pydantic**: valida *input* y arma *output* con schemas de
   `app/schemas/`; en la práctica el repo serializa con helpers (ver `_helpers.py`),
   así que mantente coherente con ese patrón para respuestas de actores.

7. **Manejo de errores**: usa `HTTPException` de FastAPI con códigos semánticos
   (404 no encontrado, 400 validación, 401/403 auth, 423 cuenta bloqueada, 429
   rate-limit). Devuelve mensajes en español y breves.

8. **Paginación**: usa `DEFAULT_PAGE_SIZE` / `MAX_PAGE_SIZE` de `config.py`.
   Encapsula parámetros `skip`/`limit` en las rutas que listan.
   Respuesta estándar de listas: `{"items": [...], "total": N}`.

## Modelo de respuesta típico para listas

```python
return {"items": items, "total": len(items)}
```

## CORS y arranque

- CORS ya está configurado en `main.py` con `settings.CORS_ORIGINS`. No lo
  dupliques salvo necesidad explícita.
- El rate limit está en el middleware de `main.py` (`RATE_LIMIT_PER_MINUTE`).
- El seed de arranque se ejecuta en el evento `startup` (crea tablas y actores de
  ejemplo si está vacío). Si agregas un nuevo modelo, regístralo en
  `models/__init__.py` para que se cree la tabla.

## Checklist antes de terminar

- [ ] Endpoint protegido con `Depends(get_current_user)` (o `require_admin`).
- [ ] Router registrado en `api/v1/router.py`.
- [ ] Errores con `HTTPException` y mensaje en español.
- [ ] Listas devuelven `{"items": [...], "total": N}`.
- [ ] Sin importar `Session` global; siempre `Depends(get_db)`.
- [ ] No se duplicó CORS ni configuración de `main.py`.