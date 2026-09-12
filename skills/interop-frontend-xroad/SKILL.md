---
name: interop-frontend-xroad
description: Frontend del sistema de interoperabilidad X-Road Colombia (FrontendInteroperabilidad). Cubre el stack con internacionalización (i18n es/en), mapas Leaflet, grafos de relaciones, export a PDF (jspdf), temas y las páginas del módulo.
---

# Skill: Frontend Interoperabilidad X-Road (FrontendInteroperabilidad)

Usa esta skill al trabajar en el frontend del **Análisis de Interoperabilidad**.

## Stack confirmado (ver `package.json`)

**Diferente al de GOVStake** en varios paquetes clave:

| Paquete | Uso |
|---------|-----|
| React 18 + Vite 5 + Tailwind 3.3 | Base |
| `react-router-dom` **6** | Rutas |
| `i18next` + `react-i18next` + `i18next-browser-languagedetector` | Internacionalización es/en |
| `leaflet` + `react-leaflet` | **Mapas geográficos** |
| `react-force-graph-2d` (usa `d3-force`) | **Grafos de relaciones** entre nodos |
| `jspdf` + `jspdf-autotable` | **Exportar a PDF** |
| `recharts` | Gráficas |
| `lucide-react` | Iconos |

> Nota: aunque el stack base es parecido a `react-vite-tailwind`, este frente usa
> **rutas con `element=` (react-router 6)**, i18n global y componentes extra.

## Estructura `src/`

```
src/
├── App.jsx                      # Rutas (react-router 6)
├── main.jsx
├── i18n/
│   ├── index.js                 # Configuración i18next (detecta idioma)
│   └── locales/{es.json,en.json}
├── contexts/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx         # Tema claro/oscuro
├── components/
│   ├── LanguageSelector.jsx     # Selector es/EN
│   ├── ThemeToggle.jsx
│   ├── RelationshipGraph.jsx    # Grafo de relaciones (react-force-graph-2d)
│   ├── chatbot/AgentGDChat.jsx
│   ├── common/{GlassCard,StatusPulse}.jsx
│   └── layout/Layout.jsx
├── pages/                       # Dashboard, Entidades, MapaInteractivo,
│                                # EvaluacionMadurez, MatrizServicios, AnalisisIA,
│                                # Reportes, AuditoriaSeguridad, LoginPage
├── services/{api.js, aiApi.js, pdfExportService.js}
└── styles/{index.css, animations.css}
```

## Internacionalización (i18n) — obligatoria

Todo texto visible debe pasar por i18n, **nunca** hardcodear en las páginas:

1. Traducciones en `src/i18n/locales/es.json` y `en.json`.
2. Uso con `useTranslation` (o `t('clave')`) con `react-i18next`.
3. Prefijos por módulo, p. ej. `navigation.map`, `navigation.maturity`,
   `navigation.reports`, `navigation.aiAnalysis`.
4. Añade SIEMPRE la clave en **ambos** idiomas; si falta, el fallback es `es`.
5. El selector está en `components/LanguageSelector.jsx` y guarda el idioma en
   `localStorage`.

### Nuevo texto
- Abre los dos JSON, agrega la clave en es y en,
- Usa `t('grupo.clave')` en la página.
- Verifica que no haya texto plano visible suelto en los `.jsx`.

## Rutas (`App.jsx`)

- `LoginPage` pública; el resto bajo rutas protegidas con `Layout`.
- `ProtectedRoute` redirige a `/login` si no hay sesión.

## páginas clave y su backend

| Página | Módulo backend | Particularidad |
|--------|----------------|----------------|
| `Dashboard.jsx` | `/dashboard` | KPIs y resumen |
| `Entidades.jsx` | `/entities` | Gestión de entidades |
| `MapaInteractivo.jsx` | coordenadas (`latitude`/`longitude`) | **Leaflet** para mapa geográfico |
| `EvaluacionMadurez.jsx` | `/maturity` | Modelo de madurez MinTIC (4 dominios) |
| `MatrizServicios.jsx` | `/services`, `/interop` | Matriz de servicios |
| `AnalisisIA.jsx` | `/ai` | Insights con IA |
| `Reportes.jsx` | `/reports` | Reportes + **export PDF** con `jspdf` |
| `AuditoriaSeguridad.jsx` | `/auditoria` o security | Trazabilidad |

## Export a PDF

`src/services/pdfExportService.js` centraliza el uso de **jspdf + autotable**.
- Para exportar una tabla, usa la utilidad central en vez de crear un `jspdf`
   nuevo en cada página.
- Respeta el estilo existente (encabezado, logos de `public`, colores del tema).

## Cliente API (`src/services/api.js`)

- `API_BASE_URL = '/api/v1'`.
- Keys de token distintas a GOVStake: `xroad_access_token` / `xroad_refresh_token`.
- Mismo patrón: objetos por dominio (`authApi`, `sectorsApi`, …) + `aiApi.js`
  separado para IA.
- Interceptor de refresh de token igual que el de GOVStake.

## Tema claro/oscuro

- Hay `ThemeContext.jsx` + `ThemeToggle.jsx` y `styles/animations.css`.
- Al añadir estilos, sigue la variable del tema (no fuerces solo colores fijos).
- Querido `StatusPulse.jsx` para indicadores de estado (pulso animado).

## Comandos

```powershell
npm run dev        # Vite dev
npm run build      # Build de producción
npm run lint       # ESLint (js/jsx, sin warnings)
```

El repo incluye `lint` con `--max-warnings 0`; **deja el código sin warnings**
antes de terminar.

## Checklist

- [ ] Textos nuevos con la traducción en es.json y en.json (+ uso con `t()`).
- [ ] Rutas agregadas en `App.jsx` y enlace en `Layout.jsx`.
- [ ] Llamadas API por objeto de dominio (api.js / aiApi.js).
- [ ] Export PDF a través de `pdfExportService.js`.
- [ ] `npm run build` y `npm run lint` sin errores/warnings.