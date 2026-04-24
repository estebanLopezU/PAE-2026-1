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
} from 'recharts'
import RelationshipGraph from '../components/RelationshipGraph'

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

const PENDING_ENTITIES = [
  { name: 'Alcaldía de Cúcuta', dept: 'N. Santander', status: 'En Proceso', eta: 'T4 2026', reason: 'Certificación de seguridad en curso' },
  { name: 'Gobernación del Cauca', dept: 'Cauca', status: 'En Proceso', eta: 'T3 2026', reason: 'Ajustes de infraestructura digital regional' },
  { name: 'Universidad del Cauca', dept: 'Cauca', status: 'Pendiente', eta: '2027', reason: 'Presupuesto pendiente de aprobación' },
  { name: 'IDEAM', dept: 'Nacional', status: 'En Proceso', eta: 'T2 2026', reason: 'Adaptación de sistemas legacy' },
  { name: 'RTVC', dept: 'Nacional', status: 'En Proceso', eta: 'T4 2026', reason: 'Migración de plataformas de contenido' },
  { name: 'Gobernación de Córdoba', dept: 'Córdoba', status: 'Pendiente', eta: '2027', reason: 'Infraestructura de red pendiente' },
  { name: 'Alcaldía de Quibdó', dept: 'Chocó', status: 'Pendiente', eta: '2027', reason: 'Cobertura de internet insuficiente' },
  { name: 'Alcaldía de Leticia', dept: 'Amazonas', status: 'Pendiente', eta: '2027', reason: 'Conectividad satelital en despliegue' },
  { name: 'Universidad de Nariño', dept: 'Nariño', status: 'Pendiente', eta: '2027', reason: 'Migración de sistemas internos' },
  { name: 'Universidad del Magdalena', dept: 'Magdalena', status: 'Pendiente', eta: '2027', reason: 'Proyecto en etapa de formulación' },
  { name: 'Universidad de la Guajira', dept: 'La Guajira', status: 'Pendiente', eta: '2027', reason: 'Piloto regional en preparación' },
  { name: 'Universidad de Cartagena', dept: 'Bolívar', status: 'Pendiente', eta: '2027', reason: 'Proceso de aprobación institucional' },
]

