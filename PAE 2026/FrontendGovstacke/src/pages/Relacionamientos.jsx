import { useEffect, useState } from 'react'
import { RefreshCw, AlertTriangle, Plus, X, Save } from 'lucide-react'
import GlassCard from '../components/common/GlassCard'
import { relacionamientosApi, actorsApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const CANALES = ['reunion', 'correo', 'telefono', 'evento', 'oficio', 'redes']
const CALIDAD_COLOR = { alta: '#10b981', media: '#ff8a3d', baja: '#ff3b3b' }

export default function Relacionamientos() {
  const { isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [actores, setActores] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const emptyForm = { actor_id: '', canal: 'reunion', calidad: 'media', calificacion: 70, resumen: '', fecha: '' }
  const [form, setForm] = useState(emptyForm)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [r, a] = await Promise.all([relacionamientosApi.getAll(), actorsApi.getAll()])
      setItems(r.data?.items || [])
      setActores(a.data?.items || [])
    } catch {
      setError('No se pudo cargar el tablero de relacionamiento.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await relacionamientosApi.create({
        ...form,
        actor_id: Number(form.actor_id),
        calificacion: Number(form.calificacion),
        fecha: form.fecha || null,
      })
      setShowModal(false)
      setForm(emptyForm)
      load()
    } catch {
      alert('No se pudo registrar el relacionamiento.')
    } finally {
      setSaving(false)
    }
  }
  const nombreActor = (id) => actores.find((a) => a.id === id)?.nombre || `Actor #${id}`

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#ff3b3b]">TABLERO DE RELACIONAMIENTO</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Relacionamientos</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 rounded-lg border border-[#3a1616] px-4 py-2 text-xs font-bold text-[#a08080] hover:border-[#ff3b3b]/50 hover:text-white">
            <RefreshCw className="h-4 w-4" /> ACTUALIZAR
          </button>
          {isAdmin() && (
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#ff3b3b] to-[#ff8a3d] px-4 py-2 text-xs font-black tracking-wider text-[#1a0505]">
              <Plus className="h-4 w-4" /> NUEVO REGISTRO
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
        <GlassCard className="p-14 text-center text-sm text-[#8a6363]">No hay registros de relacionamiento.</GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((r) => {
            const calidad = r.calidad || (r.calificacion >= 75 ? 'alta' : r.calificacion >= 50 ? 'media' : 'baja')
            return (
              <GlassCard key={r.id} className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-[10px] font-black uppercase"
                    style={{ color: CALIDAD_COLOR[calidad] || '#8a6363', background: `${CALIDAD_COLOR[calidad] || '#8a6363'}1a` }}
                  >
                    {calidad} · {r.calificacion}/100
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#8a6363]">{r.canal}</span>
                </div>
                <p className="mt-3 font-bold text-white">{nombreActor(r.actor_id)}</p>
                {r.resumen && <p className="mt-1 text-xs text-[#a08080]">{r.resumen}</p>}
                {r.fecha && <p className="mt-3 border-t border-[#3a1616]/60 pt-3 font-mono text-[11px] text-[#8a6363]">FECHA: {r.fecha}</p>}
              </GlassCard>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <GlassCard className="relative z-10 w-full max-w-lg p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Nuevo relacionamiento</h2>
              <button onClick={() => setShowModal(false)} className="text-[#8a6363] hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <select required value={form.actor_id} onChange={(e) => setForm({ ...form, actor_id: e.target.value })} className="w-full rounded-lg border border-[#3a1616] bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#ff3b3b]">
                <option value="">Selecciona actor *</option>
                {actores.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <select value={form.canal} onChange={(e) => setForm({ ...form, canal: e.target.value })} className="rounded-lg border border-[#3a1616] bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#ff3b3b]">
                  {CANALES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={form.calidad} onChange={(e) => setForm({ ...form, calidad: e.target.value })} className="rounded-lg border border-[#3a1616] bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#ff3b3b]">
                  <option value="alta">alta</option>
                  <option value="media">media</option>
                  <option value="baja">baja</option>
                </select>
              </div>
              <label className="block text-xs text-[#d4b0b0]">
                Calificación: <span className="font-mono text-[#ff8a3d]">{form.calificacion}</span>
                <input type="range" min="0" max="100" value={form.calificacion} onChange={(e) => setForm({ ...form, calificacion: e.target.value })} className="mt-1 w-full accent-[#ff3b3b]" />
              </label>
              <textarea value={form.resumen} onChange={(e) => setForm({ ...form, resumen: e.target.value })} placeholder="Resumen de la interacción" rows={3} className="w-full rounded-lg border border-[#3a1616] bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#ff3b3b]" />
              <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="w-full rounded-lg border border-[#3a1616] bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#ff3b3b]" />
              <button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#ff3b3b] to-[#ff8a3d] py-3 font-mono text-sm font-black tracking-widest text-[#1a0505] disabled:opacity-50">
                <Save className="h-4 w-4" /> {saving ? 'GUARDANDO…' : 'REGISTRAR'}
              </button>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  )
}

