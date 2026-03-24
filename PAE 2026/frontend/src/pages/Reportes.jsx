import { useState, useEffect } from 'react'
import { Download, FileText, Table, BarChart } from 'lucide-react'
import { entitiesApi, servicesApi, maturityApi, reportsApi } from '../services/api'

export default function Reportes() {
  const [stats, setStats] = useState({
    entities: 0,
    services: 0,
    assessments: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [entitiesRes, servicesRes, assessmentsRes] = await Promise.all([
        entitiesApi.getAll({ limit: 1 }),
        servicesApi.getAll({ limit: 1 }),
        maturityApi.getAssessments({ limit: 1 })
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
    try {
      let response
      let filename
      
      console.log(`Iniciando descarga de reporte: ${type}`)
      
      switch (type) {
        case 'entities':
          response = await reportsApi.downloadEntitiesCsv()
          filename = 'reporte_entidades.csv'
          break
        case 'services':
          response = await reportsApi.downloadServicesCsv()
          filename = 'reporte_servicios.csv'
          break
        case 'maturity':
          response = await reportsApi.downloadMaturityCsv()
          filename = 'reporte_madurez.csv'
          break
        default:
          console.error('Tipo de reporte no válido')
          return
      }
      
      console.log('Respuesta recibida:', response)
      console.log('Tipo de datos:', typeof response.data)
      console.log('Tamaño de datos:', response.data?.length || 'N/A')
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      console.log('Blob creado:', blob.size, 'bytes')
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        console.log('Descarga completada y recursos liberados')
      }, 100)
      
    } catch (error) {
      console.error('Error downloading report:', error)
      console.error('Error details:', error.response?.data || error.message)
      alert('Error al descargar el reporte. Por favor, intente de nuevo.')
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <div key={report.type} className="bg-white rounded-lg shadow card-hover">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <report.icon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                  <p className="text-sm text-gray-500">{report.description}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-semibold text-gray-900">{report.count}</div>
                <div className="text-sm text-gray-500">registros disponibles</div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => handleDownload(report.type)}
                  className="btn btn-primary w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar CSV
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen del Ecosistema</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{stats.entities}</div>
            <div className="text-sm text-blue-600">Total Entidades</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{stats.services}</div>
            <div className="text-sm text-green-600">Total Servicios</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{stats.assessments}</div>
            <div className="text-sm text-purple-600">Evaluaciones</div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Instrucciones</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
          <li>Los reportes se generan en formato CSV compatible con Excel</li>
          <li>Los datos se actualizan en tiempo real desde la base de datos</li>
          <li>Puede filtrar los datos antes de descargar usando las páginas de cada sección</li>
          <li>Los reportes incluyen todos los campos disponibles del ecosistema</li>
        </ul>
      </div>
    </div>
  )
}