import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import { entitiesApi, sectorsApi } from '../services/api'
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

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta entidad?')) {
      try {
        await entitiesApi.delete(id)
        fetchEntities()
      } catch (error) {
        console.error('Error deleting entity:', error)
      }
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entidades</h1>
          <p className="mt-1 text-sm text-gray-500">Gestión de entidades públicas del ecosistema X-Road</p>
        </div>
        <button className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Entidad
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
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
      <div className="table-container">
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
                    <div className="font-medium text-gray-900">{entity.name}</div>
                    <div className="text-sm text-gray-500">{entity.acronym} • NIT: {entity.nit}</div>
                  </div>
                </td>
                <td>{entity.sector_name}</td>
                <td>{entity.department || '-'}</td>
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
                  ) : '-'}
                </td>
                <td>{entity.services_count || 0}</td>
                <td>
                  <div className="flex space-x-2">
                    <button className="text-primary-600 hover:text-primary-900">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(entity.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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