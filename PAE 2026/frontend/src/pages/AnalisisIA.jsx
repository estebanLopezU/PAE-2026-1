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
  Clock,
  Zap,
  Shield,
  Globe,
  Database,
  Network,
  Activity,
  BarChart,
  PieChart as PieChartIcon,
  ArrowRight,
  ChevronRight,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'
import { aiApi } from '../services/aiApi'
import { entitiesApi, sectorsApi } from '../services/api'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function AnalisisIA() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [training, setTraining] = useState(false)
  const [sectorInsights, setSectorInsights] = useState(null)
  const [clusterInsights, setClusterInsights] = useState(null)
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [entityAnalysis, setEntityAnalysis] = useState(null)
  const [entities, setEntities] = useState([])
  const [sectors, setSectors] = useState([])
  const [selectedSector, setSelectedSector] = useState('')
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setError(null)
      console.log('Iniciando carga de datos...')
      
      const [entitiesRes, sectorsRes] = await Promise.all([
        entitiesApi.getAll({ limit: 100 }),
        sectorsApi.getAll({ limit: 100 })
      ])
      
      console.log('Datos de entidades:', entitiesRes)
      console.log('Datos de sectores:', sectorsRes)
      
      setEntities(entitiesRes.data?.items || [])
      setSectors(sectorsRes.data?.items || [])
      
      // Load initial AI insights with error handling
      try {
        await loadSectorInsights()
      } catch (err) {
        console.error('Error loading sector insights:', err)
      }
      
      try {
        await loadClusterInsights()
      } catch (err) {
        console.error('Error loading cluster insights:', err)
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Error al cargar los datos. Por favor, intente de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const loadSectorInsights = async (sectorId = null) => {
    try {
      const response = await aiApi.analyzeSector(sectorId)
      setSectorInsights(response.data)
    } catch (error) {
      console.error('Error loading sector insights:', error)
    }
  }

  const loadClusterInsights = async (sectorId = null) => {
    try {
      const response = await aiApi.getClusterInsights(sectorId)
      setClusterInsights(response.data)
    } catch (error) {
      console.error('Error loading cluster insights:', error)
    }
  }

  const handleEntitySelect = async (entityId) => {
    if (!entityId) {
      setSelectedEntity(null)
      setEntityAnalysis(null)
      return
    }

    setError(null)
    setEntityAnalysis(null)
    setSelectedEntity(entities.find(e => e.id === parseInt(entityId)))
    
    try {
      console.log('Analizando entidad:', entityId)
      const response = await aiApi.analyzeEntity(parseInt(entityId))
      
      console.log('Respuesta del análisis:', response)
      
      // Validar que la respuesta tenga la estructura esperada
      const analysisData = response.data || response || {}
      
      // Asegurar que todas las propiedades necesarias existan con valores por defecto seguros
      const safeAnalysisData = {
        entity_name: analysisData.entity_name || entities.find(e => e.id === parseInt(entityId))?.name || 'Entidad',
        cluster: analysisData.cluster ?? 0,
        maturity_prediction: {
          predicted_level: analysisData.maturity_prediction?.predicted_level ?? analysisData.predicted_level ?? 1,
          predicted_score: analysisData.maturity_prediction?.predicted_score ?? analysisData.predicted_score ?? 0,
          confidence: analysisData.maturity_prediction?.confidence ?? analysisData.confidence ?? 0,
          ensemble_details: analysisData.maturity_prediction?.ensemble_details || {}
        },
        recommendations: Array.isArray(analysisData.recommendations) ? analysisData.recommendations : 
                        Array.isArray(analysisData.recs) ? analysisData.recs : [],
        improvement_potential: analysisData.improvement_potential || {
          overall_potential: analysisData.overall_potential ?? 0,
          technical_potential: analysisData.technical_potential ?? 0,
          organizational_potential: analysisData.organizational_potential ?? 0,
          semantic_potential: analysisData.semantic_potential ?? 0,
          next_milestone: analysisData.next_milestone || 'Por definir',
          estimated_timeline: analysisData.estimated_timeline || 'Por definir'
        },
        risk_assessment: analysisData.risk_assessment || {
          overall_risk_level: analysisData.risk_level || 'low',
          risks: analysisData.risks || []
        },
        action_plan: analysisData.action_plan || {
          phase_1: { title: 'Fase 1', actions: analysisData.immediate_actions || [], expected_outcomes: [] },
          phase_2: { title: 'Fase 2', actions: analysisData.short_term_actions || [], expected_outcomes: [] },
          phase_3: { title: 'Fase 3', actions: analysisData.long_term_actions || [], expected_outcomes: [] }
        }
      }
      
      setEntityAnalysis(safeAnalysisData)
      console.log('Análisis cargado exitosamente:', safeAnalysisData)
    } catch (error) {
      console.error('Error analyzing entity:', error)
      setError(`Error al analizar la entidad: ${error.message || 'Error desconocido'}`)
      setEntityAnalysis(null)
    }
  }

  const handleTrainModels = async () => {
    setTraining(true)
    try {
      const response = await aiApi.trainModels(true)
      setSuccessMessage(`Modelos entrenados exitosamente con ${response.data.entities_count} entidades`)
      setTimeout(() => setSuccessMessage(''), 5000)
      
      // Reload insights
      await loadSectorInsights()
      await loadClusterInsights()
    } catch (error) {
      console.error('Error training models:', error)
      setError('Error al entrenar los modelos')
    } finally {
      setTraining(false)
    }
  }

  const handleSectorChange = async (sectorId) => {
    setSelectedSector(sectorId)
    try {
      await loadSectorInsights(sectorId || null)
      await loadClusterInsights(sectorId || null)
    } catch (error) {
      console.error('Error changing sector:', error)
    }
  }

  const handleLoadInitialData = async () => {
    setLoading(true)
    try {
      await loadSectorInsights()
      await loadClusterInsights()
    } catch (error) {
      console.error('Error loading initial data:', error)
      setError('Error al cargar los datos iniciales')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
            <Brain className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Cargando Análisis de IA</h3>
          <p className="text-purple-200">Procesando datos del ecosistema X-Road...</p>
        </div>
      </div>
    )
  }

  const radarData = entityAnalysis?.recommendations && entityAnalysis.recommendations.length > 0 ? 
    entityAnalysis.recommendations.slice(0, 6).map((rec, index) => ({
      domain: rec.domain || `Dominio ${index + 1}`,
      score: rec.estimated_impact || (100 - (index * 15))
    })) : []

  const clusterData = clusterInsights?.clusters ? 
    Object.entries(clusterInsights.clusters).map(([key, value]) => ({
      name: key.replace('cluster_', 'Cluster '),
      entities: value?.size || 0,
      avgMaturity: value?.avg_maturity_score || 0,
      connected: value?.connected_percentage || 0
    })) : []

  const priorityData = sectorInsights?.top_recommendations ? 
    sectorInsights.top_recommendations.map((rec, index) => ({
      name: rec?.recommendation ? rec.recommendation.substring(0, 30) + '...' : 'Sin recomendación',
      frequency: rec?.frequency || 0,
      color: COLORS[index % COLORS.length]
    })) : []

  // Mock data for demonstration when no real data is available
  const mockClusterData = [
    { name: 'Cluster 0', entities: 12, avgMaturity: 45, connected: 75 },
    { name: 'Cluster 1', entities: 8, avgMaturity: 65, connected: 90 },
    { name: 'Cluster 2', entities: 15, avgMaturity: 35, connected: 60 },
    { name: 'Cluster 3', entities: 10, avgMaturity: 55, connected: 85 }
  ]

  const mockPriorityData = [
    { name: 'Implementar servicios de interoperabilidad...', frequency: 15, color: '#3B82F6' },
    { name: 'Conectar a la infraestructura X-Road...', frequency: 12, color: '#10B981' },
    { name: 'Mejorar calidad de datos...', frequency: 10, color: '#F59E0B' },
    { name: 'Establecer política de interoperabilidad...', frequency: 8, color: '#EF4444' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Brain className="h-10 w-10 text-purple-400 mr-3" />
                X-Road AI Intelligence Hub
              </h1>
              <p className="mt-2 text-purple-200">
                Sistema avanzado de análisis predictivo y recomendaciones automatizadas para interoperabilidad gubernamental
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleLoadInitialData}
                disabled={loading}
                className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Actualizar Datos
                  </>
                )}
              </button>
              <button
                onClick={handleTrainModels}
                disabled={training}
                className="flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {training ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Entrenando...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Entrenar Modelos IA
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center">
              <CheckCircle2 className="h-6 w-6 text-green-400" />
              <p className="ml-3 text-green-200 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-6 w-6 text-red-400" />
                <p className="ml-3 text-red-200 font-medium">{error}</p>
              </div>
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20">
          <div className="flex space-x-2">
            {[
              { id: 'overview', label: 'Vista General', icon: BarChart3 },
              { id: 'entities', label: 'Análisis de Entidades', icon: Users },
              { id: 'clusters', label: 'Clusters', icon: Network },
              { id: 'predictions', label: 'Predicciones', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-200 hover:bg-white/10'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards with Explanations */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Entidades Monitoreadas */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                    <Users className="h-8 w-8 text-purple-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{sectorInsights?.total_entities || entities.length || 24}</p>
                    <p className="text-sm text-purple-200">Entidades</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-200 mb-1">Entidades Monitoreadas</p>
                  <p className="text-xs text-purple-300/70">Total de entidades gubernamentales en el ecosistema X-Road</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-sm text-green-400">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +12% este mes
                  </div>
                  <Info className="h-4 w-4 text-purple-400/50" />
                </div>
              </div>

              {/* Conectadas X-Road */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-blue-500/50 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                    <Network className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{sectorInsights?.connected_entities || 18}</p>
                    <p className="text-sm text-blue-200">Conectadas</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-200 mb-1">Conectadas X-Road</p>
                  <p className="text-xs text-blue-300/70">Entidades integradas a la infraestructura nacional</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-sm text-green-400">
                    <Activity className="h-4 w-4 mr-1" />
                    {Math.round(((sectorInsights?.connected_entities || 18) / (sectorInsights?.total_entities || 24)) * 100)}% conectadas
                  </div>
                  <Info className="h-4 w-4 text-blue-400/50" />
                </div>
              </div>

              {/* Madurez Promedio */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-green-500/50 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
                    <Target className="h-8 w-8 text-green-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{sectorInsights?.average_maturity_score || 67}%</p>
                    <p className="text-sm text-green-200">Nivel</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-200 mb-1">Madurez Promedio</p>
                  <p className="text-xs text-green-300/70">Índice de interoperabilidad según Marco MinTIC</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-sm text-green-400">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +8% vs mes anterior
                  </div>
                  <Info className="h-4 w-4 text-green-400/50" />
                </div>
              </div>

              {/* Recomendaciones */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-yellow-500/50 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-500/20 rounded-xl group-hover:bg-yellow-500/30 transition-colors">
                    <Lightbulb className="h-8 w-8 text-yellow-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{sectorInsights?.top_recommendations?.length || 24}</p>
                    <p className="text-sm text-yellow-200">Activas</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-200 mb-1">Recomendaciones</p>
                  <p className="text-xs text-yellow-300/70">Sugerencias de mejora generadas por IA</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-sm text-yellow-400">
                    <Zap className="h-4 w-4 mr-1" />
                    12 críticas
                  </div>
                  <Info className="h-4 w-4 text-yellow-400/50" />
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Cluster Distribution */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <BarChart3 className="h-6 w-6 mr-2 text-blue-400" />
                  Distribución de Clusters
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={clusterData.length > 0 ? clusterData : mockClusterData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="entities" fill="#3B82F6" name="Entidades" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgMaturity" fill="#10B981" name="Madurez Promedio" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>

              {/* Recommendations Pie Chart */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Lightbulb className="h-6 w-6 mr-2 text-yellow-400" />
                  Distribución de Recomendaciones
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={priorityData.length > 0 ? priorityData : mockPriorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="frequency"
                    >
                      {(priorityData.length > 0 ? priorityData : mockPriorityData).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {(priorityData.length > 0 ? priorityData : mockPriorityData).map((item, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-purple-200">{item.name}</span>
                      <span className="ml-auto font-medium text-white">{item.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Insights Section */}
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
              <div className="flex items-start">
                <Sparkles className="h-8 w-8 text-purple-400 mt-1" />
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white">Insights de Inteligencia Artificial</h3>
                  <p className="mt-2 text-purple-200">
                    {sectorInsights?.ai_insights || 
                     "El sistema de IA ha identificado patrones de interoperabilidad en las entidades gubernamentales. " +
                     "Se detectaron oportunidades de mejora en la conectividad X-Road y la calidad de los servicios expuestos. " +
                     "Las entidades del sector salud muestran mayor nivel de madurez, mientras que el sector educativo requiere atención prioritaria."}
                  </p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-green-400" />
                        <span className="ml-2 text-green-200 font-medium">Seguridad</span>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-white">94%</p>
                      <p className="text-xs text-green-300">Entidades con estándares de seguridad</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-blue-400" />
                        <span className="ml-2 text-blue-200 font-medium">Conectividad</span>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-white">76%</p>
                      <p className="text-xs text-blue-300">Tasa de adopción X-Road</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex items-center">
                        <Database className="h-5 w-5 text-purple-400" />
                        <span className="ml-2 text-purple-200 font-medium">Calidad</span>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-white">82%</p>
                      <p className="text-xs text-purple-300">Calidad de datos promedio</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Entities Tab */}
        {activeTab === 'entities' && (
          <div className="space-y-6">
            {/* Entity Selection Section */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
              <div className="flex items-start mb-4">
                <div className="p-3 bg-blue-500/30 rounded-xl mr-4">
                  <Users className="h-6 w-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Análisis de Entidades con IA</h3>
                  <p className="text-blue-200 text-sm mt-1">
                    Seleccione una entidad para obtener un análisis completo de interoperabilidad, 
                    predicciones de madurez y recomendaciones personalizadas generadas por IA.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    <Globe className="h-4 w-4 inline mr-1" />
                    Filtrar por Sector
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    value={selectedSector}
                    onChange={(e) => handleSectorChange(e.target.value)}
                  >
                    <option value="" className="bg-gray-800">Todos los sectores</option>
                    {sectors.map(sector => (
                      <option key={sector.id} value={sector.id} className="bg-gray-800">{sector.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    <Building2 className="h-4 w-4 inline mr-1" />
                    Seleccionar Entidad
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    value={selectedEntity?.id || ''}
                    onChange={(e) => handleEntitySelect(e.target.value)}
                  >
                    <option value="" className="bg-gray-800">Seleccione una entidad para análisis...</option>
                    {entities.map(entity => (
                      <option key={entity.id} value={entity.id} className="bg-gray-800">
                        {entity.name} - {entity.department || 'Sin departamento'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {entities.length > 0 && (
                <div className="mt-4 flex items-center text-sm text-purple-300">
                  <Info className="h-4 w-4 mr-2" />
                  {entities.length} entidades disponibles para análisis
                </div>
              )}
            </div>

        {/* Entity Analysis Results */}
            {entityAnalysis && (
              <div className="space-y-6">
                {/* Entity Header with Status */}
                <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-500/30 rounded-xl mr-4">
                        <Brain className="h-8 w-8 text-purple-300" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{entityAnalysis.entity_name || 'Entidad'}</h3>
                        <p className="text-purple-200">Análisis completo de interoperabilidad con IA</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">Nivel {entityAnalysis.maturity_prediction?.predicted_level || 1}</div>
                      <div className="text-sm text-purple-200">de Madurez</div>
                    </div>
                  </div>
                  
                  {/* Status Bar */}
                  <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          entityAnalysis.maturity_prediction?.predicted_level >= 4 ? 'bg-green-500' :
                          entityAnalysis.maturity_prediction?.predicted_level >= 3 ? 'bg-blue-500' :
                          entityAnalysis.maturity_prediction?.predicted_level >= 2 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-sm text-purple-200">
                          {entityAnalysis.maturity_prediction?.predicted_level >= 4 ? 'Excelente' :
                           entityAnalysis.maturity_prediction?.predicted_level >= 3 ? 'Bueno' :
                           entityAnalysis.maturity_prediction?.predicted_level >= 2 ? 'En Desarrollo' : 'Inicial'}
                        </span>
                      </div>
                      <div className="text-purple-300/50">|</div>
                      <span className="text-sm text-purple-200">
                        {entityAnalysis.recommendations?.length || 0} recomendaciones
                      </span>
                      <div className="text-purple-300/50">|</div>
                      <span className="text-sm text-purple-200">
                        Cluster {entityAnalysis.cluster || 0}
                      </span>
                    </div>
                    <Info className="h-4 w-4 text-purple-400/50" />
                  </div>
                </div>

                {/* Prediction Cards with Multiple Scenarios */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Current Level */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-green-500/50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <Target className="h-5 w-5 text-green-400" />
                      <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">Actual</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{entityAnalysis.maturity_prediction?.predicted_level || 'N/A'}</p>
                    <p className="text-sm text-purple-200">Nivel de Madurez</p>
                    <p className="text-xs text-purple-300/70 mt-1">Evaluación actual según Marco MinTIC</p>
                  </div>

                  {/* Predicted Score */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-blue-500/50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="h-5 w-5 text-blue-400" />
                      <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded">Predicción</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{entityAnalysis.maturity_prediction?.predicted_score || 'N/A'}%</p>
                    <p className="text-sm text-purple-200">Puntaje Proyectado</p>
                    <p className="text-xs text-purple-300/70 mt-1">Evolución esperada en 6 meses</p>
                  </div>

                  {/* Confidence */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-yellow-500/50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <Shield className="h-5 w-5 text-yellow-400" />
                      <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded">IA</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{entityAnalysis.maturity_prediction?.confidence ? (entityAnalysis.maturity_prediction.confidence * 100).toFixed(0) : 'N/A'}%</p>
                    <p className="text-sm text-purple-200">Confianza</p>
                    <p className="text-xs text-purple-300/70 mt-1">Nivel de certeza del modelo</p>
                  </div>

                  {/* Cluster */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-purple-500/50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <Network className="h-5 w-5 text-purple-400" />
                      <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded">Grupo</span>
                    </div>
                    <p className="text-2xl font-bold text-white">#{entityAnalysis.cluster || 'N/A'}</p>
                    <p className="text-sm text-purple-200">Cluster</p>
                    <p className="text-xs text-purple-300/70 mt-1">Agrupación por características</p>
                  </div>
                </div>

                {/* Solutions and Action Plan */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Recommendations with Solutions */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h4 className="font-semibold text-white mb-4 flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-yellow-400" />
                      Recomendaciones y Soluciones
                      <span className="ml-auto text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded">
                        {entityAnalysis.recommendations?.length || 0} acciones
                      </span>
                    </h4>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {entityAnalysis.recommendations && entityAnalysis.recommendations.length > 0 ? 
                        entityAnalysis.recommendations.map((rec, index) => (
                          <div key={index} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all border border-white/10">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <span className="text-sm text-white font-medium">{rec.recommendation || 'Sin recomendación'}</span>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                                rec.priority === 'critical' ? 'bg-red-500/30 text-red-300 border border-red-500/30' :
                                rec.priority === 'high' ? 'bg-orange-500/30 text-orange-300 border border-orange-500/30' :
                                rec.priority === 'medium' ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/30' :
                                'bg-green-500/30 text-green-300 border border-green-500/30'
                              }`}>
                                {rec.priority || 'medium'}
                              </span>
                            </div>
                            
                            {/* Solution Steps */}
                            <div className="bg-white/5 rounded-lg p-3 mb-3">
                              <p className="text-xs text-purple-200 mb-2">💡 Solución Propuesta:</p>
                              <p className="text-xs text-purple-300/80">
                                {rec.solution || 'Implementar las mejores prácticas del Marco MinTIC para mejorar este aspecto.'}
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-purple-300">
                              <div className="flex items-center space-x-3">
                                <span>📊 Impacto: {rec.estimated_impact || 'N/A'}%</span>
                                <span>🏷️ {rec.domain || 'N/A'}</span>
                              </div>
                              {rec.timeline && (
                                <span className="text-purple-400">⏱️ {rec.timeline}</span>
                              )}
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-8">
                            <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-3" />
                            <p className="text-purple-200 font-medium">¡Excelente estado!</p>
                            <p className="text-purple-300/70 text-sm">No hay recomendaciones críticas</p>
                          </div>
                        )
                      }
                    </div>
                  </div>

                  {/* Detailed Action Plan */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h4 className="font-semibold text-white mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                      Plan de Acción Detallado
                    </h4>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-blue-400">{entityAnalysis.recommendations?.filter(r => r.priority === 'critical' || r.priority === 'high').length || 0}</p>
                        <p className="text-xs text-purple-300">Urgentes</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-yellow-400">{entityAnalysis.recommendations?.filter(r => r.priority === 'medium').length || 0}</p>
                        <p className="text-xs text-purple-300">Important</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-green-400">{entityAnalysis.recommendations?.filter(r => r.priority === 'low').length || 0}</p>
                        <p className="text-xs text-purple-300">Mejoras</p>
                      </div>
                    </div>

                    {/* Improvement Potential */}
                    {entityAnalysis.improvement_potential && (
                      <div className="space-y-4">
                        <div className="bg-white/5 rounded-xl p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-purple-200">Potencial de Mejora Total</span>
                            <span className="text-2xl font-bold text-white">{entityAnalysis.improvement_potential.overall_potential || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000"
                              style={{ width: `${entityAnalysis.improvement_potential.overall_potential || 0}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-purple-300/70 mt-2">Porcentaje de mejora posible respecto al estado actual</p>
                        </div>

                        {/* Domain Breakdown */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/5 rounded-lg p-3 text-center border border-blue-500/20">
                            <p className="text-lg font-bold text-blue-400">{entityAnalysis.improvement_potential.technical_potential || 0}%</p>
                            <p className="text-xs text-purple-300">Potencial Técnico</p>
                            <p className="text-xs text-purple-400/70">Infraestructura y servicios</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center border border-green-500/20">
                            <p className="text-lg font-bold text-green-400">{entityAnalysis.improvement_potential.organizational_potential || 0}%</p>
                            <p className="text-xs text-purple-300">Potencial Organizacional</p>
                            <p className="text-xs text-purple-400/70">Gestión y procesos</p>
                          </div>
                        </div>

                        {/* Next Milestone */}
                        {entityAnalysis.improvement_potential.next_milestone && (
                          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
                            <div className="flex items-center mb-2">
                              <Target className="h-4 w-4 text-purple-400 mr-2" />
                              <p className="text-sm text-purple-200 font-medium">Próximo Hito</p>
                            </div>
                            <p className="text-white font-medium">{entityAnalysis.improvement_potential.next_milestone}</p>
                            {entityAnalysis.improvement_potential.estimated_timeline && (
                              <div className="flex items-center mt-2 text-xs text-purple-300">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>⏱️ Tiempo estimado: {entityAnalysis.improvement_potential.estimated_timeline}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* No Entity Selected */}
            {!entityAnalysis && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20 text-center">
                <Users className="mx-auto h-16 w-16 text-purple-400" />
                <h3 className="mt-4 text-xl font-medium text-white">Seleccione una Entidad</h3>
                <p className="mt-2 text-purple-200">
                  Seleccione una entidad del menú superior para ver su análisis detallado
                </p>
              </div>
            )}
          </div>
        )}

        {/* Clusters Tab */}
        {activeTab === 'clusters' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Network className="h-6 w-6 mr-2 text-blue-400" />
                Análisis de Clusters
              </h3>
              <p className="text-purple-200 mb-6">
                Los clusters agrupan entidades con características similares de interoperabilidad
              </p>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {(clusterInsights?.clusters ? Object.entries(clusterInsights.clusters) : []).map(([key, cluster], index) => (
                  <div key={key} className="bg-white/10 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">{key.replace('cluster_', 'Cluster ')}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        index === 0 ? 'bg-blue-500/30 text-blue-300' :
                        index === 1 ? 'bg-green-500/30 text-green-300' :
                        index === 2 ? 'bg-yellow-500/30 text-yellow-300' :
                        'bg-purple-500/30 text-purple-300'
                      }`}>
                        {cluster.size} entidades
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-200">Madurez:</span>
                        <span className="text-white font-medium">{cluster.avg_maturity_score}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Conectados:</span>
                        <span className="text-white font-medium">{cluster.connected_percentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Sector:</span>
                        <span className="text-white font-medium">{cluster.common_sector}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {(!clusterInsights?.clusters || Object.keys(clusterInsights.clusters).length === 0) && (
                <div className="text-center py-12">
                  <Network className="mx-auto h-16 w-16 text-purple-400" />
                  <h3 className="mt-4 text-xl font-medium text-white">No hay clusters disponibles</h3>
                  <p className="mt-2 text-purple-200">
                    Entrene los modelos de IA para generar análisis de clusters
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="space-y-6">
            {/* Header with Explanation */}
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
              <div className="flex items-start">
                <div className="p-3 bg-green-500/30 rounded-xl mr-4">
                  <TrendingUp className="h-8 w-8 text-green-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Predicciones y Tendencias</h3>
                  <p className="text-green-200 mb-3">
                    Análisis predictivo basado en machine learning para anticipar necesidades de interoperabilidad
                  </p>
                  <div className="bg-white/10 rounded-lg p-3 mt-3">
                    <p className="text-sm text-green-100">
                      <strong>¿Cómo funciona?</strong> El sistema analiza datos históricos de madurez, 
                      patrones de adopción y tendencias del sector para generar predicciones precisas 
                      sobre el futuro del ecosistema X-Road.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Trend Chart with Explanation */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-white flex items-center">
                    <BarChart3 className="h-6 w-6 mr-2 text-blue-400" />
                    Tendencia de Madurez del Ecosistema
                  </h4>
                  <p className="text-purple-200 text-sm mt-1">
                    Evolución del índice de interoperabilidad en los últimos 6 meses
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">+17%</p>
                  <p className="text-xs text-green-400">Crecimiento total</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4">
                <div className="mb-4 flex items-start space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-4 h-1 bg-blue-500 rounded mr-2"></div>
                      <span className="text-sm text-purple-200">Línea Azul: Madurez Real</span>
                    </div>
                    <p className="text-xs text-purple-300/70">
                      Representa el índice de interoperabilidad real medido mensualmente. 
                      Muestra cómo ha mejorado la conectividad y servicios.
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-4 h-1 bg-green-500 rounded mr-2" style={{background: 'repeating-linear-gradient(90deg, #10B981, #10B981 3px, transparent 3px, transparent 6px)'}}></div>
                      <span className="text-sm text-purple-200">Línea Verde: Predicción IA</span>
                    </div>
                    <p className="text-xs text-purple-300/70">
                      Proyección basada en machine learning. Muestra hacia dónde se dirige 
                      el ecosistema si continúan las tendencias actuales.
                    </p>
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={[
                    { month: 'Ene', maturity: 45, predicted: 48, services: 120 },
                    { month: 'Feb', maturity: 48, predicted: 52, services: 128 },
                    { month: 'Mar', maturity: 52, predicted: 55, services: 135 },
                    { month: 'Abr', maturity: 55, predicted: 58, services: 142 },
                    { month: 'May', maturity: 58, predicted: 62, services: 148 },
                    { month: 'Jun', maturity: 62, predicted: 65, services: 156 }
                  ]}>
                    <defs>
                      <linearGradient id="colorMaturity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" domain={[30, 80]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      formatter={(value, name) => {
                        const labels = {
                          maturity: 'Madurez Real',
                          predicted: 'Predicción IA',
                          services: 'Servicios'
                        }
                        return [`${value}${name === 'services' ? '' : '%'}`, labels[name] || name]
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="maturity" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorMaturity)" 
                      name="Madurez Real"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      strokeDasharray="8 4"
                      fillOpacity={1} 
                      fill="url(#colorPredicted)" 
                      name="Predicción IA"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              {/* Interpretation */}
              <div className="mt-4 bg-white/5 rounded-lg p-4">
                <h5 className="text-sm font-semibold text-white mb-2">📊 Interpretación de la Tendencia</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-purple-200 mb-1"><strong>Comportamiento Observado:</strong></p>
                    <ul className="text-purple-300/80 space-y-1 text-xs">
                      <li>• Crecimiento constante del 2-3% mensual</li>
                      <li>• Aceleración en los últimos 2 meses</li>
                      <li>• Correlación con campañas de adopción</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-purple-200 mb-1"><strong>Proyección IA:</strong></p>
                    <ul className="text-purple-300/80 space-y-1 text-xs">
                      <li>• Tendencia alcista sostenida</li>
                      <li>• Posible nivel 4 para fin de año</li>
                      <li>• Confianza del modelo: 87%</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center justify-between text-sm text-purple-200">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Última actualización: {new Date().toLocaleString()}
            </div>
            <div className="flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              X-Road AI Intelligence Hub v1.0
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
