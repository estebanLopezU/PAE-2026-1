import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

// Clave para localStorage
const STORAGE_KEYS = {
  USERS: 'xroad_users',
  CURRENT_USER: 'xroad_current_user',
  ACCESS_TOKEN: 'xroad_access_token',
  REFRESH_TOKEN: 'xroad_refresh_token',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adminAttempts, setAdminAttempts] = useState(0)

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    const savedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (savedUser) {
      try {
        if (!savedToken) {
          localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        } else {
          setUser(JSON.parse(savedUser))
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      }
    }
    setLoading(false)
  }, [])

  // Registrar nuevo usuario normal
  const registerUser = (email, password, name) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
    
    // Verificar si el correo ya existe
    if (users.find(u => u.email === email)) {
      throw new Error('El correo electrónico ya está registrado')
    }
    
    // Crear nuevo usuario
    const newUser = {
      id: Date.now(),
      email,
      password, // En producción debería estar hasheado
      name,
      role: 'user',
      createdAt: new Date().toISOString()
    }
    
    // Guardar en localStorage
    users.push(newUser)
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
    
    return newUser
  }

  // Iniciar sesión como usuario normal
  const loginUser = async (email, password) => {
    // Primero intentar autenticación backend (roles institucionales)
    try {
      const response = await authApi.login(email, password)
      const { access_token, refresh_token, user: backendUser } = response.data

      if (!backendUser) {
        throw new Error('Respuesta de autenticación inválida')
      }

      const userData = {
        id: backendUser.email,
        email: backendUser.email,
        name: backendUser.name,
        role: backendUser.role,
      }

      setUser(userData)
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData))
      if (access_token) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token)
      }
      if (refresh_token) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token)
      }

      return userData
    } catch {
      throw new Error('Correo o contraseña incorrectos')
    }
  }

  // Iniciar sesión como administrador
  const loginAdmin = async (email, password) => {
    // Verificar intentos
    if (adminAttempts >= 3) {
      setAdminAttempts(0)
      throw new Error('Demasiados intentos fallidos. Volviendo a la pantalla principal...')
    }

    try {
      const response = await authApi.login(email, password)
      const { access_token, refresh_token, user: backendUser } = response.data

      if (!backendUser || backendUser.role !== 'admin') {
        throw new Error('El usuario no tiene rol de administrador')
      }

      setAdminAttempts(0)

      const userData = {
        id: backendUser.email,
        email: backendUser.email,
        name: backendUser.name,
        role: backendUser.role,
      }

      setUser(userData)
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData))
      if (access_token) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token)
      }
      if (refresh_token) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token)
      }

      return userData
    } catch {
      setAdminAttempts(prev => prev + 1)
      const remaining = 3 - (adminAttempts + 1)
      throw new Error(`Credenciales incorrectos. Intentos restantes: ${remaining}`)
    }
  }

  // Cerrar sesión
  const logout = () => {
    setUser(null)
    setAdminAttempts(0)
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  }

  // Verificar si el usuario es administrador
  const isAdmin = () => {
    return user?.role === 'admin'
  }

  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return user !== null && !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  }

  // Verificar permisos
  const canEdit = () => {
    return user?.role === 'admin'
  }

  const canDelete = () => {
    return user?.role === 'admin'
  }

  const canCreate = () => {
    return user?.role === 'admin'
  }

  const value = {
    user,
    loading,
    adminAttempts,
    registerUser,
    loginUser,
    loginAdmin,
    logout,
    isAdmin,
    isAuthenticated,
    canEdit,
    canDelete,
    canCreate
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}