import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Flame,
  Grid3X3,
  Layers,
  RefreshCw,
  Search,
  ShieldAlert,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  CartesianGrid,
  Cell,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import GlassCard from '../components/common/GlassCard'
import { matrizApi } from '../services/api'
import { etiquetaTipo } from '../constants/actores'

// Los niveles que devuelve el backend y su lectura estratégica.
const PRIORIDAD = {
  prioridad_alta: { label: 'Alta', color: '#ef4444', desc: 'Gestión inmediata' },
  prioridad_media: { label: 'Media', color: '#f97316', desc: 'Seguimiento cercano' },
  prioridad_baja: { label: 'Baja', color: '#eab308', desc: 'Vigilancia periódica' },
  monitoreo: { label: 'Monitoreo', color: '#94a3b8', desc: 'Sin percepción del líder' },
}
const ORDEN_PRIORIDAD = ['prioridad_alta', 'prioridad_media', 'prioridad_baja', 'monitoreo']
const COLORES_TIPO = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#38bdf8', '#3b82f6', '#22c55e', '#a855f7']

const EJES = [
  { key: 'poder', label: 'Poder' },
  { key: 'legitimidad', label: 'Legitimidad' },
  { key: 'influencia', label: 'Influencia' },
  { key: 'interes', label: 'Interés' },
  { key: 'urgencia', label: 'Urgencia' },
]

// Nombres clásicos de los cuadrantes cuando se grafica Poder × Legitimidad.
const CUADRANTES = {
  alto_alto: 'Gestionar de cerca',
  alto_bajo: 'Mantener satisfechos',
  bajo_alto: 'Mantener informados',
  bajo_bajo: 'Monitorear',
}

