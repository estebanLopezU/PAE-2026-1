import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Building2, 
  Link2, 
  Unlink, 
  Activity,
  TrendingUp,
  Users
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { dashboardApi } from '../services/api'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

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
      color: 'bg-blue-500'
    },
    {
      name: t('dashboard.connectedEntities'),
      value: kpis?.xroad_connected || 0,
      icon: Link2,
      color: 'bg-green-500'
    },
    {
      name: t('common.pending'),
      value: kpis?.xroad_pending || 0,
      icon: Activity,
      color: 'bg-yellow-500'
    },
    {
      name: t('dashboard.xroadStatus'),
      value: `${kpis?.xroad_connection_rate || 0}%`,
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      name: t('dashboard.totalServices'),
      value: kpis?.total_services || 0,
      icon: Users,
      color: 'bg-indigo-500'
    },
    {
      name: t('dashboard.averageMaturity'),
      value: kpis?.average_maturity_score || 0,
      icon: Activity,
      color: 'bg-orange-500'
    }
  ]

  const maturityDistribution = kpis?.maturity_distribution ? [
    { name: t('maturityLevels.1'), value: kpis.maturity_distribution[1] },
    { name: t('maturityLevels.2'), value: kpis.maturity_distribution[2] },
    { name: t('maturityLevels.3'), value: kpis.maturity_distribution[3] },
    { name: t('maturityLevels.4'), value: kpis.maturity_distribution[4] }
  ] : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((kpi) => (
          <div
            key={kpi.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6 card-hover"
          >
            <dt>
              <div className={`absolute rounded-md ${kpi.color} p-3`}>
                <kpi.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{kpi.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{kpi.value}</p>
            </dd>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Entities by Sector */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('dashboard.bySector')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sectorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sector" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* X-Road Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('dashboard.xroadStatus')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={xroadStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                nameKey="status"
              >
                {xroadStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Maturity Distribution */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('maturity.assessmentHistory')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={maturityDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="value" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}