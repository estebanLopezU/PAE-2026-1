import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Activity } from 'lucide-react'
import StatusPulse from './components/common/StatusPulse'
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
import AuditoriaSeguridad from './pages/AuditoriaSeguridad'

// Componente para proteger rutas que requieren autenticación
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const [showLoading, setShowLoading] = useState(true)
  
  // Load fonts for loading screen
  useEffect(() => {
    if (!showLoading) return
    
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Fredoka+One&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [showLoading])
  
  // Floating dots for loading screen
  useEffect(() => {
    if (!showLoading) return
    
    const wrap = document.getElementById('fdots-app')
    if (!wrap) return
    
    const colors = ['#E05A6B','#F0843A','#EFC430','#4CAF6B','#3A9FD8','#8B5CF6']
    for (let i = 0; i < 24; i++) {
      const d = document.createElement('div')
      d.className = 'dot-app'
      const size = 8 + Math.random() * 20
      d.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random() * 98}%;
        top:${60 + Math.random() * 40}%;
        background:${colors[i % colors.length]};
        animation-duration:${3 + Math.random() * 5}s;
        animation-delay:${Math.random() * 5}s;
        position:absolute;
        border-radius:50%;
        opacity:0.18;
        animation:floatUpApp linear infinite;
      `
      wrap.appendChild(d)
    }
    
    return () => {
      while (wrap.firstChild) {
        wrap.removeChild(wrap.firstChild)
      }
    }
  }, [showLoading])
  
  // Hide loading after 1.8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false)
    }, 1800)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050a18] flex items-center justify-center">
        <StatusPulse size="lg" />
      </div>
    )
  }
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  
  // Show premium booting screen
  if (showLoading) {
    return (
      <div className="fixed inset-0 bg-[#050a18] z-[1000] flex flex-col items-center justify-center overflow-hidden">
        {/* Background Grid */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#007FFF 1px, transparent 1px), linear-gradient(90deg, #007FFF 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        <div className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full px-6">
          {/* Logo Animation */}
          <div className="relative">
             <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent opacity-50" />
                <Activity className="h-10 w-10 text-indigo-400 animate-pulse" />
             </div>
             {/* Orbital rings */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-indigo-500/10 rounded-full animate-[spin_4s_linear_infinite]" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-emerald-500/5 rounded-full animate-[spin_6s_linear_reverse_infinite]" />
          </div>

          <div className="space-y-6 w-full text-center">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white tracking-[0.3em] uppercase italic">Initializing</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">X-Road Interoperability Core</p>
            </div>

            {/* Booting Telemetry */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 font-mono text-[9px] text-indigo-400/70 text-left space-y-1.5 overflow-hidden font-bold">
               <p className="flex justify-between items-center"><span className="text-emerald-400/80">AUTHENTICATING_NODE...</span> <span className="text-[8px] opacity-40">0x00FF32</span></p>
               <p className="flex justify-between items-center">SYNCHRONIZING_FEDERATION... <span className="text-emerald-400">READY</span></p>
               <p className="flex justify-between items-center text-slate-500">ENCRYPTING_CHANNELS_TLS_1.3... <span className="animate-pulse">ACTIVE</span></p>
               <div className="pt-3">
                 <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 w-3/4 animate-[shimmer_2s_infinite]" style={{ backgroundSize: '200% 100%' }} />
                 </div>
               </div>
            </div>

            <div className="flex items-center justify-center gap-2">
               <StatusPulse size="xs" status="success" />
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Secure Node 7-B Online</span>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes shimmer {
            0% { background-position: 100% 0%; }
            100% { background-position: -100% 0%; }
          }
        `}</style>
      </div>
    )
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
      
      <Route 
        path="/auditoria-seguridad" 
        element={
          <ProtectedRoute>
            <Layout>
              <AuditoriaSeguridad />
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