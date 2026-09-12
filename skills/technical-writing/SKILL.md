---
name: technical-writing
description: Redacción y mantenimiento de la documentación del proyecto PAE/GOVStake 360: manual de usuario, informe final de práctica, protocolo, guía de ejecución y artículos. Estilo claro, neutral y orientado a entidades públicas.
---

# Skill: Technical Writing (Documentación PAE / GOVStake 360)

Usa esta skill al redactar, editar o traducir documentos del repositorio como
`MANUAL-USUARIO.md`, `INFORME_PRACTICA_ACADEMICA.md`, `GUIA_EJECUCION.md`,
`articulo.md`, `SECURITY_HARDENING.md`, u otros `.md`.

## Objetivo del documento

Cada doc del repo tiene un lector distinto. Define el objetivo antes de escribir:

| Documento | Público | Enfoque |
|-----------|---------|---------|
| `MANUAL-USUARIO.md` | Usuario final / entidad pública | Cómo usar la plataforma paso a paso |
| `INFORME_PRACTICA_ACADEMICA.md` | Evaluadores académicos | Resultados, metodología, evidencias |
| `GUIA_EJECUCION.md` | Desarrollador/operador | Cómo levantar y desplegar |
| `articulo.md` | Comunidad académica | Aporte de investigación aplicada |
| `SECURITY_HARDENING.md` | Técnico/Seguridad | Medidas de seguridad |

## Estilo de escritura

- **Neutral e institucional**, sin jerga para usuarios finales; técnico solo en
  docs para desarrolladores.
- Verbos en infinitivo o presente ("Ingrese", "El sistema permite", no "Se debe...").
- Frases cortas, en español, sin anglicismos innecesarios (square en vez de
  ambigüedad; "dashboard" → "tablero" la primera vez, luego puede citarse).
- Estructura con encabezados jerárquicos (`#`, `##`, `###`) y listas.
- Tablas para datos comparativos (puertos, ventajas).

## Contenido recomendado por tipo

### Manual de usuario
1. Introducción (qué es GOVStake 360 y para qué sirve).
2. Requisitos previos (cuenta, navegador, accesos y roles).
3. Guía por módulo: Actores, Matriz/Mapa, Compromisos, Relacionamientos, Alertas,
   Protocolo, Reportes. Acorde a las rutas reales de `App.jsx`.
4. Flujos: registrar actor, asignar variables, ver alertas, generar reporte.
5. Preguntas frecuentes y solución de problemas comunes.

### Informe de práctica académica
- Contexto y problema público (alineado con el PAE).
- Metodología y cronograma (coherente con las 16 semanas del PAE).
- Lo construido (backend + frontend + agentgd) y cómo valida el PAE.
- Evidencias (prototipo, matriz de variables, manual, protocolo, informe).
- Aspectos éticos y de protección de datos (ver skill `data-protection`).
- Proyecciones a futuro (escalar a consultoría/alcaldías).

## Coherencia con el código

- Menciona solo funcionalidades **existentes** (revisa rutas/endpoints).
- Puerto/rutas reales: API `/api/docs`, `/api/v1`; frontend puerto según CORS.
- No inventes módulos; si el doc describe algo inexistente, márcalo o actualiza el
  código/skill en vez de forzar el doc.

## Checklist

- [ ] Objetivo y público claros.
- [ ] Estructura jerárquica y listas/tablas.
- [ ] Lenguaje institucional, claro, en español.
- [ ] Solo funcionalidades reales del repo.
- [ ] Sección de ética/protección de datos donde corresponda.