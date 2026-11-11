import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Calculator,
  GraduationCap,
  Info,
  Layers,
  Network,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
} from 'lucide-react'
import GlassCard from '../components/common/GlassCard'
import { modeloApi } from '../services/api'
import { EXPR_COLORS, NIVELES_ORDINALES as NIVELES, RANGO_COLORS } from '../constants/modelo'

function Chip({ children, color = '#a1a1aa', solid = false }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
      style={{
        color: solid ? '#111113' : color,
        background: solid ? color : `${color}1f`,
        border: `1px solid ${color}55`,
      }}
    >
      {children}
    </span>
  )
}

function Seccion({ icono: Icono, eyebrow, titulo, children }) {
  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#3f3f46] bg-white/5">
          <Icono className="h-4 w-4 text-[#f97316]" />
        </div>
        <div>
          {eyebrow && (
            <p className="font-mono text-[10px] tracking-[0.3em] text-[#ef4444]">
              {eyebrow}
            </p>
          )}
          <h2 className="text-xl font-bold text-white">{titulo}</h2>
        </div>
      </div>
      {children}
    </section>
  )
}

export default function Fundamentos({ publico = false }) {
  const [teoria, setTeoria] = useState(null)
  const [casos, setCasos] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const [niveles, setNiveles] = useState({
    poder: 2,
    legitimidad: 2,
    urgencia: 2,
    frecuencia_intentos: 1,
  })
  const [calculo, setCalculo] = useState(null)
  const [calculando, setCalculando] = useState(false)

  const [rangoFiltro, setRangoFiltro] = useState('')

  const [parejas, setParejas] = useState({ pl: 5, pu: 5, lu: 5 })

  useEffect(() => {
    let vivo = true
    setLoading(true)
    Promise.all([modeloApi.teoria(), modeloApi.plu()])
      .then(([t, p]) => {
        if (!vivo) return
        setTeoria(t.data)
        setCasos(p.data?.items || [])
      })
      .catch(() => vivo && setError('No se pudo cargar el contenido del modelo.'))
      .finally(() => vivo && setLoading(false))
    return () => {
      vivo = false
    }
  }, [])

  useEffect(() => {
    let vivo = true
    setCalculando(true)
    modeloApi
      .calcular(niveles)
      .then((r) => vivo && setCalculo(r.data))
      .catch(() => vivo && setCalculo(null))
      .finally(() => vivo && setCalculando(false))
    return () => {
      vivo = false
    }
  }, [niveles])

  const casosFiltrados = useMemo(
    () => (rangoFiltro ? casos.filter((c) => c.rango === rangoFiltro) : casos),
    [casos, rangoFiltro]
  )

  const ponderacion = useMemo(() => {
    const subtotales = {
      poder: Number(parejas.pl) + Number(parejas.pu),
      legitimidad: 10 - Number(parejas.pl) + Number(parejas.lu),
      urgencia: 10 - Number(parejas.pu) + (10 - Number(parejas.lu)),
    }
    const pesos = {
      poder: subtotales.poder / 30,
      legitimidad: subtotales.legitimidad / 30,
      urgencia: subtotales.urgencia / 30,
    }
    return { subtotales, pesos }
  }, [parejas])

  const cambiarNivel = (clave, valor) =>
    setNiveles((prev) => ({ ...prev, [clave]: Number(valor) }))

  const cargando = loading && !teoria

  const contenido = (
    <div className={publico ? 'space-y-10' : 'space-y-10'}>
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#ef4444]">
            FUNDAMENTOS DEL MODELO
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-white">
            {teoria?.que_es?.titulo || 'Qué es GOVStake 360'}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#d4d4d8]">
            {teoria?.que_es?.frase ||
              'GOVStake 360 convierte la percepción del líder sobre sus grupos de interés en una jerarquía de atención y una recomendación de relacionamiento.'}
          </p>
          {!publico && (
            <p className="mt-3 text-sm text-[#a1a1aa]">
              Esta página explica el modelo que aplica la aplicación. Todo el contenido
              y el cálculo provienen del mismo motor, de modo que la teoría y los datos
              nunca se contradicen.
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {publico ? (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#ef4444] to-[#f97316] px-5 py-3 text-xs font-black tracking-wider text-[#1a0505]"
            >
              Ingresar a la aplicación <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              to="/que-es-govstake"
              className="flex items-center gap-2 rounded-lg border border-[#3f3f46] px-4 py-2 text-xs font-bold text-[#a1a1aa] transition-all hover:border-[#ef4444]/50 hover:text-white"
            >
              Ver página pública <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {error && (
        <GlassCard className="p-4">
          <p className="flex items-center gap-2 text-sm text-[#fca5a5]">
            <AlertTriangle className="h-4 w-4" /> {error}
          </p>
        </GlassCard>
      )}

      {cargando ? (
        <div className="flex h-40 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-[#ef4444]" />
        </div>
      ) : (
        teoria && (
          <>
            {/* Pilares */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {(teoria.que_es?.pilares || []).map((p, i) => (
                <GlassCard key={p.titulo} className="p-5 border-t-2 border-[#ef4444]/60">
                  <p className="font-mono text-[10px] tracking-[0.25em] text-[#ef4444]">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <p className="mt-2 text-sm font-bold text-white">{p.titulo}</p>
                  <p className="mt-2 text-xs leading-relaxed text-[#a1a1aa]">{p.descripcion}</p>
                </GlassCard>
              ))}
            </div>

            {/* Para qué sirve */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#f97316]" />
                <p className="text-sm font-bold text-white">
                  {teoria.proposito?.titulo || 'Para qué sirve en la gestión pública'}
                </p>
              </div>
              <ul className="mt-4 space-y-2">
                {(teoria.proposito?.usos || []).map((uso) => (
                  <li key={uso} className="flex items-start gap-3 text-sm text-[#d4d4d8]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ef4444]" />
                    {uso}
                  </li>
                ))}
              </ul>
            </GlassCard>

            {/* El ciclo SLX */}
            <Seccion
              icono={Network}
              eyebrow="MODELO SLX · KATZ Y KAHN (1978)"
              titulo="Cómo se convierte una expectativa en conducta"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {(teoria.slx?.etapas || []).map((etapa) => (
                  <GlassCard key={etapa.clave} className="relative p-5">
                    <div className="flex items-center justify-between">
                      <Chip color="#38bdf8">Paso {etapa.orden}</Chip>
                      <span className="font-mono text-[10px] text-[#52525b]">
                        {etapa.clave}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-bold text-white">{etapa.nombre}</p>
                    <p className="mt-2 text-xs leading-relaxed text-[#a1a1aa]">
                      {etapa.descripcion}
                    </p>
                    <p className="mt-3 rounded-lg border border-[#3f3f46] bg-black/30 p-2 text-[11px] text-[#d4d4d8]">
                      <span className="font-bold text-[#38bdf8]">Dato en GOVStake: </span>
                      {etapa.senal_en_govstake}
                    </p>
                  </GlassCard>
                ))}
              </div>
              <p className="text-xs text-[#71717a]">{teoria.slx?.cita}</p>
            </Seccion>

            {/* Calculadora PLU */}
            <Seccion
              icono={Calculator}
              eyebrow="MODELO PLU · CAPÍTULO 4 DEL DOCTORADO"
              titulo="Calculadora de relevancia"
            >
              <GlassCard className="p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    <p className="text-sm text-[#a1a1aa]">
                      Elige el nivel de cada atributo. La relevancia usa los pesos con los
                      que están impresas las Tablas 4.4 y 4.5 del doctorado.
                    </p>
                    {[
                      { clave: 'poder', label: 'Poder', ayuda: 'Capacidad de influir o imponer decisiones.' },
                      { clave: 'legitimidad', label: 'Legitimidad', ayuda: 'Reconocimiento jurídico, institucional o social.' },
                      { clave: 'urgencia', label: 'Urgencia', ayuda: 'Sensibilidad al tiempo y criticidad de la exigencia.' },
                      { clave: 'frecuencia_intentos', label: 'Frecuencia de intentos', ayuda: 'Cuántas veces el actor intenta influir.' },
                    ].map(({ clave, label, ayuda }) => (
                      <div key={clave}>
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-[#d4d4d8]">
                            {label}
                          </label>
                          <span className="font-mono text-xs text-[#f97316]">
                            {niveles[clave]}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-4 gap-2">
                          {NIVELES.map((n) => {
                            const activo = Number(niveles[clave]) === n.valor
                            return (
                              <button
                                key={n.valor}
                                type="button"
                                onClick={() => cambiarNivel(clave, n.valor)}
                                className={`rounded-lg border px-2 py-2 text-[11px] font-bold transition-all ${
                                  activo
                                    ? 'border-[#ef4444] bg-[#ef4444]/15 text-white'
                                    : 'border-[#3f3f46] text-[#a1a1aa] hover:border-[#ef4444]/40 hover:text-white'
                                }`}
                              >
                                {n.label}
                              </button>
                            )
                          })}
                        </div>
                        <p className="mt-1 text-[11px] text-[#71717a]">{ayuda}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-[#3f3f46] bg-black/30 p-5">
                    {!calculo ? (
                      <div className="flex h-full items-center justify-center">
                        <RefreshCw className={`h-5 w-5 text-[#ef4444] ${calculando ? 'animate-spin' : ''}`} />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-mono text-[10px] tracking-[0.25em] text-[#a1a1aa]">
                              CÓDIGO PLU
                            </p>
                            <p className="mt-1 font-mono text-4xl font-black tracking-[0.2em] text-white">
                              {calculo.plu}
                            </p>
                            <p className="mt-1 text-xs text-[#a1a1aa]">
                              Caso {calculo.caso} de 64 · {calculo.identificacion} ·{' '}
                              {calculo.estado}
                            </p>
                          </div>
                          <Chip color={RANGO_COLORS[calculo.rango]} solid>
                            {calculo.rango_etiqueta}
                          </Chip>
                        </div>

                        <div className="space-y-2">
                          {calculo.pasos.map((paso) => (
                            <div
                              key={paso.atributo}
                              className="flex items-center justify-between rounded-lg border border-[#3f3f46] bg-white/5 px-3 py-2 text-xs"
                            >
                              <span className="capitalize text-[#d4d4d8]">{paso.atributo}</span>
                              <span className="font-mono text-[#a1a1aa]">
                                {paso.nivel} × {paso.peso.toFixed(4)}
                              </span>
                              <span className="font-mono font-bold text-[#f97316]">
                                {paso.aporte.toFixed(2)}
                              </span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between rounded-lg border border-[#ef4444]/40 bg-[#ef4444]/10 px-3 py-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-white">
                              Relevancia calculada
                            </span>
                            <span className="font-mono text-lg font-black text-[#ef4444]">
                              {calculo.relevancia_calculada.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-right text-[10px] text-[#71717a]">
                            escala 0,00 – 3,00
                          </p>
                        </div>

                        <div
                          className="rounded-xl border p-4"
                          style={{
                            borderColor: `${EXPR_COLORS[calculo.expresion_sugerida.clave] || '#52525b'}55`,
                            background: `${EXPR_COLORS[calculo.expresion_sugerida.clave] || '#52525b'}12`,
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">
                              Expresión sugerida
                            </p>
                            {!calculo.sin_percepcion && (
                              <Chip color={EXPR_COLORS[calculo.expresion_sugerida.clave]}>
                                Confianza {calculo.expresion_sugerida.confianza}%
                              </Chip>
                            )}
                          </div>
                          <p className="mt-2 text-lg font-bold text-white">
                            {calculo.expresion_sugerida.nombre}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-[#d4d4d8]">
                            {calculo.expresion_sugerida.descripcion}
                          </p>
                          <p className="mt-2 font-mono text-[10px] text-[#71717a]">
                            {calculo.expresion_sugerida.regla}
                          </p>
                        </div>

                        <p className="text-[11px] leading-relaxed text-[#71717a]">
                          Recomendación fundamentada en las correlaciones de la Hipótesis F
                          del doctorado. No es una orden: el líder puede sobrescribirla y el
                          cambio queda registrado.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </Seccion>

            {/* Escala y atributos */}
            <Seccion
              icono={Scale}
              eyebrow="INSTRUMENTO · CAPÍTULO 3"
              titulo="La escala y los tres atributos"
            >
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <GlassCard className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">
                    Escala verbal cerrada de cuatro niveles
                  </p>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {(teoria.niveles || []).map((n) => (
                      <div
                        key={n.clave}
                        className="rounded-lg border border-[#3f3f46] bg-white/5 p-3 text-center"
                      >
                        <p className="font-mono text-lg font-black text-[#f97316]">{n.puntos}</p>
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-white">
                          {n.etiqueta}
                        </p>
                        <p className="mt-1 text-[10px] text-[#71717a]">
                          {n.banda_100}–{n.banda_100_max}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] leading-relaxed text-[#71717a]">
                    {teoria.escala?.nota}
                  </p>
                </GlassCard>

                <GlassCard className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">
                    Pesos publicados y rangos de relevancia
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {['poder', 'legitimidad', 'urgencia'].map((k) => (
                      <div key={k} className="rounded-lg border border-[#3f3f46] bg-white/5 p-2 text-center">
                        <p className="text-[10px] uppercase tracking-wide text-[#71717a]">{k}</p>
                        <p className="font-mono text-sm font-bold text-white">
                          {(teoria.pesos[k] * 100).toFixed(2)}%
                        </p>
                        <p className="font-mono text-[10px] text-[#71717a]">
                          {teoria.pesos_numerador[k]}/30
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {(teoria.rangos || []).map((r) => (
                      <div
                        key={r.clave}
                        className="flex items-center justify-between rounded-lg border border-[#3f3f46] px-3 py-1.5 text-xs"
                      >
                        <span className="flex items-center gap-2 text-[#d4d4d8]">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ background: RANGO_COLORS[r.clave] }}
                          />
                          {r.etiqueta}
                        </span>
                        <span className="font-mono text-[#a1a1aa]">
                          {r.min.toFixed(2)} – {r.max.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
              <p className="text-[11px] leading-relaxed text-[#71717a]">
                {teoria.fuentes?.nota_pesos}
              </p>
            </Seccion>

            {/* Ponderación */}
            <Seccion
              icono={Layers}
              eyebrow="PASO 1 DEL PROCEDIMIENTO · TABLA 4.1"
              titulo="Ponderación por apareamiento"
            >
              <GlassCard className="p-6">
                <p className="max-w-3xl text-sm leading-relaxed text-[#a1a1aa]">
                  La tesis no fija una constante: cada líder reparte diez puntos en cada
                  pareja de atributos. Los subtotales sobre 30 se convierten en los pesos
                  de la relevancia. Mueve los controles para ver cómo cambia la ponderación.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <div className="space-y-4">
                    {[
                      { clave: 'pl', a: 'Poder', b: 'Legitimidad' },
                      { clave: 'pu', a: 'Poder', b: 'Urgencia' },
                      { clave: 'lu', a: 'Legitimidad', b: 'Urgencia' },
                    ].map(({ clave, a, b }) => (
                      <div key={clave}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#d4d4d8]">
                            {a} <span className="text-[#71717a]">vs</span> {b}
                          </span>
                          <span className="font-mono text-[#f97316]">
                            {parejas[clave]} – {10 - parejas[clave]}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={parejas[clave]}
                          onChange={(e) =>
                            setParejas((prev) => ({ ...prev, [clave]: Number(e.target.value) }))
                          }
                          className="mt-1 w-full accent-[#ef4444]"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-[#3f3f46] bg-black/30 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">
                      Pesos resultantes
                    </p>
                    <div className="mt-3 space-y-2">
                      {['poder', 'legitimidad', 'urgencia'].map((k) => (
                        <div key={k}>
                          <div className="flex items-center justify-between text-xs">
                            <span className="capitalize text-[#d4d4d8]">{k}</span>
                            <span className="font-mono text-[#f97316]">
                              {ponderacion.subtotales[k]}/30 ·{' '}
                              {(ponderacion.pesos[k] * 100).toFixed(2)}%
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#27272a]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#ef4444] to-[#f97316]"
                              style={{ width: `${ponderacion.pesos[k] * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-[11px] leading-relaxed text-[#71717a]">
                      Los pesos publicados en las Tablas 4.4 y 4.5 (43,33 / 33,33 / 23,33 %)
                      corresponden a 13, 10 y 7 puntos. Cada valoración de un actor puede
                      guardar su propia ponderación y queda registrada con ella.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </Seccion>

            {/* Cinco etapas */}
            <Seccion
              icono={BookOpen}
              eyebrow="METODOLOGÍA PROCESAL"
              titulo="Las cinco etapas, auditables una por una"
            >
              <div className="space-y-3">
                {(teoria.procedimiento?.etapas || []).map((etapa) => (
                  <GlassCard key={etapa.clave} className="p-5">
                    <div className="flex flex-wrap items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ef4444] to-[#f97316] font-mono text-sm font-black text-[#1a0505]">
                        {etapa.numero}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white">{etapa.nombre}</p>
                        <p className="mt-1 text-xs leading-relaxed text-[#a1a1aa]">
                          {etapa.descripcion}
                        </p>
                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <p className="rounded-lg bg-white/5 px-3 py-2 text-[11px] text-[#d4d4d8]">
                            <span className="block font-bold text-[#38bdf8]">Entrada</span>
                            {etapa.entrada}
                          </p>
                          <p className="rounded-lg bg-white/5 px-3 py-2 text-[11px] text-[#d4d4d8]">
                            <span className="block font-bold text-[#22c55e]">Salida</span>
                            {etapa.salida}
                          </p>
                          <p className="rounded-lg bg-white/5 px-3 py-2 text-[11px] text-[#d4d4d8]">
                            <span className="block font-bold text-[#f97316]">En GOVStake</span>
                            {etapa.evidencia_en_govstake}
                          </p>
                        </div>
                        <p className="mt-2 font-mono text-[10px] text-[#52525b]">{etapa.cita}</p>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </Seccion>

            {/* Expresiones */}
            <Seccion
              icono={GraduationCap}
              eyebrow="EXPRESIONES DEL LIDERAZGO · FIGURA 1.1"
              titulo="De la autocracia a la delegación"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {(teoria.expresiones || []).map((e) => (
                  <GlassCard
                    key={e.clave}
                    className="p-5 border-t-2"
                    style={{ borderTopColor: EXPR_COLORS[e.clave] }}
                  >
                    <div className="flex items-center justify-between">
                      <Chip color={EXPR_COLORS[e.clave]}>Nivel {e.grado_influencia}</Chip>
                    </div>
                    <p className="mt-3 text-sm font-bold text-white">{e.nombre}</p>
                    <p className="mt-2 text-xs leading-relaxed text-[#a1a1aa]">{e.descripcion}</p>
                    <ul className="mt-3 space-y-1">
                      {e.practicas.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-[11px] text-[#d4d4d8]">
                          <span
                            className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                            style={{ background: EXPR_COLORS[e.clave] }}
                          />
                          {p}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 rounded-lg bg-black/30 p-2 text-[11px] leading-relaxed text-[#a1a1aa]">
                      <span className="font-bold" style={{ color: EXPR_COLORS[e.clave] }}>
                        Cuándo: {''}
                      </span>
                      {e.cuando_recomendar}
                    </p>
                  </GlassCard>
                ))}
              </div>
              <GlassCard className="p-5">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">
                  <Info className="h-4 w-4 text-[#f97316]" /> Correlaciones de la Hipótesis F
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  {(teoria.correlaciones || []).map((c) => (
                    <div
                      key={`${c.factor}-${c.expresion}`}
                      className="flex items-start justify-between gap-3 rounded-lg border border-[#3f3f46] bg-white/5 p-3"
                    >
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-[#71717a]">
                          {c.factor.replace(/_/g, ' ')} → {c.expresion.replace(/_/g, ' ')}
                        </p>
                        <p className="mt-1 text-[11px] text-[#d4d4d8]">{c.lectura}</p>
                      </div>
                      <span
                        className={`font-mono text-sm font-bold ${
                          c.rho > 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'
                        }`}
                      >
                        {c.rho > 0 ? '+' : ''}
                        {c.rho.toFixed(3)}
                        {c.significancia}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-[#71717a]">
                  La tesis encuentra asociaciones, no una regla deductiva. Por eso GOVStake
                  recomienda una expresión con su nivel de confianza y permite sobrescribirla.
                </p>
              </GlassCard>
            </Seccion>

            {/* 64 casos */}
            <Seccion
              icono={Layers}
              eyebrow="TABLAS 4.3, 4.4 Y 4.5"
              titulo="Los 64 casos posibles"
            >
              <GlassCard className="overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3f3f46] p-4">
                  <p className="text-xs text-[#a1a1aa]">
                    {casosFiltrados.length} de {casos.length} casos · ordenados por
                    relevancia ascendente, como en la tabla del doctorado.
                  </p>
                  <select
                    value={rangoFiltro}
                    onChange={(e) => setRangoFiltro(e.target.value)}
                    className="rounded-lg border border-[#3f3f46] bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-[#ef4444]"
                  >
                    <option value="">Todos los rangos</option>
                    {(teoria.rangos || []).map((r) => (
                      <option key={r.clave} value={r.clave}>
                        {r.etiqueta}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="max-h-[460px] overflow-auto">
                  <table className="min-w-full">
                    <thead className="sticky top-0 bg-[#18181b]">
                      <tr className="border-b border-[#3f3f46]">
                        {['Caso', 'PLU', 'Identificación', 'Estado', 'Relevancia', 'Rango'].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]"
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3f3f46]/60">
                      {casosFiltrados.map((c) => (
                        <tr key={c.caso} className="transition-colors hover:bg-white/5">
                          <td className="px-4 py-2 font-mono text-xs text-[#71717a]">{c.caso}</td>
                          <td className="px-4 py-2 font-mono text-sm font-bold tracking-[0.2em] text-white">
                            {c.plu}
                          </td>
                          <td className="px-4 py-2 text-xs text-[#d4d4d8]">{c.identificacion}</td>
                          <td className="px-4 py-2 text-xs text-[#a1a1aa]">{c.estado}</td>
                          <td className="px-4 py-2 font-mono text-xs text-[#f97316]">
                            {c.relevancia_calculada.toFixed(2)}
                          </td>
                          <td className="px-4 py-2">
                            <Chip color={RANGO_COLORS[c.rango]}>{c.rango_etiqueta}</Chip>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </Seccion>

            {/* Ética */}
            <Seccion
              icono={ShieldCheck}
              eyebrow="LÍMITES Y COMPROMISOS"
              titulo={teoria.etica?.titulo || 'Ética del modelo'}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {(teoria.etica?.principios || []).map((p) => (
                  <GlassCard key={p.clave} className="p-5">
                    <p className="text-sm font-bold text-white">{p.titulo}</p>
                    <p className="mt-2 text-xs leading-relaxed text-[#a1a1aa]">{p.detalle}</p>
                  </GlassCard>
                ))}
              </div>
              <GlassCard className="border-l-4 border-[#f97316] p-4">
                <p className="text-xs leading-relaxed text-[#d4d4d8]">
                  <span className="font-bold text-[#f97316]">Advertencia: </span>
                  {teoria.etica?.advertencia}
                </p>
              </GlassCard>
            </Seccion>

            {/* Fuentes */}
            <GlassCard className="p-6">
              <p className="font-mono text-[10px] tracking-[0.25em] text-[#a1a1aa]">FUENTES</p>
              <p className="mt-3 text-xs leading-relaxed text-[#d4d4d8]">
                {teoria.fuentes?.principal}
              </p>
              <ul className="mt-3 space-y-1">
                {(teoria.fuentes?.complementarias || []).map((f) => (
                  <li key={f} className="text-[11px] leading-relaxed text-[#71717a]">
                    {f}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </>
        )
      )}
    </div>
  )

  if (!publico) return contenido

  return (
    <div className="min-h-screen bg-[#09090b]">
      <header className="flex items-center justify-between border-b border-[#3f3f46] bg-[#18181b]/70 px-5 py-4 backdrop-blur-xl lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ef4444] to-[#f97316] font-mono text-sm font-black text-[#1a0505]">
            G
          </div>
          <div>
            <p className="font-mono text-sm font-bold tracking-widest text-white">
              GOV<span className="text-[#ef4444]">STAKE</span> 360
            </p>
            <p className="font-mono text-[10px] tracking-[0.2em] text-[#a1a1aa]">
              FUNDAMENTOS DEL MODELO
            </p>
          </div>
        </div>
        <Link
          to="/login"
          className="rounded-lg border border-[#3f3f46] px-4 py-2 text-xs font-bold text-[#a1a1aa] hover:border-[#ef4444]/50 hover:text-white"
        >
          Ingresar
        </Link>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10">{contenido}</div>
    </div>
  )
}
