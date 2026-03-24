import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { entitiesApi, sectorsApi } from '../services/api'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet marker icons
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const xroadStatusColors = {
  connected: '#10B981',
  pending: '#F59E0B',
  not_connected: '#EF4444'
}

export default function MapaInteractivo() {
  const [entities, setEntities] = useState([])
  const [sectors, setSectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSector, setSelectedSector] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

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
    if (selectedSector && entity.sector_id !== parseInt(selectedSector)) return false
    if (selectedStatus && entity.xroad_status !== selectedStatus) return false
    return entity.latitude && entity.longitude
  })

  // Colombia center coordinates
  const colombiaCenter = [4.5709, -74.2973]

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
        <h1 className="text-2xl font-bold text-gray-900">Mapa Interactivo</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visualización geográfica de entidades públicas en el ecosistema X-Road
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="form-label">Sector</label>
            <select
              className="form-select"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
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
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
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
                setSelectedSector('')
                setSelectedStatus('')
              }}
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm text-gray-600">Conectado</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
            <span className="text-sm text-gray-600">Pendiente</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <span className="text-sm text-gray-600">No Conectado</span>
          </div>
          <div className="ml-auto text-sm text-gray-500">
            Mostrando {filteredEntities.length} de {entities.length} entidades
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
        <MapContainer
          center={colombiaCenter}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredEntities.map((entity) => (
            <Marker
              key={entity.id}
              position={[entity.latitude, entity.longitude]}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-gray-900">{entity.name}</h3>
                  {entity.acronym && (
                    <p className="text-sm text-gray-600">{entity.acronym}</p>
                  )}
                  <p className="text-sm text-gray-500">{entity.department}</p>
                  <div className="mt-2">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: xroadStatusColors[entity.xroad_status] + '20',
                        color: xroadStatusColors[entity.xroad_status]
                      }}
                    >
                      {entity.xroad_status === 'connected' ? 'Conectado' :
                       entity.xroad_status === 'pending' ? 'Pendiente' : 'No Conectado'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Servicios: {entity.services_count || 0}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}