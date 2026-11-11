import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, AlertTriangle, UploadCloud, Grid3X3, Info, BookOpen } from 'lucide-react'
import GlassCard from '../components/common/GlassCard'
import { matrizApi, sincronizacionesApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import {
  EXPR_COLORS,
  EXPR_LABELS,
  RANGO_COLORS,
  RANGO_LABELS,
} from '../constants/modelo'

const MITCHELL_COLORS = {
  definitivo: '#ef4444',
  expectante_dominante: '#f59e0b',
  expectante_peligroso: '#f97316',
  expectante_dependiente: '#eab308',
  latente_inactivo: '#38bdf8',
  latente_discrecional: '#0ea5e9',
  latente_demandante: '#3b82f6',
  no_relevante: '#94a3b8',
}

const MITCHELL_LABELS = {
  definitivo: 'Definitivo',
  expectante_dominante: 'Expectante dominante',
  expectante_peligroso: 'Expectante peligroso',
  expectante_dependiente: 'Expectante dependiente',
  latente_inactivo: 'Latente inactivo',
  latente_discrecional: 'Latente discrecional',
  latente_demandante: 'Latente demandante',
  no_relevante: 'No relevante',
}

const GRUPO_CARDS = [
  { key: 'definitivo', label: 'Definitivos', color: MITCHELL_COLORS.definitivo, desc: 'Poder + legitimidad + urgencia' },
  { key: 'expectante', label: 'Expectantes', color: MITCHELL_COLORS.expectante_dominante, desc: 'Dos atributos presentes' },
  { key: 'latente', label: 'Latentes', color: MITCHELL_COLORS.latente_inactivo, desc: 'Un solo atributo' },
  { key: 'no_relevante', label: 'No relevantes', color: MITCHELL_COLORS.no_relevante, desc: 'Ningún atributo presente o sin valoración' },
]

const NIVEL_COLORS = ['#52525b', '#38bdf8', '#eab308', '#ef4444']

function MitchellChip({ tipo }) {
  const color = MITCHELL_COLORS[tipo] || MITCHELL_COLORS.no_relevante
  const label = MITCHELL_LABELS[tipo] || tipo
  return (
    <span
      className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide"
      style={{ color, background: `${color}1f`, border: `1px solid ${color}55` }}
    >
      {label}
    </span>
  )
}

function NivelBadge({ letra, nivel }) {
  const color = NIVEL_COLORS[Number(nivel) || 0]
  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-md font-mono text-[11px] font-bold"
      style={{ color, background: `${color}1f`, border: `1px solid ${color}55` }}
      title={`${letra} nivel ${nivel} de 3`}
    >
      {letra}
      {nivel}
    </span>
  )
}

