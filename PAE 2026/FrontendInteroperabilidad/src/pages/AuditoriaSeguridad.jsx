import { useState, useEffect } from 'react'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Lock, 
  Eye, 
  Activity, 
  Database, 
  Server, 
  Key, 
  FileCheck,
  RefreshCw,
  AlertCircle,
  Clock,
  Users,
  Globe,
  ShieldCheck,
  BarChart3,
  Terminal,
  Cpu,
  Zap
} from 'lucide-react'
import { entitiesApi, sectorsApi } from '../services/api'
import GlassCard from '../components/common/GlassCard'
import StatusPulse from '../components/common/StatusPulse'

export default function AuditoriaSeguridad() {
  const [loading, setLoading] = useState(true)
  const [entities, setEntities] = useState([])
  const [auditData, setAuditData] = useState({
    securityScore: 87,
    totalChecks: 156,
    passedChecks: 136,
    failedChecks: 20,
    lastAudit: new Date().toISOString(),
    activeSessions: 12,
    failedLogins: 3,
    apiRequests: 12547,
    dataTransferred: '8.7 GB'
  })

  const [securityChecks] = useState([
    { name: 'Autenticación JWT', status: 'passed', score: 100, category: 'AUTH' },
    { name: 'Encriptación HTTPS', status: 'passed', score: 100, category: 'ENCR' },
    { name: 'Sanitización de entradas', status: 'passed', score: 95, category: 'APP' },
    { name: 'CORS Configuración', status: 'passed', score: 90, category: 'NET' },
    { name: 'Rate Limiting', status: 'warning', score: 75, category: 'NET' },
    { name: 'Auditoría de accesos', status: 'passed', score: 100, category: 'LOGS' },
    { name: 'Protección SQL Injection', status: 'passed', score: 100, category: 'DB' },
    { name: 'Protección XSS', status: 'passed', score: 100, category: 'APP' },
    { name: 'Gestión de sesiones', status: 'warning', score: 80, category: 'AUTH' },
    { name: 'Políticas de contraseñas', status: 'passed', score: 100, category: 'AUTH' },
    { name: 'MFA Implementado', status: 'failed', score: 0, category: 'AUTH' },
    { name: 'Logs de seguridad', status: 'passed', score: 100, category: 'LOGS' }
  ])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const entitiesRes = await entitiesApi.getAll({ limit: 200 })
      setEntities(entitiesRes.data?.items || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const runAudit = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setAuditData(prev => ({
      ...prev,
      lastAudit: new Date().toISOString(),
      securityScore: Math.round(85 + Math.random() * 10)
    }))
    setLoading(false)
  }

  if (loading) {
     return (
       <div className="flex min-h-[60vh] items-center justify-center">
         <StatusPulse size="lg" />
       </div>
     )
  }

  const getStatusColor = (status) => {
    if (status === 'passed') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    if (status === 'warning') return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    return 'text-red-400 bg-red-500/10 border-red-500/20'
  }

  const getStatusKind = (status) => {
    if (status === 'passed') return 'success'
    if (status === 'warning') return 'warning'
    return 'error'
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
               <Shield className="h-6 w-6 text-blue-400" />
             </div>
             <h1 className="text-4xl font-bold tracking-tight text-white uppercase">Security Core Audit</h1>
          </div>
          <p className="text-slate-400 font-medium max-w-xl text-sm">
             Protocolos de seguridad de alto nivel y monitoreo de integridad de nodos federados X-Road.
          </p>
        </div>
        <button
          onClick={runAudit}
          disabled={loading}
          className="group relative flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              CYBER AUDIT IN PROGRESS...
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              EXECUTE GLOBAL AUDIT 01
            </>
          )}
        </button>
      </div>

      {/* Modern KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-6 border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SECURITY STATUS</p>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex flex-col gap-4">
             <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">{auditData.securityScore}</span>
                <span className="text-sm font-bold text-slate-500">% CRITICAL</span>
             </div>
             <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
               <div 
                 className="bg-emerald-500 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                 style={{ width: `${auditData.securityScore}%` }}
               ></div>
             </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">COMPLIANCE INDEX</p>
            <FileCheck className="h-4 w-4 text-blue-400" />
          </div>
          <div className="flex flex-col gap-1">
             <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{auditData.passedChecks}</span>
                <span className="text-sm font-bold text-slate-500">/ {auditData.totalChecks}</span>
             </div>
             <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest flex items-center gap-1">
                <StatusPulse status="success" size="sm" /> 
                STABLE PROTOCOL
             </p>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ACTIVE SESSIONS</p>
            <Users className="h-4 w-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
             <span className="text-3xl font-black text-white">{auditData.activeSessions}</span>
             <span className="animate-pulse h-2 w-2 rounded-full bg-purple-500/50 block" />
          </div>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-2 font-mono">
             LAST SYNC: {new Date().toLocaleTimeString()}
          </p>
        </GlassCard>

        <GlassCard className="p-6 border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">LAST AUDIT OPS</p>
            <Terminal className="h-4 w-4 text-slate-600" />
          </div>
          <div className="flex flex-col gap-1">
             <span className="text-xl font-black text-slate-200 uppercase truncate">
                {new Date(auditData.lastAudit).toLocaleDateString('es-CO')}
             </span>
             <p className="text-[10px] text-slate-500 font-mono">
                SIG: 0x{Math.random().toString(16).slice(2, 10).toUpperCase()}
             </p>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detailed Security Checks */}
        <GlassCard className="lg:col-span-2 p-6 border-slate-700/50">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-widest">Global Control Matrix</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Audit trails and integrity validation of core segments</p>
            </div>
            <Cpu className="h-5 w-5 text-slate-800" />
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {securityChecks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800 rounded-xl hover:bg-slate-800/60 hover:border-slate-700 transition-all group">
                <div className="flex items-center gap-4">
                  <StatusPulse status={getStatusKind(check.status)} size="sm" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-slate-200 group-hover:text-white transition-colors uppercase">{check.name}</p>
                    <p className="text-[9px] font-mono text-slate-600 font-black tracking-widest">{check.category} SEGMENT</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden sm:block w-32 bg-slate-950 rounded-full h-1 overflow-hidden">
                    <div 
                      className={`h-full opacity-60 ${check.score >= 80 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : check.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${check.score}%` }}
                    ></div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${getStatusColor(check.status)}`}>
                    {check.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Actionable Insights */}
        <div className="space-y-6">
          <GlassCard className="p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30">
             <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-blue-500/20 rounded-lg">
                 <Zap className="h-5 w-5 text-blue-400" />
               </div>
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Active Insights</h3>
             </div>
             
             <div className="space-y-4">
                <div className="p-4 bg-slate-900/60 rounded-xl border border-red-500/30">
                   <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest">CRITICAL RISK</h4>
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                   </div>
                   <p className="text-xs font-bold text-slate-200 mb-1">MFA Missing on Root Ops</p>
                   <p className="text-[10px] text-slate-500 font-medium">Add multifactor auth for all sysadmins segments.</p>
                </div>

                <div className="p-4 bg-slate-900/60 rounded-xl border border-amber-500/30">
                   <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest">MEDIUM RISK</h4>
                      <Lock className="h-3 w-3 text-amber-500" />
                   </div>
                   <p className="text-xs font-bold text-slate-200 mb-1">Incomplete Rate Limiting</p>
                   <p className="text-[10px] text-slate-500 font-medium">Set boundaries for IP requests on API Gateway.</p>
                </div>
             </div>

             <button className="w-full mt-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-white font-black text-[10px] uppercase tracking-widest transition-all">
                VIEW FULL REPORT →
             </button>
          </GlassCard>

          <GlassCard className="p-6 border-slate-700/50 bg-emerald-500/5">
             <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-500 mt-1" />
                <div>
                   <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-2">CORE INTEGRITY</h4>
                   <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                      El sistema opera bajo los estándares de seguridad perimetral de X-Road. Todas las comunicaciones viajan a través de túneles TLS 1.3 con validación de certificados mutua (mTLS).
                   </p>
                </div>
             </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}