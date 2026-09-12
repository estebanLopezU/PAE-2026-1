---
name: code-review-refactoring
description: Revisión de código y refactor coherente en GOVStake 360. Busca consistencia entre BackendGovstacke y BackendInteroperabilidad, detecta duplicación, y aplica mejoras pequeñas y seguras respetando las convenciones del repo.
---

# Skill: Code Review & Refactoring

Usa esta skill para revisar, limpiar o mejorar código de forma consistente y sin
romper funcionalidad. Es especialmente útil porque el repo tiene **dos backends**
con propósitos distintos pero patrones parecidos.

## Antes de refactorizar

1. **Identifica el motivo real**: duplicación, función demasiado larga, mezcla de
   responsabilidades, o inconsistencia entre los dos backends.
2. **Cambios pequeños y verificables**: cada refactor debe poder revisarse y
   probarse por separado. No mezcles refactor con cambios de comportamiento.
3. **Ejecuta pruebas** antes y después (usa la skill `unit-testing`).

## Principios de revisión

- **Duplicación consciente**: copiar código entre los 2 backends puede ser aceptable
  si evolucionan por separado; pero si la lógica es idéntica y cambia al unísono,
  unificar o documentar. No fuerces abstracciones prematuras.
- **Responsabilidades**: los endpoints no deben contener lógica de negocio que
  encaje en funciones puras de `models/__init__.py`.
- **Consistencia de nombres**: `tipo`, `variables`, `indice_priorizacion`,
  `indice_relacionamiento`, `nivel_prioridad` deben llamarse igual en backend y
  frontend. Si detectas variaciones (p. ej. `types` vs `tipos`), corrígelas.
- **Mensajes y errores**: en español, breves, con códigos HTTP correctos.
- **Sin cambios cosméticos aislados**: no "limpiar" un archivo entero si el
  objetivo era mover una función; manten el diff enfocado.

## Señales de deuda a atender

- Funciones > ~40 líneas → dividir por responsabilidad.
- Importaciones innecesarias / modelos no registrados en `__init__.py`.
- Variables 0–100 duplicadas fuera del contrato (ver skill `sqlalchemy-models`).
- Seguridad débil (contraseñas plano, tokens sin validar tipo) → ver skill
  `security-auth-jwt`.

## Patrón seguro para refactor

1. Lee el archivo completo antes de editar (no refactorices a ciegas).
2. Haz una edición a la vez con `editor`; verifica cada cambio.
3. Después de un grupo de cambios, ejecuta lint/import y tests.
4. Termina con una lista de lo tocado para que el humano revise.

### Comandos de verificación

```powershell
# Backend: compila sin errores
python -m compileall "app" -q && Write-Output "OK backend"

# Frontend: build
# (opcional) cd FrontendGovstacke && npm run build
```

## Checklist

- [ ] Refactor pequeño, con prueba antes/después.
- [ ] Lógica de negocio en funciones puras, no en endpoints.
- [ ] Nombres consistentes backend↔frontend.
- [ ] Sin cambios cosméticos fuera de alcance.
- [ ] Documentada la decisión de duplicar o unificar.