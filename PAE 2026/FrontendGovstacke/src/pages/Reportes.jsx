import { useEffect, useState } from 'react'
import { RefreshCw, AlertTriangle, Lightbulb, FileText } from 'lucide-react'
import GlassCard from '../components/common/GlassCard'
import { reportesApi } from '../services/api'

const SEV_COLOR = { alta: '#ff3b3b', media: '#ff8a3d', baja: '#8a6363' }

export default function Reportes() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [porActores, setPorActores] = useState([])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [e, a] = await Promise.all([reportesApi.ejecutivo(), reportesApi.porActores()])
      setData(e.data)
      setPorActores(a.data?.items || [])
    } catch {
      setError('No se pudo generar el reporte.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

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
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#ff3b3b]">INTELIGENCIA ESTRATÉGICA</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Reportes para la toma de decisiones</h1>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border border-[#3a1616] px-4 py-2 text-xs font-bold text-[#a08080] hover:border-[#ff3b3b]/50 hover:text-white"
        >
          <RefreshCw className="h-4 w-4" /> GENERAR
        </button>
      </div>

      {error && (
        <GlassCard className="p-4">
          <p className="flex items-center gap-2 text-sm text-[#ff6b6b]">
            <AlertTriangle className="h-4 w-4" /> {error}
          </p>
        </GlassCard>
      )}

      {data?.resumen && (
        <GlassCard className="p-6">
          <p className="mb-4 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a08080]">
            <FileText className="h-4 w-4 text-[#ff8a3d]" /> Resumen ejecutivo
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ['Actores', data.resumen.total_actores],
              ['Índice relacionamiento', data.resumen.indice_relacionamiento_promedio],
              ['Índice priorización', data.resumen.indice_priorizacion_promedio],
              ['Riesgo alto', data.resumen.actores_riesgo_alto],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-[#3a1616] bg-black/30 p-4 text-center">
                <p className="text-2xl font-bold text-[#ff8a3d]">{v}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-[#8a6363]">{k}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(data.resumen.por_prioridad || {}).map(([k, v]) => (
              <span key={k} className="rounded-full px-3 py-1 text-[10px] font-black uppercase"
                style={{ color: SEV_COLOR[k] || '#8a6363', background: `${SEV_COLOR[k] || '#8a6363'}1a` }}>
                {k}: {v}
              </span>
            ))}
          </div>
        </GlassCard>
      )}

      {data?.recomendaciones?.length > 0 && (
        <GlassCard className="p-6">
          <p className="mb-4 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a08080]">
            <Lightbulb className="h-4 w-4 text-[#ff8a3d]" /> Recomendaciones accionables
          </p>
          <div className="space-y-3">
            {data.recomendaciones.map((r, i) => (
              <div key={i} className="rounded-xl border p-4"
                style={{ borderColor: `${SEV_COLOR[r.severidad]}55`, background: `${SEV_COLOR[r.severidad]}0d` }}>
                <p className="font-bold" style={{ color: SEV_COLOR[r.severidad] }}>
                  [{r.severidad.toUpperCase()}] {r.titulo}
                </p>
                <p className="mt-1 text-sm text-[#d4b0b0]">{r.detalle}</p>
                {r.actores?.length > 0 && (
                  <p className="mt-2 font-mono text-[11px] text-[#8a6363]">Actores: {r.actores.join(' · ')}</p>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}
      {porActores.length > 0 && (
        <GlassCard className="overflow-hidden">
          <div className="border-b border-[#3a1616] p-5">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a08080]">
              Reporte detallado por actor
            </p>
          </div>
          <div className="max-h-[480px] overflow-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-[#1a0a0a]">
                <tr className="border-b border-[#3a1616]">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#8a6363]">Actor</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#8a6363]">Tipo</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#8a6363]">Prioridad</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#8a6363]">Relacionamiento</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#8a6363]">Riesgo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3a1616]/50">
                {porActores.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-white/5">
                    <td className="px-4 py-3 text-sm font-bold text-white">{a.nombre}</td>
                    <td className="px-4 py-3 font-mono text-xs uppercase text-[#d4b0b0]">{a.tipo.replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase"
                        style={{ color: SEV_COLOR[a.nivel_prioridad] || '#8a6363', background: `${SEV_COLOR[a.nivel_prioridad] || '#8a6363'}1a` }}>
                        {a.nivel_prioridad}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-[#ff8a3d]">{a.indice_relacionamiento ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-sm" style={{ color: (a.riesgo_conflicto ?? 0) >= 70 ? '#ff3b3b' : '#8a6363' }}>
                      {a.riesgo_conflicto ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  )
}

