# 🔒 Seguridad del Proyecto X-Road Colombia

## 📋 Estado Actual de Seguridad

### ✅ **Medidas Implementadas Actualmente**

#### **1. Configuración CORS (Cross-Origin Resource Sharing)**
```python
# Backend: app/main.py
CORS_ORIGINS = [
    "http://localhost:5173",  # Frontend en desarrollo
    "http://localhost:3000"   # Frontend alternativo
]
```
**Protección**: Controla qué dominios pueden acceder a la API

#### **2. Configuración de Base de Datos**
```python
# Conexión PostgreSQL con credenciales
DATABASE_URL = "postgresql://postgres:postgres@postgres:5432/xroad_colombia"
```
**Estado**: ⚠️ Credenciales por defecto (cambiar en producción)

#### **3. Validación de Datos con Pydantic**
```python
# Todos los schemas validan automáticamente
class EntityAnalysisRequest(BaseModel):
    entity_id: int  # Validación de tipo automática
```
**Protección**: Previene inyección de datos maliciosos

#### **4. Manejo de Errores**
```python
# Excepciones controladas en endpoints
try:
    # Código de análisis
except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
```
**Protección**: Evita exposición de errores internos

---

## ⚠️ **Vulnerabilidades Identificadas**

### **1. Sin Autenticación ni Autorización**
**Riesgo**: Cualquier persona puede acceder a la API
**Nivel**: 🔴 ALTO

### **2. Credenciales de Base de Datos por Defecto**
**Riesgo**: Acceso no autorizado a la base de datos
**Nivel**: 🔴 ALTO

### **3. Debug Mode Activado**
**Riesgo**: Exposición de información sensible
**Nivel**: 🟡 MEDIO

### **4. Sin Rate Limiting**
**Riesgo**: Ataques de denegación de servicio (DoS)
**Nivel**: 🟡 MEDIO

### **5. Sin HTTPS**
**Riesgo**: Interceptación de datos en tránsito
**Nivel**: 🔴 ALTO (en producción)

---

## 🛡️ **Medidas de Seguridad Recomendadas**

### **1. Implementar Autenticación JWT**

```python
# backend/app/core/security.py
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

SECRET_KEY = "tu-clave-secreta-super-segura-aqui"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

### **2. Proteger Endpoints con Autenticación**

```python
# backend/app/api/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401)
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# Uso en endpoints
@router.get("/entities/")
async def get_entities(current_user: str = Depends(get_current_user)):
    # Solo usuarios autenticados pueden acceder
    pass
```

### **3. Cambiar Credenciales de Base de Datos**

```bash
# Crear archivo .env seguro
DATABASE_URL=postgresql://xroad_admin:password_seguro_123@postgres:5432/xroad_colombia
SECRET_KEY=una-clave-muy-segura-con-simbolos-!@#$%
DEBUG=false
```

### **4. Implementar Rate Limiting**

```python
# backend/app/core/ratelimit.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# Uso en endpoints
@router.get("/entities/")
@limiter.limit("100/minute")  # Máximo 100 requests por minuto
async def get_entities():
    pass
```

### **5. Validación y Sanitización de Input**

```python
# backend/app/core/validation.py
from pydantic import validator, BaseModel
import re

class SecureEntityInput(BaseModel):
    name: str
    email: str
    
    @validator('name')
    def validate_name(cls, v):
        # Prevenir XSS e inyección SQL
        if re.search(r'[<>\"\'%;()&+]', v):
            raise ValueError('Caracteres no permitidos en el nombre')
        return v.strip()
    
    @validator('email')
    def validate_email(cls, v):
        # Validar formato de email
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', v):
            raise ValueError('Formato de email inválido')
        return v.lower()
```

### **6. Headers de Seguridad**

```python
# backend/app/main.py
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

# Solo en producción
if not settings.DEBUG:
    app.add_middleware(HTTPSRedirectMiddleware)
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["xroad-colombia.gov.co"])

# Headers de seguridad
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
```

### **7. Logging de Seguridad**

```python
# backend/app/core/security_logger.py
import logging
from datetime import datetime

security_logger = logging.getLogger('security')

