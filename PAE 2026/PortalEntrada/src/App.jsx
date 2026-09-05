import { useState, useEffect, useRef } from 'react'
import { Link2, Target, ArrowRight, Loader2 } from 'lucide-react'

// Puerto de cada módulo
const MODULES = {
  interop: {
    title: 'INTEROP',
    subtitle: 'Dashboard Técnico',
    description: 'Mapeo y diagnóstico de interoperabilidad X-Road para entidades públicas colombianas.',
    url: 'http://localhost:5173', // Frontend INTEROP existente
    accent: '#a78bfa', // púrpura
    icon: Link2,
  },
  govstake: {
    title: 'GOVSTAKE',
    subtitle: 'Dashboard Estratégico',
    description: 'Sistema de gestión de grupos de interés públicos (GOVStake 360).',
    url: 'http://localhost:3002', // Frontend GOVSTAKE
    accent: '#f472b6', // rosa / magenta
    icon: Target,
  },
}

// Pantalla de carga inicial
function LoadingScreen({ fading }) {
  return (
    <div className={`loading-screen ${fading ? 'fade-out' : ''}`}>
      <div className="loader-orbit">
        <div className="loader-ring ring-a" />
        <div className="loader-ring ring-b" />
        <div className="loader-core">
          <Loader2 size={26} className="loader-spin" />
        </div>
      </div>
      <div className="loader-text">
        <span className="loader-brand">GOBIERNO DIGITAL</span>
        <span className="loader-bar"><i /></span>
        <span className="loader-status">Inicializando plataforma…</span>
      </div>
    </div>
  )
}

