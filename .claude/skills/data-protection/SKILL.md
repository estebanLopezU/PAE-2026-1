---
name: data-protection
description: Aplicación de principios de protección de datos personales (finalidad legítima, minimización, consentimiento, anonimización, transparencia, supervisión humana) a la gestión de actores públicos en GOVStake 360, tanto en código como en documentación.
---

# Skill: Data Protection (GOVStake 360)

Usa esta skill cuando el proyecto maneje, guarde, muestre o documente
información de **actores públicos y sociales**. Soporta el compromiso del PAE:
uso exclusivamente académico/de investigación/mejora institucional; prohibido el
uso para vigilancia, perfilamiento político o tratamiento indebido de datos.

## Principios obligatorios (derivados del PAE)

1. **Finalidad legítima** — el tratamiento solo para caracterización y gestión de
   relacionamiento público, nunca vigilancia ni perfilamiento político.
2. **Minimización** — recolectar únicamente los campos necesarios. No añadir
   datos sensibles sin justificación.
3. **Consentimiento y permisos** — antes de datos reales: consentimiento
   informado y permisos institucionales (el PAE así lo exige).
4. **Anonimización** — datos simulados o seudoanonimizados para validación.
5. **Transparencia** — que el actor sepa qué dato se usa y para qué.
6. **Supervisión humana** — que una persona valide decisiones importantes
   derivadas de la IA/alertas (ninguna decisión automática sin revisión).

## Campos actuales del modelo `Actor`

Campos de contacto (email, telefono) y `notas`/`canales` pueden contener datos
personales. Reglas:
- Trátalos como **campos sensibles a nivel de negocio** aunque no sean PII dura.
- No incluyas datos biométricos, ideología, religión, salud ni orientación
  política en los modelos. El modelo `ActorVariables` solo guarda puntuaciones
  0–100 de variables de análisis (no datos personales).
- `posicion` (0–100) es una **variable calculada** de relación, no un perfil
  político. Documenta siempre que es interno.
- Para producción con datos reales, anonimizar el dataset de validación.

## En código

- Los seeds (`seed_data.py`) usan datos simulados. Si un día usas datos reales,
  seudoanonimiza (nombres genéricos, sin contacto real) o pide autorización.
- No loguees campos personales completos. En `registrar_auditoria` el detalle
  debe evitar email/telefonos de actores.
- Respuestas de la API: devolver solo lo necesario para cada vista (no exponer
  todos los campos de contacto si el frontend no los usa).

## En documentación (manual, informe, protocolo)

- Incluir una sección de **aspectos éticos y de protección de datos** que repita:
  finalidad, minimización, consentimiento, anonimización, transparencia,
  supervisión humana y *uso no de vigilancia*.
- El `protocolo` del endpoint debe dejar claro que la clasificación es una
  *herramienta de gestión*, no una etiqueta excluyente.

## Checklist

- [ ] No se agregan campos de datos sensibles sin justificar en el modelo.
- [ ] Los logs/auditoría no revelan datos de contacto de actores.
- [ ] Los seeds usan datos simulados/seudoanonimizados.
- [ ] La documentación incluye los 6 principios.
- [ ] Se evita lenguaje que sugiera vigilancia o perfilamiento.