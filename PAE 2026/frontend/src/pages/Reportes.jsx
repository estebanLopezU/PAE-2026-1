import { useState, useEffect } from 'react'
import { Download, FileText, Table, BarChart, Lightbulb, AlertTriangle, CheckCircle, Cpu, Database, Share2, Info, ArrowUpRight, ShieldCheck } from 'lucide-react'
import { entitiesApi, servicesApi, maturityApi } from '../services/api'
import GlassCard from '../components/common/GlassCard'
import StatusPulse from '../components/common/StatusPulse'

export default function Reportes() {
  const [stats, setStats] = useState({
    entities: 0,
    services: 0,
    assessments: 0
  })
  const [loading, setLoading] = useState(true)
  const [downloadingType, setDownloadingType] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [recommendationsLoading, setRecommendationsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchRecommendations()
  }, [])

  const fetchStats = async () => {
    try {
      const [entitiesRes, servicesRes, assessmentsRes] = await Promise.all([
        entitiesApi.getAll({ limit: 1 }),
        servicesApi.getAll({ limit: 1 }),
        maturityApi.getAssessments({ limit: 100 })
      ])
      setStats({
        entities: entitiesRes.data.total,
        services: servicesRes.data.total,
        assessments: assessmentsRes.data.length
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('xroad_access_token')
      const res = await fetch('/api/v1/ai/analyze/sector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ sector_id: null })
      })
      const data = await res.json()
      if (data.data?.top_recommendations) {
        setRecommendations(data.data.top_recommendations)
      } else if (data.data?.recommendations) {
        setRecommendations(data.data.recommendations.slice(0, 5))
      } else {
        setRecommendations([])
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      setRecommendations([])
    } finally {
      setRecommendationsLoading(false)
    }
  }

  const getPriorityStatus = (priority) => {
    if (priority === 'high') return 'error'
    if (priority === 'medium') return 'warning'
    return 'success'
  }

  const getDomainStyle = (domain) => {
    const styles = {
      technical: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      organizational: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      semantic: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      legal: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    }
    return styles[domain] || 'bg-slate-500/10 text-slate-400 border-slate-500/30'
  }

  const reports = [
    {
      title: 'REGISTRO DE NODO ENTIDADES',
      description: 'Inventario completo de la infraestructura institucional X-Road.',
      icon: Database,
      count: stats.entities,
      type: 'entities',
      tag: 'DATABASE'
    },
    {
      title: 'MATRIZ DE INTEROPERABILIDAD',
      description: 'Catálogo técnico de servicios y protocolos de sincronización.',
      icon: Share2,
      count: stats.services,
      type: 'services',
      tag: 'SERVICES'
    },
    {
      title: 'MÉTRICAS DE MADUREZ (MINTIC)',
      description: 'Resultado de auditorías de evolución según el marco nacional.',
      icon: BarChart,
      count: stats.assessments,
      type: 'maturity',
      tag: 'COMPLIANCE'
    }
  ]

  const handleDownload = async (type) => {
    setDownloadingType(type)
    try {
      const token = localStorage.getItem('xroad_access_token')
      let filename
      let directUrl
      
      switch (type) {
        case 'entities':
          filename = 'reporte_entidades.xlsx'
          directUrl = '/api/v1/reports/entities/xlsx'
          break
        case 'services':
          filename = 'reporte_servicios.xlsx'
          directUrl = '/api/v1/reports/services/xlsx'
          break
        case 'maturity':
          filename = 'reporte_madurez.xlsx'
          directUrl = '/api/v1/reports/maturity/xlsx'
          break
        default:
          return
      }
      
      const response = await fetch(directUrl, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      setDownloadingType(null)
    }
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white uppercase">Data Forge</h1>
           </div>
           <p className="text-slate-400 font-medium text-sm max-w-lg">
              Extracción y análisis de activos de datos del ecosistema de interoperabilidad. Formato optimizado para auditoría.
           </p>
        </div>
        <div className="flex gap-4">
           <GlassCard className="px-6 py-2 border-slate-700/50 flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">FORMATO</span>
              <span className="text-sm font-bold text-emerald-400">XLSX / CSV</span>
           </GlassCard>
        </div>
      </div>

      {/* Report Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((report) => (
          <GlassCard key={report.type} className="p-6 border-slate-700/50 hover:border-blue-500/50 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-slate-800/50 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                <report.icon className="h-6 w-6 text-slate-400 group-hover:text-blue-400" />
              </div>
              <span className="text-[9px] font-black text-slate-500 tracking-[0.2em] bg-slate-900 px-2 py-1 rounded border border-slate-800">{report.tag}</span>
            </div>
            
            <h3 className="text-sm font-bold text-white mb-2 leading-tight uppercase">{report.title}</h3>
            <p className="text-xs text-slate-400 mb-8 leading-relaxed line-clamp-2">
              {report.description}
            </p>

            <div className="flex items-end justify-between pt-4 border-t border-slate-800/50">
              <div>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">REGISTROS</p>
                 <p className="text-2xl font-black text-white">{report.count}</p>
              </div>
              <button
                onClick={() => handleDownload(report.type)}
                disabled={downloadingType !== null}
                className="p-3 bg-white hover:bg-blue-50 rounded-xl text-slate-900 transition-all disabled:opacity-50 disabled:grayscale"
              >
                {downloadingType === report.type ? (
                   <StatusPulse size="xs" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Intelligence / AI Section */}
        <GlassCard className="lg:col-span-2 p-8 border-slate-700/50">
           <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                 <div className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-indigo-400" />
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">AI INSIGHTS ANALYTICS</h3>
                 </div>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-none">Análisis predictivo de brechas de interoperabilidad</p>
              </div>
              <StatusPulse status={recommendationsLoading ? 'warning' : 'success'} />
           </div>

           {recommendationsLoading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
                <StatusPulse size="lg" />
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Procesando Red Neuronal...</p>
             </div>
           ) : recommendations.length === 0 ? (
             <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-3xl">
                <Lightbulb className="h-12 w-12 text-slate-800 mx-auto mb-4" />
                <p className="text-sm font-black text-slate-600 uppercase">Sin anomalías detectadas en el ciclo actual</p>
             </div>
           ) : (
             <div className="space-y-4">
               {recommendations.map((rec, index) => (
                 <div key={index} className="flex gap-4 p-5 bg-slate-900/40 border border-slate-800/50 rounded-2xl hover:border-slate-700 transition-all group">
                    <div className="mt-1">
                       <StatusPulse status={getPriorityStatus(rec.priority)} size="sm" />
                    </div>
                    <div className="flex-1 space-y-3">
                       <p className="text-sm font-bold text-slate-200 leading-relaxed group-hover:text-white transition-colors">{rec.recommendation}</p>
                       <div className="flex items-center flex-wrap gap-3">
                          <span className={`px-3 py-1 text-[9px] font-black rounded-lg border uppercase tracking-[0.1em] ${getDomainStyle(rec.domain)}`}>
                             {rec.domain}
                          </span>
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/50 rounded-lg text-slate-400">
                             <ArrowUpRight className="h-3 w-3" />
                             <span className="text-[9px] font-black uppercase tracking-widest">Impacto: {rec.frequency} NODOS</span>
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </GlassCard>

        {/* Protocol Sidebar */}
        <div className="space-y-6">
           <GlassCard className="p-6 border-slate-700/50 bg-blue-500/5">
              <div className="flex items-center gap-3 mb-4">
                 <ShieldCheck className="h-6 w-6 text-blue-400" />
                 <h4 className="text-xs font-black text-white uppercase tracking-widest">Integridad Local</h4>
              </div>
              <ul className="space-y-4">
                {[
                  'Extracción via X-Road Security Server',
                  'Auditoría de integridad habilitada',
                  'Firma digital en cada paquete XLSX',
                  'Logs de descarga registrados'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-bold text-slate-400">
                     <div className="mt-1 h-1 w-1 bg-blue-500 rounded-full shrink-0" />
                     {item}
                  </li>
                ))}
              </ul>
           </GlassCard>

           <GlassCard className="p-6 border-slate-700/50">
              <div className="flex items-center gap-3 mb-4">
                 <Info className="h-6 w-6 text-slate-500" />
                 <h4 className="text-xs font-black text-white uppercase tracking-widest">Documentación</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
                 Los reportes generados cumplen con el estándar técnico de interoperabilidad v2.0. Utilice software compatible con Office 365 para visualización de macros corporativos.
              </p>
              <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-slate-700">
                 Ver Guía de Uso
              </button>
           </GlassCard>
        </div>
      </div>
    </div>
  )
}
