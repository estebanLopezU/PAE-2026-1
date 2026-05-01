import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Download,
  Globe2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Activity,
  Zap,
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from 'recharts'
import RelationshipGraph from '../components/RelationshipGraph'
import GlassCard from '../components/common/GlassCard'
import StatusPulse from '../components/common/StatusPulse'

const API_BASE = '/api/v1'
const PENDING_PER_PAGE = 8

const STATUS_CONFIG = {
  connected: {
    label: 'Conectadas',
    color: '#10B981',
  },
  pending: {
    label: 'Pendientes',
    color: '#F59E0B',
  },
  not_connected: {
    label: 'No conectadas',
    color: '#EF4444',
  },
}

async function fetchAPI(url, signal) {
  const token = localStorage.getItem('xroad_access_token')
  let response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal,
  })

  if (response.status === 401) {
    const refreshToken = localStorage.getItem('xroad_refresh_token')
    if (refreshToken) {
      const refreshResponse = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
        signal,
      })

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        const newAccessToken = refreshData?.access_token
        if (newAccessToken) {
          localStorage.setItem('xroad_access_token', newAccessToken)
          response = await fetch(url, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${newAccessToken}`,
            },
            signal,
          })
        }
      }
    }
  }

  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status}`)
  }

  return response.json()
}

