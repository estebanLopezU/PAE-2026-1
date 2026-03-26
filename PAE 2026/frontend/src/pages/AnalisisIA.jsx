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
  Zap
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts'
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
      
      setEntities(entitiesRes.data.items || [])
      setSectors(sectorsRes.data.items || [])
      
      // Load initial AI insights
      await loadSectorInsights()
      await loadClusterInsights()
      
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

    try {
      const response = await aiApi.analyzeEntity(parseInt(entityId))
      setEntityAnalysis(response.data)
      setSelectedEntity(entities.find(e => e.id === parseInt(entityId)))
    } catch (error) {
      console.error('Error analyzing entity:', error)
      setError('Error al analizar la entidad')
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
    await loadSectorInsights(sectorId || null)
    await loadClusterInsights(sectorId || null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const radarData = entityAnalysis ? Object.entries(entityAnalysis.maturity_prediction.recommendations).map(([key, value], index) => ({
    domain: `Recomendación ${index + 1}`,
    score: 100 - (index * 15)
  })) : []

  const clusterData = clusterInsights?.clusters ? Object.entries(clusterInsights.clusters).map(([key, value]) => ({
    name: key.replace('cluster_', 'Cluster '),
    entities: value.size,
    avgMaturity: value.avg_maturity_score,
    connected: value.connected_percentage
  })) : []

  const priorityData = sectorInsights?.top_recommendations ? sectorInsights.top_recommendations.map((rec, index) => ({
    name: rec.recommendation.substring(0, 30) + '...',
    frequency: rec.frequency,
    color: COLORS[index % COLORS.length]
  })) : []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Brain className="h-8 w-8 text-purple-600 mr-3" />
            Análisis de Inteligencia Artificial
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Análisis predictivo y recomendaciones automatizadas para interoperabilidad
          </p>
        </div>
        <button
          onClick={handleTrainModels}
          disabled={training}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            training
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          {training ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Entrenando...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Entrenar Modelos
            </>
          )}
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchData}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sector Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="form-label">Filtrar por Sector</label>
            <select
              className="form-select"
              value={selectedSector}
              onChange={(e) => handleSectorChange(e.target.value)}
            >
              <option value="">Todos los sectores</option>
              {sectors.map(sector => (
                <option key={sector.id} value={sector.id}>{sector.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Seleccionar Entidad para Análisis</label>
            <select
              className="form-select"
              value={selectedEntity?.id || ''}
              onChange={(e) => handleEntitySelect(e.target.value)}
            >
              <option value="">Seleccione una entidad...</option>
              {entities.map(entity => (
                <option key={entity.id} value={entity.id}>
                  {entity.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* AI Overview Cards */}
      {sectorInsights && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Entidades Analizadas</dt>
                  <dd className="text-lg font-medium text-gray-900">{sectorInsights.total_entities}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Madurez Promedio</dt>
                  <dd className="text-lg font-medium text-gray-900">{sectorInsights.average_maturity_score}%</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Nivel Promedio</dt>
                  <dd className="text-lg font-medium text-gray-900">{sectorInsights.average_maturity_level}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Recomendaciones</dt>
                  <dd className="text-lg font-medium text-gray-900">{sectorInsights.top_recommendations?.length || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {sectorInsights?.ai_insights && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
          <div className="flex">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-purple-900">Insights de IA</h3>
              <p className="mt-2 text-purple-800">{sectorInsights.ai_insights}</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cluster Distribution */}
        {clusterData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Distribución de Clusters
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clusterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="entities" fill="#3B82F6" name="Entidades" />
                <Bar dataKey="avgMaturity" fill="#10B981" name="Madurez Promedio" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Recommendations */}
        {priorityData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
              Recomendaciones Principales
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, frequency }) => `${frequency}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="frequency"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {priorityData.map((item, index) => (
                <div key={index} className="flex items-center text-sm">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-600">{item.name}</span>
                  <span className="ml-auto font-medium">{item.frequency}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Entity Analysis */}
      {entityAnalysis && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-600" />
            Análisis de Entidad: {entityAnalysis.entity_name}
          </h3>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Prediction Results */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Predicción de Madurez</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Nivel Actual:</span>
                  <span className="font-medium">{entityAnalysis.maturity_prediction.predicted_level}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Puntaje Predicho:</span>
                  <span className="font-medium">{entityAnalysis.maturity_prediction.predicted_score}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Confianza:</span>
                  <span className="font-medium">{entityAnalysis.maturity_prediction.confidence * 100}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cluster:</span>
                  <span className="font-medium">Cluster {entityAnalysis.cluster}</span>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recomendaciones de IA</h4>
              <div className="space-y-3">
                {entityAnalysis.recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-900">{rec.recommendation}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Dominio: {rec.domain}</span>
                      <span>Impacto: {rec.estimated_impact}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cluster Details */}
      {clusterInsights?.clusters && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            Detalles de Clusters
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(clusterInsights.clusters).map(([key, cluster]) => (
              <div key={key} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  {key.replace('cluster_', 'Cluster ')}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Entidades:</span>
                    <span className="font-medium">{cluster.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Madurez Promedio:</span>
                    <span className="font-medium">{cluster.avg_maturity_score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conectados:</span>
                    <span className="font-medium">{cluster.connected_percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sector Común:</span>
                    <span className="font-medium">Sector {cluster.common_sector}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!sectorInsights && !clusterInsights && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Brain className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay análisis disponibles</h3>
          <p className="mt-1 text-sm text-gray-500">
            Entrene los modelos de IA para generar análisis y recomendaciones.
          </p>
          <div className="mt-6">
            <button
              onClick={handleTrainModels}
              disabled={training}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              <Zap className="-ml-1 mr-2 h-5 w-5" />
              Entrenar Modelos
            </button>
          </div>
        </div>
      )}
    </div>
  )
}