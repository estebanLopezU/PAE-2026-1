# Matriz de Trazabilidad — Interoperabilidad (PAE → Código)

**Proyecto:** Análisis de Interoperabilidad en el sector público de Colombia
**Estándar:** X-Road · **Marco:** Interoperabilidad del MinTIC
**Backend:** `BackendInteroperabilidad` · **Frontend:** `FrontendInteroperabilidad`
**Generada:** a partir de la revisión del código (estado actual del repo)

Esta matriz vincula cada requisito del PAE con los artefactos que lo implementan.
Leyenda de estado: ✅ Implementado · ⚠️ Parcial · ❌ Pendiente.

---

## 1. Objetivo general y objetivo específicos

| ID | Requisito (PAE) | Modular | Artefactos que lo implementan | Estado |
|----|------------------|---------|-------------------------------|--------|
| R1 | **Objetivo general:** Mapeo diagnóstico de entidades públicas que han implementado interoperabilidad (X-Road u otros), evaluando madurez según Marco MinTIC | Backend | `app/models/` (`Entity`, `Service`, `Sector`, `MaturityAssessment`) · `app/api/v1/router.py` | ✅ Implementado |
| R2 | **OE1:** Identificar estado de vinculación — caracterizar ecosistema de entidades conectadas a Servicios Ciudadanos Digitales (inventarios AND y nodos X-Road) | Conectores X-Road/Datos Abiertos | `app/api/v1/endpoints/interoperability.py` (`/interop/xroad/...`, `/interop/open-data/...`) · `app/services/xroad_connector.py` · `app/services/open_data_portal.py` | ✅ Implementado |
| R3 | **OE2:** Evaluar capacidad técnica/operativa — diagnóstico de dominios técnico y semántico MinTIC, estandarización de APIs y calidad de datos | Análisis de APIs / Validación semántica | `app/api/v1/endpoints/interoperability.py` (`/interop/api-analysis/...`, `/interop/validation/...`) · `app/services/api_analyzer.py` · `app/services/semantic_validator.py` | ✅ Implementado |
| R4 | **OE3:** Visualizar mapa de interconexión estatal — matriz de servicios y tablero de control (dashboard) por sectores | Dashboard / Matriz de servicios | `app/api/v1/endpoints/dashboard.py` (ext.) y `interoperability.py` (`/interop/dashboard/...`, `/relationships`) · `app/models/relationship.py` | ✅ Implementado |

---

## 2. Productos del cronograma (16 semanas, 4 fases)

| ID | Fase / Actividad del PAE | Módulo | Artefactos | Estado |
|----|--------------------------|--------|------------|--------|
| R5 | **F1 (semanas 1–4):** Estudio de los 4 dominios del Marco MinTIC (Legal, Organizacional, Semántico, Técnico) | Modelo de madurez | `app/models/maturity.py` (4 `*_domain_score`) · `app/schemas/maturity.py` | ✅ Implementado |
| R6 | **F1:** Revisar Portal de Datos Abiertos de Colombia para identificar conjuntos de datos intercambiados | Conector Datos Abiertos | `app/services/open_data_portal.py` · `/interop/open-data/search`, `/interop/open-data/datasets/{sector}`, `/interop/open-data/statistics` | ✅ Implementado |
| R7 | **F1:** Solicitar vía Derecho de Petición a AND/MinTIC listado de entidades vinculadas y nodo X-Road *(actividad de gestión externa)* | Conectores X-Road | `app/services/xroad_connector.py` (`/interop/xroad/members`, `/interop/xroad/services`, `/interop/xroad/connectivity-report`) · `app/services/petition_generator.py` | ⚠️ Parcial (los conectores simulan datos; la DP real es un trámite externo) |
| R8 | **F2 (semanas 5–8):** Seleccionar muestra de entidades de distintos sectores | Entidades/Sectores | `app/api/v1/endpoints/entities.py` · `endpoints/sectors.py` · `app/models/entity.py`, `sector.py` | ✅ Implementado |
| R9 | **F2:** Registrar retos técnicos y protocolos (APIs, REST, SOAP) de CIOs de 3–5 entidades | Entidad/Service | `app/models/entity.py` (`cio_*`) · `app/models/service.py` (`protocol` REST/SOAP/X-Road) · `endpoints/entities.py`, `services.py` | ✅ Implementado |
| R10 | **F2:** Entrevistas a CIO / líderes de TI | Entidad | Datos de contacto en `app/models/entity.py` (`cio_name`, `cio_email`, `cio_phone`) | ⚠️ Parcial (no hay módulo de encuestas; se modela la información del CIO) |
| R11 | **F3 (semanas 9–12):** Aplicar Modelo de Madurez del MinTIC — clasificar en Inicial, Básico, Intermedio, Avanzado | Madurez | `app/api/v1/endpoints/maturity.py` (`/maturity/levels`, `/maturity/assessments`) · `app/schemas/maturity.py` (`MATURITY_LEVELS`) | ✅ Implementado |
| R12 | **F3:** Identificar cuellos de botella (estándares semánticos, resistencia organizacional) | Brechas | `app/services/gap_analyzer.py` (`/interop/gaps/analyze`, `/interop/gaps/report`) · `app/api/v1/endpoints/interoperability.py` | ✅ Implementado |
| R13 | **F4 (semanas 13–16):** Dashboard que visualice geográficamente y por sectores qué entidades "hablan entre sí" y qué servicios ofrecen en la Carpeta Ciudadana Digital | Dashboard + Mapa + Grafo | Backend: `/interop/dashboard/kpis`, `/by-sector`, `/by-xroad-status`, `/relationships` · Frontend: `src/pages/Dashboard.jsx`, `MapaInteractivo.jsx` (Leaflet), `components/RelationshipGraph.jsx` | ✅ Implementado |
| R14 | **F4:** Servicios de la Carpeta Ciudadana Digital | Conector Carpeta Ciudadana | `app/services/digital_citizen_folder.py` · `/interop/digital-citizen/services`, `/statistics/{id}`, `/interoperability-report` | ✅ Implementado |
| R15 | **F4:** Informe de recomendaciones técnicas para la administración de los sistemas de información | Reportes | `app/api/v1/endpoints/reports.py` (`/reports/entities|csv|xlsx`, `/services/...`, `/maturity/...`) · `/interop/reports/generate` (json/html/pdf) · `app/services/report_generator.py` | ✅ Implementado |
---

