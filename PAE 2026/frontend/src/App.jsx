import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Entidades from './pages/Entidades'
import MatrizServicios from './pages/MatrizServicios'
import MapaInteractivo from './pages/MapaInteractivo'
import EvaluacionMadurez from './pages/EvaluacionMadurez'
import Reportes from './pages/Reportes'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/entidades" element={<Entidades />} />
            <Route path="/matriz" element={<MatrizServicios />} />
            <Route path="/mapa" element={<MapaInteractivo />} />
            <Route path="/evaluacion" element={<EvaluacionMadurez />} />
            <Route path="/reportes" element={<Reportes />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App
