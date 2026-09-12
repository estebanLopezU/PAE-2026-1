---
name: ux-a11y-dashboard
description: Lineamientos de UX y accesibilidad para los tableros y mapas de GOVStake 360 (Dashboard, Matriz, KPIs, gráficas recharts). Busca legibilidad, jerarquía clara y soporte básico de accesibilidad sin romper el estilo oscuro actual.
---

# Skill: UX & Accesibilidad de Dashboard (GOVStake 360)

Usa esta skill al construir o revisar tableros, KPIs, gráficas y mapas.

## Jerarquía visual

- Estructura típica de `Dashboard.jsx`: fila de **KPIs** en grid
  (`xl:grid-cols-4`), luego **gráficas** (recharts) y listas (prioridad, riesgo).
- Orden lógico: 1) resumen (KPIs), 2) análisis (mapa/matriz), 3) acción
  (compromisos, alertas).
- Cada KPI con: título corto, valor grande, `helper` breve que explica la métrica
  (p. ej. "Calidad general (0–100)").

## KPIs (coherencia con el backend)

Muestra las métricas que el endpoint `/dashboard` ya devuelve:

| KPI | Campo API (dashboard) |
|-----|------------------------|
| Actores registrados | `total_actores` |
| Índice de relacionamiento | `indice_calidad_relacionamiento` (0–100) |
| Compromisos pendientes | `compromisos_pendientes` / `compromisos_total` |
| Alertas sin leer | `alertas_no_leidas` / `alertas_criticas` |

Usa `data?.campo ?? 0` para no romper cuando el backend responde antes.

## Semántica de alertas (colores)

- `critical` / riesgo alto → rojo.
- `warning` / riesgo moderado → ámbar.
- `info` → neutro/azul.
No uses color como único canal: acompaña con icono y texto.

## Gráficas (recharts)

- Título y unidad siempre visibles (0–100 para variables e índices).
- Tooltips con etiqueta legible (nombre del actor + valor).
- No sobrecargar; si hay muchos actores, filtrar top N o por tipo.
- Colores diferenciados para `poder`, `legitimidad`, `influencia` y
  `riesgo_conflicto` (usa la paleta de GOVStake).

## Accesibilidad (mínimo obligatorio)

- **Contraste**: sobre fondo oscuro usa texto claro; testea que los KPIs y títulos
  sean legibles. Valores en blanco/grises claros sobre `#150505`.
- **Enfoque**: todos los controles (selects, botones, inputs de `Actores.jsx`)
  tienen `outline` visible al enfocar (ya usan `focus:border-[#ff3b3b]`).
- **Etiquetas**: cada input/select con `placeholder` o label accesible. En HTML
  span, agrega `aria-label` cuando no haya `<label>` explícito.
- **Texto alternativo**: cualquier ícono decorativo con `aria-hidden="true"`;
  los informativos con `role="img"` y `aria-label`.
- **Tablas/matriz**: cabecera claramente diferenciada; no usar color solo para
  indicar prioridad (añadir columna de texto del nivel).
- **Teclado**: las tarjetas/acciones clicables son `<button>` reales o tienen
  `role="button"` y `onKeyDown`.

## Responsive

- Grids colapsan en `sm`/`md`/`xl` (`grid-cols-1` → `xl:grid-cols-4`).
- El mapa y las gráficas se limitan en altura (`height` fijo de recharts).
- Verifica scroll horizontal inesperado en pantallas chicas.

## Checklist

- [ ] KPIs usan el campo correcto del backend con fallback `?? 0`.
- [ ] Colores no son el único indicador de severidad.
- [ ] Contraste OK sobre tema oscuro.
- [ ] Inputs con label/placeholder/aria y focus visible.
- [ ] Iconos decorativos con `aria-hidden`.
- [ ] Responsive colapsa bien.