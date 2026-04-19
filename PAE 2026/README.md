# 🚀 X-Road Colombia - Plataforma de Interoperabilidad Gubernamental

## 📋 Tabla de Contenido

- [Descripción General](#descripción-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Guía de Instalación](#guía-de-instalación)
- [Guía de Ejecución](#guía-de-ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Base de Datos](#base-de-datos)
- [Funcionalidades](#funcionalidades)
- [Despliegue](#despliegue)
- [Solución de Problemas](#solución-de-problemas)

---

## 🎯 Descripción General

**X-Road Colombia** es una plataforma integral para la gestión y monitoreo de la interoperabilidad entre entidades gubernamentales colombianas, basada en el Marco de Interoperabilidad del MinTIC.

### 🎯 Hallazgo Principal del Estudio:

✅ ✅ **De las 127 entidades oficialmente registradas en el nodo central de X-Road:**
✅ ✅ **77 entidades** = Cuentan con informacion publica disponible, servicios publicados y documentacion accesible
✅ ✅ **50 entidades** = Estan registradas oficialmente, PERO NO tienen absolutamente ninguna informacion publica disponible.

✅ Casi el 40% de las entidades que oficialmente se anuncian como conectadas, no tienen ninguna presencia publica ni operativa verificable.

---

### ✅ Características Principales:

- 📊 **Dashboard Interactivo** - Visualización en tiempo real del ecosistema X-Road
- 🏛️ **Gestión de Entidades** - Registro y monitoreo de entidades gubernamentales
- 🔗 **Servicios de Interoperabilidad** - Catálogo de APIs y servicios disponibles
- 📈 **Evaluación de Madurez** - Sistema de evaluación según el Marco Oficial MinTIC
- 🗺️ **Mapa Interactivo** - Geolocalización de entidades en todo el territorio nacional
- 📋 **Reportes** - Generación de reportes en CSV para análisis
- 🤖 **Análisis con IA** - Recomendaciones inteligentes y análisis predictivo
- 🔐 **Seguridad por diseño** - Arquitectura solo lectura, Rate Limiting y protecciones contra ataques comunes
- ⚡ **Motor de calificacion automatico** - Evalua entidades automaticamente en menos de 30 segundos

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Dashboard  │ │  Entidades  │ │ Evaluación  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │    Mapa     │ │   Matriz    │ │  Reportes   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI)                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Endpoints  │ │   Router    │ │  Schemas    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Models    │ │  Database   │ │   Config    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ SQLAlchemy ORM
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  Entities   │ │  Services   │ │  Maturity   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────┐                                           │
│  │   Sectors   │                                           │
│  └─────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

### Patrón de Arquitectura:

- **Frontend:** Arquitectura basada en componentes con React
- **Backend:** Arquitectura RESTful con FastAPI
- **Base de Datos:** Modelo relacional con PostgreSQL
- **Despliegue:** Contenedores Docker con Docker Compose

---

## 🛠️ Tecnologías Utilizadas

### Backend:
- **Python 3.11** - Lenguaje de programación
- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy** - ORM para Python
- **PostgreSQL 15** - Base de datos relacional
- **Pydantic** - Validación de datos
- **Uvicorn** - Servidor ASGI
- **scikit-learn** - Machine Learning para análisis predictivo

### Frontend:
- **React 18** - Biblioteca de interfaces de usuario
- **Vite** - Build tool moderno
- **Tailwind CSS** - Framework de CSS utility-first
- **Recharts** - Biblioteca de gráficos
- **Leaflet** - Mapas interactivos
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos modernos
- **i18next** - Internacionalización

### DevOps:
- **Docker** - Contenedores
- **Docker Compose** - Orquestación de contenedores
- **Nginx** - Servidor web y proxy inverso

---

## 📥 Guía de Instalación

### Requisitos Previos:

- **Docker Desktop** 20.x o superior
- **Git** 2.x o superior
- **Navegador web** moderno (Chrome, Firefox, Edge)

### Instalación Paso a Paso:

1. **Clonar el repositorio:**
```bash
git clone https://github.com/estebanLopezU/PAE-2026-1.git
cd PAE-2026-1
```

2. **Verificar Docker:**
```bash
docker --version
docker-compose --version
```

3. **Iniciar Docker Desktop:**
   - Abre Docker Desktop desde el menú de inicio
   - Espera a que muestre "Docker Desktop is running"

---

## ▶️ Guía de Ejecución

### Iniciar la Aplicación:

```bash
# Navegar al directorio del proyecto
cd "PAE 2026"

# Iniciar todos los servicios
docker-compose up -d
```

### Verificar Estado de Servicios:

```bash
# Ver contenedores corriendo
docker ps --filter "name=xroad"

# Ver logs del backend
docker logs xroad-backend

# Ver logs del frontend
docker logs xroad-frontend
```

### Acceder a la Aplicación:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:5173 | Interfaz principal |
| **Backend API** | http://localhost:8000 | API REST |
| **Documentación API** | http://localhost:8000/docs | Swagger UI |

### Detener la Aplicación:

```bash
# Detener servicios (manteniendo datos)
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Eliminar todo incluyendo datos
docker-compose down -v
```

---

## 📁 Estructura del Proyecto

```
PAE 2026/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── dashboard.py      # Endpoints del dashboard
│   │   │       │   ├── entities.py       # CRUD de entidades
│   │   │       │   ├── maturity.py       # Evaluaciones de madurez
│   │   │       │   ├── reports.py        # Generación de reportes
│   │   │       │   ├── sectors.py        # Sectores gubernamentales
│   │   │       │   └── services.py       # Servicios de interoperabilidad
│   │   │       ├── router.py             # Configuración de rutas
│   │   │       └── __init__.py
│   │   ├── models/
│   │   │   ├── entity.py                 # Modelo de entidades
│   │   │   ├── maturity.py               # Modelo de evaluaciones
│   │   │   ├── sector.py                 # Modelo de sectores
│   │   │   ├── service.py                # Modelo de servicios
│   │   │   └── __init__.py
│   │   ├── schemas/
│   │   │   ├── entity.py                 # Schemas de entidades
│   │   │   ├── maturity.py               # Schemas de evaluaciones
│   │   │   ├── sector.py                 # Schemas de sectores
│   │   │   ├── service.py                # Schemas de servicios
│   │   │   └── __init__.py
│   │   ├── config.py                     # Configuración de la app
│   │   ├── database.py                   # Configuración de BD
│   │   └── main.py                       # Punto de entrada FastAPI
│   ├── scripts/
│   │   └── seed_data.py                  # Script de datos iniciales
│   ├── requirements.txt                  # Dependencias Python
│   └── Dockerfile                        # Configuración Docker backend
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       └── Layout.jsx            # Layout principal
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx             # Página del dashboard
│   │   │   ├── Entidades.jsx             # Gestión de entidades
│   │   │   ├── EvaluacionMadurez.jsx     # Evaluaciones
│   │   │   ├── MapaInteractivo.jsx       # Mapa de Colombia
│   │   │   ├── MatrizServicios.jsx       # Matriz de servicios
│   │   │   └── Reportes.jsx              # Generación de reportes
│   │   ├── services/
│   │   │   └── api.js                    # Servicio de API
│   │   ├── styles/
│   │   │   ├── index.css                 # Estilos globales
│   │   │   └── animations.css            # Animaciones CSS
│   │   ├── App.jsx                       # Componente principal
│   │   └── main.jsx                      # Punto de entrada React
│   ├── public/
│   ├── package.json                      # Dependencias Node.js
│   ├── vite.config.js                    # Configuración Vite
│   ├── tailwind.config.js                # Configuración Tailwind
│   └── Dockerfile                        # Configuración Docker frontend
├── docker-compose.yml                    # Orquestación de contenedores
├── PROJECT_PLAN.md                       # Plan del proyecto
├── GUIA_EJECUCION.md                     # Guía de ejecución detallada
└── README.md                             # Este archivo
```

---

## 🔌 API Endpoints

### Dashboard
```
GET /api/v1/dashboard/kpis
GET /api/v1/dashboard/by-sector
GET /api/v1/dashboard/by-department
GET /api/v1/dashboard/by-xroad-status
GET /api/v1/dashboard/services-by-protocol
GET /api/v1/dashboard/top-mature-entities
GET /api/v1/dashboard/maturity-radar/{entity_id}
```

### Entidades
```
GET    /api/v1/entities/
GET    /api/v1/entities/{id}
POST   /api/v1/entities/
PUT    /api/v1/entities/{id}
DELETE /api/v1/entities/{id}
```

### Servicios
```
GET    /api/v1/services/
GET    /api/v1/services/{id}
POST   /api/v1/services/
PUT    /api/v1/services/{id}
DELETE /api/v1/services/{id}
```

### Sectores
```
GET    /api/v1/sectors/
GET    /api/v1/sectors/{id}
POST   /api/v1/sectors/
PUT    /api/v1/sectors/{id}
DELETE /api/v1/sectors/{id}
```

### Evaluaciones de Madurez
```
GET    /api/v1/maturity/levels
GET    /api/v1/maturity/assessments
GET    /api/v1/maturity/assessments/{id}
GET    /api/v1/maturity/entity/{entity_id}/latest
POST   /api/v1/maturity/assessments
PUT    /api/v1/maturity/assessments/{id}
DELETE /api/v1/maturity/assessments/{id}
```

### Relaciones
```
GET /api/v1/relationships/graph
```

### Reportes
```
GET /api/v1/reports/entities/csv
GET /api/v1/reports/services/csv
GET /api/v1/reports/maturity/csv
```

---

## 🗄️ Base de Datos

### Esquema de la Base de Datos:

#### Tabla `sectors`
```sql
CREATE TABLE sectors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7),
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla `entities`
```sql
CREATE TABLE entities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    acronym VARCHAR(50),
    nit VARCHAR(20) UNIQUE,
    sector_id INTEGER REFERENCES sectors(id),
    department VARCHAR(100),
    municipality VARCHAR(100),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    website VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    xroad_status VARCHAR(20) DEFAULT 'not_connected',
    xroad_member_code VARCHAR(100),
    cio_name VARCHAR(255),
    cio_email VARCHAR(255),
    cio_phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

#### Tabla `services`
```sql
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    entity_id INTEGER REFERENCES entities(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    protocol VARCHAR(50),
    category VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    version VARCHAR(20),
    documentation_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

#### Tabla `maturity_assessments`
```sql
CREATE TABLE maturity_assessments (
    id SERIAL PRIMARY KEY,
    entity_id INTEGER REFERENCES entities(id),
    overall_level INTEGER NOT NULL,
    overall_score DECIMAL(5,2) NOT NULL,
    legal_domain_score DECIMAL(5,2) DEFAULT 0,
    organizational_domain_score DECIMAL(5,2) DEFAULT 0,
    semantic_domain_score DECIMAL(5,2) DEFAULT 0,
    technical_domain_score DECIMAL(5,2) DEFAULT 0,
    has_api_documentation INTEGER DEFAULT 0,
    uses_standard_protocols INTEGER DEFAULT 0,
    has_data_quality INTEGER DEFAULT 0,
    has_security_standards INTEGER DEFAULT 0,
    has_interoperability_policy INTEGER DEFAULT 0,
    has_trained_personnel INTEGER DEFAULT 0,
    assessment_date TIMESTAMP DEFAULT NOW(),
    assessor_name VARCHAR(255),
    assessor_notes TEXT,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Relaciones:
- `entities` pertenece a `sectors` (FK: sector_id)
- `services` pertenece a `entities` (FK: entity_id)
- `maturity_assessments` pertenece a `entities` (FK: entity_id)

---

## ⚙️ Funcionalidades

### 1. Dashboard Interactivo
- KPIs principales del ecosistema X-Road
- Gráficos de distribución por sector
- Estado de conexiones X-Road
- Top entidades por madurez

### 2. Gestión de Entidades
- Lista paginada de entidades
- Filtros por sector y departamento
- CRUD completo de entidades
- Estado de conexión X-Road

### 3. Evaluación de Madurez
- Formulario de evaluación con 6 criterios
- Cálculo automático de puntajes
- Visualización con gráficos de radar
- Historial de evaluaciones

### 4. Mapa Interactivo
- Mapa de Colombia con Leaflet
- Ubicación de entidades
- Filtros por sector
- Información de contacto

### 5. Reportes
- Generación de reportes CSV
- Descarga de datos de entidades
- Descarga de servicios
- Descarga de evaluaciones

### 6. Análisis con IA
- Predicción de niveles de madurez
- Clustering de entidades
- Recomendaciones inteligentes
- Análisis predictivo

---

## 🚢 Despliegue

### Desarrollo Local:

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Reconstruir y reiniciar
docker-compose up -d --build
```

### Producción:

1. **Configurar variables de entorno:**
```bash
# backend/.env
DATABASE_URL=postgresql://user:password@host:5432/dbname
SECRET_KEY=your-secret-key
DEBUG=false
```

2. **Build de producción:**
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🔧 Solución de Problemas

### Problema 1: Docker Desktop no está corriendo

**Error:**
```
error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.51/..."
```

**Solución:**
1. Abre Docker Desktop desde el menú de inicio
2. Espera a que muestre "Docker Desktop is running"
3. Ejecuta nuevamente: `docker-compose up -d`

---

### Problema 2: Puerto ya en uso

**Error:**
```
Bind for 0.0.0.0:8000 failed: port is already allocated
```

**Solución:**
```bash
# Ver qué proceso está usando el puerto
netstat -ano | findstr :8000

# Detener todos los contenedores
docker stop $(docker ps -aq)
```

---

### Problema 3: La página muestra pantalla azul

**Solución:**
1. Verifica que los contenedores estén corriendo: `docker ps`
2. Reconstruye el frontend: `docker-compose up -d --build frontend`
3. Limpia la caché del navegador (Ctrl+F5)

---

### Problema 4: Base de datos vacía

**Solución:**
```bash
# Cargar datos de ejemplo
docker exec xroad-backend python scripts/seed_data.py
```

---

## 📞 Contacto

- **Equipo de Desarrollo:** PAE 2026
- **Repositorio:** https://github.com/estebanLopezU/PAE-2026-1

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

**¡Gracias por usar X-Road Colombia! 🇨🇴**

**¡Gracias por usar X-Road Colombia! 🇨🇴**