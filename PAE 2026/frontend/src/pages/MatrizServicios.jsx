import { useState, useEffect } from 'react'
import { servicesApi, sectorsApi } from '../services/api'
import clsx from 'clsx'
import { RefreshCw, CheckCircle, XCircle, Clock, Database, Zap, Shield, Box } from 'lucide-react'
import GlassCard from '../components/common/GlassCard'
import StatusPulse from '../components/common/StatusPulse'

export default function MatrizServicios() {
  const [services, setServices] = useState([])
  const [sectors, setSectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    protocol: '',
    category: ''
  })
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    fetchData()
    
    const interval = setInterval(() => {
      fetchData()
      setLastUpdate(new Date())
    }, 30000)
    
    return () => clearInterval(interval)
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
    REST: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    SOAP: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    'X-Road': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  }

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
               <Database className="h-6 w-6 text-blue-400" />
             </div>
             <h1 className="text-4xl font-bold tracking-tight text-white uppercase">Matriz de Servicios</h1>
          </div>
          <p className="text-slate-400 font-medium max-w-xl">
             Catálogo centralizado de activos de información y endpoints de interoperabilidad. Última sincronización: <span className="text-blue-400 font-mono">{lastUpdate.toLocaleTimeString()}</span>
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <GlassCard className="p-6 border-slate-700/50">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Protocolo</label>
            <select
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none"
              value={filters.protocol}
              onChange={(e) => setFilters(prev => ({ ...prev, protocol: e.target.value }))}
            >
              <option value="">TODOS LOS PROTOCOLOS</option>
              {protocols.map(proto => (
                <option key={proto} value={proto}>{proto.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Categoría</label>
            <select
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500/50 outline-none"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">TODAS LAS CATEGORÍAS</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="w-full flex items-center justify-center gap-2 px-6 py-3 text-slate-400 bg-slate-800/50 border border-slate-700 hover:bg-slate-700 hover:text-white rounded-xl font-bold transition-all"
              onClick={() => setFilters({ protocol: '', category: '' })}
            >
              <RefreshCw className="h-4 w-4" />
              RESTABLECER FILTROS
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {protocols.map(proto => {
          const count = services.filter(s => s.protocol === proto).length
          return (
            <GlassCard key={proto} className="p-5 border-t-2" style={{ borderTopColor: proto === 'REST' ? '#60A5FA' : proto === 'SOAP' ? '#A78BFA' : '#34D399' }}>
               <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{proto} ENDPOINTS</p>
                  <Box className="h-4 w-4 text-slate-600" />
               </div>
               <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{count}</span>
                  <span className="text-xs font-bold text-slate-500">ACTIVOS</span>
               </div>
            </GlassCard>
          )
        })}
        <GlassCard className="p-5 bg-blue-600/10 border-blue-500/30">
           <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">TOTAL ECOSYSTEM</p>
              <Zap className="h-4 w-4 text-blue-400" />
           </div>
           <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{services.length}</span>
              <span className="text-xs font-bold text-blue-500">TOTAL</span>
           </div>
        </GlassCard>
      </div>

      {/* Main Table Section */}
      <GlassCard className="overflow-hidden border-slate-700/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Servicio / Identificador</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Entidad Proveedora</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Categoría</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocolo</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Estado Operativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{service.name}</div>
                      <div className="text-[10px] font-mono font-bold text-slate-600">{service.code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                       <Shield className="h-3.5 w-3.5 text-blue-500/50" />
                       <span className="font-medium text-slate-300">{service.entity_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       {service.category || 'GENERAL'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={clsx('px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest', protocolColors[service.protocol] || 'bg-slate-800 border-slate-700 text-slate-400')}>
                      {service.protocol}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex justify-center">
                        <StatusPulse status={service.status === 'active' ? 'success' : 'error'} size="sm" />
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {services.length === 0 && (
          <div className="p-12 text-center">
             <Box className="h-12 w-12 text-slate-800 mx-auto mb-4" />
             <p className="text-slate-500 font-bold uppercase tracking-widest">No matching service assets found</p>
          </div>
        )}
      </GlassCard>
    </div>
  )
}