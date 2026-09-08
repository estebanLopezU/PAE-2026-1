import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import Actores from './pages/Actores'
import Matriz from './pages/Matriz'
import Compromisos from './pages/Compromisos'
import Relacionamientos from './pages/Relacionamientos'
import Alertas from './pages/Alertas'
import Protocolo from './pages/Protocolo'
import Reportes from './pages/Reportes'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#150505]">
        <p className="font-mono text-sm tracking-[0.2em] text-[#a08080]">CARGANDO…</p>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="actores" element={<Actores />} />
        <Route path="matriz" element={<Matriz />} />
        <Route path="compromisos" element={<Compromisos />} />
        <Route path="relacionamientos" element={<Relacionamientos />} />
        <Route path="alertas" element={<Alertas />} />
        <Route path="protocolo" element={<Protocolo />} />
        <Route path="reportes" element={<Reportes />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}