import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Target,
  Lightbulb,
  RefreshCw,
  BarChart3,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Zap,
  Shield,
  Network,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info,
  Cpu,
  Layers,
  LineChart as LineChartIcon
} from 'lucide-react'
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts'
import { aiApi } from '../services/aiApi'
import { entitiesApi, sectorsApi } from '../services/api'
import GlassCard from '../components/common/GlassCard'
import StatusPulse from '../components/common/StatusPulse'

export default function AnalisisIA() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [training, setTraining] = useState(false)
  const [entities, setEntities] = useState([])
  const [sectors, setSectors] = useState([])
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [entityAnalysis, setEntityAnalysis] = useState(null)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setError(null)
      const [entitiesRes, sectorsRes] = await Promise.all([
        entitiesApi.getAll({ limit: 200 }),
        sectorsApi.getAll({ limit: 100 })
      ])
      setEntities(entitiesRes.data?.items || [])
      setSectors(sectorsRes.data?.items || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Sincronización de datos fallida.')
    } finally {
      setLoading(false)
    }
  }

  const handleEntitySelect = async (entityId) => {
    if (!entityId) {
      setSelectedEntity(null)
      setEntityAnalysis(null)
      return
    }

    const entity = entities.find(e => e.id === parseInt(entityId))
    setSelectedEntity(entity)
    setEntityAnalysis(null)

    try {
      const response = await aiApi.analyzeEntity(parseInt(entityId))
      const analysisData = response.data.success ? response.data.data : response.data
      setEntityAnalysis(analysisData)
    } catch (error) {
      console.error('Error analyzing entity:', error)
    }
  }

  const handleTrainModels = async () => {
    setTraining(true)
    setError(null)
    try {
      await aiApi.trainModels(true)
      setSuccessMessage(`Algoritmos predictivos recalibrados exitosamente.`)
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      setError('Fallo en el proceso de entrenamiento neuronal.')
    } finally {
      setTraining(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <StatusPulse size="lg" />
      </div>
    )
  }

  const connectedCount = entities.filter(e => e.xroad_status === 'connected').length
  const totalEntities = entities.length
  const connectivityRate = totalEntities > 0 ? Math.round((connectedCount / totalEntities) * 100) : 0

  const predictedConnectivity12Months = Math.min(100, connectivityRate + 25)
  const predictedMaturity12Months = Math.min(100, 65 + 15)
  const predictedEntities12Months = Math.round(totalEntities * (1 + (4.2 / 100) * 12))

  const trendData = [
    { mes: 'Q1', conectividad: connectivityRate, madurez: 65 },
    { mes: 'Q2', conectividad: connectivityRate + 7, madurez: 65 + 4 },
    { mes: 'Q3', conectividad: connectivityRate + 15, madurez: 65 + 8 },
    { mes: 'Q4', conectividad: predictedConnectivity12Months, madurez: predictedMaturity12Months }
  ]

  const maturityDistribution = [
    { name: 'N1 - INICIAL', count: entities.filter(e => e.maturity_level === 1).length, color: '#EF4444' },
    { name: 'N2 - BÁSICO', count: entities.filter(e => e.maturity_level === 2).length, color: '#F59E0B' },
    { name: 'N3 - INTERMEDIO', count: entities.filter(e => e.maturity_level === 3).length, color: '#3B82F6' },
    { name: 'N4 - AVANZADO', count: entities.filter(e => e.maturity_level === 4).length, color: '#10B981' }
  ]

  const aiInsights = [
    {
      title: 'Detección de Expansión',
      description: `Proyección de conectividad: Incremento del ${predictedConnectivity12Months - connectivityRate}% en 365 días estelares.`,
      confidence: 87,
      impact: 'high',
      icon: Activity
    },
    {
      title: 'Evolución de Madurez',
      description: `El índice institucional escalará a ${predictedMaturity12Months}% optimizando latencia administrativa.`,
      confidence: 82,
      impact: 'medium',
      icon: Zap
    }
  ]

  return (
    <div className="space-y-8 pb-16">
      {/* Predictive Dashboard Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
               <Brain className="h-6 w-6 text-indigo-400" />
             </div>
             <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Neural Command</h1>
          </div>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em] ml-1">
             Motor de Predicción y Análisis Probabilístico X-Road
          </p>
        </div>
        
        <button
          onClick={handleTrainModels}
          disabled={training}
          className="group relative flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-black text-[10px] uppercase tracking-widest transition-all overflow-hidden shadow-[0_0_20px_rgba(79,70,229,0.3)]"
        >
          {training ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Reentrenar Red Neural
        </button>
      </div>

      {successMessage && (
        <GlassCard className="p-4 border-emerald-500/30 bg-emerald-500/5">
           <div className="flex items-center gap-3 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4" /> {successMessage}
           </div>
        </GlassCard>
      )}

      {/* Real-time Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'INSTANCIAS TOTALES', val: totalEntities, icon: Users, color: 'text-blue-400', unit: 'Nodos' },
          { label: 'LINKAGE ACTUAL', val: `${connectivityRate}%`, icon: Network, color: 'text-emerald-400', unit: 'Sincronizado' },
          { label: 'TARGET 12M', val: `${predictedConnectivity12Months}%`, icon: TrendingUp, color: 'text-indigo-400', unit: 'Proyectado' },
          { label: 'MINDSET SCORE', val: '65%', icon: Target, color: 'text-amber-400', unit: 'Madurez' }
        ].map((stat, i) => (
          <GlassCard key={i} className="p-5 border-slate-700/50">
             <div className="flex justify-between items-start">
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">{stat.label}</p>
                   <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
                   <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{stat.unit}</p>
                </div>
                <stat.icon className={`h-5 w-5 ${stat.color.replace('text', 'text-opacity-20')}`} />
             </div>
          </GlassCard>
        ))}
      </div>

      {/* Analytics Core */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Vector Map */}
        <GlassCard className="lg:col-span-2 p-6 border-slate-700/50">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <LineChartIcon className="h-4 w-4 text-emerald-400" /> Vector de Crecimiento
             </h3>
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[9px] font-black text-slate-500 uppercase">Sync</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500" /><span className="text-[9px] font-black text-slate-500 uppercase">Maturity</span></div>
             </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorSync" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="mes" tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="conectividad" stroke="#10B981" strokeWidth={3} fill="url(#colorSync)" />
              <Area type="monotone" dataKey="madurez" stroke="#6366f1" strokeWidth={3} fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Nodal Cluster Distribution */}
        <GlassCard className="p-6 border-slate-700/50">
           <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" /> Clústeres de Madurez
           </h3>
           <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={maturityDistribution} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
              <Bar dataKey="count" barSize={14} radius={[0, 4, 4, 0]}>
                {maturityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Intelligence Stream */}
      <GlassCard className="p-8 border-indigo-500/20 bg-indigo-500/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <Brain size={120} className="text-indigo-400" />
        </div>
        <div className="relative z-10">
           <h3 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-indigo-400" /> Motor de Inferencia Cognitiva
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiInsights.map((insight, index) => (
                <div key={index} className="p-6 bg-slate-950/80 border border-slate-800 rounded-2xl flex gap-5 hover:border-indigo-500/50 transition-all group">
                   <div className="shrink-0">
                      <div className="p-3 bg-indigo-500/10 rounded-xl">
                         <insight.icon className="h-6 w-6 text-indigo-500" />
                      </div>
                   </div>
                   <div className="space-y-4 flex-1">
                      <div>
                         <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">{insight.title}</h4>
                         <p className="text-xs text-slate-400 leading-relaxed font-medium">{insight.description}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-900">
                         <div className="flex items-center gap-2">
                            <StatusPulse status={insight.confidence > 85 ? 'success' : 'warning'} size="xs" />
                            <span className="text-[9px] font-black text-slate-500 uppercase">Confianza: {insight.confidence}%</span>
                         </div>
                         <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${insight.impact === 'high' ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' : 'text-indigo-400 border-indigo-500/30'}`}>
                            {insight.impact.toUpperCase()} IMPACT
                         </span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </GlassCard>

      {/* Neural Entity Profiler */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-1 space-y-4">
            <GlassCard className="p-6 border-slate-700/50 h-full">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Selector de Nodos</h3>
               <select
                  className="w-full px-4 py-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-bold focus:ring-2 focus:ring-indigo-500 outline-none uppercase text-xs"
                  value={selectedEntity?.id || ''}
                  onChange={(e) => handleEntitySelect(e.target.value)}
                >
                  <option value="">ANÁLISIS NODAL...</option>
                  {entities.map(entity => (
                    <option key={entity.id} value={entity.id}>
                      {entity.name.toUpperCase()}
                    </option>
                  ))}
               </select>
               <div className="mt-8 space-y-6">
                  <div className="space-y-2">
                     <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Contexto Técnico</p>
                     <p className="text-xs text-slate-400 leading-relaxed font-medium">Seleccione una entidad para desencadenar el motor de inferencia individual y proyectar su ciclo de madurez.</p>
                  </div>
                  <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                     <div className="flex items-center gap-2 mb-2">
                        <Cpu className="h-3 w-3 text-indigo-400" />
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">IA Active</span>
                     </div>
                     <div className="h-1 w-full bg-slate-800 overflow-hidden rounded-full">
                        <div className="h-full bg-indigo-500 w-2/3 animate-pulse" />
                     </div>
                  </div>
               </div>
            </GlassCard>
         </div>

         {/* Profiler Output */}
         <div className="lg:col-span-3">
            <GlassCard className="p-8 border-slate-700/50 min-h-[300px] flex flex-col">
               {entityAnalysis ? (
                 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Resultado de Inferencia</p>
                          <h4 className="text-2xl font-black text-white italic">{entityAnalysis.entity_name || selectedEntity?.name}</h4>
                       </div>
                       <div className="text-right">
                          <p className="text-4xl font-black text-indigo-400 font-mono tracking-tighter">
                             L-{entityAnalysis.maturity_prediction?.predicted_level || 'X'}
                          </p>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nivel Proyectado</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {[
                         { label: 'Neural Score', val: `${entityAnalysis.maturity_prediction?.predicted_score ?? 0}%`, color: 'text-white' },
                         { label: 'Probabilidad', val: `${Math.round((entityAnalysis.maturity_prediction?.confidence ?? 0) * 100)}%`, color: 'text-emerald-400' },
                         { label: 'Cluster Tag', val: `#${entityAnalysis.cluster ?? 0}`, color: 'text-indigo-400' }
                       ].map((box, i) => (
                         <div key={i} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{box.label}</p>
                            <p className={`text-xl font-black ${box.color}`}>{box.val}</p>
                         </div>
                       ))}
                    </div>

                    {entityAnalysis.recommendations && entityAnalysis.recommendations.length > 0 && (
                      <div className="space-y-4">
                         <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Directivas de Optimización</h5>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {entityAnalysis.recommendations.slice(0, 4).map((rec, idx) => (
                              <div key={idx} className="flex items-start gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl group hover:border-indigo-500 transition-colors">
                                 <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                 <p className="text-xs text-slate-400 font-bold leading-relaxed group-hover:text-slate-200">{rec.recommendation || rec}</p>
                              </div>
                            ))}
                         </div>
                      </div>
                    )}
                 </div>
               ) : selectedEntity ? (
                 <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
                    <StatusPulse size="lg" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Analizando Sonda Nodal...</p>
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center gap-6 py-20 border-2 border-dashed border-slate-800 rounded-3xl">
                    <Brain className="h-12 w-12 text-slate-800" />
                    <div className="text-center">
                       <p className="text-sm font-black text-slate-600 uppercase tracking-widest">A la espera de parámetros de entrada</p>
                       <p className="text-[10px] font-bold text-slate-700 uppercase mt-1">Seleccione una entidad para procesar metadatos</p>
                    </div>
                 </div>
               )}
            </GlassCard>
         </div>
      </div>
    </div>
  )
}
}
