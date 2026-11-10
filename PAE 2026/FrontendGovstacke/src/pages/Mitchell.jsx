import { useEffect, useState } from 'react'
import { RefreshCw, AlertTriangle, UploadCloud, Users, Grid3X3, Info } from 'lucide-react'
import GlassCard from '../components/common/GlassCard'
import { matrizApi, sincronizacionesApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

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
  { key: 'no_relevante', label: 'No relevantes', color: MITCHELL_COLORS.no_relevante, desc: 'Bajo el umbral de atención' },
]

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
            la legitimidad y la urgencia que percibe. GOVStake convierte esas intensidades
            en una clasificación estratégica.
          </p>
        </div>
        <div className="flex gap-2">
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
          <p className="text-xs text-[#a1a1aa]">Un atributo se considera presente cuando su valor es ≥ {resumen?.umbral ?? 60}</p>
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
                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Poder</th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Legitimidad</th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Urgencia</th>
                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Frecuencia</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Clasificación</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">Acción sugerida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3f3f46]/60">
                {items.map((a) => {
                  const v = a.variables || {}
                  const m = a.mitchell || {}
                  return (
                    <tr key={a.id} className="transition-colors hover:bg-white/5">
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-white">{a.nombre}</p>
                        <p className="mt-0.5 text-xs text-[#a1a1aa]">{a.tipo.replace('_', ' ')}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border border-[#3f3f46] px-2 py-1 text-[10px] font-bold uppercase text-[#d4d4d8]">
                          {a.fuente === 'entidad_publica' ? 'Entidad pública' : 'Manual'}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-center font-mono text-sm ${v.poder >= 60 ? 'text-[#f97316]' : 'text-[#a1a1aa]'}`}>{v.poder ?? 0}</td>
                      <td className={`px-4 py-3 text-center font-mono text-sm ${v.legitimidad >= 60 ? 'text-[#f97316]' : 'text-[#a1a1aa]'}`}>{v.legitimidad ?? 0}</td>
                      <td className={`px-4 py-3 text-center font-mono text-sm ${v.urgencia >= 60 ? 'text-[#f97316]' : 'text-[#a1a1aa]'}`}>{v.urgencia ?? 0}</td>
                      <td className="px-4 py-3 text-center font-mono text-sm text-[#a1a1aa]">{v.frecuencia_intentos ?? 0}</td>
                      <td className="px-4 py-3"><MitchellChip tipo={m.tipo_mitchell} /></td>
                      <td className="px-4 py-3 text-sm text-[#d4d4d8]">{m.accion_sugerida}</td>
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

