import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MessageCircle, X, Send } from 'lucide-react'

// AgentGD: nube flotante de IA que se puede arrastrar por toda la pantalla.
// platform = 'govstake' | 'interop'
export default function AgentGDChat({ platform = 'govstake' }) {
  const isGov = platform === 'interop' ? false : true
  const API_URL = '/api/v1/agentgd/chat'

  // Token JWT: admite las claves de ambos frontends
  const getToken = () =>
    localStorage.getItem('govstake_access_token') ||
    localStorage.getItem('xroad_access_token') ||
    ''

  const palette = isGov
    ? {
        bubble: 'linear-gradient(135deg,#ff3b3b,#ff8a3d)',
        header: 'linear-gradient(90deg,#ff3b3b,#ff8a3d)',
        card: 'rgba(26,10,10,0.97)',
        cardBorder: 'rgba(255,59,59,0.45)',
        user: 'rgba(255,59,59,0.22)',
        bot: 'rgba(42,16,16,0.95)',
        botBorder: 'rgba(255,59,59,0.3)',
        title: 'AgentGD · GOVStake'
      }
    : {
        bubble: 'linear-gradient(135deg,#0ea5e9,#2563eb)',
        header: 'linear-gradient(90deg,#06b6d4,#2563eb)',
        card: 'rgba(11,16,32,0.97)',
        cardBorder: 'rgba(34,211,238,0.45)',
        user: 'rgba(14,165,233,0.22)',
        bot: 'rgba(15,23,48,0.95)',
        botBorder: 'rgba(34,211,238,0.3)',
        title: 'AgentGD · Interop'
      }

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const [pos, setPos] = useState({ x: Math.max(24, window.innerWidth - 380), y: 120 })
  const dragRef = useRef(null)
  const offsetRef = useRef({ x: 0, y: 0 })
  const boxRef = useRef(null)
  const listRef = useRef(null)
useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current) return
      setPos({
        x: Math.min(Math.max(0, e.clientX - offsetRef.current.x), window.innerWidth - 360),
        y: Math.min(Math.max(0, e.clientY - offsetRef.current.y), window.innerHeight - 480),
      })
    }
    const onUp = () => { dragRef.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, loading])

  const startDrag = (e) => {
    const box = boxRef.current
    if (!box) return
    const rect = box.getBoundingClientRect()
    if (e.target.dataset.drag) {
      offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      dragRef.current = true
    }
  }

  const send = async () => {
    const msg = input.trim()
    if (!msg || loading) return
    setMessages((m) => [...m, { role: 'user', content: msg }])
    setInput('')
    setLoading(true)
    try {
      const token = getToken()
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: msg, history: messages.slice(-8) }),
      })
      const data = await res.json()
      setMessages((m) => [...m, { role: 'assistant', content: data.response || (data.detail ? `⚠️ ${data.detail}` : 'Sin respuesta.') }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: '⚠️ No pude conectar con AgentGD.' }])
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="Abrir AgentGD"
          style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2147483000, background: palette.bubble }}
          className="rounded-full p-4 text-white shadow-2xl transition-transform hover:scale-110"
        >
          <MessageCircle style={{ width: 28, height: 28 }} />
        </button>
      )}

      {open && (
        <div
          style={{
            position: 'fixed',
            left: pos.x,
            top: pos.y,
            width: 360,
            zIndex: 2147483000,
            background: palette.card,
            border: `1px solid ${palette.cardBorder}`,
          }}
          className="rounded-2xl shadow-2xl"
        >
          <div
            style={{ background: palette.header }}
            className="flex cursor-move select-none items-center justify-between rounded-t-2xl px-4 py-3"
            onMouseDown={startDrag}
          >
            <div className="flex items-center gap-2">
              <MessageCircle style={{ width: 20, height: 20 }} className="text-white" />
              <p className="text-sm font-bold text-white">{palette.title}</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white hover:opacity-70">
              <X style={{ width: 20, height: 20 }} />
            </button>
          </div>

          <div ref={listRef} className="h-52 space-y-2 overflow-y-auto px-3 py-2">
            {messages.length === 0 && (
              <div className="text-xs text-white/60">
                👋 ¡Hola! Soy <b>AgentGD</b>. Puedo analizar el dashboard y responder sobre
                {isGov
                  ? ' actores, matriz de priorización, compromisos y alertas de GOVStake 360'
                  : ' entidades, conectividad X-Road, madurez y servicios de interoperabilidad'}.
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className="max-w-full rounded-lg px-3 py-2 text-sm whitespace-pre-wrap text-white"
                style={
                  m.role === 'user'
                    ? { background: palette.user, marginLeft: 'auto', width: 'fit-content' }
                    : { background: palette.bot, border: `1px solid ${palette.botBorder}`, marginRight: 'auto' }
                }
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="rounded-lg px-3 py-2 text-sm text-white/80" style={{ background: palette.bot }}>
                Escribiendo…
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-white/10 px-3 py-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Pregunta a AgentGD…"
              className="flex-1 rounded-lg bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
            />
            <button onClick={send} className="rounded-lg p-2 text-white hover:opacity-70 disabled:opacity-40" disabled={loading}>
              <Send style={{ width: 20, height: 20 }} />
            </button>
          </div>
        </div>
      )}
    </>,
    document.body
  )
}