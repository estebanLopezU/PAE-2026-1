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
  red: '#ef4444',
  orange: '#f97316',
  green: '#10b981',
  amber: '#f59e0b',
  blue: '#3b82f6',
  slate: '#94a3b8',
}

function KpiCard({ title, value, helper, color, icon: Icon }) {
  return (
    <GlassCard className="p-5 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#a1a1aa]">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</p>
        </div>
        {Icon && (
          <div className="rounded-lg bg-white/5 p-2">
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        )}
      </div>
      {helper && (
        <p className="mt-4 flex items-center gap-1 text-xs font-medium text-[#a1a1aa]">
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
        <RefreshCw className="h-6 w-6 animate-spin text-[#ef4444]" />
      </div>
    )
  }

  if (error) {
    return (
      <GlassCard className="p-6">
        <p className="flex items-center gap-2 text-sm text-[#fca5a5]">
          <AlertTriangle className="h-5 w-5" /> {error}
        </p>
        <button
          onClick={load}
          className="mt-4 rounded-lg border border-[#ef4444]/40 px-4 py-2 font-mono text-xs tracking-widest text-[#ef4444] hover:bg-[#ef4444]/10"
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
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#ef4444]">DASHBOARD ESTRATÉGICO</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Tablero de gestión de actores</h1>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border border-[#3f3f46] px-4 py-2 text-xs font-bold text-[#a1a1aa] transition-all hover:border-[#ef4444]/50 hover:text-white"
        >
          <RefreshCw className="h-4 w-4" /> ACTUALIZAR
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Actores registrados" value={data?.total_actores ?? 0} color={KPI_COLORS.orange} icon={Users} helper="Grupos de interés activos" />
        <KpiCard title="Índice relacionamiento" value={data?.indice_calidad_relacionamiento ?? 0} color={KPI_COLORS.green} icon={TrendingUp} helper="Calidad general (0–100)" />
        <KpiCard title="Stakeholders definitivos" value={data?.mitchell_resumen?.definitivo ?? 0} color={KPI_COLORS.red} icon={AlertTriangle} helper="Poder + legitimidad + urgencia" />
        <KpiCard title="Evaluaciones pendientes" value={data?.pendientes_evaluacion ?? 0} color={KPI_COLORS.blue} icon={Activity} helper="Entidades por caracterizar" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard title="Compromisos pendientes" value={data?.compromisos_pendientes ?? 0} color={KPI_COLORS.amber} icon={Handshake} helper={`${data?.compromisos_total ?? 0} en total`} />
        <KpiCard title="Alertas sin leer" value={data?.alertas_no_leidas ?? 0} color={KPI_COLORS.red} icon={Bell} helper={`${data?.alertas_criticas ?? 0} críticas`} />
        <KpiCard title="Actores expectantes" value={data?.mitchell_resumen?.expectante ?? 0} color={KPI_COLORS.orange} icon={Users} helper="Dos atributos de Mitchell" />
      </div>

      <GlassCard className="p-6">
        <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">
          Clasificación de grupos de interés · Mitchell
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ['Definitivos', data?.mitchell_resumen?.definitivo ?? 0, KPI_COLORS.red],
            ['Expectantes', data?.mitchell_resumen?.expectante ?? 0, KPI_COLORS.orange],
            ['Latentes', data?.mitchell_resumen?.latente ?? 0, KPI_COLORS.blue],
            ['No relevantes', data?.mitchell_resumen?.no_relevante ?? 0, KPI_COLORS.slate],
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-xl border border-[#3f3f46] bg-white/5 p-4 text-center">
              <p className="text-3xl font-bold text-white" style={{ color }}>{value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-[#a1a1aa]">{label}</p>
            </div>
          ))}
        </div>
      </GlassCard>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <GlassCard className="p-6">
          <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">
            Top 5 · Índice de priorización
          </h2>
          {topPrioridad.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#a1a1aa]">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topPrioridad} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis type="number" domain={[0, 100]} stroke="#a1a1aa" fontSize={11} />
                <YAxis type="category" dataKey="nombre" stroke="#d4d4d8" fontSize={11} width={130} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, color: '#fdecec' }} />
                <Bar dataKey="indice" radius={[0, 6, 6, 0]}>
                  {topPrioridad.map((entry, i) => (
                    <Cell key={i} fill={i === 0 ? '#ef4444' : i < 3 ? '#f97316' : '#a1a1aa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">
            Mapa Poder × Interés (tamaño = influencia)
          </h2>
          {mapa.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#a1a1aa]">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis type="number" dataKey="poder" name="Poder" domain={[0, 100]} stroke="#a1a1aa" fontSize={11} />
                <YAxis type="number" dataKey="interes" name="Interés" domain={[0, 100]} stroke="#a1a1aa" fontSize={11} />
                <ZAxis type="number" dataKey="influencia" range={[40, 400]} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, color: '#fdecec' }} />
                <Scatter data={mapa} name="Actor">
                  {mapa.map((entry, i) => (
                    <Cell key={i} fill={entry.riesgo_conflicto >= 70 ? '#ef4444' : '#f97316'} fillOpacity={0.75} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        <GlassCard className="p-6 xl:col-span-2">
          <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">
            Compromisos por estado
          </h2>
          {porEstado.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#a1a1aa]">Sin compromisos registrados</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={porEstado}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="estado" stroke="#a1a1aa" fontSize={11} />
                <YAxis allowDecimals={false} stroke="#a1a1aa" fontSize={11} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, color: '#fdecec' }} />
                <Bar dataKey="total" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </div>

      {(data?.mayor_riesgo_conflicto || []).length > 0 && (
        <GlassCard className="p-6">
          <h2 className="mb-4 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#ef4444]">
            <AlertTriangle className="h-4 w-4" /> Actores con mayor riesgo de conflicto
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.mayor_riesgo_conflicto.map((a) => (
              <div key={a.id} className="rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/5 px-4 py-3 transition-all hover:border-[#ef4444]/60">
                <p className="text-sm font-bold text-white">{a.nombre}</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-[#a1a1aa]">{a.tipo}</p>
                <p className="mt-2 font-mono text-xs text-[#fca5a5]">Riesgo: {a.variables?.riesgo_conflicto ?? 0}/100</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">
        <span>GOVSTAKE_V1.0.0</span>
        <span>SISTEMA DE GESTIÓN DE GRUPOS DE INTERÉS PÚBLICOS</span>
      </div>
    </div>
  )
}
