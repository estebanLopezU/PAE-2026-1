import { useState, useEffect } from 'react'
import { Search, Eye, Plus, Filter, X, Building2, MapPin, Activity } from 'lucide-react'
import { entitiesApi, sectorsApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import clsx from 'clsx'

const xroadStatusConfig = {
  connected: { label: 'Conectado', color: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  pending: { label: 'Pendiente', color: 'bg-yellow-500', text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  not_connected: { label: 'Sin Conexion', color: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
}

const maturityConfig = {
  1: { label: 'Inicial', color: 'bg-red-500' },
  2: { label: 'Basico', color: 'bg-orange-500' },
  3: { label: 'Intermedio', color: 'bg-blue-500' },
  4: { label: 'Avanzado', color: 'bg-green-500' }
}

export default function Entidades() {
  const { canCreate } = useAuth()
  const [entities, setEntities] = useState([])
  const [sectors, setSectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    sector_id: '',
    xroad_status: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
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

  const clearFilters = () => {
    setFilters({ search: '', sector_id: '', xroad_status: '' })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const hasActiveFilters = filters.search || filters.sector_id || filters.xroad_status
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </span>
            Entidades
          </h1>
          <p className="mt-1 text-gray-500 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {pagination.total} entidades en el ecosistema X-Road
          </p>
        </div>
        {canCreate() && (
          <button className="btn btn-primary flex items-center gap-2 shadow-lg shadow-blue-500/25">
            <Plus className="h-4 w-4" />
            Nueva Entidad
          </button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Buscar por nombre, sigla o NIT..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'flex items-center gap-2 px-4 py-3 rounded-xl border transition-all',
              showFilters || hasActiveFilters
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            )}
          >
            <Filter className="h-5 w-5" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                {[filters.sector_id, filters.xroad_status].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
              <select
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado X-Road</label>
              <select
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.xroad_status}
                onChange={(e) => handleFilterChange('xroad_status', e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="connected">Conectado</option>
                <option value="pending">Pendiente</option>
                <option value="not_connected">Sin Conexion</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <X className="h-4 w-4" />
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Entity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entities.map((entity) => {
          const status = xroadStatusConfig[entity.xroad_status] || xroadStatusConfig.not_connected
          const maturity = entity.maturity_level ? maturityConfig[entity.maturity_level] : null
          
          return (
            <div 
              key={entity.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition-all duration-300 group cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {entity.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{entity.acronym}</p>
                </div>
                <span className={clsx(
                  'px-3 py-1 rounded-full text-xs font-semibold',
                  status.bg, status.text
                )}>
                  {status.label}
                </span>
              </div>
              
              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium">NIT:</span>
                  <span className="font-mono">{entity.nit}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{entity.department || 'No especificado'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span>{entity.sector_name || 'Sin sector'}</span>
                </div>
              </div>
              
              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {maturity ? (
                    <span className={clsx(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white',
                      maturity.color
                    )}>
                      <Activity className="h-3 w-3" />
                      {maturity.label}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Sin evaluar</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {entity.services_count || 0} servicios
                  </span>
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {entities.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No se encontraron entidades</h3>
          <p className="text-gray-500 mt-2">Intenta ajustar los filtros de busqueda</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-600">
            Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Anterior
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (pagination.page <= 3) {
                  pageNum = i + 1
                } else if (pagination.page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = pagination.page - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                    className={clsx(
                      'w-10 h-10 text-sm font-medium rounded-lg transition-colors',
                      pagination.page === pageNum
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <button
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={pagination.page === totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
