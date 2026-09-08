import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function LoginBackground() {
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        size: Math.random() * 1.4 + 0.6,
        top: Math.random() * 70,
        left: Math.random() * 100,
        dur: Math.random() * 3 + 2.5,
        delay: Math.random() * 4,
      })),
    []
  )
  const shoots = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        top: Math.random() * 45 + 5,
        left: Math.random() * 40 + 55,
        dur: Math.random() * 6 + 8,
        delay: Math.random() * 14,
      })),
    []
  )
  return (
    <>
      <div className="aurora-field">
        <div className="aurora-warp">
          <div className="aurora a1" />
          <div className="aurora a2" />
          <div className="aurora a3" />
          <div className="aurora a4" />
        </div>
      </div>
      <div className="stars-dim">
        {stars.map((s) => (
          <span
            key={s.id}
            style={{
              width: `${s.size}px`,
              height: `${s.size}px`,
              top: `${s.top}%`,
              left: `${s.left}%`,
              animation: `twinkleDim ${s.dur}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>
      <div className="shooting-field">
        {shoots.map((s) => (
          <div
            key={s.id}
            className="shoot"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>
      <div className="grain" />
    </>
  )
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <LoginBackground />
      <div className="stage">
      <a className="back-portal-btn" href="http://localhost:3000" style={{ zIndex: 40, position: 'fixed', top: 18, left: 18, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1rem', borderRadius: 8, background: 'rgba(26,10,10,0.8)', border: '1px solid #3a1616', color: '#c9a0a0', fontSize: '0.82rem', textDecoration: 'none', backdropFilter: 'blur(6px)' }}>
        <ArrowLeft className="h-4 w-4" /> Volver al portal
      </a>

      <div className="badge">LABGT · COLOMBIA · GOV</div>

      <h1>
        GOV<span>STAKE</span>360
      </h1>
      <p className="subtitle">SISTEMA DE GESTIÓN DE GRUPOS DE INTERÉS PÚBLICOS</p>

      <div className="card">
        <div className="card-head">
          <div className="tag">LOGIN</div>
          <div className="desc">Ingresa a tu cuenta institucional</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="user">Usuario o correo</label>
            <div className="field-input">
              <input
                id="user"
                type="email"
                placeholder="tu@entidad.gov.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="pass">Contraseña</label>
            <div className="field-input">
              <input
                id="pass"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="eye-toggle"
                aria-label="Mostrar contraseña"
                onClick={() => setShowPass((v) => !v)}
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="mb-4 rounded-lg border border-[#ff3b3b]/40 bg-[#ff3b3b]/10 px-3 py-2 text-center text-xs text-[#ff6b6b]">
              {error}
            </p>
          )}

          <button className="submit" type="submit" disabled={loading}>
            {loading ? 'VERIFICANDO…' : 'ACCEDER'}
          </button>
        </form>

        <p className="foot-note">
          <Link to="/login" style={{ color: 'inherit' }}>
            Gestor demo: gestor@govstake.gov.co · Govstake360*
          </Link>
        </p>
      </div>
      </div>
    </>
  )
}