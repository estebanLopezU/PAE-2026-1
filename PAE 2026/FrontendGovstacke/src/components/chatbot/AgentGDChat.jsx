import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

// AgentGD: nube flotante de IA que se puede arrastrar por toda la pantalla.
// platform = 'govstake' | 'interop'
export default function AgentGDChat({ platform = 'govstake' }) {
  const isGov = platform === 'interop' ? false : true
  const API_URL = '/api/v1/agentgd/chat'

  const palette = isGov
    ? {
        bubble: 'bg-gradient-to-br from-[#ff3b3b] to-[#ff8a3d]',
        header: 'bg-gradient-to-r from-[#ff3b3b] to-[#ff8a3d]',
        card: 'bg-[#1a0a0a]/95 border border-[#ff3b3b]/40',
        user: 'bg-[#ff3b3b]/20 text-white ml-auto',
        bot: 'bg-[#2a1010]/90 border border-[#ff3b3b]/30 text-white mr-auto',
        title: 'AgentGD · GOVStake'
      }
    : {
        bubble: 'bg-gradient-to-br from-[#0ea5e9] to-[#2563eb]',
        header: 'bg-gradient-to-r from-cyan-500 to-blue-600',
        card: 'bg-[#0b1020]/95 border border-cyan-500/40',
        user: 'bg-[#0ea5e9]/20 text-white ml-auto',
        bot: 'bg-[#0f1730]/90 border border-cyan-500/30 text-white mr-auto',
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
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: messages.slice(-8) }),
      })
      const data = await res.json()
      setMessages((m) => [...m, { role: 'assistant', content: data.response || 'Sin respuesta.' }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: '⚠️ No pude conectar con AgentGD.' }])
    } finally {
      setLoading(false)
    }
  }
return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="Abrir AgentGD"
          className={`fixed bottom-6 right-6 z-[1000] rounded-full p-4 shadow-2xl text-white hover:scale-110 transition-transform ${palette.bubble}`}
        >
          <MessageCircle className="h-7 w-7" />
        </button>
      )}

      {open && (
        <div
          ref={boxRef}
          className={`fixed z-[1000] w-[360px] rounded-2xl shadow-2xl ${palette.card}`}
          style={{ left: pos.x, top: pos.y }}
        >
          <div
            className={`flex items-center justify-between px-4 py-3 cursor-move select-none ${palette.header}`}
            data-drag="1"
            onMouseDown={startDrag}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-white" />
              <p className="text-sm font-bold text-white">{palette.title}</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white hover:opacity-70">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={listRef} className="h-52 overflow-y-auto px-3 py-2 space-y-2">
            {messages.length === 0 && (
              <div className="text-xs text-white/60">
                👋 ¡Hola! Soy <b>AgentGD</b>. Puedo analizar el dashboard y responder sobre
                {isGov ? 'actores, matriz de priorización, compromisos y alertas de GOVStake 360' : 'entidades, conectividad X-Road, madurez y servicios de interoperabilidad'}.
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`max-w-full px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${m.role === 'user' ? palette.user : palette.bot}`}>
                {m.content}
              </div>
            ))}
            {loading && <div className={`px-3 py-2 rounded-lg text-sm ${palette.bot}`}>Escribiendo…</div>}
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
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}