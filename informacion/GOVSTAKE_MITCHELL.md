# GOVStake 360 · Clasificación Mitchell y entidades públicas

## 1. Qué se agregó

GOVStake 360 ahora clasifica cada actor de acuerdo con el modelo de Mitchell et al. (1997):

- **Poder**
- **Legitimidad**
- **Urgencia**

Cada atributo se evalúa en una escala de **0 a 100**. Se considera presente cuando el valor es **mayor o igual a 60**.

La combinación de atributos genera automáticamente la clasificación:

| Atributos presentes | Clasificación |
|---|---|
| Ninguno | No relevante |
| Solo poder | Latente inactivo |
| Solo legitimidad | Latente discrecional |
| Solo urgencia | Latente demandante |
| Poder + legitimidad | Expectante dominante |
| Poder + urgencia | Expectante peligroso |
| Legitimidad + urgencia | Expectante dependiente |
| Poder + legitimidad + urgencia | Definitivo |

También se incorporó la variable **frecuencia de intentos de influencia**, que no cambia la clasificación Mitchell, pero sirve para detectar presión recurrente.

---

## 2. Quién evalúa

La evaluación la realiza el **gestor o líder del proyecto** desde el módulo GOVStake.

El sistema registra automáticamente:

- `evaluado_por`
- `evaluado_en`

Es decir, GOVStake guarda la percepción del usuario evaluador, no una verdad objetiva sobre la entidad.

---

## 3. Pantallas nuevas o modificadas

### Dashboard

Ahora muestra:

- Número de stakeholders definitivos.
- Número de stakeholders expectantes.
- Stakeholders latentes.
- Stakeholders no relevantes.
- Entidades pendientes de evaluación.

### Actores

El formulario de variables ahora incluye:

- `Urgencia`
- `Frecuencia de intentos de influencia`

La tabla muestra:

- Origen del actor: manual o entidad pública.
- Clasificación Mitchell.
- Índice de priorización.
- Acciones disponibles.

### Mitchell

Se agregó una vista dedicada:

```text
/mitchell
```

Incluye:

- Tarjetas resumen por grupo.
- Criterio de clasificación.
- Tabla completa por actor.
- Botón para sincronizar entidades públicas, disponible solo para administradores.

---

## 4. Sincronizar entidades públicas

El backend GOVStake puede convertir las entidades del catálogo de interoperabilidad en actores:

```http
POST /api/v1/sincronizaciones/entidades-publicas
```

Para usarlo, configura en el `.env` del backend GOVStake:

```env
INTEROP_API_URL=http://localhost:8000/api/v1
INTEROP_SYNC_EMAIL=usuario_del_backend_interoperabilidad
INTEROP_SYNC_PASSWORD=contraseña_del_usuario
INTEROP_TIMEOUT_SECONDS=30
```

En Docker, `backend` es el nombre interno del servicio de interoperabilidad:

```env
INTEROP_API_URL=http://backend:8000/api/v1
```

La sincronización:

- Crea entidades públicas nuevas.
- Actualiza información básica de entidades existentes.
- No sobrescribe la evaluación ya realizada.
- Evita duplicados usando NIT y entidad origen.
- Deja las variables nuevas en 0 hasta que un gestor las evalúe.

---

## 5. Recomendación de uso

1. Sincroniza las entidades públicas.
2. Abre cada entidad en la vista **Actores**.
3. Evalúa:
   - Poder.
   - Legitimidad.
   - Urgencia.
   - Frecuencia de intentos.
4. Revisa la vista **Mitchell**.
5. Usa la clasificación para priorizar relacionamiento, consultas y decisiones conjuntas.
