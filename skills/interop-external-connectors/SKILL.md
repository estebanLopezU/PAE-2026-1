---
name: interop-external-connectors
description: Conectores a fuentes externas de la interoperabilidad colombiana: Portal de Datos Abiertos, X-Road Colombia y Carpeta Ciudadana Digital. Explica los servicios simulados y cómo se consumen desde los endpoints.
---

# Skill: Conectores Externos de Interoperabilidad (BackendInteroperabilidad)

Usa esta skill al trabajar con los conectores que simulan el acceso a fuentes
externas del ecosistema de interoperabilidad colombiano.

## Los 3 conectores (`app/services/`)

### 1. `xroad_connector.py` — X-Road Colombia
- Simula la plataforma **X-Road** de interoperabilidad.
- Usa `dataclasses` + `Enum` + `asyncio`:
  - `XRoadMemberStatus`: `REGISTERED`, `APPROVED`, `DELETION`.
  - `XRoadMember` (member_code, member_name, member_class, status, services_count, last_activity).
  - `XRoadService` (service_code, service_name, provider_member, protocol, status, response_time).
  - `XRoadStatistics` (estadísticas agregadas).
- Expone: `get_xroad_members`, `get_xroad_services`, `get_xroad_connectivity_report`
  (singleton `xroad_connector`).

### 2. `open_data_portal.py` — Portal de Datos Abiertos de Colombia
- Simula el **Portal de Datos Abiertos** (datos.gobierno / datos abiertos MinTIC).
- Expone: `open_data_client`, `get_open_data_statistics`,
  `search_interop_datasets(query, ...)`.
- Se usa para identificar conjuntos de datos que ya se intercambian (objetivo del
  PAE, semanas 1–4).

### 3. `digital_citizen_folder.py` — Carpeta Ciudadana Digital
- Simula la **Carpeta Ciudadana Digital** del ecosistema de Servicios Ciudadanos
  Digitales del MinTIC.
- Expone: `digital_citizen_client`, `get_digital_services`,
  `get_interoperability_report`.

## Cómo se consumen (`app/api/v1/endpoints/interoperability.py`)

El endpoint principal importa y delega:

```python
from ....services.xroad_connector import xroad_connector, get_xroad_members, get_xroad_services, get_xroad_connectivity_report
from ....services.open_data_portal import open_data_client, get_open_data_statistics, search_interop_datasets
from ....services.digital_citizen_folder import digital_citizen_client, get_digital_services, get_interoperability_report
```

Rutas típicas bajo `/interop`:

| Ruta | Fuente | Función |
|------|--------|---------|
| `/interop/open-data/statistics` | Datos Abiertos | Estadísticas del portal |
| `/interop/open-data/search` | Datos Abiertos | Búsqueda de datasets (`query`, `limit`) |
| `/interop/open-data/xroad` | X-Road | Miembros/servicios X-Road |
| /interop · digital-citizen | Carpeta Ciudadana | Servicios y reporte de interoperabilidad |
| (reportes de conectividad) | X-Road | Reporte de conectividad |

Todas con `Depends(get_current_user)` y manejo `try/except` → `HTTPException`.

## Convenciones

- Los conectores son **funciones `async`** (usan `await`); los endpoints que las
  llaman deben ser `async def`. Respeta esto al agregar rutas.
- Respuesta típica: `{"success": True, "data": ..., "total": ...}`.
- Los datos son **simulados** (no llamadas reales a AND/MinTIC). No asumas que
  los datos son oficiales; están para maquetear y validar el diseño.
- Para producción real hace falta autorización oficial (derecho de petición a la
  AND/MinTIC según el PAE); mantén la interfaz para poder sustituir el simulador
  por un cliente real sin romper los endpoints.

## Buenas prácticas / estabilidad

- Nunca dejes que un fallo del conector tumbe toda la App: captura la excepción y
  lanza `HTTPException(500, ...)` con el detalle.
- Respeta los parámetros de paginación que ya usan los endpoints
  (`limit` con `ge=1, le=200`).
- Si agregas una fuente nueva, crea un módulo en `app/services/` con una interfaz
  `async` y unélo en `interoperability.py`, igual que los existentes.

## Checklist

- [ ] Conector como módulo `async` en `app/services/`.
- [ ] Endpoint `async def` con `Depends(get_current_user)`.
- [ ] `try/except` → `HTTPException` para estabilidad.
- [ ] Respuesta consistente `{"success", "data", "total"}`.
- [ ] Documentado si es simulado o requiere datos oficiales.