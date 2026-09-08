import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../services/api'

const STORAGE_KEYS = {
  CURRENT_USER: 'govstake_current_user',
  ACCESS_TOKEN: 'govstake_access_token',
  REFRESH_TOKEN: 'govstake_refresh_token',
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    const savedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password)
      const { access_token, refresh_token, user: backendUser } = response.data
      if (!backendUser) throw new Error('Respuesta de autenticación inválida')

      const userData = {
        id: backendUser.email,
        email: backendUser.email,
        name: backendUser.name,
        role: backendUser.role,
      }
      setUser(userData)
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData))
      if (access_token) localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token)
      if (refresh_token) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token)
      return userData
    } catch {
      throw new Error('Correo o contraseña incorrectos')
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  }

  const isAdmin = () => user?.role === 'admin'
  const isAuthenticated = () => user !== null && !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)

  const value = { user, loading, login, logout, isAdmin, isAuthenticated }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  return context
}