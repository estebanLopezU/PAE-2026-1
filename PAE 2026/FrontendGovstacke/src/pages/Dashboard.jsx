import { useEffect, useState } from 'react'
import {
  Users,
  Bell,
  Handshake,
  Activity,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts'
import GlassCard from '../components/common/GlassCard'
import { dashboardApi, matrizApi } from '../services/api'

const KPI_COLORS = {
  red: '#ff3b3b',
  orange: '#ff8a3d',
  green: '#10b981',
  amber: '#f59e0b',
}

function KpiCard({ title, value, helper, color, icon: Icon }) {
  return (
    <GlassCard className="p-5 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#a08080]">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</p>
        </div>
        {Icon && (
          <div className="rounded-lg bg-white/5 p-2">
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        )}
      </div>
      {helper && (
        <p className="mt-4 flex items-center gap-1 text-xs font-medium text-[#8a6363]">
          <Activity className="h-3 w-3" /> {helper}
        </p>
      )}
    </GlassCard>
  )
}
export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [mapa, setMapa] = useState([])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [dashRes, mapaRes] = await Promise.all([dashboardApi.get(), matrizApi.mapa()])
      setData(dashRes.data)
      setMapa(mapaRes.data?.items || [])
    } catch {
      setError('No se pudo cargar el dashboard. Verifica que el microservicio GOVStake esté activo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-[#ff3b3b]" />
      </div>
    )
  }

  if (error) {
    return (
      <GlassCard className="p-6">
        <p className="flex items-center gap-2 text-sm text-[#ff6b6b]">
          <AlertTriangle className="h-5 w-5" /> {error}
        </p>
        <button
          onClick={load}
          className="mt-4 rounded-lg border border-[#ff3b3b]/40 px-4 py-2 font-mono text-xs tracking-widest text-[#ff3b3b] hover:bg-[#ff3b3b]/10"
        >
          REINTENTAR
        </button>
      </GlassCard>
    )
  }

  const topPrioridad = (data?.top_prioridad || []).map((a) => ({
    nombre: a.nombre.length > 18 ? a.nombre.slice(0, 18) + '…' : a.nombre,
    indice: a.indice_priorizacion,
  }))

  const porEstado = Object.entries(data?.compromisos_por_estado || {}).map(([estado, total]) => ({
    estado,
    total,
  }))
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#ff3b3b]">DASHBOARD ESTRATÉGICO</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Tablero de gestión de actores</h1>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border border-[#3a1616] px-4 py-2 text-xs font-bold text-[#a08080] transition-all hover:border-[#ff3b3b]/50 hover:text-white"
        >
          <RefreshCw className="h-4 w-4" /> ACTUALIZAR
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Actores registrados" value={data?.total_actores ?? 0} color={KPI_COLORS.orange} icon={Users} helper="Grupos de interés activos" />
        <KpiCard title="Índice relacionamiento" value={data?.indice_calidad_relacionamiento ?? 0} color={KPI_COLORS.green} icon={TrendingUp} helper="Calidad general (0–100)" />
        <KpiCard title="Compromisos pendientes" value={data?.compromisos_pendientes ?? 0} color={KPI_COLORS.amber} icon={Handshake} helper={`${data?.compromisos_total ?? 0} en total`} />
        <KpiCard title="Alertas sin leer" value={data?.alertas_no_leidas ?? 0} color={KPI_COLORS.red} icon={Bell} helper={`${data?.alertas_criticas ?? 0} críticas`} />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <GlassCard className="p-6">
          <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a08080]">
            Top 5 · Índice de priorización
          </h2>
          {topPrioridad.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#8a6363]">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topPrioridad} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a1616" />
                <XAxis type="number" domain={[0, 100]} stroke="#8a6363" fontSize={11} />
                <YAxis type="category" dataKey="nombre" stroke="#d4b0b0" fontSize={11} width={130} />
                <Tooltip contentStyle={{ background: '#1a0a0a', border: '1px solid #3a1616', borderRadius: 8, color: '#fdecec' }} />
                <Bar dataKey="indice" radius={[0, 6, 6, 0]}>
                  {topPrioridad.map((entry, i) => (
                    <Cell key={i} fill={i === 0 ? '#ff3b3b' : i < 3 ? '#ff8a3d' : '#8a6363'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a08080]">
            Mapa Poder × Interés (tamaño = influencia)
          </h2>
          {mapa.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#8a6363]">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a1616" />
                <XAxis type="number" dataKey="poder" name="Poder" domain={[0, 100]} stroke="#8a6363" fontSize={11} />
                <YAxis type="number" dataKey="interes" name="Interés" domain={[0, 100]} stroke="#8a6363" fontSize={11} />
                <ZAxis type="number" dataKey="influencia" range={[40, 400]} />
                <Tooltip contentStyle={{ background: '#1a0a0a', border: '1px solid #3a1616', borderRadius: 8, color: '#fdecec' }} />
                <Scatter data={mapa} name="Actor">
                  {mapa.map((entry, i) => (
                    <Cell key={i} fill={entry.riesgo_conflicto >= 70 ? '#ff3b3b' : '#ff8a3d'} fillOpacity={0.75} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        <GlassCard className="p-6 xl:col-span-2">
          <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a08080]">
            Compromisos por estado
          </h2>
          {porEstado.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#8a6363]">Sin compromisos registrados</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={porEstado}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a1616" />
                <XAxis dataKey="estado" stroke="#8a6363" fontSize={11} />
                <YAxis allowDecimals={false} stroke="#8a6363" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1a0a0a', border: '1px solid #3a1616', borderRadius: 8, color: '#fdecec' }} />
                <Bar dataKey="total" fill="#ff3b3b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </div>

      {(data?.mayor_riesgo_conflicto || []).length > 0 && (
        <GlassCard className="p-6">
          <h2 className="mb-4 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#ff3b3b]">
            <AlertTriangle className="h-4 w-4" /> Actores con mayor riesgo de conflicto
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.mayor_riesgo_conflicto.map((a) => (
              <div key={a.id} className="rounded-xl border border-[#ff3b3b]/30 bg-[#ff3b3b]/5 px-4 py-3 transition-all hover:border-[#ff3b3b]/60">
                <p className="text-sm font-bold text-white">{a.nombre}</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-[#8a6363]">{a.tipo}</p>
                <p className="mt-2 font-mono text-xs text-[#ff6b6b]">Riesgo: {a.variables?.riesgo_conflicto ?? 0}/100</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a6363]">
        <span>GOVSTAKE_V1.0.0</span>
        <span>SISTEMA DE GESTIÓN DE GRUPOS DE INTERÉS PÚBLICOS</span>
      </div>
    </div>
  )
}