export default function Mitchell() {
  const { isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [resumen, setResumen] = useState(null)
  const [syncMessage, setSyncMessage] = useState('')
  const [syncing, setSyncing] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [m, r] = await Promise.all([matrizApi.mitchell(), matrizApi.mitchellResumen()])
      setItems(m.data?.items || [])
      setResumen(r.data)
    } catch {
      setError('No se pudo cargar la clasificación Mitchell.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSync = async () => {
    setSyncing(true)
    setSyncMessage('')
    try {
      const res = await sincronizacionesApi.entidadesPublicas()
      const d = res.data
      setSyncMessage(
        `${d.mensaje}: ${d.creados} creadas, ${d.actualizados} actualizadas, ${d.omitidos} omitidas.`
      )
      await load()
    } catch (err) {
      setSyncMessage(
        err?.response?.data?.detail || 'No fue posible sincronizar entidades públicas. Revisa la configuración del backend.'
      )
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-[#ef4444]" />
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#ef4444]">ANÁLISIS DE STAKEHOLDERS</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Clasificación Mitchell</h1>
          <p className="mt-2 max-w-3xl text-sm text-[#a1a1aa]">
            Cada entidad es evaluada por el gestor o líder del proyecto según el poder,
            la legitimidad y la urgencia que percibe, en la escala ordinal de cuatro
            niveles del doctorado. GOVStake calcula el código PLU, la relevancia
            ponderada, el rango y la expresión de liderazgo sugerida.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/modelo"
            className="flex items-center gap-2 rounded-lg border border-[#3f3f46] px-4 py-2 text-xs font-bold text-[#a1a1aa] transition-all hover:border-[#ef4444]/50 hover:text-white"
          >
            <BookOpen className="h-4 w-4" /> VER FUNDAMENTOS
          </Link>
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-lg border border-[#3f3f46] px-4 py-2 text-xs font-bold text-[#a1a1aa] transition-all hover:border-[#ef4444]/50 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" /> ACTUALIZAR
          </button>
          {isAdmin() && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#ef4444] to-[#f97316] px-4 py-2 text-xs font-black tracking-wider text-[#18181b] disabled:opacity-60"
            >
              <UploadCloud className="h-4 w-4" /> {syncing ? 'SINCRONIZANDO…' : 'SINCRONIZAR ENTIDADES'}
            </button>
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

      {syncMessage && (
        <GlassCard className="p-4">
          <p className="text-sm text-[#d4d4d8]">{syncMessage}</p>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {GRUPO_CARDS.map((card) => (
          <GlassCard key={card.key} className="p-5 border-l-4" style={{ borderLeftColor: card.color }}>
            <p className="text-xs font-medium uppercase tracking-wider text-[#a1a1aa]">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{resumen?.grupos?.[card.key] ?? 0}</p>
            <p className="mt-2 text-xs text-[#a1a1aa]">{card.desc}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">
            <Info className="h-4 w-4 text-[#f97316]" /> Criterio de clasificación
          </p>
          <p className="text-xs text-[#a1a1aa]">
            Un atributo está presente cuando su nivel es al menos <span className="font-mono text-[#f97316]">baja</span> (nivel {resumen?.umbral_nivel ?? 1} de 3)
          </p>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[#3f3f46] bg-white/5 p-3">
            <p className="text-sm font-bold text-white">Poder</p>
            <p className="mt-1 text-xs text-[#a1a1aa]">Capacidad de influir, imponer decisiones o afectar los recursos.</p>
          </div>
          <div className="rounded-xl border border-[#3f3f46] bg-white/5 p-3">
            <p className="text-sm font-bold text-white">Legitimidad</p>
            <p className="mt-1 text-xs text-[#a1a1aa]">Reconocimiento jurídico, institucional o social de su petición.</p>
          </div>
          <div className="rounded-xl border border-[#3f3f46] bg-white/5 p-3">
            <p className="text-sm font-bold text-white">Urgencia</p>
            <p className="mt-1 text-xs text-[#a1a1aa]">Sensibilidad al tiempo y criticidad de la exigencia.</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-[#71717a]">
          <span>
            Relevancia = <span className="font-mono text-[#d4d4d8]">P·{(resumen?.pesos?.poder * 100)?.toFixed(1) ?? '43.3'}% + L·{(resumen?.pesos?.legitimidad * 100)?.toFixed(1) ?? '33.3'}% + U·{(resumen?.pesos?.urgencia * 100)?.toFixed(1) ?? '23.3'}%</span>
          </span>
          <span>
            Actores sin percepción del líder: <span className="font-mono text-[#f97316]">{resumen?.sin_percepcion_del_lider ?? 0}</span>
          </span>
          <span className="font-mono">
            {Object.entries(resumen?.por_rango || {})
              .filter(([, v]) => v > 0)
              .map(([k, v]) => `${RANGO_LABELS[k] || k}: ${v}`)
              .join(' · ')}
          </span>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <div className="border-b border-[#3f3f46] p-5">
          <p className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#a1a1aa]">
            <Grid3X3 className="h-4 w-4 text-[#f97316]" /> Matriz Mitchell por actor
          </p>
        </div>
        {items.length === 0 ? (
          <p className="py-14 text-center text-sm text-[#a1a1aa]">No hay actores registrados.</p>
        ) : (
          <div className="max-h-[560px] overflow-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-[#18181b]">
                <tr className="border-b border-[#3f3f46]">
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Actor</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Origen</th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">PLU</th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Atributos</th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Relevancia</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Clasificación</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Expresión sugerida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3f3f46]/60">
                {items.map((a) => {
                  const m = a.mitchell || {}
                  const niveles = m.niveles || {}
                  const expresion = m.expresion_sugerida || {}
                  return (
                    <tr key={a.id} className="transition-colors hover:bg-white/5">
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-white">{a.nombre}</p>
                        <p className="mt-0.5 text-xs text-[#a1a1aa]">{a.tipo.replace(/_/g, ' ')}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border border-[#3f3f46] px-2 py-1 text-[10px] font-bold uppercase text-[#d4d4d8]">
                          {a.fuente === 'entidad_publica' ? 'Entidad pública' : 'Manual'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-sm font-bold tracking-[0.15em] text-white">
                        {m.sin_percepcion ? '—' : m.plu}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <NivelBadge letra="P" nivel={niveles.poder ?? 0} />
                          <NivelBadge letra="L" nivel={niveles.legitimidad ?? 0} />
                          <NivelBadge letra="U" nivel={niveles.urgencia ?? 0} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {m.sin_percepcion ? (
                          <span className="text-xs text-[#71717a]">Sin valoración</span>
                        ) : (
                          <div>
                            <p className="font-mono text-sm font-bold text-[#f97316]">
                              {m.relevancia_calculada?.toFixed(2)}
                            </p>
                            <span
                              className="mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider"
                              style={{
                                color: RANGO_COLORS[m.rango] || '#a1a1aa',
                                background: `${RANGO_COLORS[m.rango] || '#a1a1aa'}1f`,
                                border: `1px solid ${RANGO_COLORS[m.rango] || '#a1a1aa'}55`,
                              }}
                            >
                              {m.rango_etiqueta || RANGO_LABELS[m.rango] || '—'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div title={m.accion_sugerida}>
                          <MitchellChip tipo={m.tipo_mitchell} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {expresion.clave ? (
                          <div>
                            <p
                              className="text-xs font-bold"
                              style={{ color: EXPR_COLORS[expresion.clave] || '#d4d4d8' }}
                            >
                              {EXPR_LABELS[expresion.clave] || expresion.nombre}
                            </p>
                            <p className="mt-0.5 font-mono text-[10px] text-[#71717a]">
                              confianza {expresion.confianza}%
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-[#71717a]">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
