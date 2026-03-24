# X-Road Colombia - Plataforma de Interoperabilidad Gubernamental

## 📋 Índice

- [Descripción General](#descripción-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Base de Datos](#base-de-datos)
- [API Backend](#api-backend)
- [Frontend](#frontend)
- [Guía de Instalación](#guía-de-instalación)
- [Guía de Uso](#guía-de-uso)
- [Desarrollo](#desarrollo)
- [Despliegue](#despliegue)
- [Contribuciones](#contribuciones)

---

## 🎯 Descripción General

**X-Road Colombia** es una plataforma integral para la gestión y monitoreo de la interoperabilidad entre entidades gubernamentales colombianas, basada en el Marco de Interoperabilidad del MinTIC.

### Características Principales:

- 📊 **Dashboard Interactivo** - Visualización en tiempo real del ecosistema X-Road
- 🏛️ **Gestión de Entidades** - Registro y monitoreo de entidades gubernamentales
- 🔗 **Servicios de Interoperabilidad** - Catálogo de APIs y servicios disponibles
- 📈 **Evaluación de Madurez** - Sistema de evaluación según el Marco MinTIC
- 🗺️ **Mapa Interactivo** - Geolocalización de entidades en Colombia
- 📋 **Reportes** - Generación de reportes en CSV para análisis

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

### Frontend:
- **React 18** - Biblioteca de interfaces de usuario
- **Vite** - Build tool moderno
- **Tailwind CSS** - Framework de CSS utility-first
- **Recharts** - Biblioteca de gráficos
- **Leaflet** - Mapas interactivos
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos modernos

### DevOps:
- **Docker** - Contenedores
- **Docker Compose** - Orquestación de contenedores
- **Nginx** - Servidor web y proxy inverso

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
└── README.md                             # Este archivo
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
    overall_level INTEGER NOT NULL, -- 1-4
    overall_score DECIMAL(5,2) NOT NULL, -- 0-100
    legal_domain_score DECIMAL(5,2) DEFAULT 0,
    organizational_domain_score DECIMAL(5,2) DEFAULT 0,
    semantic_domain_score DECIMAL(5,2) DEFAULT 0,
    technical_domain_score DECIMAL(5,2) DEFAULT 0,
    has_api_documentation INTEGER DEFAULT 0, -- 0-4
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

## 🔌 API Backend

### Endpoints Disponibles:

#### Dashboard
```
GET /api/v1/dashboard/kpis
GET /api/v1/dashboard/by-sector
GET /api/v1/dashboard/by-department
GET /api/v1/dashboard/by-xroad-status
GET /api/v1/dashboard/services-by-protocol
GET /api/v1/dashboard/top-mature-entities
GET /api/v1/dashboard/maturity-radar/{entity_id}
```

#### Entidades
```
GET    /api/v1/entities/
GET    /api/v1/entities/{id}
POST   /api/v1/entities/
PUT    /api/v1/entities/{id}
DELETE /api/v1/entities/{id}
```

#### Servicios
```
GET    /api/v1/services/
GET    /api/v1/services/{id}
POST   /api/v1/services/
PUT    /api/v1/services/{id}
DELETE /api/v1/services/{id}
```

#### Sectores
```
GET    /api/v1/sectors/
GET    /api/v1/sectors/{id}
POST   /api/v1/sectors/
PUT    /api/v1/sectors/{id}
DELETE /api/v1/sectors/{id}
```

#### Evaluaciones de Madurez
```
GET    /api/v1/maturity/levels
GET    /api/v1/maturity/assessments
GET    /api/v1/maturity/assessments/{id}
GET    /api/v1/maturity/entity/{entity_id}/latest
POST   /api/v1/maturity/assessments
PUT    /api/v1/maturity/assessments/{id}
DELETE /api/v1/maturity/assessments/{id}
```

#### Reportes
```
GET /api/v1/reports/entities/csv
GET /api/v1/reports/services/csv
GET /api/v1/reports/maturity/csv
```

### Ejemplo de Respuesta:

```json
{
  "items": [
    {
      "id": 1,
      "name": "Ministerio de Salud y Protección Social",
      "acronym": "MinSalud",
      "nit": "8999990001",
      "sector_id": 1,
      "department": "Bogotá D.C.",
      "xroad_status": "connected",
      "latitude": 4.7110,
      "longitude": -74.0721,
      "is_active": true,
      "created_at": "2026-03-24T00:40:20.913575Z"
    }
  ],
  "total": 15,
  "page": 1,
  "page_size": 20
}
```

---

## 🎨 Frontend

### Componentes Principales:

#### Layout (`Layout.jsx`)
- Navegación lateral con menú
- Header con información de usuario
- Contenedor principal para páginas

#### Dashboard (`Dashboard.jsx`)
- KPIs principales del ecosistema
- Gráficos de distribución por sector
- Estado de conexiones X-Road
- Top entidades por madurez

#### Entidades (`Entidades.jsx`)
- Lista paginada de entidades
- Filtros por sector y departamento
- CRUD completo de entidades
- Estado de conexión X-Road

#### Evaluación de Madurez (`EvaluacionMadurez.jsx`)
- Formulario de evaluación con 6 criterios
- Cálculo automático de puntajes
- Visualización con gráficos de radar
- Historial de evaluaciones

#### Mapa Interactivo (`MapaInteractivo.jsx`)
- Mapa de Colombia con Leaflet
- Ubicación de entidades
- Filtros por sector
- Información de contacto

#### Reportes (`Reportes.jsx`)
- Generación de reportes CSV
- Descarga de datos de entidades
- Descarga de servicios
- Descarga de evaluaciones

### Servicios API (`api.js`)

```javascript
// Ejemplo de uso
import { entitiesApi, maturityApi } from '../services/api'

// Obtener entidades
const entities = await entitiesApi.getAll({ limit: 100 })

// Crear evaluación
const assessment = await maturityApi.createAssessment({
  entity_id: 1,
  overall_level: 3,
  overall_score: 75.5,
  assessor_name: 'Juan Pérez'
})
```

### Estilos y Animaciones:

- **Tailwind CSS** para estilos utility-first
- **Animaciones CSS** personalizadas en `animations.css`
- **Efectos hover** modernos en tarjetas y botones
- **Gradientes** y sombras elegantes
- **Transiciones suaves** en todas las interacciones

---

## 🚀 Guía de Instalación

### Requisitos Previos:
- Docker Desktop
- Git
- Navegador web moderno

### Instalación Paso a Paso:

1. **Clonar el repositorio:**
```bash
git clone https://github.com/estebanLopezU/mineria_de_datos_proyecto.git
cd mineria_de_datos_proyecto
```

2. **Iniciar los servicios:**
```bash
docker-compose up -d
```

3. **Verificar que los contenedores están corriendo:**
```bash
docker ps
```

4. **Acceder a la aplicación:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Documentación API: http://localhost:8000/docs

5. **Cargar datos iniciales (opcional):**
```bash
docker exec xroad-backend python scripts/seed_data.py
```

### Comandos Útiles:

```bash
# Ver logs del backend
docker logs xroad-backend

# Ver logs del frontend
docker logs xroad-frontend

# Reiniciar servicios
docker-compose restart

# Detener servicios
docker-compose down

# Reconstruir y reiniciar
docker-compose up -d --build
```

---

## 📖 Guía de Uso

### 1. Dashboard
- Accede al dashboard principal para ver KPIs del ecosistema
- Visualiza distribución de entidades por sector
- Monitorea el estado de conexiones X-Road
- Revisa las entidades con mayor madurez

### 2. Gestión de Entidades
- Navega a "Entidades" en el menú lateral
- Usa los filtros para buscar entidades específicas
- Haz clic en "Nueva Entidad" para agregar una entidad
- Edita o elimina entidades existentes
- Revisa el estado de conexión X-Road de cada entidad

### 3. Evaluación de Madurez
- Ve a "Evaluación" en el menú
- Selecciona una entidad para evaluar
- Evalúa cada criterio de 0 a 4:
  - Documentación de APIs
  - Protocolos estándar
  - Calidad de datos
  - Estándares de seguridad
  - Política de interoperabilidad
  - Personal capacitado
- El sistema calcula automáticamente:
  - Puntaje general (0-100%)
  - Nivel de madurez (1-4)
  - Puntajes por dominio (Legal, Organizacional, Semántico, Técnico)

### 4. Mapa Interactivo
- Accede al mapa desde el menú
- Visualiza la ubicación geográfica de las entidades
- Usa los filtros por sector
- Haz clic en los marcadores para ver información de contacto

### 5. Matriz de Servicios
- Revisa el catálogo de servicios de interoperabilidad
- Filtra por protocolo y categoría
- Consulta la documentación de cada servicio

### 6. Reportes
- Ve a "Reportes" en el menú
- Descarga reportes en formato CSV:
  - Reporte de entidades
  - Reporte de servicios
  - Reporte de evaluaciones de madurez
- Los reportes incluyen todos los datos disponibles

---

## 💻 Desarrollo

### Estructura de Desarrollo:

```
backend/
├── app/
│   ├── api/v1/endpoints/    # Controladores REST
│   ├── models/              # Modelos SQLAlchemy
│   ├── schemas/             # Schemas Pydantic
│   ├── config.py            # Configuración
│   ├── database.py          # Conexión a BD
│   └── main.py              # Punto de entrada
└── scripts/
    └── seed_data.py         # Datos de prueba

frontend/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── pages/               # Páginas de la aplicación
│   ├── services/            # Servicios API
│   └── styles/              # Estilos CSS
└── public/                  # Archivos estáticos
```

### Agregar Nuevas Funcionalidades:

#### Backend:
1. Crear modelo en `models/`
2. Crear schema en `schemas/`
3. Crear endpoint en `api/v1/endpoints/`
4. Registrar ruta en `api/v1/router.py`

#### Frontend:
1. Crear componente en `pages/` o `components/`
2. Agregar ruta en `App.jsx`
3. Crear servicio API si es necesario
4. Agregar estilos en `styles/`

### Base de Datos:

```bash
# Acceder a la base de datos
docker exec -it xroad-postgres psql -U postgres -d xroad_colombia

# Ver tablas
\dt

# Ver estructura de tabla
\d entities

# Consultar datos
SELECT * FROM entities LIMIT 10;
```

---

## 🚢 Despliegue

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

3. **Configurar dominio y SSL:**
```nginx
server {
    listen 443 ssl;
    server_name xroad-colombia.com;
    
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    
    location / {
        proxy_pass http://frontend:80;
    }
    
    location /api {
        proxy_pass http://backend:8000;
    }
}
```

### Monitoreo:

```bash
# Ver uso de recursos
docker stats

# Ver logs en tiempo real
docker-compose logs -f

# Health checks
curl http://localhost:8000/health
```

---

## 🤝 Contribuciones

### Cómo Contribuir:

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

### Estilo de Código:

- **Backend:** Seguir PEP 8
- **Frontend:** Usar ESLint y Prettier
- **Commits:** Usar conventional commits

### Reportar Issues:

- Usar el template de issues
- Incluir pasos para reproducir
- Incluir logs relevantes

---

## 📞 Contacto

- **Equipo de Desarrollo:** PAE 2026
- **Repositorio:** https://github.com/estebanLopezU/mineria_de_datos_proyecto
- **Documentación:** http://localhost:8000/docs

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 🙏 Agradecimientos

- MinTIC por el Marco de Interoperabilidad
- Comunidad de código abierto
- Equipo de desarrollo PAE 2026

---

**¡Gracias por usar X-Road Colombia! 🇨🇴**