import { useState, useEffect } from 'react'
import { Search, Eye, Plus, Filter, X, Building2, ShieldCheck, Zap, Box } from 'lucide-react'
import { entitiesApi, sectorsApi, servicesApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import clsx from 'clsx'
import GlassCard from '../components/common/GlassCard'
import StatusPulse from '../components/common/StatusPulse'

const xroadStatusConfig = {
  connected: { label: 'Conectado', status: 'success', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  pending: { label: 'Pendiente', status: 'warning', text: 'text-amber-400', bg: 'bg-amber-500/10' },
  not_connected: { label: 'Sin Conexión', status: 'error', text: 'text-rose-400', bg: 'bg-rose-500/10' }
}

const maturityConfig = {
  1: { label: 'Inicial', color: 'bg-rose-500' },
  2: { label: 'Básico', color: 'bg-orange-500' },
  3: { label: 'Intermedio', color: 'bg-blue-500' },
  4: { label: 'Avanzado', color: 'bg-emerald-500' }
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
  const [expandedEntityId, setExpandedEntityId] = useState(null)
  const [entityServices, setEntityServices] = useState({})
  const [servicesLoadingByEntity, setServicesLoadingByEntity] = useState({})

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

  const fetchServicesByEntity = async (entityId) => {
    try {
      setServicesLoadingByEntity(prev => ({ ...prev, [entityId]: true }))
      const response = await servicesApi.getAll({ limit: 100, entity_id: entityId })
      setEntityServices(prev => ({ ...prev, [entityId]: response?.data?.items || [] }))
    } catch (error) {
      console.error('Error fetching services by entity:', error)
      setEntityServices(prev => ({ ...prev, [entityId]: [] }))
    } finally {
      setServicesLoadingByEntity(prev => ({ ...prev, [entityId]: false }))
    }
  }

  const handleToggleServices = async (entityId) => {
    if (expandedEntityId === entityId) {
      setExpandedEntityId(null)
      return
    }

    setExpandedEntityId(entityId)

    if (!entityServices[entityId]) {
      await fetchServicesByEntity(entityId)
    }
  }

  const hasActiveFilters = filters.search || filters.sector_id || filters.xroad_status
  const totalPages = Math.ceil(pagination.total / pagination.pageSize)

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <StatusPulse size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
               <Building2 className="h-6 w-6 text-blue-400" />
             </div>
             <h1 className="text-4xl font-bold tracking-tight text-white">Entidades</h1>
          </div>
          <p className="text-slate-400 font-medium max-w-xl">
             Gestión y monitoreo del ecosistema nacional de interoperabilidad. Actualmente sincronizando <span className="text-blue-400 font-bold">{pagination.total}</span> nodos institucionales.
          </p>
        </div>
        
        {canCreate() && (
          <button className="group flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all">
            <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
            REGISTRAR NODO
          </button>
        )}
      </div>

      {/* Control Bar */}
      <GlassCard className="p-4 border-slate-700/50">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none"
              placeholder="Buscar por nombre, sigla o NIT..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border font-bold transition-all',
              showFilters || hasActiveFilters
                ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
            )}
          >
            <Filter className="h-5 w-5" />
            FILTROS
            {hasActiveFilters && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center bg-white text-blue-600 text-[10px] rounded-full">
                {[filters.sector_id, filters.xroad_status].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Sector Institucional</label>
              <select
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none"
                value={filters.sector_id}
                onChange={(e) => handleFilterChange('sector_id', e.target.value)}
              >
                <option value="">TODOS LOS SECTORES</option>
                {sectors.map(sector => (
                  <option key={sector.id} value={sector.id}>{sector.name.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Estado de Conexión</label>
              <select
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none"
                value={filters.xroad_status}
                onChange={(e) => handleFilterChange('xroad_status', e.target.value)}
              >
                <option value="">TODOS LOS ESTADOS</option>
                <option value="connected">CONECTADO</option>
                <option value="pending">PENDIENTE</option>
                <option value="not_connected">SIN CONEXIÓN</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 rounded-xl font-bold transition-all"
              >
                <X className="h-4 w-4" />
                LIMPIAR BÚSQUEDA
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entities.map((entity) => {
          const status = xroadStatusConfig[entity.xroad_status] || xroadStatusConfig.not_connected
          const maturity = entity.maturity_level ? maturityConfig[entity.maturity_level] : null
          
          const isExpanded = expandedEntityId === entity.id
          const services = entityServices[entity.id] || []
          const isServicesLoading = servicesLoadingByEntity[entity.id]

          return (
            <GlassCard 
              key={entity.id}
              className="p-6 hover:translate-y-[-4px] transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-1 overflow-hidden">
                  <h3 className="text-xl font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                    {entity.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <ShieldCheck className="h-3 w-3 text-blue-500/50" />
                    {entity.acronym || 'SIN SIGLA'}
                  </div>
                </div>
                <StatusPulse status={status.status} />
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-800/50">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">NIT IDENTIFIER</p>
                    <p className="text-sm font-mono font-bold text-slate-200">{entity.nit}</p>
                  </div>
                  <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-800/50">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">TERRITORY</p>
                    <p className="text-sm font-bold text-slate-200 truncate">{entity.department || 'NACIONAL'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-400 bg-blue-500/5 p-3 rounded-xl border border-blue-500/10">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  <span className="truncate">{entity.sector_name || 'SIN SECTOR ASIGNADO'}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {maturity ? (
                    <div className={clsx(
                      'flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter text-white',
                      maturity.color
                    )}>
                      <Zap className="h-3 w-3" />
                      LVL {entity.maturity_level} • {maturity.label}
                    </div>
                  ) : (
                    <div className="text-[10px] font-black uppercase text-slate-600 tracking-widest">NO ASESSED</div>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase leading-none">SERVICES</p>
                    <p className="text-lg font-mono font-black text-white">{entity.services_count || 0}</p>
                  </div>
                  <button
                    onClick={() => handleToggleServices(entity.id)}
                    className={clsx(
                      'p-3 rounded-xl transition-all shadow-lg',
                      isExpanded
                        ? 'bg-blue-600 text-white shadow-blue-500/20'
                        : 'bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white hover:shadow-blue-500/20'
                    )}
                    title="Ver servicios de la entidad"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-5 rounded-xl border border-slate-800/70 bg-slate-900/40 p-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                    Servicios de la entidad
                  </p>

                  {isServicesLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <StatusPulse size="md" />
                    </div>
                  ) : services.length === 0 ? (
                    <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
                      <Box className="h-4 w-4" />
                      <span>No hay servicios registrados para esta entidad.</span>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-auto pr-1">
                      {services.map((service) => (
                        <div
                          key={service.id}
                          className="rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2"
                        >
                          <p className="text-sm font-bold text-slate-200">{service.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            Código: {service.code || 'NO REGISTRADO'}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {service.description || 'Sin descripción funcional registrada para este servicio.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          )
        })}
      </div>

      {/* Empty State */}
      {entities.length === 0 && (
        <GlassCard className="text-center py-24">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800">
            <Building2 className="h-10 w-10 text-slate-700" />
          </div>
          <h3 className="text-2xl font-bold text-white">SIN RESULTADOS EN EL NODO</h3>
          <p className="text-slate-500 mt-2 font-medium">Los parámetros de búsqueda no coinciden con registros activos.</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-6 text-blue-400 hover:text-blue-300 font-bold border-b border-blue-400/30 pb-1"
            >
              RESET FILTERS
            </button>
          )}
        </GlassCard>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
          <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
            SHOWING <span className="text-white">{(pagination.page - 1) * pagination.pageSize + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)}</span> OF {pagination.total} ENTITIES
          </p>
          <div className="flex items-center gap-3">
            <button
              className="px-6 py-2.5 text-xs font-bold text-slate-400 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-700 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              PREV
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) pageNum = i + 1
                else if (pagination.page <= 3) pageNum = i + 1
                else if (pagination.page >= totalPages - 2) pageNum = totalPages - 4 + i
                else pageNum = pagination.page - 2 + i
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                    className={clsx(
                      'w-10 h-10 text-xs font-black rounded-xl transition-all',
                      pagination.page === pageNum
                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/40'
                        : 'text-slate-500 hover:bg-slate-800'
                    )}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <button
              className="px-6 py-2.5 text-xs font-bold text-slate-400 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-700 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              disabled={pagination.page === totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              NEXT
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
