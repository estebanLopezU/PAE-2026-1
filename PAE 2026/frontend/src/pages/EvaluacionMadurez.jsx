import { useState, useEffect } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Plus, Award, Target, BarChart3, ChevronRight, Info, AlertOctagon, TrendingUp, Cpu, Shield } from 'lucide-react'
import { maturityApi, entitiesApi, dashboardApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import GlassCard from '../components/common/GlassCard'
import StatusPulse from '../components/common/StatusPulse'

const maturityLevelLabels = {
  1: 'INICIAL',
  2: 'BÁSICO',
  3: 'INTERMEDIO',
  4: 'AVANZADO'
}

const maturityLevelColors = {
  1: '#EF4444',
  2: '#F59E0B',
  3: '#3B82F6',
  4: '#10B981'
}

const domainLabels = {
  legal: 'LEGAL',
  organizational: 'ORGANIZACIONAL',
  semantic: 'SEMÁNTICO',
  technical: 'TÉCNICO'
}

const criteriaLabels = {
  api_documentation: 'Documentación APIs',
  standard_protocols: 'Protocolos Estándar',
  data_quality: 'Calidad Datos',
  security_standards: 'Seguridad',
  interoperability_policy: 'Política Interoperabilidad',
  trained_personnel: 'Personal Capacitado'
}

const criteriaDescriptions = {
  api_documentation: '¿La entidad tiene documentación completa de sus APIs?',
  standard_protocols: '¿Utiliza protocolos estándar (REST, SOAP, etc.)?',
  data_quality: '¿Los datos siguen estándares de calidad (metadatos, catálogos)?',
  security_standards: '¿Implementa estándares de seguridad (autenticación, cifrado)?',
  interoperability_policy: '¿Tiene políticas de interoperabilidad definidas?',
  trained_personnel: '¿El personal está capacitado en interoperabilidad?'
}

const getCriteriaInterpretation = (percentage) => {
  if (percentage >= 80) return 'ALTO CUMPLIMIENTO'
  if (percentage >= 60) return 'CUMPLIMIENTO MEDIO'
  if (percentage >= 40) return 'CUMPLIMIENTO BÁSICO'
  return 'CUMPLIMIENTO BAJO'
}

const criteriaKeyAliases = {
  has_api_documentation: 'api_documentation',
  uses_standard_protocols: 'standard_protocols',
  has_data_quality: 'data_quality',
  has_security_standards: 'security_standards',
  has_interoperability_policy: 'interoperability_policy',
  has_trained_personnel: 'trained_personnel'
}

const normalizeCriteria = (rawCriteria = {}) => {
  return Object.entries(rawCriteria).reduce((acc, [rawKey, rawValue]) => {
    const normalizedKey = criteriaKeyAliases[rawKey] || rawKey
    const normalizedValue = typeof rawValue === 'boolean' ? (rawValue ? 1 : 0) : Number(rawValue) || 0
    acc[normalizedKey] = normalizedValue
    return acc
  }, {})
}

export default function EvaluacionMadurez() {
  const { canCreate } = useAuth()
  const [assessments, setAssessments] = useState([])
  const [entities, setEntities] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [radarData, setRadarData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setError(null)
      const [assessmentsRes, entitiesRes] = await Promise.all([
        maturityApi.getAssessments({ limit: 150 }),
        entitiesApi.getAll({ limit: 150 })
      ])
      
      const assessmentsData = Array.isArray(assessmentsRes.data) ? assessmentsRes.data : []
      setAssessments(assessmentsData)
      
      const entitiesData = entitiesRes.data?.items || []
      setEntities(entitiesData)
      
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Error al cargar los datos del sistema de madurez.')
    } finally {
      setLoading(false)
    }
  }

  const handleEntitySelect = async (entityId) => {
    if (!entityId) {
      setSelectedEntity(null)
      setRadarData(null)
      return
    }

    try {
      const response = await dashboardApi.getMaturityRadar(entityId)
      setRadarData(response.data)
      setSelectedEntity(entities.find(e => e.id === parseInt(entityId)))
    } catch (error) {
      console.error('Error fetching radar data:', error)
    }
  }

  const hasAssessmentForEntity = (entityId) => {
    const normalizedEntityId = Number(entityId)
    return assessments.some((assessment) => Number(assessment.entity_id) === normalizedEntityId)
  }

  if (loading) {
    return (
       <div className="flex min-h-[60vh] items-center justify-center">
         <StatusPulse size="lg" />
       </div>
    )
  }

  const radarChartData = radarData ? Object.entries(radarData.domains).map(([key, value]) => ({
    domain: domainLabels[key],
    score: value,
    fullMark: 100
  })) : []

  const normalizedCriteriaData = radarData ? normalizeCriteria(radarData.criteria) : {}
  const criteriaChartData = radarData
    ? Object.keys(criteriaLabels).map((key) => ({
        criteria: criteriaLabels[key],
        key,
        score: normalizedCriteriaData[key] ?? 0
      }))
    : []
  const maxCriteriaScore = Math.max(4, ...criteriaChartData.map(item => item.score || 0))
  const criteriaTechnicalTableData = criteriaChartData.map((item) => {
    const normalizedPercentage = maxCriteriaScore > 0 ? (item.score / maxCriteriaScore) * 100 : 0
    return {
      ...item,
      percentage: normalizedPercentage,
      interpretation: getCriteriaInterpretation(normalizedPercentage),
      description: criteriaDescriptions[item.key]
    }
  })

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
               <Target className="h-6 w-6 text-blue-400" />
             </div>
             <h1 className="text-4xl font-bold tracking-tight text-white uppercase">Evaluación de Madurez</h1>
          </div>
          <p className="text-slate-400 font-medium max-w-xl text-sm">
             Métrica de evolución institucional basada en el Marco de Interoperabilidad del Gobierno de Colombia.
          </p>
        </div>
        {canCreate() && (
          <button className="group relative flex items-center gap-3 px-8 py-4 bg-white hover:bg-slate-200 rounded-xl text-slate-900 font-black text-xs uppercase tracking-widest transition-all overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Plus className="h-4 w-4" />
            Nueva Auditoría
          </button>
        )}
      </div>

      {error ? (
        <GlassCard className="p-8 border-red-500/30 bg-red-500/5 text-center">
             <AlertOctagon className="h-12 w-12 text-red-500 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-white uppercase mb-2">Error de Sincronización</h3>
             <p className="text-slate-400 mb-6">{error}</p>
             <button onClick={fetchData} className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-black uppercase tracking-widest">
                Reintentar Conexión
             </button>
        </GlassCard>
      ) : (
        <>
          {/* Selector Panel */}
          <GlassCard className="p-6 border-slate-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Entidad en Análisis</label>
                <select
                  className="w-full px-4 py-4 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-200 font-bold focus:ring-2 focus:ring-blue-500/50 outline-none uppercase"
                  value={selectedEntity?.id || ''}
                  onChange={(e) => handleEntitySelect(e.target.value)}
                >
                  <option value="">SELECCIONAR NODO...</option>
                  {entities.map(entity => (
                    <option key={entity.id} value={entity.id}>
                      {entity.name.toUpperCase()} {!hasAssessmentForEntity(entity.id) && '[PENDIENTE]'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedEntity && radarData ? (
                <div className="flex gap-6 items-center">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SCORE GLOBAL</span>
                      <div className="flex items-baseline gap-2">
                         <span className="text-4xl font-black text-white">{radarData.overall_score}%</span>
                         <TrendingUp className="h-4 w-4 text-emerald-400" />
                      </div>
                   </div>
                   <div className="h-12 w-[1px] bg-slate-800 hidden md:block" />
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">NIVEL ALCANZADO</span>
                      <div className="flex items-center gap-3">
                         <StatusPulse status={radarData.overall_level >= 3 ? 'success' : radarData.overall_level === 2 ? 'warning' : 'error'} size="sm" />
                         <span className="text-xl font-black text-slate-200 tracking-tight uppercase" style={{ color: maturityLevelColors[radarData.overall_level] }}>
                            {maturityLevelLabels[radarData.overall_level]}
                         </span>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-slate-600 italic text-sm">
                   <Info className="h-5 w-5" />
                   Seleccione una entidad para desplegar el radar de madurez.
                </div>
              )}
            </div>
          </GlassCard>

          {/* Pending Warning */}
          {selectedEntity && !hasAssessmentForEntity(selectedEntity.id) && (
            <GlassCard className="p-6 border-amber-500/30 bg-amber-500/5">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <AlertOctagon className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-2">Protocolo de Evaluación Pendiente</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                    Este nodo institucional aún no ha completado el ciclo de auditoría de madurez. Los datos mostrados podrían ser proyecciones basadas en infraestructura base. Se requiere ejecución de auditoría técnica dirigida.
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Charts Grid */}
          {radarData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard className="p-6 border-slate-700/50">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-sm font-black text-white uppercase tracking-widest">Espectro de Dominios</h3>
                   <Cpu className="h-4 w-4 text-slate-700" />
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="domain" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Audit Score"
                      dataKey="score"
                      stroke={maturityLevelColors[radarData.overall_level]}
                      fill={maturityLevelColors[radarData.overall_level]}
                      fillOpacity={0.6}
                    />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', fontSize: '10px', borderRadius: '12px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </GlassCard>

              <GlassCard className="p-6 border-slate-700/50">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-sm font-black text-white uppercase tracking-widest">Análisis de Criterios</h3>
                   <BarChart3 className="h-4 w-4 text-slate-700" />
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={criteriaChartData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" domain={[0, maxCriteriaScore]} hide />
                    <YAxis dataKey="criteria" type="category" width={160} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} />
                    <Bar 
                        dataKey="score" 
                        fill={maturityLevelColors[radarData.overall_level]} 
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </GlassCard>
            </div>
          )}

          {radarData && (
            <GlassCard className="overflow-hidden border-slate-700/50">
              <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Matriz Técnica de Evaluación de Criterios</h3>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Escala normalizada: 0% a 100%
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/50 border-b border-slate-800">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Criterio</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Valor Obtenido</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Porcentaje</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Interpretación</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Criterio Técnico Evaluado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {criteriaTechnicalTableData.map((row) => (
                      <tr key={row.key} className="hover:bg-white/5 transition-colors align-top">
                        <td className="px-6 py-4 text-xs font-bold text-slate-200">{row.criteria}</td>
                        <td className="px-6 py-4 text-center text-xs font-mono font-bold text-white">{row.score.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black tracking-widest border border-blue-500/30 text-blue-300 bg-blue-500/10">
                            {row.percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-amber-300">{row.interpretation}</td>
                        <td className="px-6 py-4 text-xs text-slate-400 leading-relaxed">{row.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {/* Assessments Registry */}
          <GlassCard className="overflow-hidden border-slate-700/50">
            <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Registro Histórico de Auditorías</h3>
              <div className="p-1.5 bg-blue-500/10 rounded-lg">
                 <Shield className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            
            {assessments.length === 0 ? (
              <div className="p-16 text-center">
                <Award className="h-12 w-12 text-slate-800 mx-auto mb-4" />
                <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">No se registran trazabilidades de madurez en el sistema</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/50 border-b border-slate-800">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Entidad Auditada</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Nivel</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Score</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Fecha Sinc.</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Auditor Responsable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {assessments.map((assessment) => (
                      <tr key={assessment.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-5 text-xs font-bold text-slate-200">
                           {assessment.entity_name.toUpperCase()}
                        </td>
                        <td className="px-6 py-5 text-center">
                           <span
                             className="inline-flex items-center px-4 py-1 rounded-lg text-[9px] font-black text-white uppercase tracking-widest"
                             style={{ backgroundColor: `${maturityLevelColors[assessment.overall_level]}20`, color: maturityLevelColors[assessment.overall_level], border: `1px solid ${maturityLevelColors[assessment.overall_level]}40` }}
                           >
                             {maturityLevelLabels[assessment.overall_level]}
                           </span>
                        </td>
                        <td className="px-6 py-5 text-center text-xs font-mono font-bold text-white">
                           {assessment.overall_score}%
                        </td>
                        <td className="px-6 py-5 text-center text-[10px] font-bold text-slate-500 font-mono">
                           {new Date(assessment.assessment_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                             <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-[8px]">{assessment.assessor_name[0]}</div>
                             {assessment.assessor_name}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>

          {/* Stats Summary */}
          {assessments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <GlassCard className="p-5 text-center border-slate-700/50">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">TOTAL AUDITS</p>
                  <p className="text-2xl font-black text-white">{assessments.length}</p>
               </GlassCard>
               <GlassCard className="p-5 text-center border-l-2 border-emerald-500">
                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">HIGH MATURITY</p>
                  <p className="text-2xl font-black text-white">{assessments.filter(a => a.overall_level >= 3).length}</p>
               </GlassCard>
               <GlassCard className="p-5 text-center border-l-2 border-amber-500">
                  <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">BASIC N NODES</p>
                  <p className="text-2xl font-black text-white">{assessments.filter(a => a.overall_level === 2).length}</p>
               </GlassCard>
               <GlassCard className="p-5 text-center border-l-2 border-red-500">
                  <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">INITIAL PHASE</p>
                  <p className="text-2xl font-black text-white">{assessments.filter(a => a.overall_level === 1).length}</p>
               </GlassCard>
            </div>
          )}
        </>
      )}
    </div>
  )
}