function useCountUp(target, duration = 850) {
  const [valor, setValor] = useState(0)
  const anterior = useRef(0)

  useEffect(() => {
    const destino = Number(target) || 0
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      anterior.current = destino
      setValor(destino)
      return
    }
    const desde = anterior.current
    if (desde === destino) {
      setValor(destino)
      return
    }
    let raf
    const inicio = performance.now()
    const paso = (ahora) => {
      const t = Math.min(1, (ahora - inicio) / duration)
      const suave = 1 - Math.pow(1 - t, 3)
      setValor(desde + (destino - desde) * suave)
      if (t < 1) raf = requestAnimationFrame(paso)
      else anterior.current = destino
    }
    raf = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return valor
}

function iniciales(nombre = '') {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  if (!partes.length) return '?'
  return (partes[0][0] + (partes[1]?.[0] || '')).toUpperCase()
}

function PrioridadChip({ nivel, compacto = false }) {
  const cfg = PRIORIDAD[nivel] || PRIORIDAD.monitoreo
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-black uppercase tracking-wider ${
        compacto ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]'
      }`}
      style={{ color: cfg.color, background: `${cfg.color}1a`, border: `1px solid ${cfg.color}4d` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  )
}

function KpiCard({ icon: Icon, label, value, helper, color, share, delay = 0 }) {
  const animado = Math.round(useCountUp(value))
  return (
    <GlassCard
      className="animate-rise relative overflow-hidden p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a1a1aa]">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-white">{animado}</p>
          <p className="mt-1 text-[11px] leading-snug text-[#71717a]">{helper}</p>
        </div>
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${color}14`, border: `1px solid ${color}33`, color }}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.min(100, Math.max(2, share ?? 0))}%`, background: color }}
        />
      </div>
    </GlassCard>
  )
}

function TooltipPunto({ active, payload }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  if (!p?.nombre) return null
  const cfg = PRIORIDAD[p.nivel_prioridad] || PRIORIDAD.monitoreo
  const barras = [
    ['Poder', p.poder],
    ['Legitimidad', p.legitimidad],
    ['Urgencia', p.urgencia],
    ['Influencia', p.influencia],
  ]
  return (
    <div className="w-60 rounded-xl border border-white/10 bg-[#0b0b0f]/95 p-3 shadow-2xl shadow-black/60 backdrop-blur">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold leading-snug text-white">{p.nombre}</p>
        <span
          className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase"
          style={{ color: cfg.color, background: `${cfg.color}1f`, border: `1px solid ${cfg.color}55` }}
        >
          {cfg.label}
        </span>
      </div>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-[#71717a]">
        {etiquetaTipo(p.tipo)}
      </p>
      <div className="mt-2.5 space-y-1.5">
        {barras.map(([nombre, valor]) => (
          <div key={nombre} className="flex items-center gap-2">
            <span className="w-[70px] shrink-0 text-[10px] text-[#a1a1aa]">{nombre}</span>
            <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
              <span
                className="block h-full rounded-full"
                style={{ width: `${valor}%`, background: cfg.color, opacity: 0.85 }}
              />
            </span>
            <span className="w-6 text-right font-mono text-[10px] text-[#d4d4d8]">
              {Math.round(valor)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2 text-[10px]">
        <span className="text-[#71717a]">Índice de priorización</span>
        <span className="font-mono font-bold" style={{ color: cfg.color }}>
          {Number(p.indice_priorizacion ?? 0).toFixed(2)}
        </span>
      </div>
      {p.sin_percepcion && (
        <p className="mt-1.5 text-[10px] leading-snug text-[#71717a]">
          Entidad sincronizada que aún no ha sido valorada por el líder.
        </p>
      )}
    </div>
  )
}

function FormaGrupo({ cx, cy, payload }) {
  if (cx == null || cy == null) return null
  // El grupo se dibuja como un globo ligeramente separado del origen para que
  // no quede cortado por los ejes, unido por una línea guía.
  const gx = cx + 30
  const gy = cy - 52
  return (
    <g>
      <line
        x1={cx}
        y1={cy}
        x2={gx}
        y2={gy + 16}
        stroke="#52525b"
        strokeDasharray="2 2"
      />
      <circle
        cx={gx}
        cy={gy}
        r={17}
        fill="rgba(148,163,184,0.12)"
        stroke="#94a3b8"
        strokeDasharray="3 3"
        strokeWidth={1.2}
      />
      <text
        x={gx}
        y={gy + 4}
        textAnchor="middle"
        fill="#e4e4e7"
        fontSize={11}
        fontWeight={700}
        fontFamily="ui-monospace, monospace"
      >
        {payload?.total ?? 0}
      </text>
    </g>
  )
}

function TablaEsqueleto() {  return (
    <div className="space-y-6">
      <div className="h-10 w-72 animate-pulse rounded-lg bg-white/5" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]" />
        ))}
      </div>
      <div className="h-24 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]" />
      <div className="h-[420px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]" />
    </div>
  )
}

export default function Matriz() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [priorizacion, setPriorizacion] = useState([])
  const [mapa, setMapa] = useState([])
  const [resumen, setResumen] = useState(null)

  const [ejeX, setEjeX] = useState('poder')
  const [ejeY, setEjeY] = useState('legitimidad')
  const [verSinPercepcion, setVerSinPercepcion] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtroPrioridad, setFiltroPrioridad] = useState('todas')
  const [orden, setOrden] = useState('indice')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [p, m, r] = await Promise.all([
        matrizApi.priorizacion(),
        matrizApi.mapa(),
        matrizApi.resumen(),
      ])
      setPriorizacion(p.data?.items || [])
      setMapa(m.data?.items || [])
      setResumen(r.data)
    } catch {
      setError('No se pudo cargar la matriz. Verifica el microservicio GOVStake.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const total = resumen?.total_actores ?? 0
  const porPrioridad = resumen?.por_prioridad || {}

  const sinPercepcion = useMemo(
    () => priorizacion.filter((a) => a.mitchell?.sin_percepcion).length,
    [priorizacion]
  )
  const evaluados = Math.max(0, total - sinPercepcion)
  const cobertura = total ? Math.round((evaluados / total) * 100) : 0

  // El endpoint del mapa no trae el índice; se completa con la priorización
  // para colorear los puntos y mostrarlo en el tooltip sin otra consulta.
  const puntos = useMemo(() => {
    const meta = new Map(priorizacion.map((a) => [a.id, a]))
    return mapa.map((p) => {
      const base = meta.get(p.id)
      return {
        ...p,
        indice_priorizacion: base?.indice_priorizacion ?? 0,
        nivel_prioridad: base?.nivel_prioridad ?? 'monitoreo',
        sin_percepcion: base?.mitchell?.sin_percepcion ?? false,
      }
    })
  }, [mapa, priorizacion])

  const puntosVisibles = useMemo(
    () => (verSinPercepcion ? puntos : puntos.filter((p) => !p.sin_percepcion)),
    [puntos, verSinPercepcion]
  )

  // Los actores sin valoración colapsan en el origen. En lugar de dibujar 124
  // círculos superpuestos (que parecen uno solo), se agrupan en un marcador
  // con el conteo cuando el usuario los muestra.
  const enOrigen = useMemo(
    () =>
      puntosVisibles.filter(
        (p) => Number(p[ejeX]) === 0 && Number(p[ejeY]) === 0
      ).length,
    [puntosVisibles, ejeX, ejeY]
  )

  const puntosGrafica = useMemo(
    () =>
      enOrigen > 1
        ? puntosVisibles.filter(
            (p) => Number(p[ejeX]) !== 0 || Number(p[ejeY]) !== 0
          )
        : puntosVisibles,
    [puntosVisibles, enOrigen, ejeX, ejeY]
  )

  const tipos = useMemo(
    () =>
      Object.entries(resumen?.por_tipo || {})
        .sort((a, b) => b[1] - a[1])
        .map(([clave, conteo], i) => ({
          clave,
          conteo,
          color: COLORES_TIPO[i % COLORES_TIPO.length],
        })),
    [resumen]
  )
  const maxTipo = tipos[0]?.conteo || 1

  const topInfluencia = useMemo(
    () =>
      [...priorizacion]
        .filter((a) => (a.variables?.influencia ?? 0) > 0)
        .sort((a, b) => (b.variables?.influencia ?? 0) - (a.variables?.influencia ?? 0))
        .slice(0, 5),
    [priorizacion]
  )

  const topRiesgo = useMemo(
    () =>
      priorizacion
        .filter((a) => (a.variables?.riesgo_conflicto ?? 0) > 0)
        .sort((a, b) => (b.variables?.riesgo_conflicto ?? 0) - (a.variables?.riesgo_conflicto ?? 0))
        .slice(0, 4),
    [priorizacion]
  )

  const filas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const salida = priorizacion.filter((a) => {
      if (filtroPrioridad !== 'todas' && a.nivel_prioridad !== filtroPrioridad) return false
      if (!q) return true
      return [a.nombre, a.institucion, etiquetaTipo(a.tipo)]
        .filter(Boolean)
        .some((texto) => texto.toLowerCase().includes(q))
    })
    if (orden === 'nombre') salida.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    else if (orden === 'riesgo')
      salida.sort(
        (a, b) => (b.variables?.riesgo_conflicto ?? 0) - (a.variables?.riesgo_conflicto ?? 0)
      )
    else salida.sort((a, b) => b.indice_priorizacion - a.indice_priorizacion)
    return salida
  }, [priorizacion, busqueda, filtroPrioridad, orden])

  const cuadrantes = ejeX === 'poder' && ejeY === 'legitimidad'
  const etiquetaX = EJES.find((e) => e.key === ejeX)?.label || ejeX
  const etiquetaY = EJES.find((e) => e.key === ejeY)?.label || ejeY

  if (loading) return <TablaEsqueleto />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#ef4444]">ANÁLISIS ESTRATÉGICO</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Matriz y mapa de actores</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#a1a1aa]">
            Dónde se concentra el poder, la legitimidad y la influencia de la red de actores.
            Cada punto es un grupo de interés ponderado por su índice de priorización.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/modelo"
            className="flex items-center gap-2 rounded-lg border border-[#3f3f46] px-4 py-2 text-xs font-bold text-[#a1a1aa] transition-all hover:border-[#ef4444]/50 hover:text-white"
          >
            <BookOpen className="h-4 w-4" /> FUNDAMENTOS
          </Link>
          <Link
            to="/mitchell"
            className="flex items-center gap-2 rounded-lg border border-[#3f3f46] px-4 py-2 text-xs font-bold text-[#a1a1aa] transition-all hover:border-[#ef4444]/50 hover:text-white"
          >
            <Grid3X3 className="h-4 w-4" /> MITCHELL
          </Link>
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-lg border border-[#3f3f46] px-4 py-2 text-xs font-bold text-[#a1a1aa] transition-all hover:border-[#ef4444]/50 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" /> ACTUALIZAR
          </button>
        </div>
      </div>

      {error && (
        <GlassCard className="p-4">
          <p className="flex items-center gap-2 text-sm text-[#fca5a5]">
            <AlertTriangle className="h-4 w-4" /> {error}
          </p>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Users}
          label="Actores registrados"
          value={total}
          helper={`${evaluados} con percepción del líder`}
          color="#f97316"
          share={cobertura}
          delay={0}
        />
        <KpiCard
          icon={Flame}
          label="Prioridad alta"
          value={porPrioridad.prioridad_alta ?? 0}
          helper="Gestión inmediata"
          color="#ef4444"
          share={total ? ((porPrioridad.prioridad_alta ?? 0) / total) * 100 : 0}
          delay={60}
        />
        <KpiCard
          icon={Activity}
          label="Prioridad media"
          value={porPrioridad.prioridad_media ?? 0}
          helper="Seguimiento cercano"
          color="#f59e0b"
          share={total ? ((porPrioridad.prioridad_media ?? 0) / total) * 100 : 0}
          delay={120}
        />
        <KpiCard
          icon={Layers}
          label="Tipos de actor"
          value={tipos.length}
          helper="Categorías presentes en la red"
          color="#38bdf8"
          share={(tipos.length / 13) * 100}
          delay={180}
        />
      </div>

      <GlassCard className="animate-rise overflow-hidden" style={{ animationDelay: '220ms' }}>
        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">
                Composición por prioridad
              </h2>
              <span className="font-mono text-[10px] text-[#71717a]">{total} actores</span>
            </div>
            <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-white/5">
              {ORDEN_PRIORIDAD.map((clave) => {
                const conteo = porPrioridad[clave] ?? 0
                if (!conteo) return null
                return (
                  <div
                    key={clave}
                    title={`${PRIORIDAD[clave].label}: ${conteo}`}
                    className="h-full transition-all duration-700"
                    style={{ width: `${(conteo / total) * 100}%`, background: PRIORIDAD[clave].color }}
                  />
                )
              })}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {ORDEN_PRIORIDAD.map((clave) => {
                const conteo = porPrioridad[clave] ?? 0
                const cfg = PRIORIDAD[clave]
                const pct = total ? ((conteo / total) * 100).toFixed(1) : '0.0'
                return (
                  <div
                    key={clave}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: cfg.color }} />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-[#d4d4d8]">{cfg.label}</p>
                        <p className="truncate text-[10px] text-[#71717a]">{cfg.desc}</p>
                      </div>
                    </div>
                    <div className="ml-2 text-right">
                      <p className="font-mono text-sm font-bold text-white">{conteo}</p>
                      <p className="font-mono text-[10px] text-[#71717a]">{pct}%</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="lg:border-l lg:border-white/5 lg:pl-6">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">
                Distribución por tipo
              </h2>
              <span className="font-mono text-[10px] text-[#71717a]">{tipos.length} categorías</span>
            </div>
            <div className="mt-4 space-y-2.5">
              {tipos.slice(0, 6).map((t) => (
                <div key={t.clave}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-[11px] text-[#d4d4d8]">{etiquetaTipo(t.clave)}</p>
                    <span className="font-mono text-[11px] text-[#a1a1aa]">{t.conteo}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.max(3, (t.conteo / maxTipo) * 100)}%`,
                        background: t.color,
                      }}
                    />
                  </div>
                </div>
              ))}
              {tipos.length > 6 && (
                <p className="pt-1 text-[10px] text-[#71717a]">
                  + {tipos.length - 6} categorías con menor representación
                </p>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="animate-rise p-6" style={{ animationDelay: '300ms' }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">
              Mapa dinámico · {etiquetaX} × {etiquetaY}
            </h2>
            <p className="mt-1 text-[11px] text-[#71717a]">
              El tamaño de cada punto representa la influencia del actor.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#71717a]">
              Eje X
              <select
                value={ejeX}
                onChange={(e) => setEjeX(e.target.value)}
                className="rounded-lg border border-[#3f3f46] bg-[#0e0e11] px-2 py-1.5 text-[11px] font-semibold text-[#d4d4d8] focus:border-[#ef4444]/60 focus:outline-none"
              >
                {EJES.map((e) => (
                  <option key={e.key} value={e.key}>
                    {e.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#71717a]">
              Eje Y
              <select
                value={ejeY}
                onChange={(e) => setEjeY(e.target.value)}
                className="rounded-lg border border-[#3f3f46] bg-[#0e0e11] px-2 py-1.5 text-[11px] font-semibold text-[#d4d4d8] focus:border-[#ef4444]/60 focus:outline-none"
              >
                {EJES.map((e) => (
                  <option key={e.key} value={e.key}>
                    {e.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={() => setVerSinPercepcion((v) => !v)}
              className={`rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                verSinPercepcion
                  ? 'border-[#3f3f46] text-[#a1a1aa] hover:border-[#ef4444]/50 hover:text-white'
                  : 'border-[#ef4444]/50 bg-[#ef4444]/10 text-[#fca5a5]'
              }`}
            >
              {verSinPercepcion ? `Ocultar ${sinPercepcion} sin percepción` : `Mostrar ${sinPercepcion}`}
            </button>
          </div>
        </div>

        <div className="mt-4">
          {puntosVisibles.length === 0 ? (
            <p className="py-24 text-center text-sm text-[#a1a1aa]">
              No hay actores que graficar con los filtros actuales.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 16, right: 24, bottom: 12, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                {cuadrantes && (
                  <>
                    <ReferenceArea x1={50} x2={100} y1={50} y2={100} fill="rgba(239,68,68,0.05)"
                      label={{ value: CUADRANTES.alto_alto, position: 'insideTopRight', fill: 'rgba(248,113,113,0.6)', fontSize: 10 }} />
                    <ReferenceArea x1={50} x2={100} y1={0} y2={50} fill="rgba(249,115,22,0.05)"
                      label={{ value: CUADRANTES.alto_bajo, position: 'insideBottomRight', fill: 'rgba(251,146,60,0.6)', fontSize: 10 }} />
                    <ReferenceArea x1={0} x2={50} y1={50} y2={100} fill="rgba(56,189,248,0.05)"
                      label={{ value: CUADRANTES.bajo_alto, position: 'insideTopLeft', fill: 'rgba(125,211,252,0.6)', fontSize: 10 }} />
                    <ReferenceArea x1={0} x2={50} y1={0} y2={50} fill="rgba(148,163,184,0.04)"
                      label={{ value: CUADRANTES.bajo_bajo, position: 'insideBottomLeft', offset: 12, fill: 'rgba(148,163,184,0.55)', fontSize: 10 }} />
                  </>
                )}
                <ReferenceLine x={50} stroke="#52525b" strokeDasharray="4 4" />
                <ReferenceLine y={50} stroke="#52525b" strokeDasharray="4 4" />
                <XAxis
                  type="number"
                  dataKey={ejeX}
                  name={etiquetaX}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  stroke="#3f3f46"
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  type="number"
                  dataKey={ejeY}
                  name={etiquetaY}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  stroke="#3f3f46"
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  tickLine={false}
                  width={36}
                />
                <ZAxis type="number" dataKey="influencia" range={[70, 480]} />
                <Tooltip content={<TooltipPunto />} cursor={{ strokeDasharray: '3 3', stroke: '#52525b' }} />
                <Scatter data={puntosGrafica} name="Actor">
                  {puntosGrafica.map((p) => {
                    const cfg = PRIORIDAD[p.nivel_prioridad] || PRIORIDAD.monitoreo
                    return (
                      <Cell
                        key={p.id}
                        fill={cfg.color}
                        fillOpacity={0.72}
                        stroke={cfg.color}
                        strokeOpacity={0.9}
                      />
                    )
                  })}
                </Scatter>
                {enOrigen > 1 && (
                  <Scatter
                    data={[{ [ejeX]: 0, [ejeY]: 0, total: enOrigen }]}
                    shape={<FormaGrupo />}
                    legendType="none"
                    isAnimationActive={false}
                  />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/5 pt-3">
          {ORDEN_PRIORIDAD.map((clave) => (
            <span key={clave} className="flex items-center gap-1.5 text-[11px] text-[#a1a1aa]">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: PRIORIDAD[clave].color }}
              />
              {PRIORIDAD[clave].label}
              <span className="font-mono text-[10px] text-[#71717a]">{porPrioridad[clave] ?? 0}</span>
            </span>
          ))}
          <span className="text-[10px] text-[#71717a] sm:ml-2">
            {verSinPercepcion && enOrigen > 1
              ? `${puntosGrafica.length} valorados + ${enOrigen} sin percepción agrupados en el origen`
              : !verSinPercepcion
                ? `${sinPercepcion} actores sin percepción ocultos`
                : `${puntosGrafica.length} actores graficados`}
          </span>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="animate-rise p-5" style={{ animationDelay: '360ms' }}>
          <h2 className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#a1a1aa]">
            <TrendingUp className="h-3.5 w-3.5 text-[#f97316]" /> Mayor influencia
          </h2>
          {topInfluencia.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#71717a]">Sin valoraciones de influencia.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {topInfluencia.map((a) => {
                const valor = a.variables?.influencia ?? 0
                const cfg = PRIORIDAD[a.nivel_prioridad] || PRIORIDAD.monitoreo
                return (
                  <div key={a.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate text-xs font-semibold text-[#d4d4d8]">{a.nombre}</p>
                      <span className="font-mono text-[11px] text-white">{Math.round(valor)}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.max(2, valor)}%`, background: cfg.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </GlassCard>

        <GlassCard className="animate-rise p-5" style={{ animationDelay: '400ms' }}>
          <h2 className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#a1a1aa]">
            <ShieldAlert className="h-3.5 w-3.5 text-[#ef4444]" /> Riesgo de conflicto
          </h2>
          {topRiesgo.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#71717a]">
              Sin riesgos registrados en los actores valorados.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {topRiesgo.map((a) => {
                const valor = Math.round(a.variables?.riesgo_conflicto ?? 0)
                const color = valor >= 70 ? '#ef4444' : valor >= 40 ? '#f59e0b' : '#94a3b8'
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-[#d4d4d8]">{a.nombre}</p>
                      <p className="truncate text-[10px] text-[#71717a]">{etiquetaTipo(a.tipo)}</p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold"
                      style={{ color, background: `${color}1a`, border: `1px solid ${color}4d` }}
                    >
                      {valor}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </GlassCard>

        <GlassCard className="animate-rise p-5" style={{ animationDelay: '440ms' }}>
          <h2 className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#a1a1aa]">
            <Activity className="h-3.5 w-3.5 text-[#38bdf8]" /> Cobertura de evaluación
          </h2>
          <div className="mt-4 flex items-center gap-5">
            <div
              className="relative h-24 w-24 shrink-0 rounded-full"
              style={{
                background: `conic-gradient(#f97316 ${cobertura}%, rgba(255,255,255,0.06) 0)`,
              }}
            >
              <div className="absolute inset-[7px] flex flex-col items-center justify-center rounded-full bg-[#101014]">
                <span className="text-lg font-bold text-white">{cobertura}%</span>
                <span className="text-[9px] uppercase tracking-wider text-[#71717a]">valorado</span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#d4d4d8]">
                {evaluados} de {total} actores
              </p>
              <p className="mt-1 text-[11px] leading-snug text-[#71717a]">
                Las {sinPercepcion} entidades sincronizadas aún no tienen percepción del líder y
                se agrupan en el origen del mapa.
              </p>
              <Link
                to="/actores"
                className="mt-2 inline-block text-[10px] font-bold uppercase tracking-wider text-[#f97316] transition-colors hover:text-[#ef4444]"
              >
                Valorar actores →
              </Link>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="animate-rise overflow-hidden" style={{ animationDelay: '480ms' }}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 p-5">
          <div>
            <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">
              Matriz de priorización
            </h2>
            <p className="mt-1 text-[11px] text-[#71717a]">
              Ordenada por índice de priorización (poder, legitimidad, influencia e interés).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#71717a]" />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar actor, institución o tipo…"
                className="w-64 rounded-lg border border-[#3f3f46] bg-[#0e0e11] py-2 pl-9 pr-3 text-xs text-white placeholder:text-[#71717a] focus:border-[#ef4444]/60 focus:outline-none"
              />
            </div>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="rounded-lg border border-[#3f3f46] bg-[#0e0e11] px-3 py-2 text-xs font-semibold text-[#d4d4d8] focus:border-[#ef4444]/60 focus:outline-none"
            >
              <option value="indice">Ordenar por índice</option>
              <option value="nombre">Ordenar por nombre</option>
              <option value="riesgo">Ordenar por riesgo</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-white/5 px-5 py-3">
          {[['todas', 'Todas', total, '#a1a1aa'], ...ORDEN_PRIORIDAD.map((clave) => [
            clave,
            PRIORIDAD[clave].label,
            porPrioridad[clave] ?? 0,
            PRIORIDAD[clave].color,
          ])].map(([clave, label, conteo, color]) => {
            const activo = filtroPrioridad === clave
            return (
              <button
                key={clave}
                onClick={() => setFiltroPrioridad(clave)}
                className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all"
                style={{
                  color: activo ? '#0b0b0f' : color,
                  background: activo ? color : `${color}14`,
                  borderColor: `${color}55`,
                }}
              >
                {label} <span className="font-mono">{conteo}</span>
              </button>
            )
          })}
          {(busqueda || filtroPrioridad !== 'todas') && (
            <button
              onClick={() => {
                setBusqueda('')
                setFiltroPrioridad('todas')
              }}
              className="ml-auto text-[10px] font-bold uppercase tracking-wider text-[#71717a] hover:text-white"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {filas.length === 0 ? (
          <p className="py-16 text-center text-sm text-[#a1a1aa]">
            Ningún actor coincide con la búsqueda.
          </p>
        ) : (
          <div className="max-h-[520px] overflow-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 z-10 bg-[#101014]">
                <tr className="border-b border-[#3f3f46]">
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#71717a]">
                    #
                  </th>
                  <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#71717a]">
                    Actor
                  </th>
                  <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#71717a]">
                    Prioridad
                  </th>
                  <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#71717a]">
                    Índice
                  </th>
                  <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#71717a]">
                    Riesgo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                {filas.map((a, i) => {
                  const cfg = PRIORIDAD[a.nivel_prioridad] || PRIORIDAD.monitoreo
                  const riesgo = Math.round(a.variables?.riesgo_conflicto ?? 0)
                  const colorRiesgo = riesgo >= 70 ? '#ef4444' : riesgo >= 40 ? '#f59e0b' : '#71717a'
                  const medalla =
                    orden === 'indice' && filtroPrioridad === 'todas' && !busqueda && i < 3
                      ? ['#fbbf24', '#d4d4d8', '#d97706'][i]
                      : null
                  return (
                    <tr key={a.id} className="group transition-colors hover:bg-white/[0.04]">
                      <td className="px-5 py-3">
                        <span
                          className="font-mono text-xs font-bold"
                          style={{ color: medalla || '#52525b' }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-[10px] font-bold"
                            style={{
                              color: cfg.color,
                              background: `${cfg.color}14`,
                              border: `1px solid ${cfg.color}3d`,
                            }}
                          >
                            {iniciales(a.nombre)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">{a.nombre}</p>
                            <p className="truncate text-[10px] text-[#71717a]">
                              {etiquetaTipo(a.tipo)}
                              {a.institucion ? ` · ${a.institucion}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <PrioridadChip nivel={a.nivel_prioridad} />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-11 font-mono text-xs font-bold text-[#d4d4d8]">
                            {Number(a.indice_priorizacion ?? 0).toFixed(1)}
                          </span>
                          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-white/5">
                            <span
                              className="block h-full rounded-full"
                              style={{
                                width: `${Math.max(2, a.indice_priorizacion ?? 0)}%`,
                                background: cfg.color,
                              }}
                            />
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-mono text-xs" style={{ color: colorRiesgo }}>
                          {riesgo}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-white/5 px-5 py-3 text-[10px] uppercase tracking-wider text-[#71717a]">
          <span>
            Mostrando {filas.length} de {total} actores
          </span>
          <span className="font-mono">GOVSTAKE · MATRIZ ESTRATÉGICA</span>
        </div>
      </GlassCard>
    </div>
  )
}

