---
name: interop-ai-analysis
description: Análisis de interoperabilidad asistido por IA: análisis de APIs, validación semántica, análisis de brechas (gaps) y generación de reportes. Explica los servicios gap_analyzer, semantic_validator, api_analyzer y ai_analyzer y sus endpoints.
---

# Skill: Análisis de Interoperabilidad con IA (BackendInteroperabilidad)

Usa esta skill al trabajar con el análisis automático/IA de APIs, brechas y
semántica, y con su agrupación bajo `/interop` y `/ai`.

## Servicios de análisis (`app/services/`)

### `api_analyzer.py` — Análisis de APIs
- Analiza la calidad/estandarización de una API de una entidad (`analyze_entity_api`).
- Útil para evaluar los dominios Técnico/Semántico del Marco MinTIC.

### `semantic_validator.py` — Validación semántica
- Valida semántica y estructura de endpoints de APIs gubernamentales
  (`validate_api_semantics`, `get_validation_errors`).
- Enums:
  - `ValidationSeverity`: `error`, `warning`, `info`.
  - `ValidationCategory`: `naming`, `structure`, `parameters`, `response`,
    `documentation`, `security`.
  - `ValidationIssue` (dataclass): id, category, severity, …
- Las funciones de validación son `async` (usan `asyncio`, `re`).

### `gap_analyzer.py` — Análisis de brechas
- Identifica gaps en servicios, APIs y documentos de entidades
  (`analyze_interoperability_gaps`).
- Enums:
  - `GapSeverity`: `critical`, `high`, `medium`, `low`, `info`.
  - `GapCategory`: `api_availability`, `documentation`, `security`, `performance`,
    `compliance`, `interoperability`.
  - `Gap` (dataclass): id, title, description, category, severity, …
- Usa `statistics` para agregados numéricos.

### `ai_analyzer.py` — Análisis con IA
- Genera análisis/insights con IA sobre los datos (para el módulo `AnalisisIA`
  y el tablero).

### `report_generator.py` — Generación de reportes
- Genera reportes (ejecutivo, brechas, madurez) y exportables PDF.
- Funciones: `generate_executive_summary`, `generate_gap_report`,
  `generate_entity_maturity_report`.

## Endpoints

### En `interoperability.py` (`/interop`)
- Solicitudes tipo: `APIAnalysisRequest` (`base_url`, `entity_name`, `entity_code`)
  y `GapAnalysisRequest` (`sector_id`, `include_inactive`).
- Rutas para análisis de API → `api_analyzer`; brechas → `gap_analyzer`;
  validación semántica → `semantic_validator`.

### En `ai_analysis.py` (`/ai`)
- Endpoints de análisis con IA reutilizando `ai_analyzer`.

### En `reports.py` (`/reports`)
- Reportes ejecutivo/brechas/madurez usando `report_generator`.

## Convenciones

- Los `enum`s (severity, category) definen categorías estables que **el frontend
  usa para colorear** alertas/brechas. NO cambies los valores de los enum sin
  ajustar la vista (ver skill `ux-a11y-dashboard` para la semántica de colores).
- Los análisis son operaciones costosas: en endpoints `async def`, y con
  parámetros controlados (límites). Evita análisis masivos sin paginación.
- Los servicios delegan y los endpoints no contienen lógica de negocio.
- Las brechas/validaciones se devuelven como listas tipadas; si necesitas
  `items`/`total`, envuélvelas coherentemente con el resto de la API.

## Buenas prácticas

- Para `APIAnalysisRequest` y `GapAnalysisRequest`, valida la entrada con Pydantic
  (ya definidos como `BaseModel` en el endpoint).
- Mantén la severidad: `critical`/`high` → acción, `medium`/`low` → seguimiento,
  `info` → informativo. Documenta esa semántica en el frontend.
- No guardes resultados de análisis volátiles en la BD si no se necesitan;
  los gaps se calculan bajo demanda desde los servicios.

## Checklist

- [ ] Lógica de análisis vive en `app/services/`, no en el endpoint.
- [ ] Enums de severidad/categoría estables y usados por el frontend.
- [ ] Endpoints `async def` cuando llaman servicios `async`.
- [ ] Entradas validadas con Pydantic.
- [ ] Errores controlados con `HTTPException`.