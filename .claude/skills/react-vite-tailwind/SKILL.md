---
name: react-vite-tailwind
description: Convenciones del frontend GOVStake 360 en React 18 + Vite + Tailwind CSS. Cubre estructura de carpetas, rutas protegidas, cliente API (axios), estilos y paquetes disponibles.
---

# Skill: React + Vite + Tailwind (FrontendGovstacke)

Usa esta skill al crear o modificar páginas, componentes y estilos del frontend.

## Stack confirmado (ver `package.json`)

- React **18.2** + `react-dom`
- Vite **5** (`npm install`, no usar yarn/pnpm para este proyecto)
- Tailwind CSS **3.4** + PostCSS/Autoprefixer
- `react-router-dom` **7** (rutas)
- `axios` (cliente API)
- `recharts` (gráficas) y `lucide-react` (iconos)
- `clsx` (utilidad para combinar clases)

## Estructura `src/`

```
src/
├── App.jsx                     # Rutas y ProtectedRoute
├── main.jsx                    # Punto de entrada
├── services/api.js             # Cliente axios + APIs por dominio
├── contexts/AuthContext.jsx    # Estado de sesión
├── pages/                      # Una página por ruta (Dashboard, Actores, Matriz…)
├── components/
│   ├── layout/Layout.jsx       # Barra lateral y top bar
│   ├── common/GlassCard.jsx    # Tarjeta "glass" reutilizable
│   └── chatbot/AgentGDChat.jsx # Asistente IA flotante
└── styles/govstake.css
```

## Rutas (`src/App.jsx`)

- `LoginPage` es pública.
- El resto vive dentro de `<ProtectedRoute><Layout /></ProtectedRoute>`.
- Añade una ruta nueva en dos sitios:
  1. `App.jsx` dentro del bloque de rutas protegidas:
     ```jsx
     <Route path="midominio" element={<MiPagina />} />
     ```
  2. El enlace en `Layout.jsx` (arreglo `NAV_ITEMS` con `{ to, label, icon }`).
- Importa el icono desde `lucide-react`.

## Cliente API (`src/services/api.js`)

- `baseURL = '/api/v1'`.
- Interceptor de request agrega `Authorization: Bearer <access>`.
- Interceptor de response refresca el access con el refresh token en `401`.
- Agrupa endpoints por dominio en objetos exportados (p. ej. `actorsApi`,
  `matrizApi`, `alertasApi`, `reportesApi`).
- Nuevo endpoint: agrega un método al objeto correspondiente, NO uses axios
  directo dentro de las páginas.

## Autenticación en vistas

```jsx
import { useAuth } from '../contexts/AuthContext'
const { user } = useAuth()
```

- Si se necesita restringir por rol (admin), consulta `user.role` y muestra u
  oculta acciones, pero nunca bases la seguridad en el frontend (siempre en el
  backend con `require_admin`).

## Estilos Tailwind / tema

- El dashboard usa clases utilitarias de Tailwind inline y un esquema oscuro.
- `GlassCard` es el componente base para tarjetas; reúsalo en vez de repetir
  estilos de borde/fondo.
- Paleta recurrente usada en el repo (temas inline): tonos `[#150505]`,
  `[#3a1616]`, `[#ff3b3b]`, `[#ff8a3d]`, `[#a08080]`. Respétala para coherencia.
- Si usas valores arbitrarios, Tailwind los soporta con sintaxis `[valor]`.

## Formato y comandos

- JSX (`.jsx`), no TypeScript.
- Formato visual: diseño de dashboard con grid, tarjetas (GlassCard) y KPIs.
- Comandos: `npm run dev` (Vite), `npm run build`, `npm run preview`.

## Checklist

- [ ] Nueva página en `pages/`, ruta en `App.jsx` y enlace en `Layout.jsx`.
- [ ] Llamadas API por el objeto de dominio en `services/api.js`.
- [ ] Reuso de `GlassCard` y tema de colores existente.
- [ ] Protección de rutas vía `ProtectedRoute`.
- [ ] Nada de seguridad confiada solo al frontend.