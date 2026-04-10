import axios from 'axios'

const API_BASE_URL = '/api/v1'
const ACCESS_TOKEN_KEY = 'xroad_access_token'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
}

// Sectors API
export const sectorsApi = {
  getAll: (params = {}) => api.get('/sectors/', { params }),
  getById: (id) => api.get(`/sectors/${id}`),
  create: (data) => api.post('/sectors/', data),
  update: (id, data) => api.put(`/sectors/${id}`, data),
  delete: (id) => api.delete(`/sectors/${id}`),
}

// Entities API
export const entitiesApi = {
  getAll: (params = {}) => api.get('/entities/', { params }),
  getById: (id) => api.get(`/entities/${id}`),
  create: (data) => api.post('/entities/', data),
  update: (id, data) => api.put(`/entities/${id}`, data),
  delete: (id) => api.delete(`/entities/${id}`),
}

// Services API
export const servicesApi = {
  getAll: (params = {}) => api.get('/services/', { params }),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services/', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
}

// Maturity API
export const maturityApi = {
  getLevels: () => api.get('/maturity/levels'),
  getAssessments: (params = {}) => api.get('/maturity/assessments', { params }),
  getAssessment: (id) => api.get(`/maturity/assessments/${id}`),
  getLatestAssessment: (entityId) => api.get(`/maturity/entity/${entityId}/latest`),
  createAssessment: (data) => api.post('/maturity/assessments', data),
  updateAssessment: (id, data) => api.put(`/maturity/assessments/${id}`, data),
  deleteAssessment: (id) => api.delete(`/maturity/assessments/${id}`),
}

// Dashboard API
export const dashboardApi = {
  getKpis: () => api.get('/dashboard/kpis'),
  getBySector: () => api.get('/dashboard/by-sector'),
  getByDepartment: () => api.get('/dashboard/by-department'),
  getByXroadStatus: () => api.get('/dashboard/by-xroad-status'),
  getServicesByProtocol: () => api.get('/dashboard/services-by-protocol'),
  getTopMatureEntities: (limit = 10) => api.get('/dashboard/top-mature-entities', { params: { limit } }),
  getMaturityRadar: (entityId) => api.get(`/dashboard/maturity-radar/${entityId}`),
}

// Reports API
export const reportsApi = {
  downloadEntitiesXlsx: () => api.get('/reports/entities/xlsx', { responseType: 'blob' }),
  downloadServicesXlsx: () => api.get('/reports/services/xlsx', { responseType: 'blob' }),
  downloadMaturityXlsx: () => api.get('/reports/maturity/xlsx', { responseType: 'blob' }),
}

export default api
