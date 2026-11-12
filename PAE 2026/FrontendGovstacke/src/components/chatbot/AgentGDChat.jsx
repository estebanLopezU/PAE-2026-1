import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Compass, ImagePlus, MessageCircle, Send, Sparkles, X } from 'lucide-react'
import RichText from './RichText'

// AgentGD: asistente flotante de GOVStake 360 / Interoperabilidad.
// - Conoce la pantalla actual y envia esa ruta al backend.
// - Adjunta o pega capturas (se comprimen en el navegador; no se guardan).
// - Dibuja acciones de navegacion y sugerencias por pagina.

const ANCHO = 400
const ALTO_MAX = 580
const MAX_IMAGEN = 1280

function rutaActual(pathname) {
  const ruta = (pathname || '/').replace(/\/+$/, '') || '/'
  if (ruta.startsWith('/que-es-govstake')) return '/que-es-govstake'
  return ruta
}

async function comprimirImagen(archivo) {
  const tipos = ['image/png', 'image/jpeg', 'image/webp']
  if (!archivo || !tipos.includes(archivo.type)) {
    throw new Error('Solo puedo leer imagenes PNG, JPG o WEBP.')
  }

  const dataUrl = await new Promise((resolve, reject) => {
    const lector = new FileReader()
    lector.onload = () => resolve(lector.result)
    lector.onerror = () => reject(new Error('No pude leer la imagen.'))
    lector.readAsDataURL(archivo)
  })

  const imagen = await new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('La imagen no se pudo abrir.'))
    img.src = dataUrl
  })

  const escala = Math.min(1, MAX_IMAGEN / Math.max(imagen.width || 1, imagen.height || 1))
  const ancho = Math.max(1, Math.round((imagen.width || 1) * escala))
  const alto = Math.max(1, Math.round((imagen.height || 1) * escala))
  const lienzo = document.createElement('canvas')
  lienzo.width = ancho
  lienzo.height = alto
  const ctx = lienzo.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, ancho, alto)
  ctx.drawImage(imagen, 0, 0, ancho, alto)
  return lienzo.toDataURL('image/jpeg', 0.8)
}

