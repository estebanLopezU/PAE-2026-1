---
name: unit-testing
description: Guía para escribir y ejecutar pruebas unitarias en GOVStake 360. Backend con pytest + TestClient (FastAPI) y frontend con vitest. Cubre ejemplos, qué probar (lógica de negocio, endpoints) y comandos.
---

# Skill: Unit Testing (GOVStake 360)

Usa esta skill al escribir o correr pruebas. El PAE exige "pruebas funcionales y
ajustes de usabilidad" en el cronograma, así que esta skill es clave.

## Qué priorizar

1. **Lógica de negocio pura** (en `app/models/__init__.py`): las funciones son
   ideales para testear sin DB:
   - `calcular_indice_priorizacion`
   - `calcular_indice_relacionamiento`
   - `nivel_prioridad`
   - `evaluar_alertas`
2. **Endpoints** (FastAPI) con cliente de prueba, verificando status y forma de la
   respuesta (`items`/`total`).
3. **Schemas** de validación (campos inválidos rechazados).
4. Frontend: utilidades puras y render simple de páginas con vitest.

## Backend (pytest)

Añade `pytest` y `httpx` como dependencias de test (no mezclar en requirements
de producción). Ejemplo de test para lógica de negocio:

```python
# tests/test_indices.py
from app.models import calcular_indice_priorizacion, nivel_prioridad

class DummyVars:
    poder = 80; legitimidad = 80; influencia = 80; interes = 80

def test_indice_priorizacion_maximo():
    v = DummyVars()
    assert calcular_indice_priorizacion(v) == 80.0

def test_nivel_prioridad_alta():
    v = DummyVars()
    assert nivel_prioridad(calcular_indice_priorizacion(v)) == "prioridad_alta"
```

### Test de un endpoint (FastAPI)

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"
```

> Los endpoints protegidos requieren token. Para test de auth, crea un token con
> `create_access_token` o desactiva `AUTH_ENABLED` en un fixture de config.

### Ejecutar backend

```powershell
python -m pytest tests -v
```

## Frontend (vitest)

Instala (una sola vez):

```powershell
npm install -D vitest @vitejs/plugin-react
```

`vitest.config.js` al lado de `vite.config.js`:

```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  test: { environment: 'node' },
})
```

Ejemplo:

```js
// src/services/api.test.js
import { describe, it, expect } from 'vitest'
import { actorsApi } from './api'

describe('actorsApi', () => {
  it('define métodos de CRUD', () => {
    expect(actorsApi.getAll).toBeDefined()
    expect(actorsApi.create).toBeDefined()
  })
})
```

Para render de páginas (si quieres) usa `vitest` con entorno `jsdom` e
instala `@testing-library/react`. Para el MVP, cubre al menos la lógica pura.

### Ejecutar frontend

```powershell
npx vitest run
```

## Convenciones

- Un archivo de test por módulo: `test_<modulo>.py` o `<modulo>.test.js`.
- Nombres descriptivos (`test_indice_priorizacion_maximo`).
- Datos simulados en fixtures; nunca dependas de una BD de producción.
- Tras añadir un test nuevo, **ejecútalo** y verifica que pase.

## Checklist

- [ ] Cubiertas las 4 funciones de negocio de `models/__init__.py`.
- [ ] Al menos un test de health y de la lógica central.
- [ ] Tests corriendo con `pytest` / `vitest run`.
- [ ] Sin dependencias de BD real en los tests.