def log_security_event(event_type: str, user: str, details: dict):
    security_logger.info(f"""
    Evento: {event_type}
    Usuario: {user}
    Timestamp: {datetime.now().isoformat()}
    Detalles: {details}
    """)

# Uso en endpoints
@router.post("/login")
async def login(credentials: LoginCredentials):
    if not verify_password(credentials.password, stored_hash):
        log_security_event(
            "LOGIN_FAILED",
            credentials.username,
            {"reason": "Invalid password", "ip": get_client_ip()}
        )
        raise HTTPException(status_code=401)
```

---

## 🚀 **Implementación Paso a Paso**

### **Paso 1: Instalar Dependencias de Seguridad**

```bash
# Agregar a requirements.txt
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
slowapi==0.1.9
python-multipart==0.0.9
```

### **Paso 2: Configurar Variables de Entorno Seguras**

```bash
# backend/.env (NO subir a Git)
DATABASE_URL=postgresql://xroad_admin:S3cur3_P@ss!@postgres:5432/xroad_colombia
SECRET_KEY=Kj8#mN2$pQ9vX!zR4wY7&cF1@hL6*bE3
DEBUG=false
ALLOWED_HOSTS=xroad-colombia.gov.co,www.xroad-colombia.gov.co
```

### **Paso 3: Crear Usuario Administrador Seguro**

```python
# scripts/create_admin.py
from passlib.context import CryptContext
import getpass

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

username = input("Username: ")
password = getpass.getpass("Password: ")
hashed = pwd_context.hash(password)

print(f"INSERT INTO users (username, password_hash) VALUES ('{username}', '{hashed}');")
```

---

## 📊 **Checklist de Seguridad**

### **Antes de Producción:**
- [ ] Cambiar credenciales de base de datos
- [ ] Desactivar DEBUG mode
- [ ] Implementar autenticación JWT
- [ ] Configurar HTTPS
- [ ] Agregar rate limiting
- [ ] Implementar logging de seguridad
- [ ] Validar todos los inputs
- [ ] Configurar CORS correctamente
- [ ] Agregar headers de seguridad
- [ ] Realizar pruebas de penetración

### **Monitoreo Continuo:**
- [ ] Revisar logs de seguridad diariamente
- [ ] Actualizar dependencias regularmente
- [ ] Realizar auditorías de seguridad
- [ ] Monitorear intentos de acceso no autorizado
- [ ] Mantener backups seguros

---

## 🔍 **Pruebas de Seguridad Recomendadas**

### **1. Pruebas de Inyección SQL**
```bash
# Probar con inputs maliciosos
curl -X POST http://localhost:8000/api/v1/entities/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Test\"; DROP TABLE entities; --"}'
```

### **2. Pruebas XSS**
```bash
# Probar con scripts maliciosos
curl -X POST http://localhost:8000/api/v1/entities/ \
  -H "Content-Type: application/json" \
  -d '{"name": "<script>alert(\"XSS\")</script>"}'
```

### **3. Pruebas de Fuerza Bruta**
```bash
# Probar rate limiting
for i in {1..200}; do
  curl http://localhost:8000/api/v1/entities/ &
done
```

---

## 📚 **Recursos de Seguridad**

### **Documentación:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)

### **Herramientas de Auditoría:**
- **Bandit**: Análisis de seguridad para Python
- **Safety**: Verificación de dependencias
- **Trivy**: Escáner de vulnerabilidades

---

## ⚡ **Resumen Ejecutivo**

| Aspecto | Estado | Prioridad |
|---------|--------|-----------|
| CORS Configurado | ✅ Implementado | - |
| Validación de Datos | ✅ Implementado | - |
| Autenticación | ❌ No implementado | 🔴 Alta |
| Rate Limiting | ❌ No implementado | 🟡 Media |
| HTTPS | ❌ No configurado | 🔴 Alta (producción) |
| Logging de Seguridad | ❌ No implementado | 🟡 Media |
| Headers de Seguridad | ❌ No implementado | 🟡 Media |

**Recomendación Inmediata**: Implementar autenticación JWT antes de desplegar en producción.

---

**¡La seguridad es un proceso continuo, no un destino! 🔒**