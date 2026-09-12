---
name: docker-deployment
description: Despliegue con Docker Compose del ecosistema PAE (Interoperabilidad y GOVStake 360). Explica el docker-compose.yml, los servicios, puertos, bases PostgreSQL y variables de entorno.
---

# Skill: Docker Deployment (PAE 2026)

Usa esta skill al trabajar con Docker/despliegue de los servicios del proyecto.

## Contexto: `docker-compose.yml` (raíz `PAE 2026/`)

Levanta el ecosistema completo. Servicios:

| Servicio | Imagen/build | Puerto | Rol |
|----------|-------------|--------|-----|
| `postgres` | `postgres:15-alpine` | (interno) | BD X-Road Colombia |
| `backend` | `./BackendInteroperabilidad` | 8000 | API Interoperabilidad |
| `frontend` | `./FrontendInteroperabilidad` | 5173→80 | Front Interoperabilidad |
| `govstake-db` | `postgres:15-alpine` | (interno) | BD GOVStake 360 |
| `govstake-backend` | `./BackendGovstacke` | 8002 | API GOVStake 360 |

- **Redes**: todo comparte `xroad-network` (bridge).
- **Volúmenes**: `postgres_data` (xroad) y `govstake_data` (govstake).
- **Healthchecks**: los backends esperan a que la BD esté lista
  (`condition: service_healthy` con `pg_isready`).

## Variables de entorno clave

- `DATABASE_URL` se sobreescribe en compose para usar PostgreSQL en vez de
  SQLite local:
  ```
  postgresql://postgres:postgres@govstake-db:5432/govstake360
  ```
- `DEBUG: "false"` en producción.
- Frontend: `VITE_API_BASE_URL=/api/v1`.

> `config.py` de GOVStake lee `.env` (env_file). `JWT_SECRET_KEY` y usuarios demo
> deben estar definidos; en compose vienen por defecto/según el `.env` de cada
> backend. Verifica que `.env` exista en `BackendGovstacke/` antes de levantar.

## Dockerfile GOVStake (`BackendGovstacke/Dockerfile`)

- Base `python:3.11-slim`.
- Instala `gcc` y `postgresql-client` (necesario para `psycopg2-binary`).
- `pip install -r requirements.txt`, copia código, expone `8002`.
- Comando: `uvicorn app.main:app --host 0.0.0.0 --port 8002`.

## Comandos útiles

```powershell
# Levantar todo
docker compose up --build

# Solo GOVStake (backend + su BD)
docker compose up govstake-db govstake-backend

# Ver logs de un servicio
docker compose logs -f govstake-backend

# Detener y limpiar volúmenes (pierde datos locales)
docker compose down -v
```

## Puerto en local (sin Docker)

- Backend GOVStake: `uvicorn app.main:app --reload --port 8002`
- Frontend GOVStake: `npm run dev` (Vite, suele usar 3002/5173 según cors).

## Buenas prácticas

- No commits de `.env` con secrets. Mantén `.env.example` con valores de ejemplo.
- Si cambias la estructura de modelos, borra el volumen de la BD o usa migraciones
  (Alembic está en requirements).
- Mantén los puertos documentados en el README/guía de ejecución.

## Checklist

- [ ] `DATABASE_URL` correcto para el servicio.
- [ ] `.env` presente en cada backend (o envs en compose).
- [ ] Puerto expuesto coincide con el Dockerfile y el CORS del frontend.
- [ ] Healthcheck de BD antes de arrancar backend.