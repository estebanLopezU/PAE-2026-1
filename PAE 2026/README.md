# 🚀 Gobierno Digital Colombia — Suite de Plataformas (X-Road + GOVStake 360)

**Suite multi-plataforma** compuesta por un portal de entrada unificado y dos plataformas independientes que se conectan entre sí:

- 🛡️ **X-Road Colombia (Interoperabilidad)**: gestión y monitoreo de la interoperabilidad entre entidades gubernamentales según el Marco de Interoperabilidad del MinTIC.
- 🎯 **GOVStake 360**: sistema inteligente de caracterización y gestión de grupos de interés públicos (actores, matriz de priorización, compromisos, alertas y reportes).
- 🏛️ **Portal de Entrada**: landing central desde la cual se accede a cualquiera de las dos plataformas.
- 🤖 **AgentGD**: chatbot de IA (OpenRouter, modelo gratuito) integrado en ambos dashboards, con contexto real de las bases de datos; nube flotante arrastrable.

---

## ⚡ Guía Rápida de Ejecución

### 1. Requisitos Previos
- **Docker Desktop** iniciado (para Interoperabilidad).
- **Node.js 18+** (para Portal y GOVStake en modo desarrollo).

### 2. Iniciar Servicios

**Interoperabilidad (Docker):**
```bash
cd "PAE 2026"
docker compose up -d
```

**Portal + GOVStake (desarrollo local):**
```bash
cd "PAE 2026/PortalEntrada" && npm install && npx vite --port 3000
cd "PAE 2026/FrontendGovstacke" && npm install && npx vite --port 3002
```

### 3. Accesos Directos

| Servicio | URL | Descripción |
|----------|-----|-------------|
| 🏛️ **Portal de Entrada** | http://localhost:3000 | Landing de acceso a ambas plataformas |
| 🌐 **Frontend Interop** | http://localhost:5173 | Dashboard técnico X-Road (React/Vite) |
| ⚙️ **Backend Interop** | http://localhost:8000 | API REST (FastAPI) |
| 🎯 **Frontend GOVStake** | http://localhost:3002 | Dashboard estratégico GOVStake 360 |
| 🤖 **Backend GOVStake** | http://localhost:8002 | Microservicio GOVStake (FastAPI) |
| 📖 **Docs API** | http://localhost:8000/api/docs · http://localhost:8002/api/docs | Swagger de cada plataforma |
| 🤖 **AgentGD** | Burbuja flotante en ambos dashboards | Chatbot IA arrastrable |

### 4. Credenciales

| Plataforma | Rol | Usuario | Contraseña |
|------------|-----|---------|------------|
| X-Road / GOVStake | 🛡️ Administrador (acceso completo) | `elopezu@unal.edu.co` | Configurada en `.env` |
| GOVStake | 👤 Usuario (solo lectura) | `gestor@govstake.gov.co` | Configurada en `.env` |

> 🔒 Los usuarios viven en base de datos con contraseñas **bcrypt**, con bloqueo por fuerza bruta (5 intentos → 15 min) y auditoría de accesos. Las credenciales no se versionan en git (ver `.env.example`).

---

## 🛠️ Comandos Útiles de Mantenimiento

### Ver el estado de los contenedores:
```bash
docker ps
```

### Ver logs en tiempo real (útil para depuración):
```bash
# Backend
docker logs -f xroad-backend

# Frontend
docker logs -f xroad-frontend
```

### Detener la aplicación:
```bash
# Detener sin borrar datos
docker-compose stop

# Detener y eliminar contenedores
docker-compose down
```

---

## 📁 Estructura del Proyecto

*   **`/PortalEntrada`**: Portal de entrada (landing, puerto 3000) que enlaza a los dos módulos.
*   **`/FrontendInteroperabilidad`**: Aplicación React + Vite + Tailwind del módulo X-Road (puerto 5173).
*   **`/BackendInteroperabilidad`**: API FastAPI + SQLAlchemy + PostgreSQL (puerto 8000).
*   **`/FrontendGovstacke`**: Frontend del módulo GOVStake 360 (puerto 3002).
*   **`/BackendGovstacke`**: Microservicio FastAPI de GOVStake con su propia base de datos (puerto 8002).
*   **`/Frontend*/src/components/chatbot`**: Componente de AgentGD (chatbot IA).
*   **`docker-compose.yml`**: Orquestación de servicios (6 contenedores: 2 frontends/backends DB incluidos).

---

## 🤖 AgentGD (Chatbot IA)

Chatbot basado en **OpenRouter** (modelo gratuito) disponible en ambos dashboards como nube flotante arrastrable. Analiza el dashboard y responde usando el contexto real de la base de datos de cada plataforma (entidades X-Road / actores GOVStake). La API key se configura en los `.env` de los backends (`OPENROUTER_API_KEY`, `OPENROUTER_MODEL`).

---

## 🎯 Hallazgo Principal del Estudio
De las **127 entidades** registradas en el nodo central:
- **77 entidades (60%)**: Operativas con información pública y servicios accesibles.
- **50 entidades (40%)**: Registradas pero sin presencia pública ni operativa verificable.

---

## 🔧 Solución de Problemas Comunes

**1. ¿El frontend muestra un error de conexión?**
Verifica que el contenedor `xroad-backend` esté corriendo (`docker ps`). Si no, revisa los logs con `docker logs xroad-backend`.

**2. ¿Puertos ocupados?**
Si el puerto 8000 o 5173 ya están en uso, asegúrate de cerrar otras aplicaciones que los utilicen o cambia la configuración en `docker-compose.yml`.

**3. ¿Base de datos vacía?**
Puedes cargar datos iniciales ejecutando:
```bash
docker exec xroad-backend python scripts/seed_data.py
```

---
**PAE 2026** - *Impulsando la interoperabilidad en Colombia* 🇨🇴
