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
            <div key={proto} className="data-card">
              <div className="text-sm font-medium text-gray-500">{proto}</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">{count}</div>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  proto === 'REST' ? 'bg-blue-500' :
                  proto === 'SOAP' ? 'bg-purple-500' : 'bg-green-500'
                }`}></div>
                Servicios {proto}
              </div>
            </div>
          )
        })}
        <div className="data-card">
          <div className="text-sm font-medium text-gray-500">Total Servicios</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{services.length}</div>
          <div className="mt-2 flex items-center text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-primary-500 mr-2"></div>
            Todos los protocolos
          </div>
        </div>
      </div>

      {/* Services Matrix */}
      <div className="table-scientific">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Entidad</th>
                <th>Categoría</th>
                <th>Protocolo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>
                    <div>
                      <div className="font-semibold text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{service.code}</div>
                    </div>
                  </td>
                  <td>
                    <span className="text-gray-700 font-medium">{service.entity_name}</span>
                  </td>
                  <td>
                    <span className="text-gray-600">{service.category || '-'}</span>
                  </td>
                  <td>
                    <span className={clsx('status-badge', protocolColors[service.protocol])}>
                      {service.protocol}
                    </span>
                  </td>
                  <td>
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