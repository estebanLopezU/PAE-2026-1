import { useEffect, useState } from 'react'
import { RefreshCw, AlertTriangle, Users, ScrollText } from 'lucide-react'
import GlassCard from '../components/common/GlassCard'
import { protocoloApi, actorsApi } from '../services/api'

export default function Protocolo() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [actores, setActores] = useState([])
  const [actorSel, setActorSel] = useState('')
  const [detalle, setDetalle] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [p, a] = await Promise.all([protocoloApi.getAll(), actorsApi.getAll()])
      setItems(p.data?.items || [])
      setActores(a.data?.items || [])
    } catch {
      setError('No se pudo cargar el protocolo de participación.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const verActor = async (id) => {
    setActorSel(id)
    setDetalle(null)
    try {
      const res = await protocoloApi.porActor(id)
      setDetalle(res.data)
    } catch {
      setDetalle(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-[#ef4444]" />
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#ef4444]">PARTICIPACIÓN INSTITUCIONAL</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Protocolo de participación</h1>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border border-[#3f3f46] px-4 py-2 text-xs font-bold text-[#a1a1aa] hover:border-[#ef4444]/50 hover:text-white"
        >
          <RefreshCw className="h-4 w-4" /> ACTUALIZAR
        </button>
      </div>

      {error && (
        <GlassCard className="p-4">
          <p className="flex items-center gap-2 text-sm text-[#fca5a5]">
            <AlertTriangle className="h-4 w-4" /> {error}
          </p>
        </GlassCard>
      )}

      {/* Selector por actor */}
      <GlassCard className="p-5">
        <p className="mb-3 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">
          <Users className="h-4 w-4 text-[#f97316]" /> Protocolo personalizado por actor
        </p>
        <select
          value={actorSel}
          onChange={(e) => verActor(e.target.value)}
          className="w-full rounded-lg border border-[#3f3f46] bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#ef4444]"
        >
          <option value="">Selecciona un actor…</option>
          {actores.map((a) => (
            <option key={a.id} value={a.id}>{a.nombre} · {a.tipo.replace('_', ' ')}</option>
          ))}
        </select>

        {actorSel && !detalle && (
          <p className="mt-3 text-xs text-[#a1a1aa]">Cargando protocolo…</p>
        )}

        {detalle && (
          <div className="mt-4 space-y-3 rounded-xl border border-[#ef4444]/30 bg-black/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-white">{detalle.actor?.nombre}</p>
              <span className="rounded-full bg-[#f97316]/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#f97316]">
                Gestión: {detalle.prioridad_gestion} · Prioridad: {detalle.actor?.nivel_prioridad}
              </span>
            </div>
            <p className="text-sm text-[#d4d4d8]">{detalle.objetivo}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div><p className="text-[11px] uppercase tracking-wider text-[#a1a1aa]">Canales recomendados</p><p className="text-sm text-white">{detalle.canales_recomendados?.join(', ')}</p></div>
              <div><p className="text-[11px] uppercase tracking-wider text-[#a1a1aa]">Frecuencia</p><p className="text-sm text-white">{detalle.frecuencia_sugerida}</p></div>
              <div><p className="text-[11px] uppercase tracking-wider text-[#a1a1aa]">Formato</p><p className="text-sm text-white">{detalle.formato_participacion}</p></div>
              <div><p className="text-[11px] uppercase tracking-wider text-[#a1a1aa]">Requisitos</p><p className="text-sm text-white">{detalle.requisitos_habilitacion}</p></div>
            </div>
            {detalle.ajustes_dinamicos?.length > 0 && (
              <div className="rounded-lg border border-[#f97316]/30 bg-[#f97316]/5 p-3">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[#f97316]">Ajustes dinámicos</p>
                <ul className="list-inside list-disc text-sm text-[#d4d4d8]">
                  {detalle.ajustes_dinamicos.map((aj, i) => <li key={i}>{aj}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </GlassCard>
      {/* Catálogo general */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {items.map((p) => (
          <GlassCard key={p.tipo} className="p-5">
            <p className="mb-1 flex items-center gap-2 font-bold text-white">
              <ScrollText className="h-4 w-4 text-[#f97316]" /> {p.nombre}
            </p>
            <p className="text-xs uppercase tracking-wider text-[#a1a1aa]">{p.tipo.replace('_', ' ')} · Incidencia: {p.nivel_incidencia}</p>
            <p className="mt-2 text-sm text-[#d4d4d8]">{p.objetivo}</p>
            <div className="mt-3 space-y-1.5 text-xs text-[#a1a1aa]">
              <p><span className="font-bold text-[#f97316]">Canales:</span> {p.canales_recomendados?.join(', ')}</p>
              <p><span className="font-bold text-[#f97316]">Frecuencia:</span> {p.frecuencia_sugerida}</p>
              <p><span className="font-bold text-[#f97316]">Formato:</span> {p.formato_participacion}</p>
              <p><span className="font-bold text-[#f97316]">Indicadores:</span> {p.indicadores_seguimiento?.join(', ')}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}

