import { useState, useEffect } from 'react'
import { Download, FileText, Table, BarChart, Lightbulb, AlertTriangle, CheckCircle, XCircle, HelpCircle } from 'lucide-react'
import { entitiesApi, servicesApi, maturityApi, dashboardApi } from '../services/api'

export default function Reportes() {
  const [stats, setStats] = useState({
    entities: 0,
    services: 0,
    assessments: 0
  })
  const [loading, setLoading] = useState(true)
  const [downloadingType, setDownloadingType] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [recommendationsLoading, setRecommendationsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchRecommendations()
  }, [])

  const fetchStats = async () => {
    try {
      const [entitiesRes, servicesRes, assessmentsRes] = await Promise.all([
        entitiesApi.getAll({ limit: 1 }),
        servicesApi.getAll({ limit: 1 }),
        maturityApi.getAssessments({ limit: 100 })
      ])
      setStats({
        entities: entitiesRes.data.total,
        services: servicesRes.data.total,
        assessments: assessmentsRes.data.length
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const res = await fetch('/api/v1/ai/analyze/sector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector_id: null })
      })
      const data = await res.json()
      if (data.data?.top_recommendations) {
        setRecommendations(data.data.top_recommendations)
      } else if (data.data?.recommendations) {
        setRecommendations(data.data.recommendations.slice(0, 5))
      } else {
        setRecommendations([])
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      setRecommendations([])
    } finally {
      setRecommendationsLoading(false)
    }
  }

  const getPriorityIcon = (priority) => {
    if (priority === 'high') return <AlertTriangle className="h-5 w-5 text-red-500" />
    if (priority === 'medium') return <HelpCircle className="h-5 w-5 text-yellow-500" />
    return <CheckCircle className="h-5 w-5 text-green-500" />
  }

  const getDomainColor = (domain) => {
    const colors = {
      technical: 'bg-blue-100 text-blue-800',
      organizational: 'bg-purple-100 text-purple-800',
      semantic: 'bg-green-100 text-green-800',
      legal: 'bg-orange-100 text-orange-800'
    }
    return colors[domain] || 'bg-gray-100 text-gray-800'
  }

  const reports = [
    {
      title: 'Reporte de Entidades',
      description: 'Listado completo de entidades con su estado de conexión X-Road',
      icon: Table,
      count: stats.entities,
      type: 'entities'
    },
    {
      title: 'Reporte de Servicios',
      description: 'Inventario de servicios de interoperabilidad por protocolo',
      icon: FileText,
      count: stats.services,
      type: 'services'
    },
    {
      title: 'Reporte de Madurez',
      description: 'Evaluaciones de madurez por entidad y nivel',
      icon: BarChart,
      count: stats.assessments,
      type: 'maturity'
    }
  ]

  const handleDownload = async (type) => {
    setDownloadingType(type)
    try {
      let filename
      let directUrl
      
      switch (type) {
        case 'entities':
          filename = 'reporte_entidades.xlsx'
          directUrl = '/api/v1/reports/entities/xlsx'
          break
        case 'services':
          filename = 'reporte_servicios.xlsx'
          directUrl = '/api/v1/reports/services/xlsx'
          break
        case 'maturity':
          filename = 'reporte_madurez.xlsx'
          directUrl = '/api/v1/reports/maturity/xlsx'
          break
        default:
          console.error('Tipo de reporte no válido')
          return
      }
      
      const link = document.createElement('a')
      link.href = directUrl
      link.download = filename
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
      }, 100)

    } catch (error) {
      console.error('Error downloading report:', error)
      alert(`Error al descargar el reporte. Por favor, intente de nuevo.`)
    } finally {
      setDownloadingType(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generación y descarga de reportes del ecosistema X-Road
        </p>
      </div>

      {/* Report Cards */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Download className="h-5 w-5 text-primary-600" />
          Descargar Reportes
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <div key={report.type} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <report.icon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">{report.title}</h4>
                  <p className="text-sm text-gray-500">{report.description}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-semibold text-gray-900">{report.count}</span>
                  <span className="text-sm text-gray-500 ml-1">registros</span>
                </div>
                <button
                  onClick={() => handleDownload(report.type)}
                  disabled={downloadingType !== null}
                  className="btn btn-primary"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloadingType === report.type ? 'Descargando...' : 'Descargar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Instrucciones</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
          <li>Los reportes se generan en formato Excel (.xlsx)</li>
          <li>Los datos se actualizan en tiempo real desde la base de datos</li>
          <li>Los reportes incluyen todos los campos disponibles del ecosistema</li>
        </ul>
      </div>

      {/* Recomendaciones Técnicas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Recomendaciones Técnicas
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Recomendaciones priorizadas basadas en el análisis del ecosistema de interoperabilidad
        </p>
        
        {recommendationsLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No hay recomendaciones disponibles</p>
            <p className="text-sm">Ejecute primero el análisis de entidades</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getPriorityIcon(rec.priority)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{rec.recommendation}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getDomainColor(rec.domain)}`}>
                      {rec.domain}
                    </span>
                    <span className="text-xs text-gray-500">
                      Frecuencia: {rec.frequency} entidades
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
