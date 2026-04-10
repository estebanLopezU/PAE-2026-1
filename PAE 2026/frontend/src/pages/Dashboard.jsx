import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Building2, 
  Link2, 
  Clock,
  Activity,
  TrendingUp,
  Users,
  ChevronRight,
  Globe,
  Server,
  Shield
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { dashboardApi } from '../services/api'

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6']

export default function Dashboard() {
  const { t } = useTranslation()
  const [kpis, setKpis] = useState(null)
  const [sectorData, setSectorData] = useState([])
  const [xroadStatus, setXroadStatus] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [kpisRes, sectorRes, xroadRes] = await Promise.all([
        dashboardApi.getKpis(),
        dashboardApi.getBySector(),
        dashboardApi.getByXroadStatus()
      ])
      setKpis(kpisRes.data)
      setSectorData(sectorRes.data)
      setXroadStatus(xroadRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const kpiCards = [
    {
      name: t('dashboard.totalEntities'),
      value: kpis?.total_entities || 0,
      icon: Building2,
      color: '#3B82F6',
      bgGradient: 'from-blue-500/10 to-blue-600/5',
      borderColor: 'border-blue-500/30',
      iconBg: 'bg-blue-500'
    },
    {
      name: t('dashboard.connectedEntities'),
      value: kpis?.xroad_connected || 0,
      icon: Link2,
      color: '#10B981',
      bgGradient: 'from-green-500/10 to-emerald-600/5',
      borderColor: 'border-green-500/30',
      iconBg: 'bg-green-500'
    },
    {
      name: t('common.pending'),
      value: kpis?.xroad_pending || 0,
      icon: Clock,
      color: '#F59E0B',
      bgGradient: 'from-yellow-500/10 to-amber-600/5',
      borderColor: 'border-yellow-500/30',
      iconBg: 'bg-yellow-500'
    },
    {
      name: t('dashboard.xroadStatus'),
      value: `${kpis?.xroad_connection_rate || 0}%`,
      icon: TrendingUp,
      color: '#8B5CF6',
      bgGradient: 'from-purple-500/10 to-violet-600/5',
      borderColor: 'border-purple-500/30',
      iconBg: 'bg-purple-500'
    },
    {
      name: t('dashboard.totalServices'),
      value: kpis?.total_services || 0,
      icon: Server,
      color: '#06B6D4',
      bgGradient: 'from-cyan-500/10 to-cyan-600/5',
      borderColor: 'border-cyan-500/30',
      iconBg: 'bg-cyan-500'
    },
    {
      name: t('dashboard.averageMaturity'),
      value: `${kpis?.average_maturity_score || 0}%`,
      icon: Shield,
      color: '#F97316',
      bgGradient: 'from-orange-500/10 to-orange-600/5',
      borderColor: 'border-orange-500/30',
      iconBg: 'bg-orange-500'
    }
  ]

  const maturityDistribution = kpis?.maturity_distribution ? [
    { name: 'Nivel 1 - Inicial', value: kpis.maturity_distribution[1] || 0, color: '#EF4444' },
    { name: 'Nivel 2 - Basico', value: kpis.maturity_distribution[2] || 0, color: '#F59E0B' },
    { name: 'Nivel 3 - Intermedio', value: kpis.maturity_distribution[3] || 0, color: '#3B82F6' },
    { name: 'Nivel 4 - Avanzado', value: kpis.maturity_distribution[4] || 0, color: '#10B981' }
  ] : []

  return (
    <div className="space-y-8">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }
        .kpi-card:nth-child(1) { animation-delay: 0.1s; }
        .kpi-card:nth-child(2) { animation-delay: 0.2s; }
        .kpi-card:nth-child(3) { animation-delay: 0.3s; }
        .kpi-card:nth-child(4) { animation-delay: 0.4s; }
        .kpi-card:nth-child(5) { animation-delay: 0.5s; }
        .kpi-card:nth-child(6) { animation-delay: 0.6s; }
      `}</style>

      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Globe className="h-5 w-5 text-white" />
          </span>
          {t('dashboard.title')}
        </h1>
        <p className="mt-2 text-gray-500 flex items-center gap-2">
          <Activity className="h-4 w-4" />
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((kpi, index) => (
          <div
            key={kpi.name}
            className={`animate-fade-in-up kpi-card bg-gradient-to-br ${kpi.bgGradient} border ${kpi.borderColor} rounded-2xl p-5 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group`}
          >
            <div className="flex items-start justify-between">
              <div className={`${kpi.iconBg} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                <kpi.icon className="h-5 w-5 text-white" />
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">{kpi.name}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1" style={{ color: kpi.color }}>
                {kpi.value}
              </p>
            </div>
            <div className="mt-3 h-1 rounded-full bg-gray-200 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ width: '70%', backgroundColor: kpi.color }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entities by Sector */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Entidades por Sector</h3>
              <p className="text-sm text-gray-500 mt-1">Distribucion por categoria</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sectorData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis 
                dataKey="sector" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#374151', fontSize: 12 }}
                width={100}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '12px'
                }} 
              />
              <Bar dataKey="count" fill="#3B82F6" radius={[0, 6, 6, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* X-Road Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Estado de Conectividad</h3>
              <p className="text-sm text-gray-500 mt-1">X-Road por status</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Link2 className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={xroadStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="status"
                >
                  {xroadStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }} 
                  formatter={(value, name) => [`${value} entidades`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {xroadStatus.map((item, index) => (
              <div key={item.status} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-sm text-gray-600">{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Maturity Distribution */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Niveles de Madurez</h3>
            <p className="text-sm text-gray-500 mt-1">Evaluacion por nivel de interoperabilidad</p>
          </div>
          <div className="p-2 bg-purple-100 rounded-lg">
            <Shield className="h-5 w-5 text-purple-600" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {maturityDistribution.map((level, index) => (
            <div 
              key={level.name}
              className="p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all"
              style={{ borderLeftColor: level.color, borderLeftWidth: '4px' }}
            >
              <p className="text-sm text-gray-500">{level.name}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: level.color }}>
                {level.value}
              </p>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={maturityDistribution}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
            <Tooltip 
              contentStyle={{ 
                background: 'white', 
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '12px'
              }} 
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {maturityDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-blue-100 text-sm">Tasa de Conexion</p>
              <p className="text-3xl font-bold">{kpis?.xroad_connection_rate || 0}%</p>
            </div>
          </div>
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: `${kpis?.xroad_connection_rate || 0}%` }}></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <p className="text-green-100 text-sm">Servicios Activos</p>
              <p className="text-3xl font-bold">{kpis?.total_services || 0}</p>
            </div>
          </div>
          <p className="mt-4 text-green-100 text-sm">+12% vs mes anterior</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-purple-100 text-sm">Nivel Promedio Madurez</p>
              <p className="text-3xl font-bold">{kpis?.average_maturity_score || 0}%</p>
            </div>
          </div>
          <p className="mt-4 text-purple-100 text-sm">Nivel: Intermedio-Alto</p>
        </div>
      </div>
    </div>
  )
}
