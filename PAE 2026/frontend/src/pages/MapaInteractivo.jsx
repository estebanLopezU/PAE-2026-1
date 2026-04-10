import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { entitiesApi, sectorsApi } from '../services/api'
import { Search, Filter, MapPin, Building2, Link2, Clock, XCircle, Layers, Maximize2, List } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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
  connected: { color: '#10B981', label: 'Conectado', icon: Link2 },
  pending: { color: '#F59E0B', label: 'Pendiente', icon: Clock },
  not_connected: { color: '#EF4444', label: 'No Conectado', icon: XCircle }
}

const statusIcons = {
  connected: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  pending: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  not_connected: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
}

function createCustomIcon(color) {
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
        entitiesApi.getAll({ limit: 100 }),
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
    const matchesSector = !selectedSector || entity.sector_id === parseInt(selectedSector)
    const matchesStatus = !selectedStatus || entity.xroad_status === selectedStatus
    const matchesSearch = !searchTerm || 
      entity.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.acronym?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.department?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSector && matchesStatus && matchesSearch && entity.latitude && entity.longitude
  })

  const handleEntityClick = (entity) => {
    setSelectedEntity(entity)
    setMapCenter([entity.latitude, entity.longitude])
    setInitialZoom(10)
  }

  const connectedCount = filteredEntities.filter(e => e.xroad_status === 'connected').length
  const pendingCount = filteredEntities.filter(e => e.xroad_status === 'pending').length
  const notConnectedCount = filteredEntities.filter(e => e.xroad_status === 'not_connected').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-white" />
            </span>
            Mapa Interactivo
          </h1>
          <p className="text-gray-500 mt-1">Visualizacion geografica de entidades X-Road Colombia</p>
        </div>
        <button
          onClick={() => setShowList(!showList)}
          className="btn btn-secondary flex items-center gap-2"
        >
          <List className="h-4 w-4" />
          {showList ? 'Ver Mapa' : 'Ver Lista'}
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Building2 className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{entities.length}</p>
              <p className="text-xs text-gray-500">Total Entidades</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Link2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{connectedCount}</p>
              <p className="text-xs text-gray-500">Conectadas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-xs text-gray-500">Pendientes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{notConnectedCount}</p>
              <p className="text-xs text-gray-500">No Conectadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Buscar entidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Sector Filter */}
          <select
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
          >
            <option value="">Todos los sectores</option>
            {sectors.map(sector => (
              <option key={sector.id} value={sector.id}>{sector.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="connected">Conectado</option>
            <option value="pending">Pendiente</option>
            <option value="not_connected">No Conectado</option>
          </select>

          {/* Clear Filters */}
          <button
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-gray-700 font-medium"
            onClick={() => {
              setSelectedSector('')
              setSelectedStatus('')
              setSearchTerm('')
            }}
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Main Content */}
      {showList ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista de Entidades ({filteredEntities.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredEntities.map(entity => (
              <div
                key={entity.id}
                onClick={() => handleEntityClick(entity)}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: xroadStatusConfig[entity.xroad_status]?.color }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{entity.name}</p>
                    <p className="text-sm text-gray-500">{entity.department} - {entity.sector_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">{entity.services_count || 0} servicios</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Map */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '600px' }}>
            <MapContainer
              center={[4.5709, -74.2973]}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
            >
              <MapController center={mapCenter} zoom={initialZoom} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredEntities.map((entity) => {
                const statusColor = entity.xroad_status === 'connected' ? 'green' : entity.xroad_status === 'pending' ? 'yellow' : 'red'
                return (
                  <Marker
                    key={entity.id}
                    position={[entity.latitude, entity.longitude]}
                    icon={createCustomIcon(statusColor)}
                    eventHandlers={{
                      click: () => handleEntityClick(entity)
                    }}
                  >
                    <Popup>
                      <div className="p-2 min-w-48">
                        <h3 className="font-semibold text-gray-900">{entity.name}</h3>
                        {entity.acronym && (
                          <p className="text-sm text-gray-600 font-medium">{entity.acronym}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          <span>{entity.department}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <Building2 className="h-4 w-4" />
                          <span>{entity.sector_name}</span>
                        </div>
                        <div className="mt-3">
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: xroadStatusConfig[entity.xroad_status]?.color + '20',
                              color: xroadStatusConfig[entity.xroad_status]?.color
                            }}
                          >
                            {xroadStatusConfig[entity.xroad_status]?.label}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          {entity.services_count || 0} servicios activos
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          </div>

          {/* Sidebar List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 overflow-y-auto" style={{ maxHeight: '600px' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Entidades</h3>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{filteredEntities.length}</span>
            </div>
            <div className="space-y-2">
              {filteredEntities.map(entity => (
                <div
                  key={entity.id}
                  onClick={() => handleEntityClick(entity)}
                  className={`p-3 rounded-xl cursor-pointer transition-colors ${
                    selectedEntity?.id === entity.id 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: xroadStatusConfig[entity.xroad_status]?.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {entity.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {entity.department}
                      </p>
                    </div>
                  </div>
                  {selectedEntity?.id === entity.id && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Sector:</span>
                          <p className="font-medium">{entity.sector_name}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Estado:</span>
                          <p className="font-medium" style={{ color: xroadStatusConfig[entity.xroad_status]?.color }}>
                            {xroadStatusConfig[entity.xroad_status]?.label}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-6">
          <span className="text-sm font-medium text-gray-700">Leyenda:</span>
          <div className="flex items-center gap-2">
            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" alt="green" className="w-5 h-8" />
            <span className="text-sm text-gray-600">Conectado X-Road</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png" alt="yellow" className="w-5 h-8" />
            <span className="text-sm text-gray-600">Pendiente</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" alt="red" className="w-5 h-8" />
            <span className="text-sm text-gray-600">No Conectado</span>
          </div>
          <div className="ml-auto text-sm text-gray-500">
            Showing {filteredEntities.length} of {entities.length} entities on map
          </div>
        </div>
      </div>
    </div>
  )
}