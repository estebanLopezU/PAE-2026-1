import { useEffect, useState } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import GlassCard from '../components/common/GlassCard'
import { matrizApi } from '../services/api'

const PRIORIDAD_COLOR = { alta: '#ef4444', media: '#f97316', baja: '#a1a1aa' }

export default function Matriz() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [priorizacion, setPriorizacion] = useState([])
  const [mapa, setMapa] = useState([])
  const [resumen, setResumen] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [p, m, r] = await Promise.all([
        matrizApi.priorizacion(),
        matrizApi.mapa(),
        matrizApi.resumen(),
      ])
      setPriorizacion(p.data?.items || [])
      setMapa(m.data?.items || [])
      setResumen(r.data)
    } catch {
      setError('No se pudo cargar la matriz. Verifica el microservicio GOVStake.')
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
      <div>
        <p className="font-mono text-[10px] tracking-[0.3em] text-[#ef4444]">ANÁLISIS ESTRATÉGICO</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Matriz y mapa de actores</h1>
      </div>

      {error && (
        <GlassCard className="p-4">
          <p className="flex items-center gap-2 text-sm text-[#fca5a5]">
            <AlertTriangle className="h-4 w-4" /> {error}
          </p>
        </GlassCard>
      )}

      {resumen && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <GlassCard className="p-5">
            <p className="text-xs uppercase tracking-wider text-[#a1a1aa]">Total actores</p>
            <p className="mt-2 text-3xl font-bold text-white">{resumen.total_actores}</p>
          </GlassCard>
          <GlassCard className="p-5">
            <p className="text-xs uppercase tracking-wider text-[#a1a1aa]">Por prioridad</p>
            <div className="mt-2 flex gap-4 font-mono text-sm">
              {Object.entries(resumen.por_prioridad || {}).map(([k, v]) => (
                <span key={k} style={{ color: PRIORIDAD_COLOR[k] || '#a1a1aa' }}>{k}: {v}</span>
              ))}
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <p className="text-xs uppercase tracking-wider text-[#a1a1aa]">Tipos de actor</p>
            <p className="mt-2 text-3xl font-bold text-[#f97316]">{Object.keys(resumen.por_tipo || {}).length}</p>
          </GlassCard>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <GlassCard className="p-6">
          <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">
            Mapa dinámico Poder × Legitimidad
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis type="number" dataKey="poder" name="Poder" domain={[0, 100]} stroke="#a1a1aa" fontSize={11} />
              <YAxis type="number" dataKey="legitimidad" name="Legitimidad" domain={[0, 100]} stroke="#a1a1aa" fontSize={11} />
              <ZAxis type="number" dataKey="influencia" range={[40, 400]} />
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, color: '#fdecec' }} />
              <Scatter data={mapa} name="Actor">
                {mapa.map((e, i) => (
                  <Cell key={i} fill={e.riesgo_conflicto >= 70 ? '#ef4444' : '#f97316'} fillOpacity={0.75} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="overflow-hidden">
          <div className="border-b border-[#3f3f46] p-5">
            <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">
              Matriz de priorización
            </h2>
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-[#18181b]">
                <tr className="border-b border-[#3f3f46]">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">#</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Actor</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Prioridad</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Índice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3f3f46]/50">
                {priorizacion.map((a, i) => (
                  <tr key={a.id} className="transition-colors hover:bg-white/5">
                    <td className="px-4 py-3 font-mono text-xs text-[#a1a1aa]">{i + 1}</td>
                    <td className="px-4 py-3 text-sm font-bold text-white">{a.nombre}</td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-3 py-1 text-[10px] font-black uppercase"
                        style={{
                          color: PRIORIDAD_COLOR[a.nivel_prioridad] || '#a1a1aa',
                          background: `${PRIORIDAD_COLOR[a.nivel_prioridad] || '#a1a1aa'}1a`,
                        }}
                      >
                        {a.nivel_prioridad}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-[#f97316]">{a.indice_priorizacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

