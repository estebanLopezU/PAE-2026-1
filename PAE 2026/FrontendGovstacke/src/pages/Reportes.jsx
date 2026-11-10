import { useEffect, useState } from 'react'
import { RefreshCw, AlertTriangle, Lightbulb, FileText } from 'lucide-react'
import GlassCard from '../components/common/GlassCard'
import { reportesApi } from '../services/api'

const SEV_COLOR = { alta: '#ef4444', media: '#f97316', baja: '#a1a1aa' }

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
        <RefreshCw className="h-6 w-6 animate-spin text-[#ef4444]" />
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#ef4444]">INTELIGENCIA ESTRATÉGICA</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Reportes para la toma de decisiones</h1>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border border-[#3f3f46] px-4 py-2 text-xs font-bold text-[#a1a1aa] hover:border-[#ef4444]/50 hover:text-white"
        >
          <RefreshCw className="h-4 w-4" /> GENERAR
        </button>
      </div>

      {error && (
        <GlassCard className="p-4">
          <p className="flex items-center gap-2 text-sm text-[#fca5a5]">
            <AlertTriangle className="h-4 w-4" /> {error}
          </p>
        </GlassCard>
      )}

      {data?.resumen && (
        <GlassCard className="p-6">
          <p className="mb-4 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">
            <FileText className="h-4 w-4 text-[#f97316]" /> Resumen ejecutivo
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ['Actores', data.resumen.total_actores],
              ['Definitivos', data.resumen.actores_definitivos],
              ['Peligrosos', data.resumen.actores_peligrosos],
              ['Pendientes eval.', data.resumen.pendientes_evaluacion],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-[#3f3f46] bg-black/30 p-4 text-center">
                <p className="text-2xl font-bold text-[#f97316]">{v}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-[#a1a1aa]">{k}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(data.resumen.por_prioridad || {}).map(([k, v]) => (
              <span key={k} className="rounded-full px-3 py-1 text-[10px] font-black uppercase"
                style={{ color: SEV_COLOR[k] || '#a1a1aa', background: `${SEV_COLOR[k] || '#a1a1aa'}1a` }}>
                {k}: {v}
              </span>
            ))}
            {Object.entries(data.resumen.por_mitchell || {}).map(([k, v]) => (
              <span key={`mitchell-${k}`} className="rounded-full border border-[#f97316]/40 px-3 py-1 text-[10px] font-black uppercase text-[#f97316]">
                mitchell · {k.replace(/_/g, ' ')}: {v}
              </span>
            ))}
          </div>
        </GlassCard>
      )}

      {data?.recomendaciones?.length > 0 && (
        <GlassCard className="p-6">
          <p className="mb-4 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">
            <Lightbulb className="h-4 w-4 text-[#f97316]" /> Recomendaciones accionables
          </p>
          <div className="space-y-3">
            {data.recomendaciones.map((r, i) => (
              <div key={i} className="rounded-xl border p-4"
                style={{ borderColor: `${SEV_COLOR[r.severidad]}55`, background: `${SEV_COLOR[r.severidad]}0d` }}>
                <p className="font-bold" style={{ color: SEV_COLOR[r.severidad] }}>
                  [{r.severidad.toUpperCase()}] {r.titulo}
                </p>
                <p className="mt-1 text-sm text-[#d4d4d8]">{r.detalle}</p>
                {r.actores?.length > 0 && (
                  <p className="mt-2 font-mono text-[11px] text-[#a1a1aa]">Actores: {r.actores.join(' · ')}</p>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}
      {porActores.length > 0 && (
        <GlassCard className="overflow-hidden">
          <div className="border-b border-[#3f3f46] p-5">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">
              Reporte detallado por actor
            </p>
          </div>
          <div className="max-h-[480px] overflow-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-[#18181b]">
                <tr className="border-b border-[#3f3f46]">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Actor</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Tipo</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Mitchell</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Prioridad</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Relacionamiento</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Riesgo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3f3f46]/50">
                {porActores.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-white/5">
                    <td className="px-4 py-3 text-sm font-bold text-white">{a.nombre}</td>
                    <td className="px-4 py-3 font-mono text-xs uppercase text-[#d4d4d8]">{a.tipo.replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-[#f97316]/40 px-3 py-1 text-[10px] font-black uppercase text-[#f97316]">
                        {a.tipo_mitchell?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase"
                        style={{ color: SEV_COLOR[a.nivel_prioridad] || '#a1a1aa', background: `${SEV_COLOR[a.nivel_prioridad] || '#a1a1aa'}1a` }}>
                        {a.nivel_prioridad}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-[#f97316]">{a.indice_relacionamiento ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-sm" style={{ color: (a.riesgo_conflicto ?? 0) >= 70 ? '#ef4444' : '#a1a1aa' }}>
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

