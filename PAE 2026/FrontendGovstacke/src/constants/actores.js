// Tipos de actor del modelo. Fuente única para los selectores y para las
// etiquetas legibles que muestran las páginas de análisis.

export const TIPOS_ACTOR = [
  { clave: 'ciudadania', label: 'Ciudadanía' },
  { clave: 'organizaciones', label: 'Organizaciones sociales' },
  { clave: 'veeduria', label: 'Veedurías' },
  { clave: 'concejo_municipal', label: 'Concejo municipal' },
  { clave: 'servidor_publico', label: 'Servidores públicos' },
  { clave: 'empresa', label: 'Empresas / sector privado' },
  { clave: 'medios', label: 'Medios de comunicación' },
  { clave: 'universidad', label: 'Universidades' },
  { clave: 'entidad_control', label: 'Entidades de control' },
  { clave: 'cooperacion', label: 'Cooperación internacional' },
  { clave: 'gobierno_local', label: 'Gobierno local' },
  { clave: 'gobierno_departamental', label: 'Gobierno departamental' },
  { clave: 'entidad_publica', label: 'Entidad pública (sincronizada)' },
]

export const TIPO_LABELS = Object.fromEntries(
  TIPOS_ACTOR.map(({ clave, label }) => [clave, label])
)

export function etiquetaTipo(clave) {
  if (!clave) return 'Sin clasificar'
  return TIPO_LABELS[clave] || clave.replace(/_/g, ' ')
}
