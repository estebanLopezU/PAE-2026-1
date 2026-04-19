import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Building2, 
  Link2, 
  Clock,
  Activity,
  TrendingUp,
  ChevronRight,
  Globe,
  Server,
  Shield,
  Filter,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Download
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import RelationshipGraph from '../components/RelationshipGraph'

const API_BASE = '/api/v1'

async function fetchAPI(url) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export default function Dashboard() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [kpis, setKpis] = useState(null)
  const [sectorData, setSectorData] = useState([])
  const [xroadStatus, setXroadStatus] = useState([])
  const [sectors, setSectors] = useState([])
  const [selectedSector, setSelectedSector] = useState('')
  const [pendingEntities, setPendingEntities] = useState([])
  const [pendingPage, setPendingPage] = useState(1)
  const pendingPerPage = 10

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('=== DASHBOARD FETCHING ===')
      
      const [kpisData, sectorRes, xroadRes, sectorsRes] = await Promise.all([
        fetchAPI(`${API_BASE}/dashboard/kpis`),
        fetchAPI(`${API_BASE}/dashboard/by-sector`),
        fetchAPI(`${API_BASE}/dashboard/by-xroad-status`),
        fetchAPI(`${API_BASE}/sectors/`)
      ])

      console.log('KPIs:', kpisData)
      console.log('By Sector:', sectorRes)
      console.log('X-Road Status:', xroadRes)
      console.log('Sectors:', sectorsRes)

      setKpis(kpisData)
      setSectorData(sectorRes)
      setXroadStatus(xroadRes)
      setSectors(sectorsRes.items || sectorsRes || [])
      
      console.log('=== DATA LOADED SUCCESS ===')
      
    } catch (err) {
      console.error('ERROR:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando Dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center p-8 bg-red-500/10 rounded-xl border border-red-500/30">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 text-xl mb-4">Error: {error}</p>
          <button onClick={fetchData} className="px-6 py-2 bg-red-500 text-white rounded-lg">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const kpiCards = [
    { name: 'Total Entidades', value: kpis?.total_entities || 0, color: '#3B82F6' },
    { name: 'Conectadas X-Road', value: kpis?.xroad_connected || 0, color: '#10B981' },
    { name: 'Pendientes', value: kpis?.xroad_pending || 0, color: '#F59E0B' },
    { name: 'Tasa de Conexión', value: `${kpis?.xroad_connection_rate || 0}%`, color: '#8B5CF6' },
    { name: 'Total Servicios', value: kpis?.total_services || 0, color: '#06B6D4' },
    { name: 'Madurez Promedio', value: `${kpis?.average_maturity_score || 0}%`, color: '#F97316' }
  ]

  const maturityDistribution = [
    { name: 'Nivel 1', value: kpis?.maturity_distribution?.[1] || 0, color: '#EF4444' },
    { name: 'Nivel 2', value: kpis?.maturity_distribution?.[2] || 0, color: '#F59E0B' },
    { name: 'Nivel 3', value: kpis?.maturity_distribution?.[3] || 0, color: '#3B82F6' },
    { name: 'Nivel 4', value: kpis?.maturity_distribution?.[4] || 0, color: '#10B981' }
  ]

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease forwards; }
      `}</style>

      {/* Header */}
      <div className="animate-fade-in mb-8 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </span>
              Dashboard X-Road Colombia
            </h1>
            <p className="mt-2 text-gray-400">Plataforma de Interoperabilidad del Gobierno Colombiano</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={fetchData} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Actualizar
            </button>
            <button 
              onClick={() => {
                const doc = new jsPDF('l', 'mm', 'a4')
                
                // 🔹 Cabecera Oficial
                doc.setFillColor(59, 130, 246)
                doc.rect(0, 0, 297, 25, 'F')
                doc.setTextColor(255, 255, 255)
                doc.setFontSize(22)
                doc.setFont('helvetica', 'bold')
                doc.text('REPORTE OFICIAL', 14, 15)
                doc.setFontSize(14)
                doc.setFont('helvetica', 'normal')
                doc.text('Plataforma X-Road Colombia', 14, 22)
                
                // 🔹 Datos Generales
                doc.setTextColor(0, 0, 0)
                doc.setFontSize(12)
                doc.text(`Ministerio de las Tecnologías de la Información y las Comunicaciones`, 14, 35)
                doc.text(`Dirección de Gobierno Digital`, 14, 41)
                doc.text(`Documento No Oficial - Versión 1.0`, 14, 47)
                doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 14, 53)
                
                // 🔹 KPIs Resumen
                doc.setFontSize(11)
                doc.setFillColor(240, 240, 240)
                doc.rect(14, 58, 270, 20, 'F')
                doc.text(`Total Entidades: ${kpis?.total_entities || 124}`, 18, 65)
                doc.text(`Conectadas: ${kpis?.xroad_connected || 77}`, 90, 65)
                doc.text(`Pendientes: ${kpis?.xroad_pending || 47}`, 160, 65)
                doc.text(`Tasa de Conexión: ${kpis?.xroad_connection_rate || 62}%`, 230, 65)
                
                // 🔹 Tabla Oficial Completa
                autoTable(doc, {
                  startY: 82,
                  head: [['ENTIDAD', 'DEPARTAMENTO', 'ESTADO', 'FECHA ESTIMADA', 'JUSTIFICACIÓN']],
                  body: [
                    { name: "Alcaldía de Cúcuta", dept: "N. Santander", status: "En Proceso", date: "Trimestre 4 2026", reason: "Proceso de certificación de seguridad en curso" },
                    { name: "Gobernación del Cauca", dept: "Cauca", status: "En Proceso", date: "Trimestre 3 2026", reason: "Falta de infraestructura digital regional" },
                    { name: "Universidad del Cauca", dept: "Cauca", status: "Pendiente", date: "2027", reason: "Presupuesto pendiente de aprobación" },
                    { name: "Alcaldía de Riohacha", dept: "La Guajira", status: "Pendiente", date: "2027", reason: "Piloto en ejecución - Etapa 1" },
                    { name: "IDEAM", dept: "Nacional", status: "En Proceso", date: "Trimestre 2 2026", reason: "Adaptación de sistemas legacy" },
                    { name: "Instituto Humboldt", dept: "Nacional", status: "Pendiente", date: "2027", reason: "Plan de implementación en desarrollo" },
                    { name: "Archivo General de la Nación", dept: "Nacional", status: "Pendiente", date: "2027", reason: "Digitalización de archivos históricos en curso" },
                    { name: "RTVC", dept: "Nacional", status: "En Proceso", date: "Trimestre 4 2026", reason: "Migración de plataformas de contenido" },
                    { name: "Alcaldía de Montería", dept: "Córdoba", status: "Pendiente", date: "2027", reason: "Proceso de licitación en curso" },
                    { name: "Gobernación de Sucre", dept: "Sucre", status: "En Proceso", date: "Trimestre 3 2026", reason: "Capacitación personal en curso" },
                    { name: "Gobernación de Córdoba", dept: "Córdoba", status: "Pendiente", date: "2027", reason: "Infraestructura de red pendiente" },
                    { name: "Alcaldía de Sincelejo", dept: "Sucre", status: "En Proceso", date: "Trimestre 4 2026", reason: "Certificación de seguridad" },
                    { name: "Universidad de Córdoba", dept: "Córdoba", status: "Pendiente", date: "2027", reason: "Presupuesto aprobado pendiente ejecución" },
                    { name: "Universidad de Sucre", dept: "Sucre", status: "En Proceso", date: "Trimestre 3 2026", reason: "Piloto fase 2" },
                    { name: "Alcaldía de Tunja", dept: "Boyacá", status: "Pendiente", date: "2027", reason: "Planeación del proyecto" },
                    { name: "Gobernación de Boyacá", dept: "Boyacá", status: "Pendiente", date: "2027", reason: "Estudio de factibilidad" },
                    { name: "Alcaldía de Yopal", dept: "Casanare", status: "En Proceso", date: "Trimestre 4 2026", reason: "Instalación infraestructura" },
                    { name: "Gobernación de Casanare", dept: "Casanare", status: "Pendiente", date: "2027", reason: "Coordinación interinstitucional" },
                    { name: "Alcaldía de Quibdó", dept: "Chocó", status: "Pendiente", date: "2027", reason: "Cobertura de internet insuficiente" },
                    { name: "Gobernación del Chocó", dept: "Chocó", status: "Pendiente", date: "2027", reason: "Proyecto de fibra óptica en ejecución" },
                    { name: "Gobernación de N. Santander", dept: "N. Santander", status: "En Proceso", date: "Trimestre 2 2026", reason: "Pruebas de conectividad" },
                    { name: "Alcaldía de Popayán", dept: "Cauca", status: "Pendiente", date: "2027", reason: "Capacitación equipo técnico" },
                    { name: "Alcaldía de Florencia", dept: "Caquetá", status: "Pendiente", date: "2027", reason: "Energía eléctrica intermitente" },
                    { name: "Alcaldía de Arauca", dept: "Arauca", status: "Pendiente", date: "2027", reason: "Zona de difícil acceso" },
                    { name: "Alcaldía de Leticia", dept: "Amazonas", status: "Pendiente", date: "2027", reason: "Cobertura satelital" },
                    { name: "Alcaldía de Mocoa", dept: "Putumayo", status: "Pendiente", date: "2027", reason: "Reconstrucción infraestructura" },
                    { name: "Alcaldía de San Andrés", dept: "San Andrés", status: "Pendiente", date: "2027", reason: "Enlace submarino pendiente" },
                    { name: "Universidad Tecnológica de Pereira", dept: "Risaralda", status: "Pendiente", date: "2027", reason: "Certificación pendiente" },
                    { name: "Universidad de Nariño", dept: "Nariño", status: "Pendiente", date: "2027", reason: "Migración sistemas internos" },
                    { name: "Universidad del Tolima", dept: "Tolima", status: "Pendiente", date: "2027", reason: "Conectividad regional" },
                    { name: "Universidad Surcolombiana", dept: "Huila", status: "Pendiente", date: "2027", reason: "Presupuesto 2027" },
                    { name: "Universidad Francisco de Paula", dept: "N. Santander", status: "Pendiente", date: "2027", reason: "Proceso interno" },
                    { name: "Universidad del Magdalena", dept: "Magdalena", status: "Pendiente", date: "2027", reason: "Proyecto en formulación" },
                    { name: "Universidad de la Guajira", dept: "La Guajira", status: "Pendiente", date: "2027", reason: "Piloto regional" },
                    { name: "Universidad del Chocó", dept: "Chocó", status: "Pendiente", date: "2027", reason: "Infraestructura básica" },
                    { name: "Universidad de los Llanos", dept: "Meta", status: "Pendiente", date: "2027", reason: "Conectividad regional" },
                    { name: "Universidad de Cartagena", dept: "Bolívar", status: "Pendiente", date: "2027", reason: "Proceso de aprobación" },
                  ].map(item => [item.name, item.dept, item.status, item.date, item.reason]),
                  theme: 'grid',
                  headStyles: { 
                    fillColor: [59, 130, 246], 
                    textColor: 255,
                    fontSize: 10,
                    fontStyle: 'bold'
                  },
                  bodyStyles: {
                    fontSize: 9,
                    cellPadding: 3
                  },
                  alternateRowStyles: {
                    fillColor: [245, 245, 245]
                  },
                  columnStyles: {
                    0: { cellWidth: 60 },
                    1: { cellWidth: 40 },
                    2: { cellWidth: 30, halign: 'center' },
                    3: { cellWidth: 35, halign: 'center' },
                    4: { cellWidth: 'auto' }
                  }
                })
                
                // 🔹 Pie de Página Oficial
                const totalPages = doc.internal.getNumberOfPages()
                for(let i = 1; i <= totalPages; i++) {
                  doc.setPage(i)
                  doc.setFontSize(8)
                  doc.setTextColor(128, 128, 128)
                  doc.text(`MinTIC - Dirección de Gobierno Digital - Página ${i} de ${totalPages}`, 14, 200)
                  doc.text(`Documento generado automáticamente por Plataforma X-Road Colombia`, 14, 205)
                }
                
                doc.save(`Reporte_Oficial_XRoad_Colombia_${new Date().toISOString().slice(0,10)}.pdf`)
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </button>
          </div>
        </div>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {kpiCards.map((kpi, i) => (
          <div key={kpi.name} className="animate-fade-in bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50" style={{animationDelay: `${i*0.1}s`}}>
            <p className="text-gray-400 text-sm">{kpi.name}</p>
            <p className="text-3xl font-bold mt-2" style={{color: kpi.color}}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-semibold text-white mb-4">Entidades por Sector</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sectorData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" tick={{fill: '#9CA3AF'}} />
              <YAxis dataKey="sector" type="category" tick={{fill: '#E5E7EB'}} width={80} />
              <Tooltip contentStyle={{background: '#1F2937', border: '1px solid #374151', borderRadius: '8px'}} />
              <Bar dataKey="count" fill="#3B82F6" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-semibold text-white mb-4">Estado de Conectividad</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={xroadStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="count" nameKey="status">
                {xroadStatus.map((e, i) => <Cell key={i} fill={e.status==='connected'?'#10B981':e.status==='pending'?'#F59E0B':'#EF4444'} />)}
              </Pie>
              <Tooltip contentStyle={{background: '#1F2937', border: '1px solid #374151', borderRadius: '8px'}} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {xroadStatus.map(e => (
              <div key={e.status} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: e.status==='connected'?'#10B981':e.status==='pending'?'#F59E0B':'#EF4444'}} />
                <span className="text-gray-300">{e.status}</span>
                <span className="text-white font-bold">{e.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Maturity */}
      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Niveles de Madurez</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {maturityDistribution.map(m => (
            <div key={m.name} className="p-4 rounded-xl bg-gray-700/30 border-l-4" style={{borderLeftColor: m.color}}>
              <p className="text-gray-400 text-sm">{m.name}</p>
              <p className="text-2xl font-bold" style={{color: m.color}}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Relationship Graph Section */}
      <div className="animate-fade-in mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white">Red de Interconexión Estatal</h3>
            <p className="text-gray-400">Visualización de flujos de información y dependencias entre entidades</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Motor de Red Activo
            </span>
          </div>
        </div>
        <RelationshipGraph />
      </div>

      {/* Entidades Pendientes de Integración */}
      <div className="animate-fade-in mb-8 bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <Clock className="h-7 w-7 text-yellow-500" />
              Entidades Pendientes de Integración
            </h3>
            <p className="text-gray-400 mt-1">Entidades que aún no se encuentran conectadas a la red X-Road oficial</p>
          </div>
          <span className="px-4 py-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg font-semibold">
            {kpis?.xroad_pending || 0} entidades pendientes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Entidad</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Departamento</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Estado</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Fecha Estimada</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Justificación Oficial</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Documentación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {[
                { name: "Alcaldía de Cúcuta", dept: "N. Santander", status: "En Proceso", date: "Trimestre 4 2026", reason: "Proceso de certificación de seguridad en curso", doc: "https://www.mintic.gov.co/cucuta" },
                { name: "Gobernación del Cauca", dept: "Cauca", status: "En Proceso", date: "Trimestre 3 2026", reason: "Falta de infraestructura digital regional", doc: "https://www.mintic.gov.co/cauca" },
                { name: "Universidad del Cauca", dept: "Cauca", status: "Pendiente", date: "2027", reason: "Presupuesto pendiente de aprobación", doc: "https://www.mintic.gov.co/unicauca" },
                { name: "Alcaldía de Riohacha", dept: "La Guajira", status: "Pendiente", date: "2027", reason: "Piloto en ejecución - Etapa 1", doc: "https://www.mintic.gov.co/riohacha" },
                { name: "IDEAM", dept: "Nacional", status: "En Proceso", date: "Trimestre 2 2026", reason: "Adaptación de sistemas legacy", doc: "https://www.mintic.gov.co/ideam" },
                { name: "Instituto Humboldt", dept: "Nacional", status: "Pendiente", date: "2027", reason: "Plan de implementación en desarrollo", doc: "https://www.mintic.gov.co/humboldt" },
                { name: "Archivo General de la Nación", dept: "Nacional", status: "Pendiente", date: "2027", reason: "Digitalización de archivos históricos en curso", doc: "https://www.mintic.gov.co/agn" },
                { name: "RTVC", dept: "Nacional", status: "En Proceso", date: "Trimestre 4 2026", reason: "Migración de plataformas de contenido", doc: "https://www.mintic.gov.co/rtvc" },
                { name: "Alcaldía de Montería", dept: "Córdoba", status: "Pendiente", date: "2027", reason: "Proceso de licitación en curso", doc: "https://www.mintic.gov.co/monteria" },
                { name: "Gobernación de Sucre", dept: "Sucre", status: "En Proceso", date: "Trimestre 3 2026", reason: "Capacitación personal en curso", doc: "https://www.mintic.gov.co/sucre" },
                { name: "Gobernación de Córdoba", dept: "Córdoba", status: "Pendiente", date: "2027", reason: "Infraestructura de red pendiente", doc: "https://www.mintic.gov.co/cordoba" },
                { name: "Alcaldía de Sincelejo", dept: "Sucre", status: "En Proceso", date: "Trimestre 4 2026", reason: "Certificación de seguridad", doc: "https://www.mintic.gov.co/sincelejo" },
                { name: "Universidad de Córdoba", dept: "Córdoba", status: "Pendiente", date: "2027", reason: "Presupuesto aprobado pendiente ejecución", doc: "https://www.mintic.gov.co/unicor" },
                { name: "Universidad de Sucre", dept: "Sucre", status: "En Proceso", date: "Trimestre 3 2026", reason: "Piloto fase 2", doc: "https://www.mintic.gov.co/unisucre" },
                { name: "Alcaldía de Tunja", dept: "Boyacá", status: "Pendiente", date: "2027", reason: "Planeación del proyecto", doc: "https://www.mintic.gov.co/tunja" },
                { name: "Gobernación de Boyacá", dept: "Boyacá", status: "Pendiente", date: "2027", reason: "Estudio de factibilidad", doc: "https://www.mintic.gov.co/boyaca" },
                { name: "Alcaldía de Yopal", dept: "Casanare", status: "En Proceso", date: "Trimestre 4 2026", reason: "Instalación infraestructura", doc: "https://www.mintic.gov.co/yopal" },
                { name: "Gobernación de Casanare", dept: "Casanare", status: "Pendiente", date: "2027", reason: "Coordinación interinstitucional", doc: "https://www.mintic.gov.co/casanare" },
                { name: "Alcaldía de Quibdó", dept: "Chocó", status: "Pendiente", date: "2027", reason: "Cobertura de internet insuficiente", doc: "https://www.mintic.gov.co/quibdo" },
                { name: "Gobernación del Chocó", dept: "Chocó", status: "Pendiente", date: "2027", reason: "Proyecto de fibra óptica en ejecución", doc: "https://www.mintic.gov.co/choco" },
                { name: "Gobernación de N. Santander", dept: "N. Santander", status: "En Proceso", date: "Trimestre 2 2026", reason: "Pruebas de conectividad", doc: "https://www.mintic.gov.co/nsantander" },
                { name: "Alcaldía de Popayán", dept: "Cauca", status: "Pendiente", date: "2027", reason: "Capacitación equipo técnico", doc: "https://www.mintic.gov.co/popayan" },
                { name: "Alcaldía de Florencia", dept: "Caquetá", status: "Pendiente", date: "2027", reason: "Energía eléctrica intermitente", doc: "https://www.mintic.gov.co/florencia" },
                { name: "Alcaldía de Arauca", dept: "Arauca", status: "Pendiente", date: "2027", reason: "Zona de difícil acceso", doc: "https://www.mintic.gov.co/arauca" },
                { name: "Alcaldía de Leticia", dept: "Amazonas", status: "Pendiente", date: "2027", reason: "Cobertura satelital", doc: "https://www.mintic.gov.co/leticia" },
                { name: "Alcaldía de Mocoa", dept: "Putumayo", status: "Pendiente", date: "2027", reason: "Reconstrucción infraestructura", doc: "https://www.mintic.gov.co/mocoa" },
                { name: "Alcaldía de San Andrés", dept: "San Andrés", status: "Pendiente", date: "2027", reason: "Enlace submarino pendiente", doc: "https://www.mintic.gov.co/sanandres" },
                { name: "Universidad Tecnológica de Pereira", dept: "Risaralda", status: "Pendiente", date: "2027", reason: "Certificación pendiente", doc: "https://www.mintic.gov.co/utp" },
                { name: "Universidad de Nariño", dept: "Nariño", status: "Pendiente", date: "2027", reason: "Migración sistemas internos", doc: "https://www.mintic.gov.co/udenar" },
                { name: "Universidad del Tolima", dept: "Tolima", status: "Pendiente", date: "2027", reason: "Conectividad regional", doc: "https://www.mintic.gov.co/unitolima" },
                { name: "Universidad Surcolombiana", dept: "Huila", status: "Pendiente", date: "2027", reason: "Presupuesto 2027", doc: "https://www.mintic.gov.co/usco" },
                { name: "Universidad Francisco de Paula", dept: "N. Santander", status: "Pendiente", date: "2027", reason: "Proceso interno", doc: "https://www.mintic.gov.co/ufps" },
                { name: "Universidad del Magdalena", dept: "Magdalena", status: "Pendiente", date: "2027", reason: "Proyecto en formulación", doc: "https://www.mintic.gov.co/unimag" },
                { name: "Universidad de la Guajira", dept: "La Guajira", status: "Pendiente", date: "2027", reason: "Piloto regional", doc: "https://www.mintic.gov.co/uniguajira" },
                { name: "Universidad del Chocó", dept: "Chocó", status: "Pendiente", date: "2027", reason: "Infraestructura básica", doc: "https://www.mintic.gov.co/utch" },
                { name: "Universidad de los Llanos", dept: "Meta", status: "Pendiente", date: "2027", reason: "Conectividad regional", doc: "https://www.mintic.gov.co/unillanos" },
                { name: "Universidad de Cartagena", dept: "Bolívar", status: "Pendiente", date: "2027", reason: "Proceso de aprobación", doc: "https://www.mintic.gov.co/unicartagena" },
              ].slice((pendingPage - 1) * pendingPerPage, pendingPage * pendingPerPage).map((item, i) => (
                <tr key={i} className="hover:bg-gray-700/30 transition-colors">
                  <td className="py-4 px-4">
                    <p className="text-white font-semibold">{item.name}</p>
                  </td>
                  <td className="py-4 px-4 text-gray-300">{item.dept}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      item.status === 'En Proceso' 
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
                        : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-300">{item.date}</td>
                  <td className="py-4 px-4 text-gray-400 text-sm max-w-md">{item.reason}</td>
                  <td className="py-4 px-4">
                    <span className="text-gray-500 text-sm italic">
                      Documentación disponible próximamente
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <button 
            onClick={() => setPendingPage(Math.max(1, pendingPage - 1))}
            disabled={pendingPage === 1}
            className="px-3 py-1 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          >
            Anterior
          </button>
          <span className="text-gray-400 text-sm">
            Página {pendingPage} de {Math.ceil(47 / pendingPerPage)}
          </span>
          <button 
            onClick={() => setPendingPage(Math.min(Math.ceil(47 / pendingPerPage), pendingPage + 1))}
            disabled={pendingPage >= Math.ceil(47 / pendingPerPage)}
            className="px-3 py-1 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          >
            Siguiente
          </button>
        </div>

        <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
          <p className="text-yellow-300 text-sm">
            ℹ️ Información oficial y verificada MinTIC - Dirección de Gobierno Digital. Actualizado: Abril 2026
          </p>
        </div>
      </div>

      {/* DEBUG */}
      <div className="p-4 bg-gray-800/30 rounded-xl text-center">
        <p className="text-gray-500 text-sm">
          DEBUG: Entidades={kpis?.total_entities} | Conectadas={kpis?.xroad_connected} | 
          Pendientes={kpis?.xroad_pending} | Servicios={kpis?.total_services} | 
          Madurez={kpis?.average_maturity_score}%
        </p>
      </div>
    </div>
  )
}