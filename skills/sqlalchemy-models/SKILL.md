---
name: sqlalchemy-models
description: Diseño de modelos SQLAlchemy, relaciones, esquemas Pydantic y lógica de negocio (índices calculados) para GOVStake 360. Incluye cómo agregar un modelo y mantener consistencia con el seed y los helpers.
---

# Skill: SQLAlchemy Models (GOVStake 360)

Usa esta skill al crear o modificar modelos, relaciones, esquemas Pydantic y la
lógica de índices de negocio.

## Modelos existentes (carpeta `app/models/`)

| Modelo | Archivo | Rol |
|--------|---------|-----|
| `Actor` | `actor.py` | Grupo de interés público (entidad principal) |
| `ActorVariables` | `actor_variables.py` | 10 variables de análisis por actor, escala 0–100 |
| `Compromiso` | `compromiso.py` | Historial de compromisos |
| `Alerta` | `alerta.py` | Alertas relacionales |
| `Relacionamiento` | `relacionamiento.py` | Registros de relacionamiento |
| `Usuario` | `usuario.py` | Usuarios del sistema (auth, roles, bloqueo) |
| `Auditoria` | `auditoria.py` | Registro de eventos de auditoría |

## Convenciones

1. **Base común**: importa `Base` desde `app/database.py`:
   ```python
   from sqlalchemy import Column, Integer, String, ...
   from ..database import Base

   class MiModelo(Base):
       __tablename__ = "mi_modelo"
       id = Column(Integer, primary_key=True, index=True)
   ```

2. **Registrar siempre en `app/models/__init__.py`**: importar el modelo y
   añadirlo a `__all__`. Sin esto, `Base.metadata.create_all()` no crea la tabla.

3. **Timestamps** con `func.now()`:
   ```python
   from sqlalchemy.sql import func
   created_at = Column(DateTime(timezone=True), server_default=func.now())
   updated_at = Column(DateTime(timezone=True), onupdate=func.now())
   ```

4. **Relaciones** definidas con `relationship(...)` y `cascade="all, delete-orphan"`
   para dependencias fuertes (como `Actor.variables/compromisos/alertas`).

5. **Variables 0–100**: usa `Float(default=0)`. No guardes valores fuera del
   rango; la validación se hace en schema.

## Variables de análisis del actor (NO cambiar nombres)

El contrato de dominio (viene del PAE) es exactamente este orden/`key`:

```python
"poder", "legitimidad", "influencia", "interes",
"dependencia", "capacidad_movilizacion", "posicion",
"historial_participacion", "riesgo_conflicto", "canales_relacionamiento"
```

Ese mismo conjunto se declara en:
- `app/models/actor_variables.py`
- `app/api/v1/endpoints/actors.py` (`campos_validos`)
- `app/api/v1/endpoints/_helpers.py` (serialización)
- `app/seeds/seed_data.py` (datos de ejemplo)
- Frontend `FrontendGovstacke/src/pages/Actores.jsx` (formulario)

Si añades/renombras una variable, actualiza **todos** esos lugares a la vez.

## Lógica de negocio en `app/models/__init__.py`

Los cálculos centrales viven como funciones puras en `__init__.py`:

- `calcular_indice_priorizacion(v)` — media ponderada poder/legitimidad/influencia/interés (25% c/u).
- `calcular_indice_relacionamiento(v)` — base − penalizaciones (riesgo, posición contraria), 0–100.
- `nivel_prioridad(indice)` — cuartiles: `prioridad_alta/media/baja/monitoreo`.
- `evaluar_alertas(v)` — reglas automáticas (riesgo conflicto, cambio posición, baja participación, alto poder e influencia).

Estas funciones **no dependen de la sesión DB**; reciben un objeto de variables.
Mantén esa separación: no mezclar lógica de negocio nueva dentro de los endpoints
si encaja como función pura aquí.

## Schemas Pydantic (`app/schemas/`)

- Un archivo por dominio: `actor.py`, `compromiso.py`, `alerta.py`, `relacionamiento.py`.
- Patrones: `XCreate`, `XUpdate` (con todos los campos opcionales), `X` (response),
  y `XList` con `items` + `total`.
- Regístralos en `schemas/__init__.py` y en `__all__`.

## Seed (`app/seeds/seed_data.py`)

- `seed_if_empty(db)` crea actores de ejemplo si la tabla está vacía.
- `seed_usuarios(db)` crea usuarios de seguridad con contraseñas hasheadas.
- Al añadir un modelo con datos simulados, agrega su inserción acá, siguiendo el
  mismo estilo (lista de dicts + commit).

## Checklist

- [ ] Modelo en su archivo y registrado en `models/__init__.py`.
- [ ] Relaciones con `cascade` correcto.
- [ ] Timestamps con `func.now()`.
- [ ] Si toca variables de actor, actualizados los 6 puntos del contrato.
- [ ] Schedules `XCreate/XUpdate/X/XList` registrados en `schemas/__init__.py`.
- [ ] Datos de ejemplo en `seeds/seed_data.py` si aplica.