# 🚀 Acceso a la Aplicación X-Road Colombia

## ✅ Estado de los Servicios

Todos los servicios están corriendo correctamente:

| Servicio | Estado | Puerto | URL |
|----------|--------|--------|-----|
| **Frontend** | ✅ Running | 5173 | http://localhost:5173 |
| **Backend** | ✅ Running | 8000 | http://localhost:8000 |
| **PostgreSQL** | ✅ Healthy | 5432 | localhost:5432 |

---

## 🌐 URLs de Acceso

### **Frontend (Interfaz Principal)**
```
http://localhost:5173
```
- Dashboard principal
- Gestión de entidades
- Análisis de IA
- Mapa interactivo
- Reportes

### **Backend API**
```
http://localhost:8000
```
- API REST del backend
- Endpoints de datos
- Servicios de IA

### **Documentación API**
```
http://localhost:8000/docs
```
- Swagger UI interactivo
- Documentación de endpoints
- Pruebas de API

---

## 🎨 Mejoras de Diseño Implementadas

### **Efectos Visuales Científicos:**
- ✅ Grid de fondo animado con efecto de pulso
- ✅ Partículas flotantes de colores
- ✅ Tarjetas KPI con efecto neón
- ✅ Animaciones de entrada suaves
- ✅ Efectos de brillo al hover
- ✅ Gradientes científicos dinámicos

### **Componentes Mejorados:**
- **Header**: Con gradiente y efecto de brillo
- **KPIs**: Tarjetas flotantes con neón
- **Gráficos**: Contenedores con efecto glass
- **Botones**: Efecto ripple y elevación
- **Inputs**: Animaciones de enfoque
- **Tablas**: Efectos de hover suaves

### **Paleta de Colores Científicos:**
- Primario: Azul (#3b82f6)
- Secundario: Cian (#06b6d4)
- Éxito: Verde (#10b981)
- Advertencia: Ámbar (#f59e0b)
- Error: Rojo (#ef4444)
- Info: Violeta (#8b5cf6)

---

## 📊 Características del Dashboard

### **Pestañas Disponibles:**
1. **Vista General**: KPIs y gráficos principales
2. **Análisis de Entidades**: Selección y análisis individual
3. **Clusters**: Agrupación de entidades
4. **Predicciones**: Tendencias futuras

### **Funcionalidades:**
- ✅ KPIs en tiempo real
- ✅ Gráficos interactivos
- ✅ Sistema de filtros
- ✅ Recomendaciones de IA
- ✅ Análisis predictivo
- ✅ Clustering de entidades

---

## 🔧 Comandos Útiles

### **Ver Estado de Servicios:**
```bash
docker ps --filter "name=xroad"
```

### **Ver Logs:**
```bash
# Backend
docker logs xroad-backend -f

# Frontend
docker logs xroad-frontend -f

# PostgreSQL
docker logs xroad-postgres -f
```

### **Reiniciar Servicios:**
```bash
cd "PAE 2026"
docker-compose restart
```

### **Detener Servicios:**
```bash
cd "PAE 2026"
docker-compose down
```

---

## 🎯 Próximos Pasos

1. **Explora el Dashboard**: Revisa los KPIs y gráficos
2. **Navega por las Entidades**: Filtra y busca entidades
3. **Revisa los Clusters**: Analiza la agrupación
4. **Consulta las Predicciones**: Ve las tendencias futuras

---

## 📞 Soporte

Si encuentras algún problema:
1. Verifica que Docker Desktop esté corriendo
2. Revisa los logs de los servicios
3. Ejecuta `docker-compose restart`

---

**¡Disfruta de la aplicación X-Road Colombia! 🇨🇴**