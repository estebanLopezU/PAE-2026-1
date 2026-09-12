---
name: interop-maturity-model
description: Modelo de Madurez de Interoperabilidad del MinTIC aplicado en el backend de interoperabilidad. Explica los 4 dominios (Legal, Organizacional, Semántico, Técnico), niveles Inicial-Básico-Intermedio-Avanzado y el modelo MaturityAssessment.
---

# Skill: Modelo de Madurez MinTIC (BackendInteroperabilidad)

Usa esta skill al trabajar con la evaluación de madurez de entidades públicas
según el **Marco de Interoperabilidad del MinTIC**.

## El modelo (según el PAE del proyecto)

El objetivo del PAE incluye clasificar entidades en niveles de madurez
**Inicial, Básico, Intermedio o Avanzado**, evaluando los **4 dominios** del
Marco MinTIC. Esto se modela en `MaturityAssessment`.

### 4 dominios

| Dominio | Puntaje de modelo | Significado |
|---------|-------------------|-------------|
| Legal | `legal_domain_score` | Marco normativo que habilita el intercambio |
| Organizacional | `organizational_domain_score` | Capacidad y procesos organizacionales |
| Semántico | `semantic_domain_score` | Lenguaje común y calidad de datos |
| Técnico | `technical_domain_score` | Estándares técnicos, APIs, seguridad |

### Niveles globales

- `overall_level` (**1–4**): 1=Inicial, 2=Básico, 3=Intermedio, 4=Avanzado.
- `overall_score` (**0–100**): puntaje global.

### Criterios detallados (columnas 0–4)

`MaturityAssessment` guarda criterios numéricos 0–4 (según esquema `MATURITY_LEVELS`):

- `has_api_documentation`
- `uses_standard_protocols`
- `has_data_quality`
- `has_security_standards`
- `has_interoperability_policy`
- `has_trained_personnel`

Y campos de contexto: `assessor_name`, `assessor_notes`, `recommendations`,
`assessment_date`.

## Archivos relevantes

- Modelo: `app/models/maturity.py`.
- Schema + niveles: `app/schemas/maturity.py` (expone `MATURITY_LEVELS`,
  `MaturityAssessmentCreate/Update`).
- Endpoint: `app/api/v1/endpoints/maturity.py`.

## Endpoints de madurez (`/maturity`)

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/maturity/levels` | GET | Devuelve `MATURITY_LEVELS` (público) |
| `/maturity/assessments` | GET | Lista (filtros: `entity_id`, `min_level`, `max_level`, `skip`, `limit`) |
| `/maturity/assessments/{id}` | GET | Detalle de una evaluación |
| + rutas POST/PUT para crear/actualizar evaluaciones (con `require_admin`) |

El listado enriquece cada assessment con `entity_name` desde la relación `entity`.

## Convenciones

- Un assessment siempre referencia una `entity` (`entity_id` no nulo).
- Guarda los 4 puntajes de dominio (0–100) y el nivel/score global en el mismo
  registro.
- Si calculas el nivel automáticamente a partir de los dominios, documenta la
  regla y mantenla consistente con `MATURITY_LEVELS` del schema.

## Buenas prácticas (alineadas al PAE)

- Aplicar el modelo a una **muestra** de entidades de distintos sectores
  (salud, educación, hacienda), no a todo el catálogo sin criterio.
- Identificar **cuellos de botella** (falta de estándares semánticos, resistencia
  organizacional) y reflejarlos en `recommendations`.
- Usar `assessor_notes` para registrar el origen (entrevista a CIO, análisis de
  APIs, etc.) según la metodología del PAE.

## Checklist

- [ ] Assessment referenciando una entidad existente.
- [ ] Puntajes de los 4 dominios presentes.
- [ ] Nivel (1–4) y score (0–100) coherentes.
- [ ] Recomendaciones/cuellos de botella documentados.
- [ ] Rutas de escritura protegidas con `require_admin`.