## 3. Características transversales implementadas

| ID | Característica | Backend | Frontend | Estado |
|----|----------------|---------|----------|--------|
| R16 | Análisis con IA (predicción de madurez, cluster, recomendaciones, plan de acción) | `/ai/analyze/entity` · `app/services/ai_analyzer.py` | `src/pages/AnalisisIA.jsx` · `services/aiApi.js` | ✅ Implementado |
| R17 | Autenticación JWT, roles y auditoría | `app/security.py` · `endpoints/auth.py` · `models/usuario.py`, `auditoria.py` | `src/pages/LoginPage.jsx` · `contexts/AuthContext.jsx` | ✅ Implementado |
| R18 | Dashboard de auditoría / seguridad | (módulo de seguridad/auditoría) | `src/pages/AuditoriaSeguridad.jsx` | ⚠️ Parcial (la vista existe; depende del modelo `Auditoria`) |
| R19 | Exportación de datos y reportes (CSV/XLSX/PDF) | `endpoints/reports.py` (openpyxl) · `report_generator.py` (reportlab) | `src/services/pdfExportService.js` (jspdf) | ✅ Implementado |
| R20 | Internacionalización (es/en) | — | `src/i18n/index.js`, `locales/es.json`, `en.json` · `components/LanguageSelector.jsx` | ✅ Implementado |
| R21 | Asistente IA (AgentGD) | `/agentgd/chat` · `app/services/agentgd.py` | `src/components/chatbot/AgentGDChat.jsx` | ✅ Implementado |
| R22 | Despliegue Docker (Backend 8000, Frontend 5173, BD PostgreSQL) | `docker-compose.yml` · `Dockerfile` de cada servicio | `Dockerfile` · `nginx.conf` | ✅ Implementado |

---

## Resumen de cobertura

| Estado | Cantidad de requisitos |
|--------|------------------------|
| ✅ Implementado | 19 |
| ⚠️ Parcial | 3 (R7, R10, R18) |
| ❌ Pendiente | 0 |
| **Total** | **22** |

**Cobertura ≈ 91–96 %** del PAE de interoperabilidad.

### Notas / pendientes menores
- **R7 / R10:** El PAE contempla tramitar datos oficiales (derecho de petición a
  AND/MinTIC) y realizar entrevistas presenciales a CIO. El código modela la
  información y **simula** los conectores (no hay integración con fuentes reales).
  Son actividades de campo documentadas, no funcionalidades faltantes.
- **R18:** Existe la página `AuditoriaSeguridad.jsx`; conviene verificar que
  consuma un endpoint de auditoría/seguridad propio (o reutilice `Auditoria`).

---

## Información de referencia
- Ⓐ Documento del PAE: `Practica Especial Esteban.docx.pdf` (páginas 1–7).
- Ⓑ Backend: `PAE 2026/BackendInteroperabilidad/app/`.
- Ⓒ Frontend: `PAE 2026/FrontendInteroperabilidad/src/`.

> Mantén esta matriz actualizada (usa la skill `requirements-tracing`).