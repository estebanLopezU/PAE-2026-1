---
name: requirements-tracing
description: Construcción y mantenimiento de la matriz de trazabilidad entre los requisitos del PAE de GOVStake 360 y el código implementado. Verifica qué objetivo/producto del documento está cubierto y dónde.
---

# Skill: Requirements Tracing (PAE → Código)

Usa esta skill cuando quieras demostrar qué requisitos del PAE de GOVStake 360
están implementados (y en qué archivo), o para verificar si falta algo. Es útil
para informes y para priorizar trabajo.

## Requisitos de referencia (extraídos del PAE)

### Objetivo general
Diseñar y validar un sistema inteligente de caracterización y gestión de grupos
de interés públicos con matriz de poder-legitimidad-influencia, alertas
relacionales, historial de compromisos y tablero de apoyo a decisiones.

### Objetivos específicos
1. Caracterizar grupos de interés (tipos de actor).
2. Definir modelo de datos y variables de análisis (10 variables).
3. Diseñar prototipo: registro, mapa PLI, matriz de priorización, tablero,
   historial de compromisos y sistema de alertas.
4. Validar con caso piloto (datos reales autorizados o simulados).
5. Protocolo por tipo de actor e índice de calidad del relacionamiento.

### Productos esperados
- Plataforma web prototipo.
- Mapa dinámico poder-legitimidad-influencia y matriz de priorización.
- Alertas sobre cambios de posición, tensiones o riesgo de conflicto.
- Historial de compromisos y tablero de relacionamiento.
- Protocolo de participación por tipo e índice de calidad.
- Informe, manual y socialización.

## Plantilla de matriz de trazabilidad

Formato Markdown (útil para el informe). Cada fila: requisito → módulo(s) →
archivo(s) → estado.

| ID | Requisito (PAE) | Módulo | Archivos que lo implementan | Estado |
|----|------------------|--------|------------------------------|--------|
| R1 | Registro y caracterización de actores | Actores | `app/api/v1/endpoints/actors.py`; `FrontendGovstacke/src/pages/Actores.jsx` | ✅ Implementado |
| R2 | 10 variables de análisis | Modelo | `app/models/actor_variables.py`; `app/seeds/seed_data.py` | ✅ Implementado |
| R3 | Mapa poder-legitimidad-influencia | Matriz | `app/api/v1/endpoints/matriz.py` (`/mapa`); `src/pages/Matriz.jsx` | ✅ Implementado |
| R4 | Matriz de priorización | Matriz | `app/api/v1/endpoints/matriz.py` (`/priorizacion`) | ✅ Implementado |
| R5 | Alertas relacionales | Alertas | `app/api/v1/endpoints/alertas.py`; `evaluar_alertas` en `models/__init__.py` | ✅ Implementado |
| R6 | Historial de compromisos | Compromisos | `app/models/compromiso.py`; `src/pages/Compromisos.jsx` | ✅ Implementado |
| R7 | Tablero de relacionamiento | Dashboard/Relacionamiento | `app/api/v1/endpoints/dashboard.py` | ✅ Implementado |
| R8 | Protocolo por tipo de actor | Protocolo | `app/api/v1/endpoints/protocolo.py` | ✅ Implementado |
| R9 | Índice de calidad del relacionamiento | Lógica negocio | `calcular_indice_relacionamiento` en `models/__init__.py` | ✅ Implementado |
| R10 | Reportes para decisiones | Reportes | `app/api/v1/endpoints/reportes.py` | ✅ Implementado |
| R11 | Validación con datos | Seed | `app/seeds/seed_data.py` (datos simulados) | ✅ Parcial (faltan datos reales autorizados) |
| R12 | Manual / informe / protocolo | Docs | `MANUAL-USUARIO.md`, `INFORME_PRACTICA_ACADEMICA.md` | ✅ Implementado |

(Esta plantilla ya refleja el estado verificado actual del repo.)

## Cómo verificar un requisito nuevo

1. Lee el requisito en el PAE (texto del `.docx`).
2. Busca en el backend (`search_codebase`) los endpoints/rutas del dominio.
3. Confirma el modelo/schema y la vista en el frontend.
4. Marca estado: `✅ Implementado`, `⚠️ Parcial`, `❌ Pendiente`.
5. Si falta: define qué módulo lo atendería antes de marcarlo pendiente.

## Buenas prácticas

- Mantén el ID estable (R1…Rn) para referenciarlo en el informe.
- Al añadir funcionalidad, actualiza la matriz en el mismo cambio.
- Añade una columna "Evidencia" con la ruta de archivo o captura si la hay.
- Revisa coherencia con skills: cambios en variables de actor implican tocar el
  "contrato" (ver `sqlalchemy-models`).

## Checklist

- [ ] Cada requisito del PAE tiene al menos un archivo o estado claro.
- [ ] Estados honestos (`Parcial` si falta algo, p. ej. datos reales).
- [ ] La matriz está en el informe de práctica.
- [ ] Si agregaste código, actualizaste la fila correspondiente.