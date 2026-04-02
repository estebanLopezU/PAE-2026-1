import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
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
  
  // Hide loading after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false)
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [])
  
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
  
  // Show loading screen
  if (showLoading) {
    return (
      <>
        <style>{`
          .login-loading-screen-app {
            position: fixed;
            inset: 0;
            background: #0f0f13;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            animation: fadeInApp 0.5s ease;
          }
          
          .floating-dots-app {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 0;
          }
          
          .dot-app {
            position: absolute;
            border-radius: 50%;
            opacity: 0.18;
            animation: floatUpApp linear infinite;
          }
          
          @keyframes floatUpApp {
            0%   { transform: translateY(0) scale(1); opacity: 0.18; }
            50%  { opacity: 0.28; }
            100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
          }
          
          .loading-wrap-app {
            min-height: 420px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 32px;
            padding: 40px 20px;
            overflow: hidden;
            position: relative;
            z-index: 1;
          }
          
          .title-row-app {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          
          .loading-letter-app {
            font-family: 'Fredoka One', cursive;
            font-size: 72px;
            display: inline-block;
            animation: bounceApp 0.8s ease-in-out infinite;
            line-height: 1;
          }
          
          .loading-letter-app:nth-child(1)  { animation-delay: 0.0s; color: #E05A6B; }
          .loading-letter-app:nth-child(2)  { animation-delay: 0.1s; color: #F0843A; }
          .loading-letter-app:nth-child(3)  { animation-delay: 0.2s; color: #EFC430; }
          .loading-letter-app:nth-child(4)  { animation-delay: 0.3s; color: #4CAF6B; }
          .loading-letter-app:nth-child(5)  { animation-delay: 0.4s; color: #3A9FD8; }
          .loading-letter-app:nth-child(6)  { animation-delay: 0.5s; color: #8B5CF6; }
          .loading-letter-app:nth-child(7)  { animation-delay: 0.6s; color: #E05A6B; }
          
          @keyframes bounceApp {
            0%, 100% { transform: translateY(0) rotate(-2deg) scale(1); }
            40%       { transform: translateY(-18px) rotate(3deg) scale(1.1); }
            60%       { transform: translateY(-10px) rotate(-1deg) scale(1.05); }
          }
          
          .dots-row-app {
            display: flex;
            gap: 10px;
            margin-top: -10px;
          }
          
          .dot-anim-app {
            width: 14px; height: 14px;
            border-radius: 50%;
            animation: dotPulseApp 1.2s ease-in-out infinite;
          }
          
          .dot-anim-app:nth-child(1) { background: #E05A6B; animation-delay: 0s; }
          .dot-anim-app:nth-child(2) { background: #EFC430; animation-delay: 0.2s; }
          .dot-anim-app:nth-child(3) { background: #4CAF6B; animation-delay: 0.4s; }
          
          @keyframes dotPulseApp {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50%       { transform: scale(1.7); opacity: 1; }
          }
          
          .progress-container-app {
            width: 320px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          
          .progress-track-app {
            height: 12px;
            background: #1e1e2a;
            border-radius: 20px;
            overflow: hidden;
            border: 1px solid #2e2e3e;
          }
          
          .progress-fill-app {
            height: 100%;
            border-radius: 20px;
            background: linear-gradient(90deg, #E05A6B, #EFC430, #4CAF6B, #3A9FD8, #8B5CF6);
            background-size: 300% 100%;
            animation: progressSlideApp 2.5s ease-in-out infinite, shimmerApp 2s linear infinite;
            width: 0%;
          }
          
          @keyframes progressSlideApp {
            0%   { width: 0%; }
            60%  { width: 85%; }
            80%  { width: 88%; }
            100% { width: 0%; }
          }
          
          @keyframes shimmerApp {
            0%   { background-position: 0% 50%; }
            100% { background-position: 300% 50%; }
          }
          
          .msg-wrap-app {
            text-align: center;
            display: flex;
            flex-direction: column;
            gap: 8px;
            align-items: center;
          }
          
          .msg-main-app {
            font-family: 'Fredoka One', cursive;
            font-size: 24px;
            color: #f0f0f5;
            animation: fadeWaveApp 3s ease-in-out infinite;
          }
          
          @keyframes fadeWaveApp {
            0%, 100% { opacity: 0.7; }
            50%       { opacity: 1; }
          }
          
          .msg-sub-app {
            font-family: 'Space Mono', monospace;
            font-size: 13px;
            color: #888;
            animation: blinkApp 1.4s step-end infinite;
          }
          
          @keyframes blinkApp {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.3; }
          }
          
          .emoji-spin-app {
            font-size: 42px;
            display: inline-block;
            animation: spinEmojiApp 3s linear infinite;
          }
          
          @keyframes spinEmojiApp {
            0%   { transform: rotate(0deg) scale(1); }
            50%  { transform: rotate(180deg) scale(1.2); }
            100% { transform: rotate(360deg) scale(1); }
          }
          
          .star-app {
            display: inline-block;
            font-size: 26px;
            animation: starPopApp 1.5s ease-in-out infinite;
          }
          .star-app:nth-child(1) { animation-delay: 0s; }
          .star-app:nth-child(3) { animation-delay: 0.8s; }
          
          @keyframes starPopApp {
            0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.5; }
            50%       { transform: scale(1.4) rotate(20deg); opacity: 1; }
          }
          
          @keyframes fadeInApp {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
        
        <div className="login-loading-screen-app">
          <div className="floating-dots-app" id="fdots-app"></div>
          <div className="loading-wrap-app">
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'14px'}}>
              <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                <span className="star-app">&#9733;</span>
                <span className="emoji-spin-app">&#9881;</span>
                <span className="star-app">&#9733;</span>
              </div>
              <div className="title-row-app">
                <span className="loading-letter-app">L</span>
                <span className="loading-letter-app">O</span>
                <span className="loading-letter-app">A</span>
                <span className="loading-letter-app">D</span>
                <span className="loading-letter-app">I</span>
                <span className="loading-letter-app">N</span>
                <span className="loading-letter-app">G</span>
              </div>
              <div className="dots-row-app">
                <div className="dot-anim-app"></div>
                <div className="dot-anim-app"></div>
                <div className="dot-anim-app"></div>
              </div>
            </div>
            <div className="progress-container-app">
              <div className="progress-track-app">
                <div className="progress-fill-app"></div>
              </div>
            </div>
            <div className="msg-wrap-app">
              <div className="msg-main-app">🤗 Espera un momento, por favor</div>
              <div className="msg-sub-app">⏰ Esto puede demorar unos minutos...</div>
            </div>
          </div>
        </div>
      </>
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