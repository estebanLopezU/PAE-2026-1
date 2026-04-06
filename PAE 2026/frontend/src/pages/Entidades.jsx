import { useState, useEffect } from 'react'
import { Search, Eye, Plus } from 'lucide-react'
import { entitiesApi, sectorsApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import clsx from 'clsx'

const xroadStatusLabels = {
  connected: 'Conectado',
  pending: 'Pendiente',
  not_connected: 'No Conectado'
}

const xroadStatusColors = {
  connected: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  not_connected: 'bg-red-100 text-red-800'
}

const maturityLevelLabels = {
  1: 'Inicial',
  2: 'Básico',
  3: 'Intermedio',
  4: 'Avanzado'
}

const maturityLevelColors = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-blue-500',
  4: 'bg-green-500'
}

export default function Entidades() {
  const { canCreate } = useAuth()
  const [entities, setEntities] = useState([])
  const [sectors, setSectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    sector_id: '',
    xroad_status: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0
  })

  useEffect(() => {
    fetchSectors()
    fetchEntities()
  }, [])

  useEffect(() => {
    fetchEntities()
  }, [filters, pagination.page])

  const fetchSectors = async () => {
    try {
      const response = await sectorsApi.getAll({ limit: 100 })
      setSectors(response.data.items)
    } catch (error) {
      console.error('Error fetching sectors:', error)
    }
  }

  const fetchEntities = async () => {
    try {
      const params = {
        skip: (pagination.page - 1) * pagination.pageSize,
        limit: pagination.pageSize,
        ...(filters.search && { search: filters.search }),
        ...(filters.sector_id && { sector_id: filters.sector_id }),
        ...(filters.xroad_status && { xroad_status: filters.xroad_status })
      }
      const response = await entitiesApi.getAll(params)
      setEntities(response.data.items)
      setPagination(prev => ({ ...prev, total: response.data.total }))
    } catch (error) {
      console.error('Error fetching entities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const totalPages = Math.ceil(pagination.total / pagination.pageSize)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entidades</h1>
          <p className="mt-1 text-sm text-gray-500">Visualización de entidades públicas del ecosistema X-Road</p>
        </div>
        {canCreate() && (
          <button className="btn btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Crear Entidad
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="data-card">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtros de Búsqueda</h3>
          <p className="text-sm text-gray-500">Encuentre entidades específicas usando los filtros</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="form-label">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="form-input pl-10"
                placeholder="Nombre, acrónimo o NIT..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="form-label">Sector</label>
            <select
              className="form-select"
              value={filters.sector_id}
              onChange={(e) => handleFilterChange('sector_id', e.target.value)}
            >
              <option value="">Todos los sectores</option>
              {sectors.map(sector => (
                <option key={sector.id} value={sector.id}>{sector.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Estado X-Road</label>
            <select
              className="form-select"
              value={filters.xroad_status}
              onChange={(e) => handleFilterChange('xroad_status', e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="connected">Conectado</option>
              <option value="pending">Pendiente</option>
              <option value="not_connected">No Conectado</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="btn btn-secondary w-full"
              onClick={() => {
                setFilters({ search: '', sector_id: '', xroad_status: '' })
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-scientific">
        <table className="data-table">
          <thead>
            <tr>
              <th>Entidad</th>
              <th>Sector</th>
              <th>Departamento</th>
              <th>Estado X-Road</th>
              <th>Madurez</th>
              <th>Servicios</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {entities.map((entity) => (
              <tr key={entity.id}>
                <td>
                  <div>
                    <div className="font-semibold text-gray-900">{entity.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{entity.acronym} • NIT: {entity.nit}</div>
                  </div>
                </td>
                <td>
                  <span className="text-gray-700 font-medium">{entity.sector_name}</span>
                </td>
                <td>
                  <span className="text-gray-600">{entity.department || '-'}</span>
                </td>
                <td>
                  <span className={clsx('status-badge', xroadStatusColors[entity.xroad_status])}>
                    {xroadStatusLabels[entity.xroad_status]}
                  </span>
                </td>
                <td>
                  {entity.maturity_level ? (
                    <span className={clsx('status-badge', maturityLevelColors[entity.maturity_level], 'text-white')}>
                      {maturityLevelLabels[entity.maturity_level]}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">Sin evaluar</span>
                  )}
                </td>
                <td>
                  <span className="font-semibold text-gray-900">{entity.services_count || 0}</span>
                </td>
                <td>
                  <div className="flex space-x-3">
                    <button className="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-all duration-200">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            className="btn btn-secondary"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Anterior
          </button>
          <span className="flex items-center px-4 text-sm text-gray-700">
            Página {pagination.page} de {totalPages}
          </span>
          <button
            className="btn btn-secondary"
            disabled={pagination.page === totalPages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}