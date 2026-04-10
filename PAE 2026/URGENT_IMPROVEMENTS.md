# Mejoras Urgentes para el Proyecto PAE 2026

## 1. Metodología de Evaluación de Madurez (Alta Prioridad)
- [ ] Definir criterios específicos y cuantificables para cada dominio del Marco MinTIC (seguridad, protocolo estandarizado, calidad de datos, etc.)
- [ ] Establecer procesos de auditoría y validación técnica de APIs
- [ ] Documentar formularios y flujos de recolección de datos de evaluación## 2. Formalización de Solicitud a la Agencia Nacional Digital (AND) (Alta Prioridad)
- [ ] Definir el formato exacto de información requerida (entidades, estado de conexión X-Road, APIs expuestas)
- [ ] Establecer plazo de respuesta y canal oficial de comunicación
- [ ] Diseñar mecanismo de validación cruzada con datos internos

## 3. Seguridad y Conformidad X-Road (Alta Prioridad)
- [ ] Implementar autenticación OAuth2/JWT para acceso a APIs del backend
- [ ] Configurar monitoreo de cumplimiento de protocolos X-Road
- [ ] Definir proceso de revisión y aprobación de nuevos endpoints por parte del equipo de seguridad

## 4. Integración de Inteligencia Artificial (Media Prioridad)
- [ ] Recopilar dataset de evaluaciones históricas disponibles
- [ ] Seleccionar y entrenar modelo de predicción de niveles de madurez
- [ ] Validar modelo con métricas apropiadas y documentar limitaciones## 5. Monitoreo Operacional y Mantenimiento (Media Prioridad)
- [ ] Implementar sistema de alertas para contenedores críticos (PostgreSQL, FastAPI, React)
- [ ] Definir plan de actualización para cambios en el marco MinTIC
- [ ] Documentar procesos operacionales y runbooks de soporte

---

### Seguimiento de Tareas en Curso
- [x] Clarificar request and defined goal
- [x] Build Docker images
- [ ] Start backend and frontend containers