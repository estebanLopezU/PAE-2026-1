import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Building2, 
  Link2, 
  Clock,
  Activity,
  TrendingUp,
  ChevronRight,
  Globe,
  Server,
  Shield,
  Filter,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import RelationshipGraph from '../components/RelationshipGraph'

const API_BASE = '/api/v1'

async function fetchAPI(url) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export default function Dashboard() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [kpis, setKpis] = useState(null)
  const [sectorData, setSectorData] = useState([])
  const [xroadStatus, setXroadStatus] = useState([])
  const [sectors, setSectors] = useState([])
  const [selectedSector, setSelectedSector] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('=== DASHBOARD FETCHING ===')
      
      const [kpisData, sectorRes, xroadRes, sectorsRes] = await Promise.all([
        fetchAPI(`${API_BASE}/dashboard/kpis`),
        fetchAPI(`${API_BASE}/dashboard/by-sector`),
        fetchAPI(`${API_BASE}/dashboard/by-xroad-status`),
        fetchAPI(`${API_BASE}/sectors/`)
      ])

      console.log('KPIs:', kpisData)
      console.log('By Sector:', sectorRes)
      console.log('X-Road Status:', xroadRes)
      console.log('Sectors:', sectorsRes)

      setKpis(kpisData)
      setSectorData(sectorRes)
      setXroadStatus(xroadRes)
      setSectors(sectorsRes.items || sectorsRes || [])
      
      console.log('=== DATA LOADED SUCCESS ===')
      
    } catch (err) {
      console.error('ERROR:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando Dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center p-8 bg-red-500/10 rounded-xl border border-red-500/30">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 text-xl mb-4">Error: {error}</p>
          <button onClick={fetchData} className="px-6 py-2 bg-red-500 text-white rounded-lg">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const kpiCards = [
    { name: 'Total Entidades', value: kpis?.total_entities || 0, color: '#3B82F6' },
    { name: 'Conectadas X-Road', value: kpis?.xroad_connected || 0, color: '#10B981' },
    { name: 'Pendientes', value: kpis?.xroad_pending || 0, color: '#F59E0B' },
    { name: 'Tasa de Conexión', value: `${kpis?.xroad_connection_rate || 0}%`, color: '#8B5CF6' },
    { name: 'Total Servicios', value: kpis?.total_services || 0, color: '#06B6D4' },
    { name: 'Madurez Promedio', value: `${kpis?.average_maturity_score || 0}%`, color: '#F97316' }
  ]

  const maturityDistribution = [
    { name: 'Nivel 1', value: kpis?.maturity_distribution?.[1] || 0, color: '#EF4444' },
    { name: 'Nivel 2', value: kpis?.maturity_distribution?.[2] || 0, color: '#F59E0B' },
    { name: 'Nivel 3', value: kpis?.maturity_distribution?.[3] || 0, color: '#3B82F6' },
    { name: 'Nivel 4', value: kpis?.maturity_distribution?.[4] || 0, color: '#10B981' }
  ]

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease forwards; }
      `}</style>

      {/* Header */}
      <div className="animate-fade-in mb-8 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </span>
              Dashboard X-Road Colombia
            </h1>
            <p className="mt-2 text-gray-400">Plataforma de Interoperabilidad del Gobierno Colombiano</p>
          </div>
          <button onClick={fetchData} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Actualizar
          </button>
        </div>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {kpiCards.map((kpi, i) => (
          <div key={kpi.name} className="animate-fade-in bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50" style={{animationDelay: `${i*0.1}s`}}>
            <p className="text-gray-400 text-sm">{kpi.name}</p>
            <p className="text-3xl font-bold mt-2" style={{color: kpi.color}}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-semibold text-white mb-4">Entidades por Sector</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sectorData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" tick={{fill: '#9CA3AF'}} />
              <YAxis dataKey="sector" type="category" tick={{fill: '#E5E7EB'}} width={80} />
              <Tooltip contentStyle={{background: '#1F2937', border: '1px solid #374151', borderRadius: '8px'}} />
              <Bar dataKey="count" fill="#3B82F6" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-semibold text-white mb-4">Estado de Conectividad</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={xroadStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="count" nameKey="status">
                {xroadStatus.map((e, i) => <Cell key={i} fill={e.status==='connected'?'#10B981':e.status==='pending'?'#F59E0B':'#EF4444'} />)}
              </Pie>
              <Tooltip contentStyle={{background: '#1F2937', border: '1px solid #374151', borderRadius: '8px'}} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {xroadStatus.map(e => (
              <div key={e.status} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: e.status==='connected'?'#10B981':e.status==='pending'?'#F59E0B':'#EF4444'}} />
                <span className="text-gray-300">{e.status}</span>
                <span className="text-white font-bold">{e.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Maturity */}
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Niveles de Madurez</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {maturityDistribution.map(m => (
            <div key={m.name} className="p-4 rounded-xl bg-gray-700/30 border-l-4" style={{borderLeftColor: m.color}}>
              <p className="text-gray-400 text-sm">{m.name}</p>
              <p className="text-2xl font-bold" style={{color: m.color}}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Relationship Graph Section */}
      <div className="animate-fade-in mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white">Red de Interconexión Estatal</h3>
            <p className="text-gray-400">Visualización de flujos de información y dependencias entre entidades</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Motor de Red Activo
            </span>
          </div>
        </div>
        <RelationshipGraph />
      </div>

      {/* DEBUG */}
      <div className="p-4 bg-gray-800/30 rounded-xl text-center">
        <p className="text-gray-500 text-sm">
          DEBUG: Entidades={kpis?.total_entities} | Conectadas={kpis?.xroad_connected} | 
          Pendientes={kpis?.xroad_pending} | Servicios={kpis?.total_services} | 
          Madurez={kpis?.average_maturity_score}%
        </p>
      </div>
    </div>
  )
}