import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, User, Shield } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { registerUser, loginUser, loginAdmin, adminAttempts } = useAuth()
  
  const [step, setStep] = useState('role') // 'role', 'login', 'register'
  const [selectedRole, setSelectedRole] = useState(null) // 'user' o 'admin'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Boot animation state
  const [bootProgress, setBootProgress] = useState(0)
  const [bootLogs, setBootLogs] = useState([])
  const [bootComplete, setBootComplete] = useState(false)
  
  // Canvas ref
  const canvasRef = useRef(null)
  const nodesRef = useRef([])
  
  const logs = [
    'Iniciando módulo de seguridad TLS 1.3...',
    'Cargando certificados X.509...',
    'Conectando al bus de servicios X-Road...',
    'Verificando nodos gubernamentales...',
    'Sincronizando catálogo de servicios...',
    'Estableciendo canal seguro...',
    'Sistema listo.'
  ]

  // Boot animation
  useEffect(() => {
    let logIndex = 0
    let progress = 0
    
    const interval = setInterval(() => {
      progress += Math.random() * 4 + 1
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setTimeout(() => setBootComplete(true), 400)
      }
      setBootProgress(Math.floor(progress))
      
      if (Math.random() > 0.65 && logIndex < logs.length) {
        setBootLogs(prev => {
          const newLogs = [...prev, '> ' + logs[logIndex]]
          logIndex++
          return newLogs.slice(-5)
        })
      }
    }, 60)
    
    return () => clearInterval(interval)
  }, [])

  // Canvas network animation
  useEffect(() => {
    if (!bootComplete) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    let animationId
    let width, height
    
    const resize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      initNodes()
    }
    
    const initNodes = () => {
      nodesRef.current = []
      const count = Math.floor(width * height / 7000) + 25
      for (let i = 0; i < count; i++) {
        nodesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.5 + 0.5,
          pulse: Math.random() * Math.PI * 2
        })
      }
    }
    
    const draw = (ts) => {
      ctx.clearRect(0, 0, width, height)
      const maxD = 130
      const nodes = nodesRef.current
      
      nodes.forEach(n => {
        n.x += n.vx
        n.y += n.vy
        n.pulse += 0.02
        if (n.x < 0 || n.x > width) n.vx *= -1
        if (n.y < 0 || n.y > height) n.vy *= -1
      })
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < maxD) {
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(0,180,255,${(1 - d / maxD) * 0.22})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      
      nodes.forEach(n => {
        const g = 0.6 + 0.4 * Math.sin(n.pulse)
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,212,255,${g * 0.8})`
        ctx.fill()
      })
      
      // Traveling data packet
      const t = (ts / 1000) % 1
      const s = nodes[0]
      const e = nodes[Math.floor(nodes.length / 2)]
      if (s && e) {
        ctx.beginPath()
        ctx.arc(s.x + (e.x - s.x) * t, s.y + (e.y - s.y) * t, 3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,255,160,0.9)'
        ctx.fill()
      }
      
      animationId = requestAnimationFrame(draw)
    }
    
    resize()
    window.addEventListener('resize', resize)
    animationId = requestAnimationFrame(draw)
    
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [bootComplete])

  // Manejar selección de rol
  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setError('')
    setFormData({ email: '', password: '', name: '', confirmPassword: '' })
    setStep('login')
  }

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  // Manejar login
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (selectedRole === 'admin') {
        await loginAdmin(formData.email, formData.password)
      } else {
        await loginUser(formData.email, formData.password)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Manejar registro
  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      await registerUser(formData.email, formData.password, formData.name)
      setStep('login')
      setFormData({ ...formData, password: '', confirmPassword: '' })
      setError('Registro exitoso. Ahora puedes iniciar sesión.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Volver a selección de rol
  const handleBackToRoleSelect = () => {
    setStep('role')
    setSelectedRole(null)
    setError('')
    setFormData({ email: '', password: '', name: '', confirmPassword: '' })
  }

  // Cambiar a modo registro
  const handleSwitchToRegister = () => {
    setStep('register')
    setError('')
  }

  // Cambiar a modo login
  const handleSwitchToLogin = () => {
    setStep('login')
    setError('')
  }

  return (
    <div className="login-page">
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; background: #020c1b; }
        
        .login-page {
          position: relative;
          width: 100%;
          height: 100vh;
          background: #020c1b;
          overflow: hidden;
          font-family: 'Exo 2', sans-serif;
        }
        
        canvas#net {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: ${bootComplete ? 1 : 0};
          transition: opacity 1.5s ease;
        }
        
        /* BOOT SCREEN */
        .boot-screen {
          position: absolute;
          inset: 0;
          background: #020c1b;
          display: ${bootComplete ? 'none' : 'flex'};
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 20;
          transition: opacity 0.8s ease;
          opacity: ${bootComplete ? 0 : 1};
        }
        
        .boot-logo {
          font-family: 'Orbitron', monospace;
          font-size: 13px;
          font-weight: 700;
          color: #00d4ff;
          letter-spacing: 5px;
          margin-bottom: 8px;
          animation: fadeUp 0.6s 0.3s ease forwards;
          opacity: 0;
        }
        
        .boot-sub {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          color: #0a5a6e;
          letter-spacing: 6px;
          margin-bottom: 36px;
          animation: fadeUp 0.6s 0.7s ease forwards;
          opacity: 0;
        }
        
        .boot-wrap {
          width: 260px;
          height: 2px;
          background: #0d2233;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 12px;
          animation: fadeIn 0.4s 1.1s ease forwards;
          opacity: 0;
        }
        
        .boot-bar {
          height: 100%;
          width: ${bootProgress}%;
          background: linear-gradient(90deg, #00d4ff, #0066ff);
          border-radius: 2px;
          transition: width 0.05s linear;
        }
        
        .boot-pct {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: #00d4ff;
          animation: fadeIn 0.4s 1.1s ease forwards;
          opacity: 0;
        }
        
        .boot-log {
          position: absolute;
          bottom: 24px;
          left: 24px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          color: #1a4a5a;
          line-height: 1.7;
          animation: fadeIn 0.4s 1.2s ease forwards;
          opacity: 0;
        }
        
        /* MAIN UI */
        .main-ui {
          position: relative;
          z-index: 10;
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          opacity: ${bootComplete ? 1 : 0};
          transition: opacity 1.2s ease;
        }
        
        .top-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #00d4ff 30%, #0066ff 70%, transparent);
          animation: scanB 3s ease-in-out infinite;
        }
        
        @keyframes scanB {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        
        .corner {
          position: absolute;
          width: 18px;
          height: 18px;
        }
        .ctl { top: 14px; left: 14px; border-top: 1.5px solid #00d4ff; border-left: 1.5px solid #00d4ff; }
        .ctr { top: 14px; right: 14px; border-top: 1.5px solid #00d4ff; border-right: 1.5px solid #00d4ff; }
        .cbl { bottom: 14px; left: 14px; border-bottom: 1.5px solid #00d4ff; border-left: 1.5px solid #00d4ff; }
        .cbr { bottom: 14px; right: 14px; border-bottom: 1.5px solid #00d4ff; border-right: 1.5px solid #00d4ff; }
        
        .badge {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 3px;
          color: #00d4ff;
          background: rgba(0, 212, 255, 0.07);
          border: 0.5px solid rgba(0, 212, 255, 0.3);
          padding: 5px 16px;
          border-radius: 2px;
          margin-bottom: 20px;
        }
        
        .title {
          font-family: 'Orbitron', monospace;
          font-size: clamp(26px, 5vw, 52px);
          font-weight: 900;
          color: #fff;
          letter-spacing: 6px;
          text-align: center;
          text-shadow: 0 0 60px rgba(0, 150, 255, 0.5);
          margin-bottom: 12px;
        }
        
        .title span {
          color: #00d4ff;
        }
        
        .subtitle {
          font-family: 'Exo 2', sans-serif;
          font-weight: 300;
          font-size: clamp(10px, 1.5vw, 13px);
          color: #4a8fa8;
          letter-spacing: 5px;
          text-transform: uppercase;
          text-align: center;
          margin-bottom: 40px;
        }
        
        .pulse-ring {
          position: absolute;
          width: 200px;
          height: 200px;
          border: 0.5px solid rgba(0, 212, 255, 0.08);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: pulse 4s ease-out infinite;
          pointer-events: none;
        }
        
        .pulse-ring:nth-child(2) { animation-delay: 1.3s; }
        .pulse-ring:nth-child(3) { animation-delay: 2.6s; }
        
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }
        
        .scan-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.12), transparent);
          animation: scanL 6s linear infinite;
          pointer-events: none;
        }
        
        @keyframes scanL {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        /* FORM STYLES */
        .form-card {
          background: rgba(2, 12, 27, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 8px;
          padding: 32px;
          width: 100%;
          max-width: 400px;
          position: relative;
          z-index: 5;
        }
        
        .form-title {
          font-family: 'Orbitron', monospace;
          font-size: 18px;
          color: #00d4ff;
          text-align: center;
          margin-bottom: 8px;
          letter-spacing: 2px;
        }
        
        .form-desc {
          color: #4a8fa8;
          text-align: center;
          font-size: 12px;
          margin-bottom: 24px;
          letter-spacing: 1px;
        }
        
        .role-btn {
          width: 100%;
          padding: 16px;
          background: rgba(0, 212, 255, 0.05);
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
        }
        
        .role-btn:hover {
          background: rgba(0, 212, 255, 0.1);
          border-color: rgba(0, 212, 255, 0.4);
        }
        
        .role-btn.admin:hover {
          border-color: rgba(168, 85, 247, 0.4);
          background: rgba(168, 85, 247, 0.1);
        }
        
        .role-icon {
          padding: 10px;
          background: rgba(0, 212, 255, 0.1);
          border-radius: 8px;
          margin-right: 14px;
        }
        
        .role-btn.admin .role-icon {
          background: rgba(168, 85, 247, 0.2);
        }
        
        .role-text h3 {
          color: #fff;
          font-size: 14px;
          margin-bottom: 2px;
        }
        
        .role-text p {
          color: #4a8fa8;
          font-size: 11px;
        }
        
        .back-btn {
          display: flex;
          align-items: center;
          color: #4a8fa8;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 12px;
          margin-bottom: 20px;
          transition: color 0.3s;
        }
        
        .back-btn:hover {
          color: #00d4ff;
        }
        
        .input-group {
          margin-bottom: 16px;
        }
        
        .input-label {
          display: block;
          color: #4a8fa8;
          font-size: 11px;
          margin-bottom: 8px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        
        .input-field {
          width: 100%;
          padding: 12px 14px;
          background: rgba(0, 20, 40, 0.6);
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 4px;
          color: #fff;
          font-size: 14px;
          transition: all 0.3s;
        }
        
        .input-field:focus {
          outline: none;
          border-color: #00d4ff;
          box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
        }
        
        .input-field::placeholder {
          color: #1a4a5a;
        }
        
        .password-wrap {
          position: relative;
        }
        
        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #4a8fa8;
          cursor: pointer;
          transition: color 0.3s;
        }
        
        .password-toggle:hover {
          color: #00d4ff;
        }
        
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(90deg, #00d4ff, #0066ff);
          border: none;
          border-radius: 4px;
          color: #fff;
          font-family: 'Orbitron', monospace;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 8px;
        }
        
        .submit-btn:hover {
          box-shadow: 0 0 25px rgba(0, 212, 255, 0.4);
          transform: translateY(-1px);
        }
        
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .error-msg {
          padding: 10px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 4px;
          color: #ef4444;
          font-size: 12px;
          margin-bottom: 16px;
        }
        
        .warning-msg {
          padding: 10px;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 4px;
          color: #f59e0b;
          font-size: 12px;
          margin-bottom: 16px;
        }
        
        .success-msg {
          padding: 10px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 4px;
          color: #22c55e;
          font-size: 12px;
          margin-bottom: 16px;
        }
        
        .switch-text {
          text-align: center;
          color: #4a8fa8;
          font-size: 12px;
          margin-top: 20px;
        }
        
        .switch-link {
          color: #00d4ff;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: color 0.3s;
        }
        
        .switch-link:hover {
          color: #fff;
        }
        
        .footer {
          position: absolute;
          bottom: 20px;
          text-align: center;
          font-size: 11px;
          color: #1a4a5a;
          font-family: 'Share Tech Mono', monospace;
          letter-spacing: 2px;
        }
        
        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <canvas id="net" ref={canvasRef} />

      {/* BOOT SCREEN */}
      {!bootComplete && (
        <div className="boot-screen">
          <div className="boot-logo">X-ROAD COLOMBIA</div>
          <div className="boot-sub">PLATAFORMA GUBERNAMENTAL SEGURA</div>
          <div className="boot-wrap">
            <div className="boot-bar"></div>
          </div>
          <div className="boot-pct">{bootProgress}%</div>
          <div className="boot-log">
            {bootLogs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN UI */}
      <div className="main-ui">
        <div className="top-bar"></div>
        <div className="corner ctl"></div>
        <div className="corner ctr"></div>
        <div className="corner cbl"></div>
        <div className="corner cbr"></div>
        <div className="pulse-ring"></div>
        <div className="pulse-ring"></div>
        <div className="pulse-ring"></div>
        <div className="scan-line"></div>

        <div className="badge">X-ROAD · COLOMBIA · GOV</div>
        <div className="title">INTER<span>OPERA</span>BILIDAD</div>
        <div className="subtitle">Plataforma de Interoperabilidad Gubernamental</div>

        {/* FORM CARD */}
        <div className="form-card">
          {/* STEP 1: Selección de Rol */}
          {step === 'role' && (
            <>
              <div className="form-title">ACCESO</div>
              <div className="form-desc">Selecciona tu tipo de acceso</div>
              
              <button
                onClick={() => handleRoleSelect('user')}
                className="role-btn"
              >
                <div className="role-icon">
                  <User size={20} color="#4a8fa8" />
                </div>
                <div className="role-text">
                  <h3>Usuario</h3>
                  <p>Acceso de solo lectura</p>
                </div>
              </button>
              
              <button
                onClick={() => handleRoleSelect('admin')}
                className="role-btn admin"
              >
                <div className="role-icon">
                  <Shield size={20} color="#a855f7" />
                </div>
                <div className="role-text">
                  <h3>Administrador</h3>
                  <p>Acceso completo</p>
                </div>
              </button>
            </>
          )}

          {/* STEP 2: Formulario de Login */}
          {step === 'login' && (
            <>
              <button onClick={handleBackToRoleSelect} className="back-btn">
                ← Cambiar tipo de acceso
              </button>
              
              <div className="form-title">
                {selectedRole === 'admin' ? 'ADMIN' : 'LOGIN'}
              </div>
              <div className="form-desc">
                {selectedRole === 'admin' 
                  ? 'Ingresa tus credenciales de administrador'
                  : 'Ingresa a tu cuenta'}
              </div>

              {selectedRole === 'admin' && adminAttempts > 0 && (
                <div className="warning-msg">
                  Intentos fallidos: {adminAttempts}/3
                  {adminAttempts >= 3 && ' - Acceso bloqueado'}
                </div>
              )}

              {error && (
                <div className={error.includes('exitoso') ? 'success-msg' : 'error-msg'}>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <label className="input-label">
                    {selectedRole === 'admin' ? 'Email' : 'Username o Email'}
                  </label>
                  <input
                    type={selectedRole === 'admin' ? 'email' : 'text'}
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder={selectedRole === 'admin' ? 'elopezu@unal.edu.co' : 'tu@email.com'}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Password</label>
                  <div className="password-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || (selectedRole === 'admin' && adminAttempts >= 3)}
                  className="submit-btn"
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      VERIFICANDO...
                    </>
                  ) : (
                    'ACCEDER'
                  )}
                </button>
              </form>

              {selectedRole === 'user' && (
                <div className="switch-text">
                  ¿No tienes cuenta?{' '}
                  <button onClick={handleSwitchToRegister} className="switch-link">
                    Regístrate aquí
                  </button>
                </div>
              )}
            </>
          )}

          {/* STEP 3: Formulario de Registro */}
          {step === 'register' && (
            <>
              <button onClick={handleSwitchToLogin} className="back-btn">
                ← Volver a iniciar sesión
              </button>
              
              <div className="form-title">REGISTRO</div>
              <div className="form-desc">Crea tu cuenta de usuario</div>

              {error && (
                <div className="error-msg">{error}</div>
              )}

              <form onSubmit={handleRegister}>
                <div className="input-group">
                  <label className="input-label">Nombre Completo</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Contraseña</label>
                  <div className="password-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                      className="input-field"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Confirmar Contraseña</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="Repite tu contraseña"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn"
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      CREANDO...
                    </>
                  ) : (
                    'CREAR CUENTA'
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="footer">© 2026 X-ROAD COLOMBIA · GOBIERNO DE COLOMBIA</div>
      </div>
    </div>
  )
}