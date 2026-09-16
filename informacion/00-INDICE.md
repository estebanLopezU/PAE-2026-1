# 📚 Información del Proyecto — Índice de Documentos

**Proyecto:** PAE-2026-1 — GOVStake 360 + Interoperabilidad X-Road + Portal de Entrada
Esta carpeta reúne **toda la documentación del proyecto**, enumerada y organizada por función.
Enlace rápido a la versión desplegada: **https://pae-portal.vercel.app** · Detalles en el doc **1 (DEPLOY.md)**.

---

## 🗂️ Enumeración de documentos

| # | Documento | Función |
|---|-----------|---------|
| **00** | `00-INDICE.md` | Este índice: enumera y describe todos los documentos de la carpeta |
| **01** | `DEPLOY.md` | Guía de **despliegue en Internet** (producción: Vercel + Render + Neon) |
| **02** | `MANUAL_LEVANTAR_PROYECTO.md` | Cómo **levantar el proyecto en local** con un solo comando |
| **03** | `README-SUITE.md` | **Presentación de la suite** (era el README de `PAE 2026/`): qué es cada plataforma, acceso rápido y credenciales |
| **04** | `MANUAL-USUARIO.md` | **Manual de usuario** completo de X-Road Colombia, paso a paso (instalación, uso, BD, problemas) |
| **05** | `GUIA_EJECUCION.md` | **Guía de ejecución detallada** de la suite (arquitectura de servicios, requisitos, instalación, verificación) |
| **06** | `INFORME_PRACTICA_ACADEMICA.md` | **Informe académico** del PAE: metodología, hallazgos, conclusiones y evidencias |
| **07** | `articulo.md` | **Artículo de investigación** (en inglés) sobre evaluación automática de madurez del ecosistema X-Road |
| **08** | `MATRIZ_TRAZABILIDAD_GOVSTAKE.md` | **Trazabilidad PAE → código** de GOVStake 360 (requisitos G1–G22 y su implementación) |
| **09** | `MATRIZ_TRAZABILIDAD_INTEROPERABILIDAD.md` | **Trazabilidad PAE → código** de Interoperabilidad X-Road (requisitos R1+ y su implementación) |
| **10** | `SECURITY_HARDENING.md` | **Seguridad y endurecimiento** (JWT, roles, rate limiting, auditoría) de ambos microservicios |

---

## 01 — `DEPLOY.md` — Despliegue en producción
**Función:** documento maestro del despliegue 24/7 (no depende de tu PC).

1. **URLs en producción** (Portal, GOVStake, Interop en Vercel; APIs en Render; BD en Neon) + enlaces de diagnóstico (health/docs)
2. **Credenciales de demo** (admin, usuario solo lectura, analista)
3. **Arquitectura desplegada** (diagrama Vercel → Render → Neon)
4. **Reproducir el despliegue desde cero** (Blueprint de Render con `render.yaml`, frontends en Vercel, CORS)
5. **Verificación del despliegue** (curl de salud y login)
6. **Actualizar el despliegue** (backends: auto-deploy por `git push`; frontends: conectar Git en Vercel o redeploy CLI)
7. **Limitaciones del plan gratuito** (Render duerme tras 15 min; Neon no expira)
8. **Desarrollo local: sin cambios**

## 02 — `MANUAL_LEVANTAR_PROYECTO.md` — Levantar en local
**Función:** correr todo el stack en tu máquina con un comando.

1. **`setup-all.ps1`** — primera vez: instala Docker/Node/Python automáticamente (idempotente)
2. **Requisitos previos** (Docker Desktop, Node 18+, PowerShell)
3. **Levantar TODO con un solo comando** — `start-all.cmd` (doble clic) o `start-all.ps1`
4. **URLs del stack local** (Portal :3000, GOVStake :3002, Interop :5173, APIs :8000/:8002) y credenciales demo
5. **Detener todo** — `stop-all.ps1` (conserva datos)
6. **Solución de problemas** (Docker lento, puertos ocupados, frontend desactualizado)
7. **Arquitectura local** (resumen en diagrama)

## 03 — `README-SUITE.md` — Presentación de la suite
**Función:** portada del proyecto; qué es y cómo se conecta todo.

1. **Suite multi-plataforma** — X-Road Colombia, GOVStake 360, Portal de Entrada, AgentGD (chatbot IA)
2. **Guía rápida de ejecución** (requisitos, inicio de servicios)
3. **Accesos directos** (URLs locales y docs de API)
4. **Credenciales** (admin y usuario demo; bcrypt + bloqueo por fuerza bruta)
5. **Comandos útiles de mantenimiento** (docker ps, logs)

## 04 — `MANUAL-USUARIO.md` — Manual de usuario
**Función:** manual completo para usuarios finales y personal técnico de la entidad.

