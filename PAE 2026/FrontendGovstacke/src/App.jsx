import { useState, useEffect, useRef } from 'react'

function App() {
  const [showPass, setShowPass] = useState(false)

  // Genera estrellas y meteoros al montar
  const starsRef = useRef(null)
  const shootingRef = useRef(null)

  useEffect(() => {
    const starsContainer = starsRef.current
    const shootField = shootingRef.current
    if (starsContainer) {
      const STAR_COUNT = 60
      for (let i = 0; i < STAR_COUNT; i++) {
        const s = document.createElement('span')
        const size = (Math.random() * 1.4 + 0.6).toFixed(1)
        s.style.width = size + 'px'
        s.style.height = size + 'px'
        s.style.top = Math.random() * 70 + '%'
        s.style.left = Math.random() * 100 + '%'
        const dur = (Math.random() * 3 + 2.5).toFixed(2)
        const delay = (Math.random() * 4).toFixed(2)
        s.style.animation = `twinkleDim ${dur}s ease-in-out ${delay}s infinite`
        starsContainer.appendChild(s)
      }
    }
    if (shootField) {
      const SHOOT_COUNT = 6
      for (let i = 0; i < SHOOT_COUNT; i++) {
        const s = document.createElement('div')
        s.className = 'shoot'
        s.style.top = Math.random() * 45 + 5 + '%'
        s.style.left = Math.random() * 40 + 55 + '%'
        const dur = (Math.random() * 6 + 8).toFixed(2)
        const delay = (Math.random() * 14).toFixed(2)
        s.style.animationDuration = dur + 's'
        s.style.animationDelay = delay + 's'
        shootField.appendChild(s)
      }
    }
    return () => {
      if (starsContainer) starsContainer.innerHTML = ''
      if (shootField) shootField.innerHTML = ''
    }
  }, [])

  return (
    <>
<svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="auroraTurbulence" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.02"
            numOctaves="2"
            seed="7"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur="22s"
              values="0.008 0.02;0.014 0.03;0.006 0.016;0.008 0.02"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="55"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <div className="aurora-field">
        <div className="aurora-warp">
          <div className="aurora a1" />
          <div className="aurora a2" />
          <div className="aurora a3" />
          <div className="aurora a4" />
        </div>
      </div>
      <div className="stars-dim" ref={starsRef} />
      <div className="shooting-field" ref={shootingRef} />
      <div className="grain" />

      <div className="corner tl">
        <svg viewBox="0 0 26 26">
          <path d="M2 14V2H14" stroke="#ff3b3b" strokeWidth="2" fill="none" />
        </svg>
      </div>
      <div className="corner br">
        <svg viewBox="0 0 26 26">
          <path d="M2 14V2H14" stroke="#ff3b3b" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="stage">
        <a href="http://localhost:3000" className="back-portal-btn" title="Volver al portal de entrada">
          <span>←</span> Volver al portal
        </a>
        <div className="badge">LABGT · COLOMBIA · GOV</div>

        <h1>
          GOV<span>STAKE</span>360
        </h1>
        <p className="subtitle">SISTEMA DE GESTIÓN DE GRUPOS DE INTERÉS PÚBLICOS</p>

        <div className="card">
          <a className="back-link" href="#">
            ← Cambiar tipo de acceso
          </a>

          <div className="card-head">
            <div className="tag">LOGIN</div>
            <div className="desc">Ingresa a tu cuenta</div>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="field">
              <label htmlFor="user">Usuario o correo</label>
              <div className="field-input">
                <input id="user" type="email" placeholder="tu@entidad.gov.co" required />
              </div>
            </div>

            <div className="field">
              <label htmlFor="pass">Contraseña</label>
              <div className="field-input">
                <input
                  id="pass"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="eye-toggle"
                  aria-label="Mostrar contraseña"
                  onClick={() => setShowPass((v) => !v)}
                >
                  {showPass ? (
                    <svg
                      id="eyeIcon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.6 21.6 0 0 1 5.06-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 7 11 7a21.6 21.6 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      id="eyeIcon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button className="submit" type="submit">
              ACCEDER
            </button>
          </form>

          <p className="foot-note">
            ¿No tienes cuenta? <a href="#">Regístrate aquí</a>
          </p>
        </div>
      </div>
    </>
  )
}

export default App