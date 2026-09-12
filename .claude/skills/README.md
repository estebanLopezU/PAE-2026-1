# Skills del proyecto PAE / GOVStake 360

Este directorio agrupa **Skills** reutilizables en el formato estándar de agentes de
código (Cline / Claude Code). Cada Skill es una carpeta con un `SKILL.md` que
codifica conocimiento y convenciones específicas de este repositorio para que el
agente trabaje de forma consistente y con menos errores.

## Cómo usar estas Skills

Cada Skill tiene formato:

```
skills/<nombre>/SKILL.md        # instrucciones principales (obligatorio)
skills/<nombre>/references/     # documentación de apoyo (opcional)
skills/<nombre>/scripts/        # scripts de ayuda (opcional)
```

### Opción A: activarlas para el agente (recomendado)

Copia (o enlaza) las Skills que quieras activar a tu dotfiles/rutas que el agente
detecta de forma automática, por ejemplo en `.claude/skills/`:

```powershell
# Windows PowerShell: copia una skill específica
Copy-Item -Recurse "skills/security-auth-jwt" ".claude/skills/"
Copy-Item -Recurse "skills/fastapi-api"        ".claude/skills/"
```

### Opción B: invocarlas manualmente

Menciona la habilidad en tu instrucción, p. ej.:

> "Usa la skill **fastapi-api** para agregar un nuevo endpoint `TAGS`."

Con eso el agente lee `skills/fastapi-api/SKILL.md` y aplica esas directrices.

## Catálogo de Skills

| Skill | Propósito | Aplica a |
|-------|-----------|----------|
| [fastapi-api](./fastapi-api/SKILL.md) | Patrones de endpoints, routers, schemas y versionado `/api/v1` | `BackendGovstacke`, `BackendInteroperabilidad` |
| [sqlalchemy-models](./sqlalchemy-models/SKILL.md) | Modelos, relaciones, índices de negocio y migraciones | Modelos SQLAlchemy |
| [security-auth-jwt](./security-auth-jwt/SKILL.md) | JWT, bcrypt, roles, rate limiting, auditoría | `app/security.py`, `auth` |
| [data-protection](./data-protection/SKILL.md) | Principios RGPD/ley de datos aplicados a actores públicos | Backend, docs, seeds |
| [react-vite-tailwind](./react-vite-tailwind/SKILL.md) | Estructura `src/pages`, rutas, `api.js`, Tailwind | `FrontendGovstacke` |
| [ux-a11y-dashboard](./ux-a11y-dashboard/SKILL.md) | Tableros claros, KPIs, accesibilidad y mapas | `Dashboard.jsx`, `Matriz.jsx`, vistas |
| [unit-testing](./unit-testing/SKILL.md) | pytest (backend) y vitest (frontend) | Todo el repo |
| [code-review-refactoring](./code-review-refactoring/SKILL.md) | Revisión y refactor coherente entre los 2 backends | Backends |
| [docker-deployment](./docker-deployment/SKILL.md) | Imágenes, `docker-compose.yml`, puertos y envs | Raíz `PAE 2026` |
| [technical-writing](./technical-writing/SKILL.md) | Manual, informe final, protocolo y guías | Documentos `.md` |
| [requirements-tracing](./requirements-tracing/SKILL.md) | Matriz de trazabilidad PAE → código | Gestión de requisitos |

### Interoperabilidad (X-Road / MinTIC)

| Skill | Propósito | Aplica a |
|-------|-----------|----------|
| [xroad-interoperability](./xroad-interoperability/SKILL.md) | Dominio y backend de interoperabilidad X-Road / Marco MinTIC | `BackendInteroperabilidad` |
| [interop-maturity-model](./interop-maturity-model/SKILL.md) | Modelo de madurez MinTIC (Legal, Organizacional, Semántico, Técnico) | Modelo/endpoints `maturity` |
| [interop-external-connectors](./interop-external-connectors/SKILL.md) | Conectores: Datos Abiertos, X-Road, Carpeta Ciudadana | `app/services/` |
| [interop-ai-analysis](./interop-ai-analysis/SKILL.md) | Análisis IA: APIs, brechas y semántica | `gap_analyzer`, `semantic_validator`, `api_analyzer`, `ai_analyzer` |
| [interop-frontend-xroad](./interop-frontend-xroad/SKILL.md) | Frontend i18n, mapas Leaflet, grafos y PDF | `FrontendInteroperabilidad` |

## Buenas prácticas de mantenimiento

- Mantener el `SKILL.md` alineado con el código real; si cambia una convención
  (p. ej. un paquete), actualiza la Skill correspondiente.
- Añadir `references/` con ejemplos extraídos del propio repo cuando aporten.
- Cada Skill debe ser **accionable**: pasos concretos, no teoría genérica.