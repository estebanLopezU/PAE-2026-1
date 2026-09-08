import axios from 'axios'

const API_BASE_URL = '/api/v1'
const ACCESS_TOKEN_KEY = 'govstake_access_token'
const REFRESH_TOKEN_KEY = 'govstake_refresh_token'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error?.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (!refreshToken) {
        localStorage.removeItem(ACCESS_TOKEN_KEY)
        return Promise.reject(error)
      }
      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        })
        const newAccessToken = refreshResponse.data?.access_token
        if (newAccessToken) {
          localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken)
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return api(originalRequest)
        }
      } catch {
        localStorage.removeItem(ACCESS_TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
}

// Actores API
export const actorsApi = {
  getAll: (params = {}) => api.get('/actors', { params }),
  getById: (id) => api.get(`/actors/${id}`),
  create: (data) => api.post('/actors', data),
  update: (id, data) => api.put(`/actors/${id}`, data),
  updateVariables: (id, variables) => api.put(`/actors/${id}/variables`, variables),
  delete: (id) => api.delete(`/actors/${id}`),
  evaluarAlertas: (id) => api.post(`/actors/${id}/evaluar-alertas`),
}

// Matriz API (mapa poder-legitimidad-influencia y priorización)
export const matrizApi = {
  priorizacion: () => api.get('/matriz/priorizacion'),
  mapa: () => api.get('/matriz/mapa'),
  resumen: () => api.get('/matriz/resumen'),
}

// Compromisos API
export const compromisosApi = {
  getAll: (params = {}) => api.get('/compromisos', { params }),
  create: (data) => api.post('/compromisos', data),
  update: (id, data) => api.put(`/compromisos/${id}`, data),
  delete: (id) => api.delete(`/compromisos/${id}`),
}

// Alertas API
export const alertasApi = {
  getAll: (params = {}) => api.get('/alertas', { params }),
  marcarLeida: (id) => api.patch(`/alertas/${id}`, { leida: true }),
  marcarTodas: () => api.post('/alertas/marcar-todas'),
}

// Relacionamientos API
export const relacionamientosApi = {
  getAll: (params = {}) => api.get('/relacionamientos', { params }),
  create: (data) => api.post('/relacionamientos', data),
  update: (id, data) => api.put(`/relacionamientos/${id}`, data),
  delete: (id) => api.delete(`/relacionamientos/${id}`),
}

// Dashboard API
export const dashboardApi = {
  get: () => api.get('/dashboard'),
}

// Protocolo de participación API
export const protocoloApi = {
  getAll: () => api.get('/protocolo'),
  porActor: (id) => api.get(`/protocolo/actor/${id}`),
}

// Reportes API
export const reportesApi = {
  ejecutivo: () => api.get('/reportes/ejecutivo'),
  porActores: () => api.get('/reportes/actores'),
}

export default api