// Fondo animado de olas moradas realistas (canvas) + partículas
function OceanBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf
    let w = 0
    let h = 0
    let t = 0
    const DPR = Math.min(window.devicePixelRatio || 1, 2)

    // Partículas que se deslizan (float / drift)
    const particles = []
    const P_COUNT = 70

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * DPR
      canvas.height = h * DPR
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    }

    const rand = (min, max) => min + Math.random() * (max - min)

    const makeParticles = () => {
      particles.length = 0
      for (let i = 0; i < P_COUNT; i++) {
        particles.push({
          x: rand(0, 1),
          y: rand(0, 1),
          r: rand(1.2, 3.4),
          vx: rand(-0.12, 0.18), // velocidad de deslizamiento
          phase: rand(0, Math.PI * 2),
          speed: rand(0.4, 1),
          alpha: rand(0.25, 0.8),
          pink: Math.random() > 0.5,
        })
      }
    }

    // Dibuja una capa de ola (sinusoide rellena)
    const drawWave = (baseY, amplitude, wavelength, speed, color, forwards) => {
      ctx.beginPath()
      ctx.moveTo(-20, h)
      for (let x = -20; x <= w + 20; x += 4) {
        const dir = forwards ? x : w - x
        const y = baseY + Math.sin((dir + t * speed) / wavelength) * amplitude
        ctx.lineTo(x, y)
      }
      ctx.lineTo(w + 20, h)
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
    }

    // Cresta con resplandor
    const drawCrest = (baseY, amplitude, wavelength, speed, color, forwards) => {
      ctx.beginPath()
      for (let x = -20; x <= w + 20; x += 3) {
        const dir = forwards ? x : w - x
        const y = baseY + Math.sin((dir + t * speed) / wavelength) * amplitude
        if (x === -20) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = color
      ctx.shadowColor = color
      ctx.shadowBlur = 26
      ctx.lineWidth = 2.2
      ctx.lineJoin = 'round'
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    const drawParticles = () => {
      for (const p of particles) {
        // deslizamiento horizontal continuo (bucl pane)
        p.x += p.vx * p.speed * 0.006
        if (p.x > 1.05) p.x = -0.05
        if (p.x < -0.05) p.x = 1.05
        // leve flotación vertical
        const yy = (p.y + Math.sin(t * 0.002 * p.speed + p.phase) * 0.015) % 1
        const px = p.x * w
        const py = yy * h
        ctx.beginPath()
        ctx.arc(px, py, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.pink
          ? `rgba(232,121,249,${p.alpha * 0.5})`
          : `rgba(167,139,250,${p.alpha * 0.5})`
        ctx.shadowColor = p.pink ? '#e879f9' : '#a78bfa'
        ctx.shadowBlur = 12
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    // Burbujas que suben en el agua
    const bubbles = []
    const B_COUNT = 30
    const makeBubbles = () => {
      bubbles.length = 0
      for (let i = 0; i < B_COUNT; i++) {
        bubbles.push({
          x: rand(0, 1),
          y: rand(0.5, 1),
          r: rand(1.5, 5),
          vy: rand(0.15, 0.5),
          wob: rand(0, Math.PI * 2),
        })
      }
    }

    const drawBubbles = () => {
      for (const b of bubbles) {
        b.y -= b.vy * 0.002
        b.wob += 0.02
        if (b.y < -0.05) {
          b.y = rand(0.9, 1.05)
          b.x = rand(0, 1)
        }
        const px = b.x * w
        const py = b.y * h + Math.sin(b.wob) * 6
        ctx.beginPath()
        ctx.arc(px, py, b.r, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(224,215,255,0.4)'
        ctx.lineWidth = 1.4
        ctx.stroke()
        // brillo interior
        ctx.beginPath()
        ctx.arc(px - b.r * 0.3, py - b.r * 0.3, b.r * 0.35, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.35)'
        ctx.fill()
      }
    }

    const draw = () => {
      t += 1

      // fondo
      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, '#0a0616')
      grad.addColorStop(0.55, '#15092b')
      grad.addColorStop(1, '#1d0d3a')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      // olas profundas (capas base) chocando desde la izquierda y derecha
      drawWave(h * 0.62, 42, 150, 2.2, 'rgba(109,40,217,0.28)', true)
      drawWave(h * 0.72, 55, 120, 1.8, 'rgba(139,92,246,0.30)', false)
      drawWave(h * 0.84, 44, 170, 2.6, 'rgba(168,85,247,0.34)', true)
      drawWave(h * 0.94, 30, 130, 2.0, 'rgba(192,38,211,0.40)', false)

      // crestas con brillo
      drawCrest(h * 0.62, 42, 150, 2.2, 'rgba(167,139,250,0.6)', true)
      drawCrest(h * 0.84, 44, 170, 2.6, 'rgba(232,121,249,0.5)', true)

      drawParticles()
      drawBubbles()

      raf = requestAnimationFrame(draw)
    }

    resize()
    makeParticles()
    makeBubbles()
    draw()

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="ocean-bg">
      <canvas ref={canvasRef} className="ocean-canvas" />
      <div className="ocean-vignette" />
      <div className="grain-overlay" />
    </div>
  )
}

function ModuleCard({ module, index, onHover, hovered }) {
  const Icon = module.icon
  return (
    <a
      href={module.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`module-card ${hovered ? 'is-hovered' : ''}`}
      style={{ '--accent': module.accent, animationDelay: `${0.25 + index * 0.18}s` }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="card-shine" />
      <div className="module-glow" />
      <div className="module-icon">
        <Icon size={30} />
      </div>
      <h3 className="module-title">{module.title}</h3>
      <p className="module-subtitle">{module.subtitle}</p>
      <p className="module-desc">{module.description}</p>
      <span className="module-enter">
        ENTRAR <ArrowRight size={18} />
      </span>
    </a>
  )
}

function App() {
  const [loading, setLoading] = useState(true)
  const [fading, setFading] = useState(false)
  const [started, setStarted] = useState(false)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const t1 = setTimeout(() => {
      setFading(true)
      setStarted(true)
    }, 2300)
    const t2 = setTimeout(() => {
      setLoading(false)
    }, 3000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  const cards = [
    { key: 'interop', module: MODULES.interop },
    { key: 'govstake', module: MODULES.govstake },
  ]

  return (
    <>
      {loading && <LoadingScreen fading={fading} />}

      <div className={`svg-portal ${started ? 'is-started' : ''}`}>
        <OceanBackground />

        <header className="portal-header">
          <div className="portal-badge">GOBIERNO DIGITAL COLOMBIA</div>
          <h1 className="portal-title">
            Plataforma de <span>Gestión Pública</span>
          </h1>
          <p className="portal-tagline">
            Accede a los módulos de interoperabilidad y gestión estratégica del sector público.
          </p>
        </header>

        <main className="portal-modules">
          {cards.map((c, i) => (
            <ModuleCard
              key={c.key}
              module={c.module}
              index={i}
              hovered={hovered === i}
              onHover={setHovered}
            />
          ))}
        </main>

        <footer className="portal-footer">
          <p>Ministerio de Tecnologías de la Información y las Comunicaciones · Colombia</p>
        </footer>
      </div>
    </>
  )
}

export default App