function KpiCard({ title, value, helper, color, icon: Icon }) {
  return (
    <GlassCard className="p-5 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>
        </div>
        {Icon && <div className="p-2 rounded-lg bg-slate-800/50"><Icon className="w-5 h-5" style={{ color }} /></div>}
      </div>
      {helper && <p className="mt-4 text-xs text-slate-500 font-medium flex items-center gap-1">
        <Activity className="w-3 h-3" /> {helper}
      </p>}
    </GlassCard>
  )
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSector, setSelectedSector] = useState('')
  const [pendingPage, setPendingPage] = useState(1)

  const [kpis, setKpis] = useState(null)
  const [sectorData, setSectorData] = useState([])
  const [xroadStatus, setXroadStatus] = useState([])
  const [sectors, setSectors] = useState([])
  const [pendingEntities, setPendingEntities] = useState([])

  const totalPendingPages = Math.ceil(pendingEntities.length / PENDING_PER_PAGE)

  const paginatedPending = useMemo(() => {
    const start = (pendingPage - 1) * PENDING_PER_PAGE
    return pendingEntities.slice(start, start + PENDING_PER_PAGE)
  }, [pendingPage, pendingEntities])

  const normalizedStatusData = useMemo(() => {
    return xroadStatus.map((item) => ({
      ...item,
      color: STATUS_CONFIG[item.status]?.color ?? '#94A3B8',
      label: STATUS_CONFIG[item.status]?.label ?? item.status,
    }))
  }, [xroadStatus])

  const kpiCards = useMemo(
    () => [
      {
        title: 'Total de entidades',
        value: kpis?.total_entities ?? 0,
        helper: 'Entidades activas en plataforma',
        color: '#60A5FA',
        icon: Globe2
      },
      {
        title: 'Conectadas X-Road',
        value: kpis?.xroad_connected ?? 0,
        helper: 'Interoperando actualmente',
        color: '#34D399',
        icon: Zap
      },
      {
        title: 'Pendientes',
        value: kpis?.xroad_pending ?? 0,
        helper: 'En plan de onboarding',
        color: '#FBBF24',
        icon: Clock3
      },
      {
        title: 'Tasa de conexión',
        value: `${kpis?.xroad_connection_rate ?? 0}%`,
        helper: 'Cobertura nacional actual',
        color: '#A78BFA',
        icon: Activity
      },
      {
        title: 'Servicios activos',
        value: kpis?.total_services ?? 0,
        helper: 'Servicios disponibles',
        color: '#22D3EE',
        icon: ShieldCheck
      },
      {
        title: 'Madurez promedio',
        value: `${kpis?.average_maturity_score ?? 0}%`,
        helper: 'Nivel de capacidad estatal',
        color: '#FB923C',
        icon: Sparkles
      },
    ],
    [kpis]
  )

  const maturityDistribution = useMemo(
    () => [
      { label: 'Nivel 1', value: kpis?.maturity_distribution?.[1] ?? 0, color: '#EF4444' },
      { label: 'Nivel 2', value: kpis?.maturity_distribution?.[2] ?? 0, color: '#F59E0B' },
      { label: 'Nivel 3', value: kpis?.maturity_distribution?.[3] ?? 0, color: '#3B82F6' },
      { label: 'Nivel 4', value: kpis?.maturity_distribution?.[4] ?? 0, color: '#10B981' },
    ],
    [kpis]
  )

  const loadDashboard = async (signal) => {
    setLoading(true)
    setError('')
    try {
      const sectorQuery = selectedSector ? `?sector=${encodeURIComponent(selectedSector)}` : ''

      const [kpiData, sectorsByType, xroadByStatus, sectorsList, pendingData] = await Promise.all([
        fetchAPI(`${API_BASE}/dashboard/kpis${sectorQuery}`, signal),
        fetchAPI(`${API_BASE}/dashboard/by-sector`, signal),
        fetchAPI(`${API_BASE}/dashboard/by-xroad-status${sectorQuery}`, signal),
        fetchAPI(`${API_BASE}/sectors/`, signal),
        fetchAPI(`${API_BASE}/entities/?xroad_status=pending&limit=200`, signal),
      ])

      setKpis(kpiData)
      setSectorData(sectorsByType)
      setXroadStatus(xroadByStatus)
      setSectors(sectorsList.items || sectorsList || [])
      setPendingPage(1)

      const mappedPending = (pendingData.items || []).map((entity) => {
        const level = entity.maturity_level || 1
        const status = level >= 3 ? 'En Proceso' : 'Pendiente'
        const etaMap = { 4: 'T2 2026', 3: 'T3 2026', 2: 'T4 2026', 1: '2027' }
        const reasonMap = {
          4: 'En etapa final de certificación técnica',
          3: 'Ajustes de infraestructura y políticas',
          2: 'Despliegue de sistemas interoperables en curso',
          1: 'Formulación y aprobación de proyecto',
        }
        return {
          name: entity.name,
          dept: entity.department || 'Nacional',
          status,
          eta: etaMap[level] || '2027',
          reason: entity.notes || reasonMap[level] || 'Integración X-Road en planificación',
        }
      })
      setPendingEntities(mappedPending)
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'No fue posible cargar el dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    loadDashboard(controller.signal)

    return () => controller.abort()
  }, [selectedSector])

  const exportToPDF = () => {
    const doc = new jsPDF('landscape', 'mm', 'a4')
    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, 297, 28, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.text('Reporte Ejecutivo - Dashboard X-Road Colombia', 14, 12)
    doc.setFontSize(10)
    doc.text(`Fecha de generación: ${new Date().toLocaleString('es-CO')}`, 14, 20)
    doc.text(`Filtro sector: ${selectedSector || 'Todos los sectores'}`, 205, 20)

    autoTable(doc, {
      startY: 35,
      head: [['Indicador', 'Valor']],
      body: kpiCards.map((kpi) => [kpi.title, String(kpi.value)]),
      theme: 'striped',
    })

    doc.save(`dashboard_xroad_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center rounded-3xl bg-slate-900/50 border border-slate-800">
        <div className="text-center">
          <StatusPulse size="lg" className="mx-auto mb-6" />
          <p className="text-slate-400 font-medium animate-pulse">Iniciando centro de mando estratégico...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-slate-100 pb-10">
      {/* Header Section */}
      <GlassCard className="p-8 border-t-blue-500/30">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <StatusPulse status="success" />
              <h1 className="text-4xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                INTEROP CORE
              </h1>
            </div>
            <p className="text-slate-400 font-medium">Plataforma de Inteligencia de Interoperabilidad • Colombia</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedSector}
              onChange={(event) => setSelectedSector(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            >
              <option value="">Todos los sectores</option>
              {sectors.map((sector) => (
                <option key={sector.id || sector.name} value={sector.name}>{sector.name}</option>
              ))}
            </select>

            <button
              onClick={() => loadDashboard()}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-5 py-2 text-sm font-semibold hover:bg-slate-700 transition-all"
            >
              <RefreshCw className="h-4 w-4" /> REFRESH
            </button>

            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all"
            >
              <Download className="h-4 w-4" /> EXPORT
            </button>
          </div>
        </div>
      </GlassCard>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((item) => (
          <KpiCard key={item.title} {...item} />
        ))}
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <GlassCard className="p-6 xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-wide text-blue-100">FLUJO POR SECTOR ECONÓMICO</h3>
            <span className="text-xs uppercase font-bold tracking-widest text-slate-500">Real-time stats</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={sectorData} layout="vertical" margin={{ left: 30, right: 20 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis type="category" width={120} dataKey="sector" axisLine={false} tickLine={false} tick={{ fill: '#e2e8f0', fontSize: 11 }} />
              <Tooltip
                cursor={{ fill: '#1e293b', opacity: 0.4 }}
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="mb-6 text-lg font-bold tracking-wide text-blue-100">ECUALIZACIÓN DE ESTADOS</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={normalizedStatusData} dataKey="count" nameKey="label" innerRadius={65} outerRadius={90} paddingAngle={5}>
                {normalizedStatusData.map((entry) => (
                  <Cell key={entry.status} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: '#0f172a' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-6 space-y-3">
            {normalizedStatusData.map((item) => (
              <div key={item.status} className="flex items-center justify-between rounded-xl bg-slate-900/50 p-3 border border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }} />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-tighter">{item.label}</span>
                </div>
                <span className="text-sm font-mono font-bold text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Network Graph Section */}
      <GlassCard className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-blue-100">RED DE INTERCONEXIÓN X-ROAD</h3>
            <p className="text-xs text-slate-400">Visualización de dependencias y flujos críticos de información</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
            <StatusPulse status="success" size="sm" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Global Node Active</span>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden border border-slate-700/50 bg-black/20">
           <RelationshipGraph />
        </div>
      </GlassCard>

      {/* Pending Entities Table */}
      <GlassCard className="p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock3 className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-100">Ruta de Integración (Onboarding)</h3>
              <p className="text-xs text-slate-400">Entidades con proyectos de conexión activos</p>
            </div>
          </div>
          <div className="px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
            {kpis?.xroad_pending ?? 0} NODOS PENDIENTES
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="pb-4 text-left text-xs font-bold uppercase tracking-widest text-slate-500">Entidad</th>
                <th className="pb-4 text-left text-xs font-bold uppercase tracking-widest text-slate-500">Dept</th>
                <th className="pb-4 text-left text-xs font-bold uppercase tracking-widest text-slate-500">Estado</th>
                <th className="pb-4 text-left text-xs font-bold uppercase tracking-widest text-slate-500">ETA</th>
                <th className="pb-4 text-left text-xs font-bold uppercase tracking-widest text-slate-500">Justificación Técnica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedPending.map((row, idx) => (
                <tr key={idx} className="group hover:bg-white/5 transition-colors">
                  <td className="py-4 font-bold text-slate-200">{row.name}</td>
                  <td className="py-4 text-slate-400 text-sm">{row.dept}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      row.status === 'En Proceso' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-slate-700/20 text-slate-400 border border-slate-700/30'
                    }`}>
                      <div className={`w-1 h-1 rounded-full ${row.status === 'En Proceso' ? 'bg-amber-500 shadow-[0_0_5px_#f59e0b]' : 'bg-slate-500'}`} />
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 font-mono text-xs text-blue-400">{row.eta}</td>
                  <td className="py-4 text-slate-400 text-xs max-w-xs truncate">{row.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Page {pendingPage} OF {totalPendingPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPendingPage((prev) => Math.max(1, prev - 1))}
              disabled={pendingPage === 1}
              className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-30 transition-all"
            >
              PREV
            </button>
            <button
              onClick={() => setPendingPage((prev) => Math.min(totalPendingPages, prev + 1))}
              disabled={pendingPage === totalPendingPages}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-500 transition-all"
            >
              NEXT
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="flex items-center justify-between px-2 text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">
        <div className="flex gap-6">
          <span className="flex items-center gap-2 underline underline-offset-4 decoration-blue-500/50">PLATFORM_V1.0.0</span>
          <span className="flex items-center gap-2">SYS_STABLE: 99.9%</span>
        </div>
        <span>SECURED BY X-ROAD PROTOCOL</span>
      </div>
    </div>
  )
}