---
name: xroad-interoperability
description: Dominio y backend de interoperabilidad X-Road / Marco MinTIC para entidades públicas colombianas (BackendInteroperabilidad). Cubre modelos, endpoints, servicios y conceptos: X-Road, Servicios Ciudadanos Digitales, Carpeta Ciudadana, madurez MinTIC y análisis de brechas.
---

# Skill: X-Road / Interoperabilidad (BackendInteroperabilidad)

Usa esta skill al trabajar en el backend de **Análisis de Interoperabilidad del
sector público de Colombia**. Su propósito (según el PAE) es diseñar y ejecutar un
mapeo diagnóstico de entidades públicas que han implementado servicios bajo el
estándar **X-Road** (u otros), evaluando su madurez según el **Marco de
Interoperabilidad del MinTIC**.

## Contexto / vocabulario del dominio

| Término | Significado |
|---------|-------------|
| X-Road | Plataforma/marco de integración federada para intercambio seguro de datos entre sistemas |
| Servicios Ciudadanos Digitales | Ecosistema de servicios del MinTIC para ciudadanía digital |
| AND | Agencia Nacional Digital |
| Carpeta Ciudadana Digital | Carpeta del ciudadano que agrega servicios/trámites interoperados |
| Marco de Interoperabilidad MinTIC | Marco con 4 dominios: **Legal, Organizacional, Semántico y Técnico** |
| CIO | Chief Information Officer (líder de TI de la entidad) |

## Stack del backend

- FastAPI + SQLAlchemy 2.0 + Pydantic v2.
- Base de datos: SQLite local (`xroad_colombia.db`) o PostgreSQL vía env
  `DATABASE_URL`.
- Reportes PDF: `reportlab`; análisis numérico: `scikit-learn`/`pandas`.
- Autenticación/puertos: ver skills `fastapi-api` y `security-auth-jwt`
  (misma base que GOVStake).

## Estructura `app/`

```
app/
├── models/            # Sector, Entity, Service, MaturityAssessment, Relationship, Usuario, Auditoria
├── services/          # Conectores y análisis (ver skills dedicadas)
├── schemas/           # Schemas Pydantic por dominio
├── api/v1/endpoints/  # sectors, entities, services, maturity, dashboard,
│                      # reports, ai_analysis, interoperability, relationships, agentgd
└── main.py            # App, CORS, rate-limit, schema evolution y seed de usuarios
```

## Modelos principales

| Modelo | Tabla | Rol |
|--------|-------|-----|
| `Sector` | `sectors` | Sector público (salud, educación, hacienda…) |
| `Entity` | `entities` | Entidad pública (NIT, sector, ubicación, estado X-Road, info CIO) |
| `Service` | `services` | Servicio de interoperabilidad (protocolo, estándares, estado) |
| `MaturityAssessment` | `maturity_assessments` | Evaluación de madurez (niveles y dominios MinTIC) |
| `Relationship` | `relationships` | Relación entre entidades/servicios |
| `Usuario` / `Auditoria` | usuarios / auditoria | Auth y trazabilidad |

### Campos clave de `Entity`
- `xroad_status`: `not_connected`, `pending`, `connected`.
- `xroad_member_code`, `xroad_connection_date`.
- `cio_name/email/phone` (información del oficial de TI).
- Ubicación: `department`, `municipality`, `latitude`, `longitude` (para mapas).

### Campos clave de `Service`
- `protocol`: `REST`, `SOAP`, `X-Road`.
- Estándares: `data_standard` (NTC-6195…), `semantic_standard`, `security_standard`.
- `status`: `active`, `inactive`, `development`; `is_public`.

## Endpoints (`api/v1/endpoints/`)

Registrados en `api/v1/router.py` (3:

| Router | Prefijo | Dominio |
|--------|---------|---------|
| `sectors` | `/sectors` | Sectores |
| `entities` | `/entities` | Entidades |
| `services` | `/services` | Servicios |
| `maturity` | `/maturity` | Evaluación de madurez (niveles y assessments) |
| `dashboard` | `/dashboard` | Tablero de control |
| `reports` | `/reports` | Reportes (ejecutivo, brechas, madurez) |
| `ai_analysis` | `/ai` | Análisis con IA |
| `interoperability` | `/interop` | Datos abiertos, X-Road, Carpeta Ciudadana, APIs, brechas |
| `relationships` | `/relationships` | Relaciones |
| `agentgd` | `/agentgd` | Chatbot IA |

Convenciones (igual que GOVStake):
- `db: Session = Depends(get_db)`, `current_user: Dict = Depends(get_current_user)`.
- Rutas de escritura/administración: `require_admin`.
- Respuestas de listas: `{"items": [...], "total": N}` (o listas directas con
  `response_model=List[...]` en algunos endpoints).
- Errores con `HTTPException` y mensaje claro (usualmente en inglés en este
  backend; respeta el idioma del archivo que toques).

## Convenciones de los servicios (`app/services/`)

- Los conectores externos usan **dataclasses + Enum** y **simulan** integraciones
  con `asyncio` (no hay red real de X-Road en desarrollo): `xroad_connector.py`,
  `open_data_portal.py`, `digital_citizen_folder.py`.
- Los analizadores son módulos con clases/factores que exponen funciones de
  alto nivel: `gap_analyzer`, `semantic_validator`, `api_analyzer`,
  `ai_analyzer`, `report_generator`.
- El endpoint `interoperability.py` importa y delega en estos servicios;
  no dupliques lógica aquí.

## Buenas prácticas / validación en el mundo real

- Los servicios externos están **simulados** (sin datos vivos de AND/MinTIC).
  Si necesitas datos reales se requieren permisos oficiales (derecho de petición
  a la AND/MinTIC, según el PAE). Mantén la separación simulador/mundo real.
- El PAE contempla: mapeo de vinculación, evaluación de los 4 dominios MinTIC,
  matriz de servicios y Dashboard. Asegúrate de que cualquier add-on regrese a
  estos objetivos (ver skill `requirements-tracing`).

## Checklist

- [ ] Nuevo endpoint registrado en `api/v1/router.py` con su prefijo.
- [ ] Endpoint protegido (`get_current_user` / `require_admin` según proceda).
- [ ] Lógica de análisis delegada a `services/`, no escrita en el endpoint.
- [ ] Errores con `HTTPException`.
- [ ] Si se toca modelo, registrado en `models/__init__.py`.