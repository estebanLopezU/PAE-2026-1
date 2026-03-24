import { useState, useEffect } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { maturityApi, entitiesApi, dashboardApi } from '../services/api'
import clsx from 'clsx'

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

export default function EvaluacionMadurez() {
  const [assessments, setAssessments] = useState([])
  const [entities, setEntities] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [radarData, setRadarData] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('view') // 'view' | 'create' | 'edit'
  const [successMessage, setSuccessMessage] = useState('')
  
  // Form state for creating/editing assessments
  const [formData, setFormData] = useState({
    entity_id: '',
    overall_level: 1,
    overall_score: 0,
    legal_domain_score: 0,
    organizational_domain_score: 0,
    semantic_domain_score: 0,
    technical_domain_score: 0,
    has_api_documentation: 0,
    uses_standard_protocols: 0,
    has_data_quality: 0,
    has_security_standards: 0,
    has_interoperability_policy: 0,
    has_trained_personnel: 0,
    assessor_name: '',
    assessor_notes: '',
    recommendations: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setError(null)
      const [assessmentsRes, entitiesRes] = await Promise.all([
        maturityApi.getAssessments({ limit: 100 }),
        entitiesApi.getAll({ limit: 100 })
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

  const handleCriteriaChange = (field, value) => {
    const newCriteria = {
      ...formData,
      [field]: parseInt(value)
    }
    
    const maturity = calculateMaturity({
      api_documentation: newCriteria.has_api_documentation,
      standard_protocols: newCriteria.uses_standard_protocols,
      data_quality: newCriteria.has_data_quality,
      security_standards: newCriteria.has_security_standards,
      interoperability_policy: newCriteria.has_interoperability_policy,
      trained_personnel: newCriteria.has_trained_personnel
    })
    
    const domainScores = calculateDomainScores({
      api_documentation: newCriteria.has_api_documentation,
      uses_standard_protocols: newCriteria.uses_standard_protocols,
      has_data_quality: newCriteria.has_data_quality,
      has_security_standards: newCriteria.has_security_standards,
      has_interoperability_policy: newCriteria.has_interoperability_policy,
      trained_personnel: newCriteria.has_trained_personnel
    })
    
    setFormData({
      ...newCriteria,
      overall_score: maturity.score,
      overall_level: maturity.level,
      ...domainScores
    })
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.entity_id) errors.entity_id = 'Seleccione una entidad'
    if (!formData.assessor_name.trim()) errors.assessor_name = 'Ingrese el nombre del evaluador'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setSubmitting(true)
    try {
      if (editingAssessment) {
        await maturityApi.updateAssessment(editingAssessment.id, formData)
        setSuccessMessage('Evaluación actualizada exitosamente')
      } else {
        await maturityApi.createAssessment(formData)
        setSuccessMessage('Evaluación creada exitosamente')
      }
      
      // Reset form
      setFormData({
        entity_id: '',
        overall_level: 1,
        overall_score: 0,
        legal_domain_score: 0,
        organizational_domain_score: 0,
        semantic_domain_score: 0,
        technical_domain_score: 0,
        has_api_documentation: 0,
        uses_standard_protocols: 0,
        has_data_quality: 0,
        has_security_standards: 0,
        has_interoperability_policy: 0,
        has_trained_personnel: 0,
        assessor_name: '',
        assessor_notes: '',
        recommendations: ''
      })
      setEditingAssessment(null)
      setActiveTab('view')
      fetchData()
      
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error saving assessment:', error)
      setError(error.response?.data?.detail || 'Error al guardar la evaluación')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (assessment) => {
    setEditingAssessment(assessment)
    setFormData({
      entity_id: assessment.entity_id,
      overall_level: assessment.overall_level,
      overall_score: assessment.overall_score,
      legal_domain_score: assessment.legal_domain_score,
      organizational_domain_score: assessment.organizational_domain_score,
      semantic_domain_score: assessment.semantic_domain_score,
      technical_domain_score: assessment.technical_domain_score,
      has_api_documentation: assessment.has_api_documentation,
      uses_standard_protocols: assessment.uses_standard_protocols,
      has_data_quality: assessment.has_data_quality,
      has_security_standards: assessment.has_security_standards,
      has_interoperability_policy: assessment.has_interoperability_policy,
      has_trained_personnel: assessment.has_trained_personnel,
      assessor_name: assessment.assessor_name || '',
      assessor_notes: assessment.assessor_notes || '',
      recommendations: assessment.recommendations || ''
    })
    setActiveTab('create')
  }

  const handleDelete = async (assessmentId) => {
    if (!confirm('¿Está seguro de eliminar esta evaluación?')) return
    
    try {
      await maturityApi.deleteAssessment(assessmentId)
      setSuccessMessage('Evaluación eliminada exitosamente')
      fetchData()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error deleting assessment:', error)
      setError('Error al eliminar la evaluación')
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

  const criteriaChartData = radarData ? Object.entries(radarData.criteria).map(([key, value]) => ({
    criteria: criteriaLabels[key],
    score: value
  })) : []

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
            Análisis del nivel de madurez según el Marco de Interoperabilidad del MinTIC
          </p>
        </div>
        <button
          onClick={() => {
            setActiveTab(activeTab === 'create' ? 'view' : 'create')
            setEditingAssessment(null)
            setFormData({
              entity_id: '',
              overall_level: 1,
              overall_score: 0,
              legal_domain_score: 0,
              organizational_domain_score: 0,
              semantic_domain_score: 0,
              technical_domain_score: 0,
              has_api_documentation: 0,
              uses_standard_protocols: 0,
              has_data_quality: 0,
              has_security_standards: 0,
              has_interoperability_policy: 0,
              has_trained_personnel: 0,
              assessor_name: '',
              assessor_notes: '',
              recommendations: ''
            })
          }}
          className={clsx(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            activeTab === 'create'
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-primary-600 text-white hover:bg-primary-700"
          )}
        >
          {activeTab === 'create' ? 'Cancelar' : 'Nueva Evaluación'}
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('view')}
            className={clsx(
              "py-2 px-1 border-b-2 font-medium text-sm",
              activeTab === 'view'
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            Ver Evaluaciones
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={clsx(
              "py-2 px-1 border-b-2 font-medium text-sm",
              activeTab === 'create'
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            {editingAssessment ? 'Editar Evaluación' : 'Crear Evaluación'}
          </button>
        </nav>
      </div>

      {/* Create/Edit Form */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {editingAssessment ? 'Editar Evaluación de Madurez' : 'Nueva Evaluación de Madurez'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Entity Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entidad <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.entity_id}
                onChange={(e) => handleInputChange('entity_id', e.target.value)}
                className={clsx(
                  "w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500",
                  formErrors.entity_id && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                disabled={editingAssessment}
              >
                <option value="">Seleccione una entidad...</option>
                {entities.map(entity => (
                  <option key={entity.id} value={entity.id}>{entity.name}</option>
                ))}
              </select>
              {formErrors.entity_id && (
                <p className="mt-1 text-sm text-red-600">{formErrors.entity_id}</p>
              )}
            </div>

            {/* Assessor Info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evaluador <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.assessor_name}
                  onChange={(e) => handleInputChange('assessor_name', e.target.value)}
                  className={clsx(
                    "w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500",
                    formErrors.assessor_name && "border-red-300 focus:border-red-500 focus:ring-red-500"
                  )}
                  placeholder="Nombre del evaluador"
                />
                {formErrors.assessor_name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.assessor_name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas del Evaluador
                </label>
                <textarea
                  value={formData.assessor_notes}
                  onChange={(e) => handleInputChange('assessor_notes', e.target.value)}
                  rows={2}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Observaciones adicionales..."
                />
              </div>
            </div>

            {/* Maturity Criteria Assessment */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Criterios de Evaluación</h3>
              <p className="text-sm text-gray-500 mb-4">
                Evalúe cada criterio de 0 (no cumple) a 4 (cumple completamente)
              </p>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Object.entries(criteriaLabels).map(([key, label]) => (
                  <div key={key} className="border rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <p className="text-xs text-gray-500 mb-3">{criteriaDescriptions[key]}</p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="4"
                        value={formData[key === 'api_documentation' ? 'has_api_documentation' : 
                               key === 'standard_protocols' ? 'uses_standard_protocols' :
                               key === 'data_quality' ? 'has_data_quality' :
                               key === 'security_standards' ? 'has_security_standards' :
                               key === 'interoperability_policy' ? 'has_interoperability_policy' :
                               'has_trained_personnel']}
                        onChange={(e) => handleCriteriaChange(
                          key === 'api_documentation' ? 'has_api_documentation' : 
                          key === 'standard_protocols' ? 'uses_standard_protocols' :
                          key === 'data_quality' ? 'has_data_quality' :
                          key === 'security_standards' ? 'has_security_standards' :
                          key === 'interoperability_policy' ? 'has_interoperability_policy' :
                          'has_trained_personnel',
                          e.target.value
                        )}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-900 w-8 text-center">
                        {formData[key === 'api_documentation' ? 'has_api_documentation' : 
                                key === 'standard_protocols' ? 'uses_standard_protocols' :
                                key === 'data_quality' ? 'has_data_quality' :
                                key === 'security_standards' ? 'has_security_standards' :
                                key === 'interoperability_policy' ? 'has_interoperability_policy' :
                                'has_trained_personnel']}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculated Results */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">Resultados Calculados</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: maturityLevelColors[formData.overall_level] }}>
                    {formData.overall_score}%
                  </div>
                  <div className="text-sm text-gray-500">Puntuación General</div>
                </div>
                <div className="text-center">
                  <div 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: maturityLevelColors[formData.overall_level] }}
                  >
                    Nivel {formData.overall_level}: {maturityLevelLabels[formData.overall_level]}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Nivel de Madurez</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {formData.legal_domain_score.toFixed(0)}% / {formData.organizational_domain_score.toFixed(0)}% / {formData.semantic_domain_score.toFixed(0)}% / {formData.technical_domain_score.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-500">Legal / Org / Sem / Téc</div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recomendaciones
              </label>
              <textarea
                value={formData.recommendations}
                onChange={(e) => handleInputChange('recommendations', e.target.value)}
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Recomendaciones para mejorar la madurez..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('view')
                  setEditingAssessment(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={clsx(
                  "px-4 py-2 rounded-md text-sm font-medium text-white",
                  submitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primary-600 hover:bg-primary-700"
                )}
              >
                {submitting ? 'Guardando...' : (editingAssessment ? 'Actualizar Evaluación' : 'Crear Evaluación')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Tab */}
      {activeTab === 'view' && (
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
                      {entity.name} {!entity.maturity_level && '(Pendiente evaluación)'}
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
          {selectedEntity && !selectedEntity.maturity_level && (
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
                    <XAxis type="number" domain={[0, 4]} />
                    <YAxis dataKey="criteria" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="score" fill={maturityLevelColors[radarData.overall_level]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Assessments Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Evaluaciones Recientes</h3>
            </div>
            {assessments.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay evaluaciones</h3>
                <p className="mt-1 text-sm text-gray-500">No se encontraron evaluaciones de madurez registradas.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setActiveTab('create')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Crear Primera Evaluación
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entidad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evaluador</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assessments.map((assessment) => (
                      <tr key={assessment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {assessment.entity_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: maturityLevelColors[assessment.overall_level] }}
                          >
                            {maturityLevelLabels[assessment.overall_level]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assessment.overall_score}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(assessment.assessment_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {assessment.assessor_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(assessment)}
                            className="text-primary-600 hover:text-primary-900 mr-3"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(assessment.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
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
      )}
    </div>
  )
}