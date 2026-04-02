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
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      name: t('dashboard.connectedEntities'),
      value: kpis?.xroad_connected || 0,
      icon: Link2,
      color: 'bg-green-500',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      name: t('common.pending'),
      value: kpis?.xroad_pending || 0,
      icon: Activity,
      color: 'bg-yellow-500',
      gradient: 'from-yellow-500 to-amber-600'
    },
    {
      name: t('dashboard.xroadStatus'),
      value: `${kpis?.xroad_connection_rate || 0}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-violet-600'
    },
    {
      name: t('dashboard.totalServices'),
      value: kpis?.total_services || 0,
      icon: Users,
      color: 'bg-indigo-500',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      name: t('dashboard.averageMaturity'),
      value: `${kpis?.average_maturity_score || 0}%`,
      icon: Activity,
      color: 'bg-orange-500',
      gradient: 'from-orange-500 to-orange-600'
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
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.1); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.2); }
        }
        
        .kpi-card {
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }
        
        .kpi-card:nth-child(1) { animation-delay: 0.1s; }
        .kpi-card:nth-child(2) { animation-delay: 0.2s; }
        .kpi-card:nth-child(3) { animation-delay: 0.3s; }
        .kpi-card:nth-child(4) { animation-delay: 0.4s; }
        .kpi-card:nth-child(5) { animation-delay: 0.5s; }
        .kpi-card:nth-child(6) { animation-delay: 0.6s; }
        
        .kpi-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(59, 130, 246, 0.15);
        }
        
        .chart-card {
          animation: fadeInUp 0.5s ease 0.4s forwards;
          opacity: 0;
        }
        
        .gradient-bg {
          background: linear-gradient(135deg, rgba(8, 17, 32, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
        }
      `}</style>

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
            className="kpi-card relative overflow-hidden rounded-xl bg-white px-4 pt-5 pb-12 shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
              <div className={`w-full h-full bg-gradient-to-br ${kpi.gradient} rounded-bl-full`}></div>
            </div>
            <dt>
              <div className={`absolute rounded-xl ${kpi.color} p-3 shadow-lg`}>
                <kpi.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{kpi.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{kpi.value}</p>
            </dd>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent">
              <div className={`h-full bg-gradient-to-r ${kpi.gradient}`} style={{ width: '60%' }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Entities by Sector */}
        <div className="chart-card gradient-bg rounded-xl shadow-lg p-6 border border-gray-800">
          <h3 className="text-lg font-medium text-gray-100 mb-4">{t('dashboard.bySector')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sectorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
              <XAxis dataKey="sector" angle={-45} textAnchor="end" height={100} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(15, 23, 42, 0.95)', 
                  border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }} 
              />
              <Bar dataKey="count" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* X-Road Status Distribution */}
        <div className="chart-card gradient-bg rounded-xl shadow-lg p-6 border border-gray-800">
          <h3 className="text-lg font-medium text-gray-100 mb-4">{t('dashboard.xroadStatus')}</h3>
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
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(15, 23, 42, 0.95)', 
                  border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Maturity Distribution */}
        <div className="chart-card gradient-bg rounded-xl shadow-lg p-6 lg:col-span-2 border border-gray-800">
          <h3 className="text-lg font-medium text-gray-100 mb-4">{t('maturity.assessmentHistory')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={maturityDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" width={150} stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(15, 23, 42, 0.95)', 
                  border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }} 
              />
              <Bar dataKey="value" fill="url(#greenGradient)" radius={[0, 4, 4, 0]} />
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.7}/>
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.9}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}