async function fetchAPI(url, signal) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    signal,
  })

  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status}`)
  }

  return response.json()
}

function KpiCard({ title, value, helper, color }) {
  return (
    <article className="group rounded-2xl border border-slate-700/60 bg-slate-800/60 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-slate-500/70 hover:bg-slate-800/90">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight" style={{ color }}>
        {value}
      </p>
      {helper && <p className="mt-2 text-xs text-slate-500">{helper}</p>}
    </article>
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

  const totalPendingPages = Math.ceil(PENDING_ENTITIES.length / PENDING_PER_PAGE)

  const paginatedPending = useMemo(() => {
    const start = (pendingPage - 1) * PENDING_PER_PAGE
    return PENDING_ENTITIES.slice(start, start + PENDING_PER_PAGE)
  }, [pendingPage])

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
        helper: 'Entidades públicas activas en plataforma',
        color: '#60A5FA',
      },
      {
        title: 'Conectadas X-Road',
        value: kpis?.xroad_connected ?? 0,
        helper: 'Interoperando actualmente',
        color: '#34D399',
      },
      {
        title: 'Pendientes de integración',
        value: kpis?.xroad_pending ?? 0,
        helper: 'Con plan de onboarding vigente',
        color: '#FBBF24',
      },
      {
        title: 'Tasa de conexión',
        value: `${kpis?.xroad_connection_rate ?? 0}%`,
        helper: 'Cobertura de integración nacional',
        color: '#A78BFA',
      },
      {
        title: 'Servicios activos',
        value: kpis?.total_services ?? 0,
        helper: 'Servicios interoperables disponibles',
        color: '#22D3EE',
      },
      {
        title: 'Madurez promedio',
        value: `${kpis?.average_maturity_score ?? 0}%`,
        helper: 'Nivel consolidado de capacidades',
        color: '#FB923C',
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

      const [kpiData, sectorsByType, xroadByStatus, sectorsList] = await Promise.all([
        fetchAPI(`${API_BASE}/dashboard/kpis${sectorQuery}`, signal),
        fetchAPI(`${API_BASE}/dashboard/by-sector`, signal),
        fetchAPI(`${API_BASE}/dashboard/by-xroad-status${sectorQuery}`, signal),
        fetchAPI(`${API_BASE}/sectors/`, signal),
      ])

      setKpis(kpiData)
      setSectorData(sectorsByType)
      setXroadStatus(xroadByStatus)
      setSectors(sectorsList.items || sectorsList || [])
      setPendingPage(1)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSector])

  const exportToPDF = () => {
    const doc = new jsPDF('landscape', 'mm', 'a4')

    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, 297, 28, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('Reporte Ejecutivo - Dashboard X-Road Colombia', 14, 12)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Fecha de generación: ${new Date().toLocaleString('es-CO')}`, 14, 20)
    doc.text(`Filtro sector: ${selectedSector || 'Todos los sectores'}`, 205, 20)

    autoTable(doc, {
      startY: 35,
      head: [['Indicador', 'Valor']],
      body: kpiCards.map((kpi) => [kpi.title, String(kpi.value)]),
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    })

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [['Entidad', 'Departamento', 'Estado', 'ETA', 'Justificación']],
      body: PENDING_ENTITIES.map((item) => [item.name, item.dept, item.status, item.eta, item.reason]),
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    })

    doc.save(`dashboard_xroad_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center rounded-3xl border border-slate-700/60 bg-slate-900/60">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-400/20 border-t-blue-400" />
          <p className="text-slate-200">Cargando panel ejecutivo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center rounded-3xl border border-red-500/30 bg-red-500/10 p-8">
        <div className="max-w-lg text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-300" />
          <h2 className="text-xl font-semibold text-white">No se pudo cargar el dashboard</h2>
          <p className="mt-2 text-sm text-red-100/90">{error}</p>
          <button
            onClick={() => loadDashboard()}
            className="mt-5 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-slate-100">
      <section className="rounded-3xl border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 shadow-2xl shadow-slate-900/40">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
              <Sparkles className="h-3.5 w-3.5" /> Vista ejecutiva optimizada
            </p>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard X-Road Colombia</h1>
            <p className="mt-2 text-sm text-slate-400">Monitoreo estratégico de interoperabilidad del Estado colombiano.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedSector}
              onChange={(event) => setSelectedSector(event.target.value)}
              className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-blue-400"
            >
              <option value="">Todos los sectores</option>
              {sectors.map((sector) => (
                <option key={sector.id || sector.name} value={sector.name}>
                  {sector.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => loadDashboard()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-400 hover:bg-slate-700"
            >
              <RefreshCw className="h-4 w-4" /> Actualizar
            </button>

            <button
              onClick={exportToPDF}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              <Download className="h-4 w-4" /> Exportar PDF
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {kpiCards.map((item) => (
          <KpiCard key={item.title} title={item.title} value={item.value} helper={item.helper} color={item.color} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Entidades por sector</h3>
            <span className="text-xs text-slate-400">Distribución actual</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={sectorData} layout="vertical" margin={{ left: 30, right: 20, top: 8, bottom: 8 }}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fill: '#94A3B8' }} />
              <YAxis type="category" width={120} dataKey="sector" tick={{ fill: '#E2E8F0', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '10px' }}
                labelStyle={{ color: '#E2E8F0' }}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-5">
          <h3 className="mb-4 text-lg font-semibold">Estado de conectividad</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={normalizedStatusData} dataKey="count" nameKey="label" innerRadius={54} outerRadius={88} paddingAngle={3}>
                {normalizedStatusData.map((entry) => (
                  <Cell key={entry.status} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '10px' }}
                labelStyle={{ color: '#E2E8F0' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {normalizedStatusData.map((item) => (
              <div key={item.status} className="flex items-center justify-between rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 text-sm">
                <span className="inline-flex items-center gap-2 text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
                <span className="font-semibold text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Niveles de madurez institucional</h3>
            <span className="text-xs text-slate-400">Modelo 1 a 4</span>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {maturityDistribution.map((level) => (
              <div key={level.label} className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                <p className="text-sm text-slate-400">{level.label}</p>
                <p className="mt-2 text-3xl font-bold" style={{ color: level.color }}>
                  {level.value}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-5">
          <h3 className="mb-4 text-lg font-semibold">Resumen rápido</h3>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300">
              <p className="font-medium">Conectividad activa</p>
              <p className="mt-1 text-xs">{kpis?.xroad_connection_rate ?? 0}% del ecosistema ya interoperando.</p>
            </div>
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-300">
              <p className="font-medium">Cobertura de servicios</p>
              <p className="mt-1 text-xs">{kpis?.total_services ?? 0} servicios activos disponibles en la red.</p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-300">
              <p className="font-medium">Foco de implementación</p>
              <p className="mt-1 text-xs">Priorizar entidades pendientes en regiones con menor conectividad.</p>
            </div>
          </div>
        </article>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-700/60 bg-slate-800/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold">Red de interconexión estatal</h3>
            <p className="text-sm text-slate-400">Mapa dinámico de dependencias y flujos de información entre entidades.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" /> Motor de red activo
          </span>
        </div>
        <RelationshipGraph />
      </section>

      <section className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="inline-flex items-center gap-2 text-xl font-semibold">
              <Clock3 className="h-5 w-5 text-amber-400" /> Entidades pendientes de integración
            </h3>
            <p className="mt-1 text-sm text-slate-400">Seguimiento de entidades con onboarding en curso o programado.</p>
          </div>
          <span className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-300">
            {kpis?.xroad_pending ?? 0} pendientes
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-700/70">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Entidad</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Departamento</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">ETA</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Justificación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/70 bg-slate-900/30 text-sm">
              {paginatedPending.map((row) => (
                <tr key={`${row.name}-${row.dept}`} className="transition hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-medium text-slate-100">{row.name}</td>
                  <td className="px-4 py-3 text-slate-300">{row.dept}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        row.status === 'En Proceso'
                          ? 'border border-amber-400/30 bg-amber-400/10 text-amber-300'
                          : 'border border-orange-400/30 bg-orange-400/10 text-orange-300'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{row.eta}</td>
                  <td className="px-4 py-3 text-slate-400">{row.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setPendingPage((prev) => Math.max(1, prev - 1))}
            disabled={pendingPage === 1}
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-slate-400">
            Página {pendingPage} de {totalPendingPages}
          </span>
          <button
            onClick={() => setPendingPage((prev) => Math.min(totalPendingPages, prev + 1))}
            disabled={pendingPage === totalPendingPages}
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-700/60 bg-slate-900/50 p-4 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-blue-400" /> Plataforma nacional de interoperabilidad
          </span>
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Datos consolidados para toma de decisiones
          </span>
          <span className="inline-flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4 text-violet-400" /> Última actualización: {new Date().toLocaleDateString('es-CO')}
          </span>
        </div>
      </section>
    </div>
  )
}