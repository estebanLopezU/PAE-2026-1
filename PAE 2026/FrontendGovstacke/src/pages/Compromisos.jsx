import { useEffect, useState } from 'react'
import { Plus, RefreshCw, AlertTriangle, X, Trash2 } from 'lucide-react'
import GlassCard from '../components/common/GlassCard'
import { compromisosApi, actorsApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const ESTADOS = ['pendiente', 'en_proceso', 'cumplido', 'cancelado']
const ESTADO_COLOR = {
  pendiente: '#f59e0b', en_proceso: '#ff8a3d', cumplido: '#10b981', cancelado: '#8a6363',
}

export default function Compromisos() {
  const { isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [actores, setActores] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const emptyForm = { actor_id: '', titulo: '', descripcion: '', estado: 'pendiente', fecha_compromiso: '', fecha_limite: '' }
  const [form, setForm] = useState(emptyForm)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [c, a] = await Promise.all([compromisosApi.getAll(), actorsApi.getAll()])
      setItems(c.data?.items || [])
      setActores(a.data?.items || [])
    } catch {
      setError('No se pudieron cargar los compromisos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await compromisosApi.create({
        ...form,
        actor_id: Number(form.actor_id),
        fecha_compromiso: form.fecha_compromiso || null,
        fecha_limite: form.fecha_limite || null,
      })
      setShowModal(false)
      setForm(emptyForm)
      load()
    } catch {
      alert('No se pudo crear el compromiso.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este compromiso?')) return
    try {
      await compromisosApi.delete(id)
      load()
    } catch {
      alert('No se pudo eliminar (requiere rol admin).')
    }
  }

  const nombreActor = (id) => actores.find((a) => a.id === id)?.nombre || `Actor #${id}`
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#ff3b3b]">HISTORIAL DE COMPROMISOS</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Compromisos</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 rounded-lg border border-[#3a1616] px-4 py-2 text-xs font-bold text-[#a08080] hover:border-[#ff3b3b]/50 hover:text-white">
            <RefreshCw className="h-4 w-4" /> ACTUALIZAR
          </button>
          {isAdmin() && (
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#ff3b3b] to-[#ff8a3d] px-4 py-2 text-xs font-black tracking-wider text-[#1a0505]">
              <Plus className="h-4 w-4" /> NUEVO COMPROMISO
            </button>
          )}
        </div>
      </div>

      {error && (
        <GlassCard className="p-4">
          <p className="flex items-center gap-2 text-sm text-[#ff6b6b]"><AlertTriangle className="h-4 w-4" /> {error}</p>
        </GlassCard>
      )}

      {loading ? (
        <GlassCard className="flex h-40 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-[#ff3b3b]" />
        </GlassCard>
      ) : items.length === 0 ? (
        <GlassCard className="p-14 text-center text-sm text-[#8a6363]">No hay compromisos registrados.</GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((c) => (
            <GlassCard key={c.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <span
                  className="rounded-full px-3 py-1 text-[10px] font-black uppercase"
                  style={{ color: ESTADO_COLOR[c.estado] || '#8a6363', background: `${ESTADO_COLOR[c.estado] || '#8a6363'}1a` }}
                >
                  {c.estado.replace('_', ' ')}
                </span>
                {isAdmin() && (
                  <button onClick={() => handleDelete(c.id)} className="text-[#8a6363] hover:text-[#ff3b3b]" title="Eliminar">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="mt-3 font-bold text-white">{c.titulo}</p>
              {c.descripcion && <p className="mt-1 flex-1 text-xs text-[#a08080]">{c.descripcion}</p>}
              <div className="mt-4 space-y-1 border-t border-[#3a1616]/60 pt-3 font-mono text-[11px] text-[#8a6363]">
                <p>ACTOR: <span className="text-[#ff8a3d]">{nombreActor(c.actor_id)}</span></p>
                {c.fecha_limite && <p>LÍMITE: <span className="text-[#d4b0b0]">{c.fecha_limite}</span></p>}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <GlassCard className="relative z-10 w-full max-w-lg p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Nuevo compromiso</h2>
              <button onClick={() => setShowModal(false)} className="text-[#8a6363] hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <select required value={form.actor_id} onChange={(e) => setForm({ ...form, actor_id: e.target.value })} className="w-full rounded-lg border border-[#3a1616] bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#ff3b3b]">
                <option value="">Selecciona actor *</option>
                {actores.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
              <input required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Título del compromiso *" className="w-full rounded-lg border border-[#3a1616] bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#ff3b3b]" />
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción" rows={3} className="w-full rounded-lg border border-[#3a1616] bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#ff3b3b]" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="rounded-lg border border-[#3a1616] bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#ff3b3b]">
                  {ESTADOS.map((es) => <option key={es} value={es}>{es.replace('_', ' ')}</option>)}
                </select>
                <input type="date" value={form.fecha_compromiso} onChange={(e) => setForm({ ...form, fecha_compromiso: e.target.value })} className="rounded-lg border border-[#3a1616] bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#ff3b3b]" />
                <input type="date" value={form.fecha_limite} onChange={(e) => setForm({ ...form, fecha_limite: e.target.value })} className="rounded-lg border border-[#3a1616] bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#ff3b3b]" />
              </div>
              <button type="submit" disabled={saving} className="w-full rounded-lg bg-gradient-to-r from-[#ff3b3b] to-[#ff8a3d] py-3 font-mono text-sm font-black tracking-widest text-[#1a0505] disabled:opacity-50">
                {saving ? 'GUARDANDO…' : 'CREAR COMPROMISO'}
              </button>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  )
}
