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
        <RefreshCw className="h-6 w-6 animate-spin text-[#ff3b3b]" />
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#ff3b3b]">PARTICIPACIÓN INSTITUCIONAL</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Protocolo de participación</h1>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border border-[#3a1616] px-4 py-2 text-xs font-bold text-[#a08080] hover:border-[#ff3b3b]/50 hover:text-white"
        >
          <RefreshCw className="h-4 w-4" /> ACTUALIZAR
        </button>
      </div>

      {error && (
        <GlassCard className="p-4">
          <p className="flex items-center gap-2 text-sm text-[#ff6b6b]">
            <AlertTriangle className="h-4 w-4" /> {error}
          </p>
        </GlassCard>
      )}

      {/* Selector por actor */}
      <GlassCard className="p-5">
        <p className="mb-3 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a08080]">
          <Users className="h-4 w-4 text-[#ff8a3d]" /> Protocolo personalizado por actor
        </p>
        <select
          value={actorSel}
          onChange={(e) => verActor(e.target.value)}
          className="w-full rounded-lg border border-[#3a1616] bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#ff3b3b]"
        >
          <option value="">Selecciona un actor…</option>
          {actores.map((a) => (
            <option key={a.id} value={a.id}>{a.nombre} · {a.tipo.replace('_', ' ')}</option>
          ))}
        </select>

        {actorSel && !detalle && (
          <p className="mt-3 text-xs text-[#8a6363]">Cargando protocolo…</p>
        )}

        {detalle && (
          <div className="mt-4 space-y-3 rounded-xl border border-[#ff3b3b]/30 bg-black/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-white">{detalle.actor?.nombre}</p>
              <span className="rounded-full bg-[#ff8a3d]/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#ff8a3d]">
                Gestión: {detalle.prioridad_gestion} · Prioridad: {detalle.actor?.nivel_prioridad}
              </span>
            </div>
            <p className="text-sm text-[#d4b0b0]">{detalle.objetivo}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div><p className="text-[11px] uppercase tracking-wider text-[#8a6363]">Canales recomendados</p><p className="text-sm text-white">{detalle.canales_recomendados?.join(', ')}</p></div>
              <div><p className="text-[11px] uppercase tracking-wider text-[#8a6363]">Frecuencia</p><p className="text-sm text-white">{detalle.frecuencia_sugerida}</p></div>
              <div><p className="text-[11px] uppercase tracking-wider text-[#8a6363]">Formato</p><p className="text-sm text-white">{detalle.formato_participacion}</p></div>
              <div><p className="text-[11px] uppercase tracking-wider text-[#8a6363]">Requisitos</p><p className="text-sm text-white">{detalle.requisitos_habilitacion}</p></div>
            </div>
            {detalle.ajustes_dinamicos?.length > 0 && (
              <div className="rounded-lg border border-[#ff8a3d]/30 bg-[#ff8a3d]/5 p-3">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[#ff8a3d]">Ajustes dinámicos</p>
                <ul className="list-inside list-disc text-sm text-[#d4b0b0]">
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
              <ScrollText className="h-4 w-4 text-[#ff8a3d]" /> {p.nombre}
            </p>
            <p className="text-xs uppercase tracking-wider text-[#8a6363]">{p.tipo.replace('_', ' ')} · Incidencia: {p.nivel_incidencia}</p>
            <p className="mt-2 text-sm text-[#d4b0b0]">{p.objetivo}</p>
            <div className="mt-3 space-y-1.5 text-xs text-[#a08080]">
              <p><span className="font-bold text-[#ff8a3d]">Canales:</span> {p.canales_recomendados?.join(', ')}</p>
              <p><span className="font-bold text-[#ff8a3d]">Frecuencia:</span> {p.frecuencia_sugerida}</p>
              <p><span className="font-bold text-[#ff8a3d]">Formato:</span> {p.formato_participacion}</p>
              <p><span className="font-bold text-[#ff8a3d]">Indicadores:</span> {p.indicadores_seguimiento?.join(', ')}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}

