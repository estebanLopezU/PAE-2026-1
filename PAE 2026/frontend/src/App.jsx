import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import Entidades from './pages/Entidades'
import MatrizServicios from './pages/MatrizServicios'
import MapaInteractivo from './pages/MapaInteractivo'
import EvaluacionMadurez from './pages/EvaluacionMadurez'
import Reportes from './pages/Reportes'
import AnalisisIA from './pages/AnalisisIA'

// Componente para proteger rutas que requieren autenticación
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-200">Cargando...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Componente para rutas públicas (solo para usuarios no autenticados)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-200">Cargando...</p>
        </div>
      </div>
    )
  }
  
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

// Componente principal de rutas
function AppRoutes() {
  return (
    <Routes>
      {/* Ruta principal - Muestra login primero */}
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      
      {/* Ruta pública de login alternativa */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      
      {/* Rutas protegidas - Solo para usuarios autenticados */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/entidades" 
        element={
          <ProtectedRoute>
            <Layout>
              <Entidades />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/matriz" 
        element={
          <ProtectedRoute>
            <Layout>
              <MatrizServicios />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/mapa" 
        element={
          <ProtectedRoute>
            <Layout>
              <MapaInteractivo />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/evaluacion" 
        element={
          <ProtectedRoute>
            <Layout>
              <EvaluacionMadurez />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/reportes" 
        element={
          <ProtectedRoute>
            <Layout>
              <Reportes />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/analisis-ia" 
        element={
          <ProtectedRoute>
            <Layout>
              <AnalisisIA />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      {/* Redirigir cualquier ruta desconocida al login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Componente principal de la aplicación
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App