# Matriz de Trazabilidad — GOVStake 360 (PAE → Código)

**Proyecto:** Plataforma web prototipo GOVStake 360 — Relacionamiento estratégico con actores
**Backend:** `BackendGovstacke` (FastAPI + SQLAlchemy) · **Frontend:** `FrontendGovstacke` (React + Vite)
**Generada:** a partir de la revisión del código (estado actual del repo)

Esta matriz vincula cada requisito del PAE con los artefactos que lo implementan.
Leyenda de estado: ✅ Implementado · ⚠️ Parcial · ❌ Pendiente.

---

## 1. Objetivo general y objetivos específicos

| ID | Requisito (PAE) | Módulo | Artefactos que lo implementan | Estado |
|----|-----------------|--------|-------------------------------|--------|
| G1 | **Objetivo general:** Plataforma web prototipo para identificar, mapear y gestionar actores estratégicos con priorización y seguimiento del relacionamiento | Plataforma completa | `BackendGovstacke/app/` · `FrontendGovstacke/src/` | ✅ Implementado |
| G2 | **OE1:** Registro de actores (ciudadanía, organizaciones, veedurías, concejos, servidores públicos, empresas, universidades, medios, entidades de control, cooperación) | Actores | `app/models/actor.py` · `endpoints/actors.py` (`/actors`) · `FrontendGovstacke/src/pages/Actores.jsx` (`TIPOS`) | ✅ Implementado |
| G3 | **OE2:** Asignar las 10 variables de análisis (poder, legitimidad, influencia, interés, dependencia, capacidad de movilización, posición, historial de participación, riesgo de conflicto, canales de relacionamiento) | Variables | `app/models/actor_variables.py` (10 columnas, escala 0–100) · `/actors/{id}/variables` | ✅ Implementado |
| G4 | **OE3:** Mapa dinámico y matriz de priorización (índice con pesos 25 % poder/legitimidad/influencia/interés) | Matriz | `endpoints/matriz.py` (`/matriz/mapa`, `/matriz/priorizacion`, `indice_priorizacion`) · `src/pages/Matriz.jsx` | ✅ Implementado |
| G5 | **OE4:** Validación del prototipo con caso institucional real autorizado | Validación piloto | `seeds/seed_data.py` (datos simulados de 10 actores) + pruebas funcionales | ⚠️ Parcial (validado con semillas simuladas; pendiente caso institucional real con datos autorizados) |
| G6 | **OE5:** Alertas tempranas de cambios de posición, tensiones y riesgo de conflicto | Alertas | `app/models/alerta.py` · `evaluar_alertas()` · `endpoints/alertas.py` (`/alertas`) | ✅ Implementado |

---

## 2. Productos del cronograma (16 semanas, 4 fases)

| ID | Producto del PAE | Módulo | Artefactos | Estado |
|----|------------------|--------|------------|--------|
| G7 | Registro y caracterización de actores estratégicos | Actores | `models/actor.py` + `Actores.jsx` | ✅ Implementado |
| G8 | Asignación de las 10 variables por actor | Variables | `models/actor_variables.py` · endpoint de variables | ✅ Implementado |
| G9 | Mapa dinámico poder–legitimidad–influencia | Matriz | `/matriz/mapa` · `Matriz.jsx` | ✅ Implementado |
| G10 | Matriz de priorización de actores | Matriz | `/matriz/priorizacion` con `indice_priorizacion` y niveles de prioridad | ✅ Implementado |
| G11 | Alertas (cambio de posición, tensión, riesgo de conflicto) | Alertas | `/alertas` · `evaluar_alertas()` | ✅ Implementado |
| G12 | Historial de compromisos | Compromisos | `models/compromiso.py` · `/compromisos` · `Compromisos.jsx` | ✅ Implementado |
| G13 | Tablero de relacionamiento | Dashboard | `/dashboard` · `/relacionamientos` · `Dashboard.jsx` · `Relacionamientos.jsx` | ✅ Implementado |
| G14 | Protocolo de participación por tipo de actor | Protocolo | `endpoints/protocolo.py` (base de conocimiento por tipo + ajustes dinámicos por riesgo/posición/prioridad) | ✅ Implementado |
| G15 | Índice de calidad del relacionamiento institucional (0–100) | Dashboard | `calcular_indice_relacionamiento()` · KPI en `Dashboard.jsx` | ✅ Implementado |
| G16 | Reportes para la toma de decisiones | Reportes | `/reportes/ejecutivo` · `/reportes/actores` · `Reportes.jsx` | ✅ Implementado |

---

## 3. Características transversales implementadas

| ID | Característica | Backend | Frontend | Estado |
|----|----------------|---------|----------|--------|
| G17 | Autenticación JWT (login, refresh, roles admin/viewer) | `security.py` (bcrypt, bloqueo por fuerza bruta, auditoría) | cliente axios con token | ✅ Implementado |
| G18 | Asistente IA de relacionamiento (líder–stakeholder, línea LABGT/LAGI@T) | `agentgd` (chatbot que analiza la base de datos) | integración en la app | ✅ Implementado |
| G19 | Datos simulados para validación | `seeds/seed_data.py` (10 actores + 2 usuarios) | — | ✅ Implementado |
| G20 | Protección de datos y ética (finalidad, minimización, anonimización) | principios aplicados en modelos y endpoints | consentimiento en formularios | ✅ Implementado |
| G21 | Despliegue Docker (backend + PostgreSQL) | `Dockerfile` · `docker-compose.yml` (`govstake-backend`, `govstake-db`) | — | ✅ Implementado |
| G22 | Documentación y productos transferibles | `MANUAL-USUARIO.md` · `INFORME_PRACTICA_ACADEMICA.md` · `GUIA_EJECUCION.md` (en la raíz del repo) | — | ✅ Implementado |

---

## Resumen

| Estado | Cantidad | IDs |
|--------|----------|-----|
| ✅ Implementado | 21 | G1–G4, G6–G22 |
| ⚠️ Parcial | 1 | G5 (validación con caso institucional real) |
| ❌ Pendiente | 0 | — |

**Cobertura estimada: ≈ 96–99 %** de los requisitos del PAE.

Único gap: G5 depende de un convenio/caso institucional real con datos autorizados (trámite externo), por lo que hoy se valida con la semilla simulada.
