// Colores y etiquetas del modelo del doctorado, compartidos por las páginas
// que muestran la clasificación (Fundamentos y Mitchell).

export const RANGO_COLORS = {
  nula: '#94a3b8',
  baja: '#38bdf8',
  media_baja: '#eab308',
  media_alta: '#f97316',
  alta: '#ef4444',
}

export const EXPR_COLORS = {
  autocracia: '#94a3b8',
  consulta: '#38bdf8',
  decision_conjunta: '#f59e0b',
  delegacion: '#22c55e',
}

export const EXPR_LABELS = {
  autocracia: 'Autocracia',
  consulta: 'Consulta',
  decision_conjunta: 'Decisión conjunta',
  delegacion: 'Delegación',
}

export const RANGO_LABELS = {
  nula: 'Nula',
  baja: 'Baja',
  media_baja: 'Media-Baja',
  media_alta: 'Media-Alta',
  alta: 'Alta',
}

// Niveles ordinales del instrumento (0-3).
export const NIVELES_ORDINALES = [
  { valor: 0, label: 'Nula' },
  { valor: 1, label: 'Baja' },
  { valor: 2, label: 'Media' },
  { valor: 3, label: 'Alta' },
]
