import { useState, useEffect } from 'react'
import { servicesApi, sectorsApi } from '../services/api'
import clsx from 'clsx'

export default function MatrizServicios() {
  const [services, setServices] = useState([])
  const [sectors, setSectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    protocol: '',
    category: ''
  })

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      const [servicesRes, sectorsRes] = await Promise.all([
        servicesApi.getAll({ limit: 100, ...filters }),
        sectorsApi.getAll({ limit: 100 })
      ])
      setServices(servicesRes.data.items)
      setSectors(sectorsRes.data.items)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const protocols = ['REST', 'SOAP', 'X-Road']
  const categories = ['Consulta', 'Validación', 'Trámite', 'Autenticación']

  const protocolColors = {
    REST: 'bg-blue-100 text-blue-800',
    SOAP: 'bg-purple-100 text-purple-800',
    'X-Road': 'bg-green-100 text-green-800'
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
        <h1 className="text-2xl font-bold text-gray-900">Matriz de Servicios</h1>
        <p className="mt-1 text-sm text-gray-500">
          Vista de servicios de interoperabilidad por sector y protocolo
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="form-label">Protocolo</label>
            <select
              className="form-select"
              value={filters.protocol}
              onChange={(e) => setFilters(prev => ({ ...prev, protocol: e.target.value }))}
            >
              <option value="">Todos los protocolos</option>
              {protocols.map(proto => (
                <option key={proto} value={proto}>{proto}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Categoría</label>
            <select
              className="form-select"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="btn btn-secondary w-full"
              onClick={() => setFilters({ protocol: '', category: '' })}
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        {protocols.map(proto => {
          const count = services.filter(s => s.protocol === proto).length
          return (
            <div key={proto} className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-medium text-gray-500">{proto}</div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">{count}</div>
            </div>
          )
        })}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-500">Total Servicios</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{services.length}</div>
        </div>
      </div>

      {/* Services Matrix */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Servicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Protocolo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-500">{service.code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {service.entity_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.category || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={clsx('status-badge', protocolColors[service.protocol])}>
                      {service.protocol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={clsx(
                      'status-badge',
                      service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    )}>
                      {service.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}