export default function AgentGDChat({ platform = 'govstake' }) {
  const isGov = platform !== 'interop'
  const navigate = useNavigate()
  const location = useLocation()
  const pagina = rutaActual(location.pathname)

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'
  const CHAT_URL = `${API_BASE}/agentgd/chat`
  const CAPS_URL = `${API_BASE}/agentgd/capacidades`

  const getToken = () =>
    localStorage.getItem('govstake_access_token') ||
    localStorage.getItem('xroad_access_token') ||
    ''

  const palette = isGov
    ? {
        bubble: 'linear-gradient(135deg,#ef4444,#f97316)',
        header: 'linear-gradient(90deg,#ef4444,#f97316)',
        card: 'rgba(18,10,12,0.98)',
        cardBorder: 'rgba(255,59,59,0.42)',
        user: 'rgba(255,59,59,0.22)',
        bot: 'rgba(38,16,18,0.92)',
        botBorder: 'rgba(255,59,59,0.26)',
        chip: 'rgba(249,115,22,0.16)',
        chipBorder: 'rgba(249,115,22,0.45)',
        title: 'AgentGD · GOVStake',
        intro:
          'Puedo analizar actores, priorizacion, compromisos, alertas y el modelo del doctorado.',
      }
    : {
        bubble: 'linear-gradient(135deg,#0ea5e9,#2563eb)',
        header: 'linear-gradient(90deg,#06b6d4,#2563eb)',
        card: 'rgba(8,14,30,0.98)',
        cardBorder: 'rgba(34,211,238,0.42)',
        user: 'rgba(14,165,233,0.22)',
        bot: 'rgba(14,24,48,0.92)',
        botBorder: 'rgba(34,211,238,0.26)',
        chip: 'rgba(34,211,238,0.14)',
        chipBorder: 'rgba(34,211,238,0.42)',
        title: 'AgentGD · Interop',
        intro:
          'Puedo analizar entidades, servicios, conexion X-Road, madurez y brechas.',
      }

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [imagen, setImagen] = useState(null)
  const [arrastrando, setArrastrando] = useState(false)
  const [caps, setCaps] = useState(null)
  const [error, setError] = useState('')

  const [pos, setPos] = useState(() => ({
    x: Math.max(12, window.innerWidth - ANCHO - 24),
    y: Math.max(12, window.innerHeight - ALTO_MAX - 24),
  }))

  const dragRef = useRef(null)
  const offsetRef = useRef({ x: 0, y: 0 })
  const boxRef = useRef(null)
  const listRef = useRef(null)
  const fileRef = useRef(null)

  const ancho = Math.min(ANCHO, window.innerWidth - 24)
  const alto = Math.min(ALTO_MAX, window.innerHeight - 96)

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current) return
      setPos({
        x: Math.min(Math.max(4, e.clientX - offsetRef.current.x), window.innerWidth - ancho - 4),
        y: Math.min(Math.max(4, e.clientY - offsetRef.current.y), window.innerHeight - alto - 4),
      })
    }
    const onUp = () => { dragRef.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [ancho, alto])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, loading, open])

  useEffect(() => {
    if (!open || caps) return
    const token = getToken()
    fetch(CAPS_URL, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setCaps(data))
      .catch(() => {})
  }, [open, caps, CAPS_URL])

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(''), 6000)
    return () => clearTimeout(t)
  }, [error])

  const startDrag = (e) => {
    const box = boxRef.current
    if (!box) return
    if (!e.target.closest('[data-drag]')) return
    const rect = box.getBoundingClientRect()
    offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    dragRef.current = true
  }

  const adjuntar = useCallback(async (archivo) => {
    if (!archivo) return
    try {
      const comprimida = await comprimirImagen(archivo)
      setImagen(comprimida)
      setError('')
    } catch (e) {
      setError(e.message || 'No pude preparar la imagen.')
    }
  }, [])

  const onPaste = (e) => {
    const item = Array.from(e.clipboardData?.items || []).find((i) => i.type.startsWith('image/'))
    if (item) {
      const archivo = item.getAsFile()
      if (archivo) {
        e.preventDefault()
        adjuntar(archivo)
      }
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setArrastrando(false)
    const archivo = Array.from(e.dataTransfer?.files || []).find((f) => f.type.startsWith('image/'))
    if (archivo) adjuntar(archivo)
  }

  const enviar = async (textoForzado) => {
    const msg = (textoForzado ?? input).trim()
    if ((!msg && !imagen) || loading) return

    const conImagen = imagen
    const mensajeUsuario = {
      role: 'user',
      content: msg || 'Analiza esta imagen.',
      ...(conImagen ? { preview: conImagen } : {}),
    }

    setMessages((m) => [...m, mensajeUsuario])
    setInput('')
    setImagen(null)
    setLoading(true)
    setError('')

    try {
      const token = getToken()
      const historial = messages
        .filter((m) => !m.preview && typeof m.content === 'string')
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: msg || 'Describe la imagen y relaciona lo visible con los datos de la plataforma.',
          history: historial,
          page: pagina,
          image: conImagen || undefined,
        }),
      })

      let data = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }

      if (!res.ok) {
        const detalle = data.detail || `No pude responder (HTTP ${res.status}).`
        setMessages((m) => [...m, { role: 'assistant', content: `⚠️ ${detalle}` }])
        return
      }

      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: data.response || 'No obtuve una respuesta.',
          acciones: data.acciones || [],
          trazabilidad: data.trazabilidad || [],
          uso: data.uso || null,
        },
      ])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: '⚠️ No pude conectar con AgentGD.' }])
    } finally {
      setLoading(false)
    }
  }

  const ir = (ruta) => {
    navigate(ruta)
    setOpen(false)
  }

  const fichaPagina = caps?.paginas?.[pagina] || null
  const sugerencias = (fichaPagina?.preguntas || []).slice(0, 3)

  const panel = (
    <div
      ref={boxRef}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: ancho,
        height: alto,
        zIndex: 2147483000,
        background: palette.card,
        border: `1px solid ${arrastrando ? palette.chipBorder : palette.cardBorder}`,
        backdropFilter: 'blur(14px)',
      }}
      className="flex flex-col overflow-hidden rounded-2xl shadow-2xl"
      onDragOver={(e) => { e.preventDefault(); setArrastrando(true) }}
      onDragLeave={() => setArrastrando(false)}
      onDrop={onDrop}
    >
      <div
        style={{ background: palette.header }}
        className="flex shrink-0 cursor-move select-none items-center justify-between px-4 py-2.5"
        onMouseDown={startDrag}
        data-drag="1"
      >
        <div className="flex items-center gap-2" data-drag="1">
          <MessageCircle style={{ width: 18, height: 18 }} className="text-white" data-drag="1" />
          <div data-drag="1">
            <p className="text-sm font-bold leading-tight text-white" data-drag="1">{palette.title}</p>
            <p className="text-[10px] leading-tight text-white/80" data-drag="1">
              IA · {fichaPagina?.titulo || 'GOVStake 360'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => enviar('Guíame por esta pantalla paso a paso.')}
            className="rounded-lg p-1.5 text-white/90 hover:bg-white/15"
            title="Guiame por esta pantalla"
            aria-label="Guiame por esta pantalla"
          >
            <Compass style={{ width: 17, height: 17 }} />
          </button>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-white/90 hover:bg-white/15"
            aria-label="Cerrar AgentGD"
          >
            <X style={{ width: 17, height: 17 }} />
          </button>
        </div>
      </div>

      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3"
      >
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/70">
              <p className="mb-1 flex items-center gap-1.5 font-semibold text-white/90">
                <Sparkles style={{ width: 14, height: 14 }} />
                Hola, soy AgentGD
              </p>
              <p>{palette.intro}</p>
              <p className="mt-2 text-[11px] text-white/50">
                Puedo consultar los datos en vivo y guiarte por la pantalla en la que estas.
              </p>
            </div>

            {fichaPagina?.guia?.length > 0 && (
              <div className="rounded-xl border border-white/10 p-3">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/60">
                  En esta pantalla
                </p>
                <ul className="list-disc space-y-1 pl-4 text-[11px] text-white/70">
                  {fichaPagina.guia.map((paso, i) => <li key={i}>{paso}</li>)}
                </ul>
              </div>
            )}

            {sugerencias.length > 0 && (
              <div className="space-y-1.5">
                {sugerencias.map((pregunta, i) => (
                  <button
                    key={i}
                    onClick={() => enviar(pregunta)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[11px] text-white/80 transition hover:brightness-125"
                    style={{ background: palette.chip, border: `1px solid ${palette.chipBorder}` }}
                  >
                    <span>{pregunta}</span>
                    <ArrowRight style={{ width: 13, height: 13 }} className="shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className="max-w-[92%] rounded-xl px-3 py-2"
              style={
                m.role === 'user'
                  ? { background: palette.user, color: 'white' }
                  : { background: palette.bot, border: `1px solid ${palette.botBorder}` }
              }
            >
              {m.preview && (
                <img
                  src={m.preview}
                  alt="Captura adjunta"
                  className="mb-1.5 max-h-32 rounded-lg border border-white/20 object-contain"
                />
              )}
              {m.role === 'user' ? (
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{m.content}</p>
              ) : (
                <>
                  <RichText texto={m.content} />
                  {m.trazabilidad?.length > 0 && (
                    <p className="mt-1.5 border-t border-white/10 pt-1 font-mono text-[9px] uppercase tracking-wide text-white/35">
                      consulto: {m.trazabilidad.join(' · ')}
                    </p>
                  )}
                  {m.acciones?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.acciones.map((accion, j) => (
                        <button
                          key={j}
                          onClick={() => ir(accion.ruta)}
                          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-white transition hover:brightness-125"
                          style={{ background: palette.chip, border: `1px solid ${palette.chipBorder}` }}
                        >
                          {accion.etiqueta}
                          <ArrowRight style={{ width: 11, height: 11 }} />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-white/70" style={{ background: palette.bot }}>
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60" style={{ animationDelay: '0ms' }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60" style={{ animationDelay: '120ms' }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60" style={{ animationDelay: '240ms' }} />
            <span className="ml-1">Consultando la plataforma…</span>
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-[11px] text-amber-200">
            {error}
          </p>
        )}
      </div>

      {imagen && (
        <div className="flex shrink-0 items-center gap-2 border-t border-white/10 px-3 py-2">
          <img src={imagen} alt="Vista previa" className="h-12 w-12 rounded-md border border-white/20 object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-white/80">Captura adjunta</p>
            <p className="text-[10px] text-white/40">Se envia una sola vez y no se guarda.</p>
          </div>
          <button onClick={() => setImagen(null)} className="rounded p-1 text-white/60 hover:bg-white/10" aria-label="Quitar imagen">
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>
      )}

      <div className="shrink-0 border-t border-white/10 px-2.5 py-2">
        <div className="flex items-end gap-1.5">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              adjuntar(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
            title="Adjuntar una captura"
            aria-label="Adjuntar una captura"
          >
            <ImagePlus style={{ width: 18, height: 18 }} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                enviar()
              }
            }}
            onPaste={onPaste}
            placeholder="Pregunta a AgentGD…"
            aria-label="Pregunta para AgentGD"
            className="min-w-0 flex-1 rounded-lg bg-black/30 px-3 py-2 text-[13px] text-white outline-none placeholder:text-white/40 focus:ring-1 focus:ring-white/20"
          />
          <button
            onClick={() => enviar()}
            className="rounded-lg p-2 text-white transition hover:brightness-125 disabled:opacity-40"
            style={{ background: palette.bubble }}
            disabled={loading || (!input.trim() && !imagen)}
            aria-label="Enviar pregunta"
          >
            <Send style={{ width: 17, height: 17 }} />
          </button>
        </div>
        <p className="mt-1 px-1 text-center text-[9px] text-white/30">
          No adjuntes documentos con datos personales. Verifica las cifras antes de decidir.
        </p>
      </div>
    </div>
  )

  return createPortal(
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="Abrir AgentGD"
          aria-label="Abrir AgentGD"
          style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2147483000, background: palette.bubble }}
          className="rounded-full p-4 text-white shadow-2xl transition-transform hover:scale-110"
        >
          <MessageCircle style={{ width: 26, height: 26 }} />
        </button>
      )}
      {open && panel}
    </>,
    document.body
  )
}
