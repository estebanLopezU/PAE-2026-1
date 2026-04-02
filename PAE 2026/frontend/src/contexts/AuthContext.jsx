import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Credenciales del administrador
const ADMIN_CREDENTIALS = {
  email: 'elopezu@unal.edu.co',
  password: 'BZTfne48'
}

// Clave para localStorage
const STORAGE_KEYS = {
  USERS: 'xroad_users',
  CURRENT_USER: 'xroad_current_user',
  ADMIN_ATTEMPTS: 'xroad_admin_attempts'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adminAttempts, setAdminAttempts] = useState(0)

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
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
    
    // Verificar si es correo de admin
    if (email === ADMIN_CREDENTIALS.email) {
      throw new Error('Este correo está reservado para administradores')
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
  const loginUser = (email, password) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
    const foundUser = users.find(u => u.email === email && u.password === password)
    
    if (!foundUser) {
      throw new Error('Correo o contraseña incorrectos')
    }
    
    const userData = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: 'user'
    }
    
    setUser(userData)
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData))
    
    return userData
  }

  // Iniciar sesión como administrador
  const loginAdmin = (email, password) => {
    // Verificar intentos
    if (adminAttempts >= 3) {
      setAdminAttempts(0)
      throw new Error('Demasiados intentos fallidos. Volviendo a la pantalla principal...')
    }
    
    // Verificar credenciales
    if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
      setAdminAttempts(prev => prev + 1)
      const remaining = 3 - (adminAttempts + 1)
      throw new Error(`Credenciales incorrectos. Intentos restantes: ${remaining}`)
    }
    
    // Login exitoso - reiniciar contador
    setAdminAttempts(0)
    
    const userData = {
      id: 'admin',
      email: ADMIN_CREDENTIALS.email,
      name: 'Administrador X-Road',
      role: 'admin'
    }
    
    setUser(userData)
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData))
    
    return userData
  }

  // Cerrar sesión
  const logout = () => {
    setUser(null)
    setAdminAttempts(0)
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  }

  // Verificar si el usuario es administrador
  const isAdmin = () => {
    return user?.role === 'admin'
  }

  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return user !== null
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