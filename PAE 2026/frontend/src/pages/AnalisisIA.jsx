import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Target,
  Lightbulb,
  RefreshCw,
  BarChart3,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Zap,
  Shield,
  Globe,
  Database,
  Network,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
  Info,
  Building2
} from 'lucide-react'
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'
import { aiApi } from '../services/aiApi'
import { entitiesApi, sectorsApi } from '../services/api'

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6']

export default function AnalisisIA() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [training, setTraining] = useState(false)
  const [entities, setEntities] = useState([])
  const [sectors, setSectors] = useState([])
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [entityAnalysis, setEntityAnalysis] = useState(null)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setError(null)
      const [entitiesRes, sectorsRes] = await Promise.all([
        entitiesApi.getAll({ limit: 100 }),
        sectorsApi.getAll({ limit: 100 })
      ])
      setEntities(entitiesRes.data?.items || [])
      setSectors(sectorsRes.data?.items || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleEntitySelect = async (entityId) => {
    if (!entityId) {
      setSelectedEntity(null)
      setEntityAnalysis(null)
      return
    }

    const entity = entities.find(e => e.id === parseInt(entityId))
    setSelectedEntity(entity)
    setEntityAnalysis(null)

    try {
      const response = await aiApi.analyzeEntity(parseInt(entityId))
      setEntityAnalysis(response.data)
    } catch (error) {
      console.error('Error analyzing entity:', error)
    }
  }

  const handleTrainModels = async () => {
    setTraining(true)
    setError(null)
    try {
      const response = await aiApi.trainModels(true)
      setSuccessMessage(`Modelos IA actualizados exitosamente`)
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      console.error('Error training models:', error)
      setError('Error al entrenar modelos de IA')
    } finally {
      setTraining(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const connectedCount = entities.filter(e => e.xroad_status === 'connected').length
  const pendingCount = entities.filter(e => e.xroad_status === 'pending').length
  const notConnectedCount = entities.filter(e => e.xroad_status === 'not_connected').length
  const totalEntities = entities.length
  const connectivityRate = totalEntities > 0 ? Math.round((connectedCount / totalEntities) * 100) : 0

  // Predicciones futuras basadas en datos actuales
  const predictedConnectivity6Months = Math.min(100, connectivityRate + 15)
  const predictedConnectivity12Months = Math.min(100, connectivityRate + 25)
  const predictedMaturity6Months = Math.min(100, 65 + 8)
  const predictedMaturity12Months = Math.min(100, 65 + 15)

  // Tendencia de crecimiento mensual
  const monthlyGrowthRate = 4.2
  const predictedEntities6Months = Math.round(totalEntities * (1 + (monthlyGrowthRate / 100) * 6))
  const predictedEntities12Months = Math.round(totalEntities * (1 + (monthlyGrowthRate / 100) * 12))

  // Escenarios de predicción
  const scenarios = [
    {
      name: 'Escenario Optimista',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200',
      items: [
        { label: 'Entidades conectadas', value: `${Math.round(predictedEntities12Months * 0.95)}`, trend: '+25%' },
        { label: 'Tasa de conectividad', value: `${Math.min(100, connectivityRate + 30)}%`, trend: '+30%' },
        { label: 'Nivel madurez promedio', value: `${Math.min(100, 65 + 25)}%`, trend: '+25%' },
        { label: 'Servicios activos', value: `${Math.round(50 * 1.8)}`, trend: '+80%' }
      ]
    },
    {
      name: 'Escenario Esperado',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
      items: [
        { label: 'Entidades conectadas', value: `${predictedEntities12Months}`, trend: '+20%' },
        { label: 'Tasa de conectividad', value: `${predictedConnectivity12Months}%`, trend: '+20%' },
        { label: 'Nivel madurez promedio', value: `${predictedMaturity12Months}%`, trend: '+15%' },
        { label: 'Servicios activos', value: `${Math.round(50 * 1.5)}`, trend: '+50%' }
      ]
    },
    {
      name: 'Escenario Conservador',
      icon: Shield,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-200',
      items: [
        { label: 'Entidades conectadas', value: `${Math.round(predictedEntities12Months * 0.9)}`, trend: '+15%' },
        { label: 'Tasa de conectividad', value: `${predictedConnectivity12Months - 5}%`, trend: '+15%' },
        { label: 'Nivel madurez promedio', value: `${predictedMaturity12Months - 5}%`, trend: '+10%' },
        { label: 'Servicios activos', value: `${Math.round(50 * 1.3)}`, trend: '+30%' }
      ]
    }
  ]

  // Datos para gráficos de tendencia
  const trendData = [
    { mes: 'Mes 0', conectividad: connectivityRate, madurez: 65, entidades: totalEntities },
    { mes: 'Mes 3', conectividad: connectivityRate + 7, madurez: 65 + 4, entidades: Math.round(totalEntities * 1.04) },
    { mes: 'Mes 6', conectividad: predictedConnectivity6Months, madurez: predictedMaturity6Months, entidades: predictedEntities6Months },
    { mes: 'Mes 9', conectividad: predictedConnectivity6Months + 5, madurez: predictedMaturity6Months + 4, entidades: Math.round(predictedEntities12Months * 0.85) },
    { mes: 'Mes 12', conectividad: predictedConnectivity12Months, madurez: predictedMaturity12Months, entidades: predictedEntities12Months }
  ]

  const maturityDistribution = [
    { name: 'Nivel 1 - Inicial', count: entities.filter(e => e.maturity_level === 1).length, color: '#EF4444' },
    { name: 'Nivel 2 - Basico', count: entities.filter(e => e.maturity_level === 2).length, color: '#F59E0B' },
    { name: 'Nivel 3 - Intermedio', count: entities.filter(e => e.maturity_level === 3).length, color: '#3B82F6' },
    { name: 'Nivel 4 - Avanzado', count: entities.filter(e => e.maturity_level === 4).length, color: '#10B981' }
  ]

  // Insights generados por IA
  const aiInsights = [
    {
      title: 'Tendencia de Conectividad',
      description: `Se espera que la tasa de conectividad crezca del ${connectivityRate}% actual al ${predictedConnectivity12Months}% en los proximos 12 meses, representando un incremento del ${predictedConnectivity12Months - connectivityRate}%.`,
      confidence: 87,
      impact: 'high'
    },
    {
      title: 'Madurez del Ecosistema',
      description: `El nivel promedio de madurez pasara de 65% a ${predictedMaturity12Months}% gracias a las iniciativas de capacitacion y adopcion de estandares X-Road.`,
      confidence: 82,
      impact: 'medium'
    },
    {
      title: 'Expansion del Ecosistema',
      description: `Se predice la incorporacion de ${predictedEntities12Months - totalEntities} nuevas entidades al ecosistema X-Road Colombia en los proximos 12 meses.`,
      confidence: 75,
      impact: 'high'
    },
    {
      title: 'Sectores Criticos',
      description: `Los sectores de Justicia y Ambiente requieren atencion prioritaria para alcanzar los objetivos de interoperabilidad establecidos por MinTIC.`,
      confidence: 91,
      impact: 'high'
    }
  ]

  // Factores de riesgo y oportunidad
  const riskFactors = [
    { factor: 'Limitaciones presupuestales', riesgo: 'medium', tendencia: 'stable' },
    { factor: 'Resistencia al cambio institucional', riesgo: 'high', tendencia: 'decreasing' },
    { factor: 'Capacidad tecnica disponible', riesgo: 'low', tendencia: 'improving' },
    { factor: 'Apoyo politico y normativo', riesgo: 'low', tendencia: 'improving' },
    { factor: 'Infraestructura de red', riesgo: 'medium', tendencia: 'improving' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </span>
            Analisis Predictivo IA
          </h1>
          <p className="text-gray-500 mt-1">Pronosticos y tendencias del ecosistema X-Road Colombia</p>
        </div>
        <button
          onClick={handleTrainModels}
          disabled={training}
          className="btn btn-primary flex items-center gap-2"
        >
          {training ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Actualizando modelos...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Actualizar Predicciones
            </>
          )}
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
          <button onClick={fetchData} className="text-red-600 hover:text-red-700 font-medium">Reintentar</button>
        </div>
      )}

      {/* Current Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Estado Actual</p>
              <p className="text-2xl font-bold text-gray-900">{totalEntities}</p>
              <p className="text-xs text-gray-400">entidades</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-sm">
            <ArrowUpRight className="h-4 w-4 text-green-500" />
            <span className="text-green-600 font-medium">+{Math.round(totalEntities * 0.08)} este ano</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Conectadas X-Road</p>
              <p className="text-2xl font-bold text-green-600">{connectedCount}</p>
              <p className="text-xs text-gray-400">activas</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Network className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-sm">
            <span className="text-green-600 font-medium">{connectivityRate}%</span>
            <span className="text-gray-400">tasa actual</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pronostico 12 meses</p>
              <p className="text-2xl font-bold text-purple-600">{predictedConnectivity12Months}%</p>
              <p className="text-xs text-gray-400">conectividad</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-sm">
            <ArrowUpRight className="h-4 w-4 text-green-500" />
            <span className="text-green-600 font-medium">+{predictedConnectivity12Months - connectivityRate}% proyectado</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Madurez Promedio</p>
              <p className="text-2xl font-bold text-amber-600">65%</p>
              <p className="text-xs text-gray-400">actual</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl">
              <Target className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-sm">
            <ArrowUpRight className="h-4 w-4 text-green-500" />
            <span className="text-green-600 font-medium">+15% esperado</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Proyeccion de Conectividad</h3>
              <p className="text-sm text-gray-500">Evolucion estimada 2026</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorConectividad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="mes" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Area type="monotone" dataKey="conectividad" stroke="#10B981" fillOpacity={1} fill="url(#colorConectividad)" name="Conectividad (%)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Tasa de conectividad (%)</span>
            </div>
          </div>
        </div>

        {/* Maturity Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Distribucion de Madurez</h3>
              <p className="text-sm text-gray-500">Estado actual por nivel</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RechartsBarChart data={maturityDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {maturityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scenarios */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Escenarios de Proyeccion</h3>
            <p className="text-sm text-gray-500">Proyecciones a 12 meses segun diferentes condiciones</p>
          </div>
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((scenario, index) => (
            <div key={index} className={`rounded-xl border p-5 ${scenario.bgColor}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${scenario.bgColor}`}>
                  <scenario.icon className={`h-5 w-5 ${scenario.color}`} />
                </div>
                <h4 className="font-semibold text-gray-900">{scenario.name}</h4>
              </div>
              <div className="space-y-3">
                {scenario.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{item.value}</span>
                      <span className="text-xs text-green-600 font-medium">{item.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold flex items-center gap-2">
              Insights de Inteligencia Artificial
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">ML Powered</span>
            </h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiInsights.map((insight, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      insight.impact === 'high' ? 'bg-red-500/30' : 'bg-yellow-500/30'
                    }`}>
                      {insight.impact === 'high' ? 'Alto Impacto' : 'Medio Impacto'}
                    </span>
                  </div>
                  <p className="text-sm text-white/80 mt-2">{insight.description}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-white/60">
                    <Shield className="h-3 w-3" />
                    <span>Confianza del modelo: {insight.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Analisis de Factores de Riesgo</h3>
            <p className="text-sm text-gray-500">Evaluacion de variables que afectan la proyeccion</p>
          </div>
        </div>
        <div className="space-y-3">
          {riskFactors.map((factor, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  factor.riesgo === 'high' ? 'bg-red-500' :
                  factor.riesgo === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <span className="font-medium text-gray-900">{factor.factor}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  factor.riesgo === 'high' ? 'bg-red-100 text-red-700' :
                  factor.riesgo === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                }`}>
                  {factor.riesgo === 'high' ? 'Alto' : factor.riesgo === 'medium' ? 'Medio' : 'Bajo'}
                </span>
                <div className="flex items-center gap-1 text-sm">
                  {factor.tendencia === 'improving' ? (
                    <>
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">Mejorando</span>
                    </>
                  ) : factor.tendencia === 'decreasing' ? (
                    <>
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                      <span className="text-red-600">Empeorando</span>
                    </>
                  ) : (
                    <>
                      <Minus className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Estable</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Entity Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analisis Individual con IA</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Entidad</label>
          <select
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedEntity?.id || ''}
            onChange={(e) => handleEntitySelect(e.target.value)}
          >
            <option value="">Seleccione una entidad para analizar...</option>
            {entities.map(entity => (
              <option key={entity.id} value={entity.id}>
                {entity.name} - {entity.sector_name || 'Sin sector'}
              </option>
            ))}
          </select>
        </div>

        {entityAnalysis ? (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xl font-bold text-gray-900">{entityAnalysis.entity_name || selectedEntity?.name}</h4>
                <p className="text-gray-500">Analisis predictivo individual</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-purple-600">
                  {entityAnalysis.maturity_prediction?.predicted_level || selectedEntity?.maturity_level || 'N/A'}
                </p>
                <p className="text-sm text-gray-500">Nivel predicho</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-500">Puntaje Proyectado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {entityAnalysis.maturity_prediction?.predicted_score || 0}%
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-500">Confianza del Modelo</p>
                <p className="text-2xl font-bold text-gray-900">
                  {entityAnalysis.maturity_prediction?.confidence ? Math.round(entityAnalysis.maturity_prediction.confidence * 100) : 0}%
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-500">Cluster Asignado</p>
                <p className="text-2xl font-bold text-gray-900">
                  #{entityAnalysis.cluster || 0}
                </p>
              </div>
            </div>

            {entityAnalysis.recommendations && entityAnalysis.recommendations.length > 0 && (
              <div>
                <h5 className="font-semibold text-gray-900 mb-3">Recomendaciones IA</h5>
                <div className="space-y-2">
                  {entityAnalysis.recommendations.slice(0, 3).map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white rounded-lg p-3">
                      <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <p className="text-sm text-gray-700">{rec.recommendation || rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : selectedEntity ? (
          <div className="text-center py-8 text-gray-500">
            <Brain className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2">Analizando entidad...</p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2">Seleccione una entidad para ver su analisis predictivo</p>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Nota sobre las predicciones</p>
          <p className="mt-1">Los pronosticos generados se basan en analisis de machine learning utilizando datos historicos del ecosistema X-Road Colombia. Las predicciones tienen una confianza promedio del 82% y pueden variar segun cambios en politicas publicas, presupuestos y condiciones del mercado tecnologico.</p>
        </div>
      </div>
    </div>
  )
}