1. Introducción (arquitectura general + URLs de producción)
2. Requisitos del sistema (hardware/software)
3. Instalación de Docker Desktop (Windows/macOS/Linux)
4. Instalación de Git
5. Descarga del proyecto
6. Configuración del entorno (variables `.env`)
7. Ejecución del proyecto (backend y frontend)
8. Acceso a la aplicación (por sistema operativo)
9. Gestión de la base de datos (psql, respaldo/restauración)
10. Credenciales de acceso (roles)
11. Comandos útiles (Docker: logs, rebuild, espacio, consolas)
12. Solución de problemas comunes (puertos, BD, caché, proxy, permisos)
13. Estructura del proyecto
14. Apéndice: dependencias
15. Soporte y contacto · Checklist de verificación rápida

## 05 — `GUIA_EJECUCION.md` — Guía de ejecución detallada
**Función:** guía paso a paso para desarrolladores/operadores de la suite completa.

1. Arquitectura de servicios (tabla de puertos y tecnologías)
2. Tabla de contenido
3. Ejecución rápida (`start-all.ps1` / `stop-all.ps1`)
4. Requisitos previos y verificación
5. Instalación paso a paso (clonar, estructura)
6. Configuración del entorno · Ejecución · Verificación de servicios
7. Acceso a la aplicación · Comandos útiles · Solución de problemas

> ⚠️ Nota: las primeras líneas tienen caracteres mal codificados (mojibake de OneDrive); el resto del contenido es correcto.

## 06 — `INFORME_PRACTICA_ACADEMICA.md` — Informe del PAE
**Función:** informe académico formal de la Práctica Académica Especial.

1. Resumen ejecutivo (127 entidades, madurez 2.3/5.0 "Básico")
2. Metodología (6 fases: recolección → validación → instrumento → seguridad → procesamiento → visualización)
3. Limitaciones del estudio
4. Trabajos futuros
5. Introducción · Datos y fuentes de información (discrepancias analizadas)
6. Objetivo general de la práctica
7. Marco teórico y conceptual (interoperabilidad, Marco MinTIC, modelo de madurez)
8. Plataforma tecnológica y arquitectura de seguridad (+ **Acceso público en producción** con las URLs desplegadas)
9. Estructura del proyecto y organización técnica
10. Hallazgos y resultados principales
11. Conclusiones · Referencias y evidencias
12. Anexo (Septiembre 2026): extensión GOVStake 360

## 07 — `articulo.md` — Artículo de investigación
**Función:** artículo académico (en inglés) derivado del proyecto, orientado a publicación.

1. Abstract (madurez promedio 2.3/5.0; dominio semántico 1.9, técnico 3.1; Registration–Operation Gap)
2. Introducción (contribuciones, preguntas RQ1–RQ4)
3. Contexto técnico del proyecto
4. Marco de evaluación de madurez (dominios, pesos, niveles, índice)
5. Datos y notas metodológicas
6. Resultados (global, brecha registro-operación, dominios)
7. Discusión · Hoja de ruta estratégica (0–6, 6–18, 18–36 meses)
8. Amenazas a la validez · Conclusiones y trabajo futuro · Referencias

## 08 — `MATRIZ_TRAZABILIDAD_GOVSTAKE.md` — Trazabilidad GOVStake 360
**Función:** demostrar que cada requisito del PAE está implementado en el código (módulo GOVStake).

1. Objetivo general y objetivos específicos (G1–G6: registro de actores, 10 variables, mapa/matriz, alertas; validación con caso real pendiente ⚠️)
2. Productos del cronograma 16 semanas (G7–G16: actores, matriz, compromisos, dashboard, protocolo, índice de relacionamiento, reportes)
3. Características transversales (G17–G22: JWT, AgentGD IA, datos simulados, ética/protección de datos, Docker, documentación)
4. Resumen de cobertura (21 ✅ / 1 ⚠️)

## 09 — `MATRIZ_TRAZABILIDAD_INTEROPERABILIDAD.md` — Trazabilidad X-Road
**Función:** equivalente a la anterior, para el módulo de Interoperabilidad.

1. Objetivo general y objetivos específicos (R1–Rn: entidades, servicios, madurez MinTIC, brechas)
2. Productos del cronograma (R10–R14: entrevistas CIO, madurez, brechas, dashboard/mapa, carpeta ciudadana)
3. Características transversales implementadas
4. Resumen de cobertura + notas/pendientes menores
5. Información de referencia

## 10 — `SECURITY_HARDENING.md` — Seguridad
**Función:** documentar las medidas de seguridad aplicadas a ambos microservicios.

1. Arquitectura de seguridad del Visor (diagrama Mermaid: rate limiter 120 req/min, JWT 120 min access / 7 días refresh, roles admin/analyst/viewer; versiones HTML/PNG en `docs/`)
2. Leyenda del diagrama y flujo paso a paso
3. Cambios aplicados
4. Variables relevantes en `.env` (`AUTH_ENABLED`, `JWT_SECRET_KEY`, `RATE_LIMIT_PER_MINUTE`)
5. Pendientes recomendados para producción
6. Anexo (Septiembre 2026): endurecimiento aplicado a ambos microservicios

---

> 📍 **Ubicación anterior:** los documentos 01–02 y 06–09 estaban en la raíz del repo; `README-SUITE.md` era `PAE 2026/README.md`; los demás estaban en `PAE 2026/`. Se centralizaron aquí para tener toda la documentación en un solo lugar.
