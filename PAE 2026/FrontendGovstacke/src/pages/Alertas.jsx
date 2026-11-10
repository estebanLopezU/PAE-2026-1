import { useEffect, useState } from 'react'
import { RefreshCw, AlertTriangle, Check, BellRing } from 'lucide-react'
import GlassCard from '../components/common/GlassCard'
import { alertasApi } from '../services/api'

const SEVERIDAD_COLOR = { critica: '#ef4444', alta: '#f97316', media: '#f59e0b', baja: '#a1a1aa' }

export default function Alertas() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await alertasApi.getAll()
      setItems(res.data?.items || [])
    } catch {
      setError('No se pudieron cargar las alertas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const marcarLeida = async (id) => {
    try {
      await alertasApi.marcarLeida(id)
      load()
    } catch {
      alert('No se pudo marcar la alerta como leída.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#ef4444]">SISTEMA DE ALERTAS RELACIONALES</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Alertas</h1>
        </div>
        <button onClick={load} className="flex items-center gap-2 rounded-lg border border-[#3f3f46] px-4 py-2 text-xs font-bold text-[#a1a1aa] hover:border-[#ef4444]/50 hover:text-white">
          <RefreshCw className="h-4 w-4" /> ACTUALIZAR
        </button>
      </div>

      {error && (
        <GlassCard className="p-4">
          <p className="flex items-center gap-2 text-sm text-[#fca5a5]"><AlertTriangle className="h-4 w-4" /> {error}</p>
        </GlassCard>
      )}

      {loading ? (
        <GlassCard className="flex h-40 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-[#ef4444]" />
        </GlassCard>
      ) : items.length === 0 ? (
        <GlassCard className="p-14 text-center text-sm text-[#a1a1aa]">No hay alertas. Todo en orden ✅</GlassCard>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <GlassCard
              key={a.id}
              className={`flex items-start gap-4 p-5 transition-all ${a.leida ? 'opacity-50' : ''}`}
              style={{ borderLeft: `4px solid ${SEVERIDAD_COLOR[a.severidad] || '#a1a1aa'}` }}
            >
              <BellRing className="mt-0.5 h-5 w-5 shrink-0" style={{ color: SEVERIDAD_COLOR[a.severidad] || '#a1a1aa' }} />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase"
                    style={{ color: SEVERIDAD_COLOR[a.severidad] || '#a1a1aa', background: `${SEVERIDAD_COLOR[a.severidad] || '#a1a1aa'}1a` }}
                  >
                    {a.severidad}
                  </span>
                  <p className="font-bold text-white">{a.titulo}</p>
                </div>
                {a.descripcion && <p className="mt-1 text-xs text-[#a1a1aa]">{a.descripcion}</p>}
              </div>
              {!a.leida && (
                <button
                  onClick={() => marcarLeida(a.id)}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#10b981]/40 px-3 py-1.5 text-[11px] font-bold text-[#10b981] hover:bg-[#10b981]/10"
                >
                  <Check className="h-3.5 w-3.5" /> LEÍDA
                </button>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}