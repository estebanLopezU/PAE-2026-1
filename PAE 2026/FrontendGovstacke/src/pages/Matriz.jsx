import { useEffect, useState } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import GlassCard from '../components/common/GlassCard'
import { matrizApi } from '../services/api'

const PRIORIDAD_COLOR = { alta: '#ff3b3b', media: '#ff8a3d', baja: '#8a6363' }

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
        <RefreshCw className="h-6 w-6 animate-spin text-[#ff3b3b]" />
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[10px] tracking-[0.3em] text-[#ff3b3b]">ANÁLISIS ESTRATÉGICO</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Matriz y mapa de actores</h1>
      </div>

      {error && (
        <GlassCard className="p-4">
          <p className="flex items-center gap-2 text-sm text-[#ff6b6b]">
            <AlertTriangle className="h-4 w-4" /> {error}
          </p>
        </GlassCard>
      )}

      {resumen && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <GlassCard className="p-5">
            <p className="text-xs uppercase tracking-wider text-[#a08080]">Total actores</p>
            <p className="mt-2 text-3xl font-bold text-white">{resumen.total_actores}</p>
          </GlassCard>
          <GlassCard className="p-5">
            <p className="text-xs uppercase tracking-wider text-[#a08080]">Por prioridad</p>
            <div className="mt-2 flex gap-4 font-mono text-sm">
              {Object.entries(resumen.por_prioridad || {}).map(([k, v]) => (
                <span key={k} style={{ color: PRIORIDAD_COLOR[k] || '#8a6363' }}>{k}: {v}</span>
              ))}
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <p className="text-xs uppercase tracking-wider text-[#a08080]">Tipos de actor</p>
            <p className="mt-2 text-3xl font-bold text-[#ff8a3d]">{Object.keys(resumen.por_tipo || {}).length}</p>
          </GlassCard>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <GlassCard className="p-6">
          <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a08080]">
            Mapa dinámico Poder × Legitimidad
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3a1616" />
              <XAxis type="number" dataKey="poder" name="Poder" domain={[0, 100]} stroke="#8a6363" fontSize={11} />
              <YAxis type="number" dataKey="legitimidad" name="Legitimidad" domain={[0, 100]} stroke="#8a6363" fontSize={11} />
              <ZAxis type="number" dataKey="influencia" range={[40, 400]} />
              <Tooltip contentStyle={{ background: '#1a0a0a', border: '1px solid #3a1616', borderRadius: 8, color: '#fdecec' }} />
              <Scatter data={mapa} name="Actor">
                {mapa.map((e, i) => (
                  <Cell key={i} fill={e.riesgo_conflicto >= 70 ? '#ff3b3b' : '#ff8a3d'} fillOpacity={0.75} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="overflow-hidden">
          <div className="border-b border-[#3a1616] p-5">
            <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a08080]">
              Matriz de priorización
            </h2>
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-[#1a0a0a]">
                <tr className="border-b border-[#3a1616]">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#8a6363]">#</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#8a6363]">Actor</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#8a6363]">Prioridad</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#8a6363]">Índice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3a1616]/50">
                {priorizacion.map((a, i) => (
                  <tr key={a.id} className="transition-colors hover:bg-white/5">
                    <td className="px-4 py-3 font-mono text-xs text-[#8a6363]">{i + 1}</td>
                    <td className="px-4 py-3 text-sm font-bold text-white">{a.nombre}</td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-3 py-1 text-[10px] font-black uppercase"
                        style={{
                          color: PRIORIDAD_COLOR[a.nivel_prioridad] || '#8a6363',
                          background: `${PRIORIDAD_COLOR[a.nivel_prioridad] || '#8a6363'}1a`,
                        }}
                      >
                        {a.nivel_prioridad}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-[#ff8a3d]">{a.indice_priorizacion}</td>
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

