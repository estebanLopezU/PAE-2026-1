import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { entitiesApi, sectorsApi } from '../services/api'
import { Search, Filter, MapPin, Building2, Link2, Clock, XCircle, Layers, Maximize2, List, Activity, Shield, Box } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import GlassCard from '../components/common/GlassCard'
import StatusPulse from '../components/common/StatusPulse'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const xroadStatusConfig = {
  connected: { color: '#50C878', label: 'CONECTADO', icon: Link2, status: 'success' },
  pending: { color: '#F59E0B', label: 'PENDIENTE', icon: Clock, status: 'warning' },
  not_connected: { color: '#EF4444', label: 'NO CONECTADO', icon: XCircle, status: 'error' }
}

function createCustomIcon(color) {
  // Using custom SVG or better looking markers could be an enhancement
  return L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
}

function MapController({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

export default function MapaInteractivo() {
  const [entities, setEntities] = useState([])
  const [sectors, setSectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSector, setSelectedSector] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showList, setShowList] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [mapCenter, setMapCenter] = useState(null)
  const [initialZoom, setInitialZoom] = useState(6)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [entitiesRes, sectorsRes] = await Promise.all([
        entitiesApi.getAll({ limit: 200 }),
        sectorsApi.getAll({ limit: 100 })
      ])
      setEntities(entitiesRes.data.items)
      setSectors(sectorsRes.data.items)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEntities = entities.filter(entity => {
    const hasCoords = entity.latitude && entity.longitude
    const matchesSector = !selectedSector || entity.sector_id === parseInt(selectedSector)
    const matchesStatus = !selectedStatus || entity.xroad_status === selectedStatus
    const matchesSearch = !searchTerm || 
      entity.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.acronym?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.department?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSector && matchesStatus && matchesSearch && hasCoords
  })

  const handleEntityClick = (entity) => {
    setSelectedEntity(entity)
    setMapCenter([entity.latitude, entity.longitude])
    setInitialZoom(12)
  }

  const connectedCount = filteredEntities.filter(e => e.xroad_status === 'connected').length
  const pendingCount = filteredEntities.filter(e => e.xroad_status === 'pending').length
  const notConnectedCount = filteredEntities.filter(e => e.xroad_status === 'not_connected').length

  if (loading) {
     return (
       <div className="flex min-h-[60vh] items-center justify-center">
         <StatusPulse size="lg" />
       </div>
     )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
               <MapPin className="h-6 w-6 text-blue-400" />
             </div>
             <h1 className="text-4xl font-bold tracking-tight text-white uppercase">Infraestructura Geográfica</h1>
          </div>
          <p className="text-slate-400 font-medium max-w-xl text-sm italic">
             Monitoreo satelital de nodos de interoperabilidad y despliegue institucional a nivel nacional.
          </p>
        </div>
        <button
          onClick={() => setShowList(!showList)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800/80 border border-slate-700 hover:bg-slate-700 rounded-xl text-slate-200 font-bold transition-all text-sm uppercase tracking-widest"
        >
          {showList ? <Layers className="h-4 w-4" /> : <List className="h-4 w-4" />}
          {showList ? 'Vista Satelital' : 'Panel de Control'}
        </button>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5 border-l-4 border-l-blue-500">
           <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ECOSISTEMA TOTAL</p>
              <Building2 className="h-4 w-4 text-slate-600" />
           </div>
           <div className="text-3xl font-black text-white">{entities.length}</div>
        </GlassCard>
        <GlassCard className="p-5 border-l-4 border-l-emerald-500">
           <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">OPERATIVOS</p>
              <Link2 className="h-4 w-4 text-emerald-600" />
           </div>
           <div className="text-3xl font-black text-white">{connectedCount}</div>
        </GlassCard>
        <GlassCard className="p-5 border-l-4 border-l-amber-500">
           <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">EN PROCESO</p>
              <Clock className="h-4 w-4 text-amber-600" />
           </div>
           <div className="text-3xl font-black text-white">{pendingCount}</div>
        </GlassCard>
        <GlassCard className="p-5 border-l-4 border-l-red-500">
           <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">DESCONECTADOS</p>
              <XCircle className="h-4 w-4 text-red-600" />
           </div>
           <div className="text-3xl font-black text-white">{notConnectedCount}</div>
        </GlassCard>
      </div>

      {/* Filters GlassCard */}
      <GlassCard className="p-6 border-slate-700/50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-200 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none placeholder-slate-600"
              placeholder="RASTREAR ENTIDAD..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-300 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none uppercase font-bold"
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
          >
            <option value="">TODOS LOS SECTORES</option>
            {sectors.map(sector => (
              <option key={sector.id} value={sector.id}>{sector.name.toUpperCase()}</option>
            ))}
          </select>
          <select
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-300 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none uppercase font-bold"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">ESTADO DE CONEXIÓN</option>
            <option value="connected">OPERATIVO / CONECTADO</option>
            <option value="pending">PENDIENTE DE VALIDACIÓN</option>
            <option value="not_connected">CRÍTICO / DESCONECTADO</option>
          </select>
          <button
            className="w-full px-4 py-3 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-400 font-black text-[10px] tracking-widest transition-all"
            onClick={() => {
              setSelectedSector('')
              setSelectedStatus('')
              setSearchTerm('')
            }}
          >
            SISTEMA REINICIAR FILTROS
          </button>
        </div>
      </GlassCard>

      {/* Main Map/List View */}
      {showList ? (
        <GlassCard className="p-6 border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
             <Activity className="h-5 w-5 text-blue-400" />
             <h3 className="text-xl font-bold text-white uppercase tracking-tight">Registro de Nodos Geográficos ({filteredEntities.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredEntities.map(entity => (
              <div
                key={entity.id}
                onClick={() => handleEntityClick(entity)}
                className="group p-4 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-blue-500/50 cursor-pointer transition-all hover:bg-slate-800/60"
              >
                <div className="flex items-start justify-between mb-3">
                   <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-blue-500/10 transition-colors">
                      <Shield className="h-4 w-4 text-slate-400 group-hover:text-blue-400" />
                   </div>
                   <StatusPulse status={xroadStatusConfig[entity.xroad_status]?.status} size="sm" />
                </div>
                <div className="space-y-1">
                   <p className="font-bold text-slate-200 group-hover:text-white transition-colors uppercase text-xs truncate">{entity.name}</p>
                   <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{entity.department} • {entity.sector_name}</p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-800/50 pt-3">
                   <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                      <Box className="h-3 w-3" />
                      {entity.services_count || 0} ENDPOINTS
                   </div>
                   <button className="text-[9px] font-black text-blue-400 uppercase hover:text-blue-300">Localizar →</button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Area */}
          <GlassCard className="lg:col-span-3 !p-0 border-slate-700/50 overflow-hidden relative" style={{ height: '700px' }}>
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
               <div className="px-3 py-2 bg-slate-900/90 border border-slate-700/50 rounded-lg backdrop-blur-md shadow-2xl flex items-center gap-3">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50" />
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Red Activa</span>
                  </div>
               </div>
            </div>
            
            <MapContainer
              center={[4.5709, -74.2973]}
              zoom={6}
              style={{ height: '100%', width: '100%', background: '#0A0E1A' }}
              zoomControl={false} // Customizing zoom control could be next
            >
              <MapController center={mapCenter} zoom={initialZoom} />
              {/* Dark mode satellite look tile layer */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {filteredEntities.map((entity) => {
                const statusKind = entity.xroad_status === 'connected' ? 'green' : entity.xroad_status === 'pending' ? 'yellow' : 'red'
                return (
                  <Marker
                    key={entity.id}
                    position={[entity.latitude, entity.longitude]}
                    icon={createCustomIcon(statusKind)}
                    eventHandlers={{ click: () => handleEntityClick(entity) }}
                  >
                    <Popup className="custom-leaflet-popup">
                      <div className="p-3 min-w-[240px] bg-[#111827] text-white rounded-xl -m-3 border border-slate-700/50">
                        <div className="flex justify-between items-start mb-3">
                           <div className="flex-1">
                              <h3 className="font-black text-xs text-blue-400 uppercase tracking-wide leading-tight">{entity.name}</h3>
                              <p className="text-[10px] font-bold text-slate-500">{entity.acronym || 'SIN ACRÓNIMO'}</p>
                           </div>
                           <StatusPulse status={xroadStatusConfig[entity.xroad_status]?.status} size="sm" />
                        </div>
                        
                        <div className="space-y-2 mb-4">
                           <div className="flex items-center gap-2 text-slate-400">
                              <MapPin className="h-3 w-3 text-blue-500/50" />
                              <span className="text-[10px] font-medium uppercase">{entity.department}</span>
                           </div>
                           <div className="flex items-center gap-2 text-slate-400">
                              <Building2 className="h-3 w-3 text-blue-500/50" />
                              <span className="text-[10px] font-medium uppercase">{entity.sector_name}</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 p-2 bg-slate-900/50 rounded-lg border border-slate-800 mb-3">
                           <div>
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Endpoints</p>
                              <p className="text-xs font-bold text-white">{entity.services_count || 0} activos</p>
                           </div>
                           <div>
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Status</p>
                              <p className="text-[10px] font-bold text-white">{xroadStatusConfig[entity.xroad_status]?.label}</p>
                           </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                           <p className="text-[8px] font-mono text-slate-600">MOD: {new Date().toLocaleDateString()}</p>
                           <button className="text-[9px] font-black text-blue-400 uppercase tracking-widest px-2 py-1 bg-blue-500/10 rounded-md">Ver Perfil nodal</button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          </GlassCard>

          {/* Sidebar Area */}
          <GlassCard className="flex flex-col border-slate-700/50 overflow-hidden" style={{ height: '700px' }}>
            <div className="p-5 border-b border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-black text-sm text-white uppercase tracking-widest">Nodos en Radar</h3>
                <span className="text-[10px] font-black bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md">{filteredEntities.length}</span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Despliegue operativo detectado</p>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
              {filteredEntities.map(entity => (
                <div
                  key={entity.id}
                  onClick={() => handleEntityClick(entity)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    selectedEntity?.id === entity.id 
                      ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <StatusPulse status={xroadStatusConfig[entity.xroad_status]?.status} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-200 group-hover:text-white truncate uppercase tracking-tight">
                        {entity.name}
                      </p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        {entity.department}
                      </p>
                    </div>
                  </div>
                  {selectedEntity?.id === entity.id && (
                    <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{entity.sector_name}</span>
                       <Activity className="h-3 w-3 text-blue-500 animate-pulse" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-slate-900/60 border-t border-slate-800">
               <div className="space-y-3">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Simbología Nodal</p>
                  <div className="grid grid-cols-2 gap-2">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-[9px] font-bold text-slate-400">OPERATIVO</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full" />
                        <span className="text-[9px] font-bold text-slate-400">PENDIENTE</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-[9px] font-bold text-slate-400">DESCONEXIÓN</span>
                     </div>
                  </div>
               </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}