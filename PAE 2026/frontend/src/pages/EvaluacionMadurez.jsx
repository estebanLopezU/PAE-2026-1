import { useState, useEffect } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Plus } from 'lucide-react'
import { maturityApi, entitiesApi, dashboardApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const maturityLevelLabels = {
  1: 'Inicial',
  2: 'Básico',
  3: 'Intermedio',
  4: 'Avanzado'
}

const maturityLevelColors = {
  1: '#EF4444',
  2: '#F59E0B',
  3: '#3B82F6',
  4: '#10B981'
}

const domainLabels = {
  legal: 'Legal',
  organizational: 'Organizacional',
  semantic: 'Semántico',
  technical: 'Técnico'
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
      setError('Error al cargar los datos. Por favor, intente de nuevo.')
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

  // Calculate overall score and level based on criteria
  const calculateMaturity = (criteria) => {
    const scores = Object.values(criteria)
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
    const normalizedScore = (avgScore / 4) * 100
    
    let level = 1
    if (normalizedScore >= 75) level = 4
    else if (normalizedScore >= 50) level = 3
    else if (normalizedScore >= 25) level = 2
    
    return { score: Math.round(normalizedScore), level }
  }

  // Calculate domain scores based on criteria
  const calculateDomainScores = (criteria) => {
    return {
      legal_domain_score: ((criteria.has_security_standards + criteria.has_interoperability_policy) / 2) * 25,
      organizational_domain_score: ((criteria.has_trained_personnel + criteria.has_interoperability_policy) / 2) * 25,
      semantic_domain_score: ((criteria.has_data_quality + criteria.uses_standard_protocols) / 2) * 25,
      technical_domain_score: ((criteria.api_documentation + criteria.uses_standard_protocols + criteria.has_security_standards) / 3) * 25
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const radarChartData = radarData ? Object.entries(radarData.domains).map(([key, value]) => ({
    domain: domainLabels[key],
    score: value,
    fullMark: 100
  })) : []

  const normalizedCriteria = radarData ? normalizeCriteria(radarData.criteria) : {}
  const criteriaChartData = radarData
    ? Object.keys(criteriaLabels).map((key) => ({
        criteria: criteriaLabels[key],
        score: normalizedCriteria[key] ?? 0
      }))
    : []
  const maxCriteriaScore = Math.max(4, ...criteriaChartData.map(item => item.score || 0))

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evaluación de Madurez</h1>
          <p className="mt-1 text-sm text-gray-500">
            Análisis del nivel de madurez según el Marco de Interoperabilidad del MinTIC
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error al cargar datos</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchData}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evaluación de Madurez</h1>
          <p className="mt-1 text-sm text-gray-500">
            Visualización del nivel de madurez según el Marco de Interoperabilidad del MinTIC
          </p>
        </div>
        {canCreate() && (
          <button className="btn btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Crear Evaluación
          </button>
        )}
      </div>

      <>
        {/* Entity Selector for Visualization */}
        <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="form-label">Seleccionar Entidad para Visualizar</label>
                <select
                  className="form-select"
                  value={selectedEntity?.id || ''}
                  onChange={(e) => handleEntitySelect(e.target.value)}
                >
                  <option value="">Seleccione una entidad...</option>
                  {entities.map(entity => (
                    <option key={entity.id} value={entity.id}>
                      {entity.name} {!hasAssessmentForEntity(entity.id) && '(Pendiente evaluación)'}
                    </option>
                  ))}
                </select>
                {entities.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">No hay entidades disponibles</p>
                )}
              </div>
              {selectedEntity && radarData && (
                <div className="flex items-center">
                  <div className="text-sm text-gray-600">
                    <strong>Nivel:</strong> {maturityLevelLabels[radarData.overall_level]} 
                    <span className="ml-2"><strong>Score:</strong> {radarData.overall_score}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* No Assessment Warning */}
          {selectedEntity && !hasAssessmentForEntity(selectedEntity.id) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Evaluación Pendiente</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      <strong>{selectedEntity.name}</strong> aún no tiene una evaluación de madurez registrada.
                    </p>
                    <p className="mt-2">
                      <strong>Justificación:</strong> Esta entidad está en proceso de evaluación según el Marco de Interoperabilidad del MinTIC. 
                      La evaluación se realizará próximamente por el equipo técnico responsable.
                    </p>
                    <p className="mt-2">
                      <strong>Razones posibles:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>La entidad fue creada recientemente y aún no ha sido evaluada</li>
                      <li>La evaluación está programada para el próximo período</li>
                      <li>Se requiere información adicional de la entidad para completar la evaluación</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charts */}
          {radarData && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Radar Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dominios de Madurez</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarChartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="domain" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke={maturityLevelColors[radarData.overall_level]}
                      fill={maturityLevelColors[radarData.overall_level]}
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Criteria Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Criterios de Evaluación</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={criteriaChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, maxCriteriaScore]} />
                    <YAxis dataKey="criteria" type="category" width={180} />
                    <Tooltip />
                    <Bar dataKey="score" fill={maturityLevelColors[radarData.overall_level]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Assessments Table */}
          <div className="table-scientific">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Evaluaciones Recientes</h3>
            </div>
            {assessments.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay evaluaciones</h3>
                <p className="mt-1 text-sm text-gray-500">No se encontraron evaluaciones de madurez registradas.</p>
                <div className="mt-6">
                  <p className="text-sm text-gray-500">
                    No se encontraron evaluaciones de madurez registradas.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Entidad</th>
                      <th>Nivel</th>
                      <th>Score</th>
                      <th>Fecha</th>
                      <th>Evaluador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map((assessment) => (
                      <tr key={assessment.id}>
                        <td>
                          <span className="font-semibold text-gray-900">{assessment.entity_name}</span>
                        </td>
                        <td>
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: maturityLevelColors[assessment.overall_level] }}
                          >
                            {maturityLevelLabels[assessment.overall_level]}
                          </span>
                        </td>
                        <td>
                          <span className="font-semibold text-gray-900">{assessment.overall_score}%</span>
                        </td>
                        <td>
                          <span className="text-gray-600">{new Date(assessment.assessment_date).toLocaleDateString()}</span>
                        </td>
                        <td>
                          <span className="text-gray-600">{assessment.assessor_name}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Statistics Summary */}
          {assessments.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de Evaluaciones</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{assessments.length}</div>
                  <div className="text-sm text-gray-500">Total Evaluaciones</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {assessments.filter(a => a.overall_level >= 3).length}
                  </div>
                  <div className="text-sm text-gray-500">Nivel Intermedio o Superior</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {assessments.filter(a => a.overall_level === 2).length}
                  </div>
                  <div className="text-sm text-gray-500">Nivel Básico</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {assessments.filter(a => a.overall_level === 1).length}
                  </div>
                  <div className="text-sm text-gray-500">Nivel Inicial</div>
                </div>
              </div>
            </div>
          )}
      </>
    </div>
  )
}
