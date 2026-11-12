import { useEffect, useState } from 'react'
import { Plus, Search, RefreshCw, AlertTriangle, Trash2, Save, X } from 'lucide-react'
import GlassCard from '../components/common/GlassCard'
import { actorsApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { TIPOS_ACTOR as TIPOS } from '../constants/actores'

// Las cuatro variables del modelo del doctorado se valoran en escala ordinal de
// cuatro niveles. En la base se conserva el equivalente 0-100 para no perder la
// granularidad historica ni romper los indices de priorizacion.
const ORDINALES = [
  { valor: 0, label: 'Nula' },
  { valor: 25, label: 'Baja' },
  { valor: 50, label: 'Media' },
  { valor: 75, label: 'Alta' },
]

const VARIABLES = [
  { key: 'poder', label: 'Poder', ordinal: true },
  { key: 'legitimidad', label: 'Legitimidad', ordinal: true },
  { key: 'influencia', label: 'Influencia' },
  { key: 'interes', label: 'Interés' },
  { key: 'dependencia', label: 'Dependencia' },
  { key: 'capacidad_movilizacion', label: 'Cap. movilización' },
  { key: 'posicion', label: 'Posición' },
  { key: 'historial_participacion', label: 'Historial part.' },
  { key: 'riesgo_conflicto', label: 'Riesgo conflicto' },
  { key: 'canales_relacionamiento', label: 'Canales rel.' },
  { key: 'urgencia', label: 'Urgencia', ordinal: true },
  { key: 'frecuencia_intentos', label: 'Frecuencia intentos', ordinal: true },
]

const PAREJAS = [
  { clave: 'pl', a: 'poder', b: 'legitimidad', label: 'Poder vs Legitimidad' },
  { clave: 'pu', a: 'poder', b: 'urgencia', label: 'Poder vs Urgencia' },
  { clave: 'lu', a: 'legitimidad', b: 'urgencia', label: 'Legitimidad vs Urgencia' },
]

const nivelDeValor = (valor) => {
  const n = Number(valor) || 0
  if (n >= 75) return 75
  if (n >= 50) return 50
  if (n >= 25) return 25
  return 0
}

function VariableInput({ item, value, onChange }) {
  if (item.ordinal) {
    return (
      <select
        value={nivelDeValor(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-lg border border-[#3f3f46] bg-black/40 px-2 py-1.5 text-xs text-white outline-none focus:border-[#ef4444]"
      >
        {ORDINALES.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.label}
          </option>
        ))}
      </select>
    )
  }
  return (
    <input
      type="range"
      min="0"
      max="100"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full accent-[#ef4444]"
    />
  )
}

const PRIORIDAD_COLOR = { alta: '#ef4444', media: '#f97316', baja: '#a1a1aa' }
export default function Actores() {
  const { isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [buscar, setBuscar] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingVars, setEditingVars] = useState(null)
  const [saving, setSaving] = useState(false)

  const emptyForm = {
    nombre: '', tipo: 'ciudadania', email: '', telefono: '', descripcion: '',
    poder: 50, legitimidad: 50, influencia: 50, interes: 50,
    dependencia: 50, capacidad_movilizacion: 50, posicion: 50,
    historial_participacion: 50, riesgo_conflicto: 50, canales_relacionamiento: 50,
    urgencia: 0, frecuencia_intentos: 0,
  }
  const [form, setForm] = useState(emptyForm)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (buscar) params.buscar = buscar
      if (tipoFiltro) params.tipo = tipoFiltro
      const res = await actorsApi.getAll(params)
      setItems(res.data?.items || [])
    } catch {
      setError('No se pudieron cargar los actores.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscar, tipoFiltro])
  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const variables = {}
      VARIABLES.forEach(({ key }) => { variables[key] = Number(form[key]) })
      await actorsApi.create({
        nombre: form.nombre,
        tipo: form.tipo,
        email: form.email || null,
        telefono: form.telefono || null,
        descripcion: form.descripcion || null,
        variables,
      })
      setShowModal(false)
      setForm(emptyForm)
      load()
    } catch {
      alert('No se pudo crear el actor. ¿Tienes rol de administrador?')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este actor? Esta acción no se puede deshacer.')) return
    try {
      await actorsApi.delete(id)
      load()
    } catch {
      alert('No se pudo eliminar el actor (requiere rol admin).')
    }
  }

  const startEditVars = (actor) => {
    const values = {}
    VARIABLES.forEach(({ key }) => { values[key] = actor.variables?.[key] ?? 0 })
    const guardada = actor.variables?.ponderacion
    const parejas = { pl: 5, pu: 5, lu: 5 }
    if (guardada?.parejas?.length) {
      PAREJAS.forEach(({ clave, a, b }) => {
        const pareja = guardada.parejas.find((p) => p.a === a && p.b === b)
        if (pareja) parejas[clave] = Number(pareja.puntos_a)
      })
    }
    setEditingVars({
      actorId: actor.id,
      values,
      usaPonderacion: Boolean(guardada?.parejas?.length),
      parejas,
    })
  }

  const saveVars = async () => {
    setSaving(true)
    try {
      const payload = {}
      VARIABLES.forEach(({ key }) => { payload[key] = Number(editingVars.values[key]) })
      if (editingVars.usaPonderacion) {
        payload.ponderacion = {
          parejas: PAREJAS.map(({ clave, a, b }) => ({
            a,
            b,
            puntos_a: Number(editingVars.parejas[clave]),
          })),
        }
      } else {
        payload.ponderacion = null
      }
      await actorsApi.updateVariables(editingVars.actorId, payload)
      setEditingVars(null)
      load()
    } catch {
      alert('No se pudieron guardar las variables.')
    } finally {
      setSaving(false)
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#ef4444]">REGISTRO Y CARACTERIZACIÓN</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Actores</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-lg border border-[#3f3f46] px-4 py-2 text-xs font-bold text-[#a1a1aa] hover:border-[#ef4444]/50 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" /> ACTUALIZAR
          </button>
          {isAdmin() && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#ef4444] to-[#f97316] px-4 py-2 text-xs font-black tracking-wider text-[#1a0505]"
            >
              <Plus className="h-4 w-4" /> NUEVO ACTOR
            </button>
          )}
        </div>
      </div>

      <GlassCard className="flex flex-wrap gap-3 p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1a1aa]" />
          <input
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar actor por nombre…"
            className="w-full rounded-lg border border-[#3f3f46] bg-black/40 py-2 pl-10 pr-3 text-sm text-white outline-none placeholder:text-[#5c7285] focus:border-[#ef4444]"
          />
        </div>
        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
          className="rounded-lg border border-[#3f3f46] bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#ef4444]"
        >
          <option value="">Todos los tipos</option>
          {TIPOS.map((t) => (
            <option key={t.clave} value={t.clave}>{t.label}</option>
          ))}
        </select>
      </GlassCard>

      {error && (
        <GlassCard className="p-4">
          <p className="flex items-center gap-2 text-sm text-[#fca5a5]">
            <AlertTriangle className="h-4 w-4" /> {error}
          </p>
        </GlassCard>
      )}
      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-[#ef4444]" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-14 text-center text-sm text-[#a1a1aa]">No hay actores que coincidan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[#3f3f46]">
                  <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Actor</th>
                  <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Origen</th>
                  <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Tipo</th>
                  <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Prioridad</th>
                  <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Mitchell</th>
                  <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Índice</th>
                  <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3f3f46]/50">
                {items.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-white/5">
                    <td className="px-5 py-4">
                      <p className="font-bold text-white">{a.nombre}</p>
                      {a.descripcion && <p className="mt-0.5 max-w-xs truncate text-xs text-[#a1a1aa]">{a.descripcion}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full border border-[#3f3f46] px-2 py-1 font-mono text-[9px] font-bold uppercase text-white/80">
                        {a.fuente === 'entidad_publica' ? 'Entidad pública' : 'Manual'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs uppercase tracking-wider text-[#d4d4d8]">
                      {a.tipo.replace('_', ' ')}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase"
                        style={{
                          color: PRIORIDAD_COLOR[a.nivel_prioridad] || '#a1a1aa',
                          background: `${PRIORIDAD_COLOR[a.nivel_prioridad] || '#a1a1aa'}1a`,
                        }}
                      >
                        {a.nivel_prioridad}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {a.mitchell?.sin_percepcion ? (
                        <span className="rounded-full border border-[#3f3f46] bg-black/30 px-3 py-1 font-mono text-[9px] font-bold uppercase text-[#71717a]">
                          Sin valoración del líder
                        </span>
                      ) : (
                        <div>
                          <span className="rounded-full border border-[#f97316]/40 bg-[#f97316]/10 px-3 py-1 font-mono text-[9px] font-bold uppercase text-[#f97316]">
                            {a.mitchell?.etiqueta || 'Sin clasificar'}
                          </span>
                          <p className="mt-1 font-mono text-[10px] text-[#71717a]">
                            PLU {a.mitchell?.plu} · {a.mitchell?.relevancia_calculada?.toFixed(2)} ·{' '}
                            {a.mitchell?.rango_etiqueta}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-[#f97316]">{a.indice_priorizacion}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => startEditVars(a)}
                          className="rounded-lg border border-[#f97316]/40 px-3 py-1.5 text-[11px] font-bold text-[#f97316] hover:bg-[#f97316]/10"
                        >
                          Variables
                        </button>
                        {isAdmin() && (
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="rounded-lg border border-[#ef4444]/40 p-1.5 text-[#ef4444] hover:bg-[#ef4444]/10"
                            title="Eliminar actor"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <GlassCard className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Nuevo actor</h2>
              <button onClick={() => setShowModal(false)} className="text-[#a1a1aa] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del actor *" className="rounded-lg border border-[#3f3f46] bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#ef4444]" />
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="rounded-lg border border-[#3f3f46] bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#ef4444]">
                  {TIPOS.map((t) => <option key={t.clave} value={t.clave}>{t.label}</option>)}
                </select>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Correo electrónico" className="rounded-lg border border-[#3f3f46] bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#ef4444]" />
                <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="Teléfono" className="rounded-lg border border-[#3f3f46] bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#ef4444]" />
                <input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción" className="rounded-lg border border-[#3f3f46] bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#ef4444]" />
              </div>
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#a1a1aa]">Variables de análisis</p>
                <p className="mb-3 text-[11px] text-[#71717a]">
                  Poder, legitimidad, urgencia y frecuencia usan la escala ordinal del
                  doctorado (nula, baja, media, alta). Las demás variables usan 0–100.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {VARIABLES.map((item) => (
                    <label key={item.key} className="text-xs text-[#d4d4d8]">
                      {item.label}: <span className="font-mono text-[#f97316]">{form[item.key]}</span>
                      <VariableInput
                        item={item}
                        value={form[item.key]}
                        onChange={(v) => setForm({ ...form, [item.key]: v })}
                      />
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full rounded-lg bg-gradient-to-r from-[#ef4444] to-[#f97316] py-3 font-mono text-sm font-black tracking-widest text-[#1a0505] disabled:opacity-50">
                {saving ? 'GUARDANDO…' : 'CREAR ACTOR'}
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {editingVars && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditingVars(null)} />
          <GlassCard className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Variables de análisis</h2>
              <button onClick={() => setEditingVars(null)} className="text-[#a1a1aa] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {VARIABLES.map((item) => (
                <label key={item.key} className="text-xs text-[#d4d4d8]">
                  {item.label}: <span className="font-mono text-[#f97316]">{editingVars.values[item.key]}</span>
                  <VariableInput
                    item={item}
                    value={editingVars.values[item.key]}
                    onChange={(v) =>
                      setEditingVars({
                        ...editingVars,
                        values: { ...editingVars.values, [item.key]: v },
                      })
                    }
                  />
                </label>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-[#3f3f46] bg-black/30 p-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={editingVars.usaPonderacion}
                  onChange={(e) =>
                    setEditingVars({ ...editingVars, usaPonderacion: e.target.checked })
                  }
                  className="mt-0.5 h-4 w-4 accent-[#ef4444]"
                />
                <span>
                  <span className="block text-xs font-bold text-white">
                    Ponderación por apareamiento
                  </span>
                  <span className="mt-1 block text-[11px] leading-relaxed text-[#a1a1aa]">
                    Diez puntos por pareja, treinta en total. Si se deja desmarcada, la
                    valoración usa los pesos publicados en el doctorado. La ponderación
                    queda guardada junto con esta valoración.
                  </span>
                </span>
              </label>
              {editingVars.usaPonderacion && (
                <div className="mt-4 space-y-3">
                  {PAREJAS.map(({ clave, label }) => (
                    <div key={clave}>
                      <div className="flex items-center justify-between text-[11px] text-[#d4d4d8]">
                        <span>{label}</span>
                        <span className="font-mono text-[#f97316]">
                          {editingVars.parejas[clave]} – {10 - editingVars.parejas[clave]}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={editingVars.parejas[clave]}
                        onChange={(e) =>
                          setEditingVars({
                            ...editingVars,
                            parejas: {
                              ...editingVars.parejas,
                              [clave]: Number(e.target.value),
                            },
                          })
                        }
                        className="mt-1 w-full accent-[#ef4444]"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={saveVars}
              disabled={saving}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#ef4444] to-[#f97316] py-3 font-mono text-sm font-black tracking-widest text-[#1a0505] disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {saving ? 'GUARDANDO…' : 'GUARDAR VARIABLES'}
            </button>
          </GlassCard>
        </div>
      )}
    </div>
  )
}



