import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  LayoutDashboard, 
  Building2, 
  Network, 
  Map, 
  ClipboardCheck, 
  FileText,
  Brain,
  Menu,
  X,
  LogOut,
  User,
  Shield,
  ChevronRight,
  Globe,
  Activity,
  Zap
} from 'lucide-react'
import clsx from 'clsx'
import LanguageSelector from '../LanguageSelector'
import ThemeToggle from '../ThemeToggle'
import { useAuth } from '../../contexts/AuthContext'

const navigation = [
  { nameKey: 'navigation.dashboard', href: '/', icon: LayoutDashboard },
  { nameKey: 'navigation.entities', href: '/entidades', icon: Building2 },
  { nameKey: 'navigation.matrix', href: '/matriz', icon: Network },
  { nameKey: 'navigation.map', href: '/mapa', icon: Map },
  { nameKey: 'navigation.maturity', href: '/evaluacion', icon: ClipboardCheck },
  { nameKey: 'navigation.reports', href: '/reportes', icon: FileText },
  { nameKey: 'navigation.aiAnalysis', href: '/analisis-ia', icon: Brain },
]

const pageTitles = {
  '/': 'Dashboard',
  '/entidades': 'Entidades',
  '/matriz': 'Matriz de Servicios',
  '/mapa': 'Mapa Interactivo',
  '/evaluacion': 'Evaluación de Madurez',
  '/reportes': 'Reportes',
  '/analisis-ia': 'Análisis IA'
}

export default function Layout({ children }) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { t } = useTranslation()
  const { user, logout, isAdmin } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => logout()

  return (
    <div className="min-h-screen bg-[#050a18] text-slate-100 relative overflow-x-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-600/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-purple-600/5 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Grid overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Mobile sidebar */}
      <div className={clsx(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-80 flex-col bg-[#0a0f1e]/95 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl shadow-blue-900/20">
          <SidebarHeader />
          <nav className="flex-1 overflow-y-auto py-4">
            <NavItems location={location} navigation={navigation} t={t} onNavigate={() => setSidebarOpen(false)} />
          </nav>
          <SidebarUser user={user} isAdmin={isAdmin} handleLogout={handleLogout} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col z-30">
        <div className="flex flex-col h-screen bg-[#0a0f1e]/80 backdrop-blur-xl border-r border-slate-700/30">
          <SidebarHeader />
          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <NavItems location={location} navigation={navigation} t={t} />
          </nav>
          <SidebarUser user={user} isAdmin={isAdmin} handleLogout={handleLogout} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col min-h-screen relative z-10">
        {/* Top bar */}
        <header className={clsx(
          'sticky top-0 z-40 h-16 flex items-center justify-between gap-x-4 px-4 lg:px-8 transition-all duration-300',
          scrolled 
            ? 'bg-[#0a0f1e]/90 backdrop-blur-xl border-b border-slate-700/40 shadow-lg shadow-blue-900/5' 
            : 'bg-transparent'
        )}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-slate-800/80 transition-colors text-slate-300"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="hidden sm:flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Activity className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white tracking-tight">
                  {pageTitles[location.pathname] || 'Dashboard'}
                </h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Plataforma Nacional de Interoperabilidad</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-emerald-400">Sistema Operativo</span>
            </div>
            <div className="lg:hidden w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="border-t border-slate-700/30 bg-[#0a0f1e]/50 backdrop-blur-sm px-4 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-blue-400" />
              <span>X-Road Colombia 2026 - Plataforma de Interoperabilidad Gubernamental</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline">MinTIC Colombia</span>
              <span className="text-slate-600">|</span>
              <span>{new Date().toLocaleDateString('es-CO')}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

function SidebarHeader() {
  return (
    <div className="flex h-20 items-center px-6 border-b border-slate-700/30">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 animate-gradient-x">
          <Globe className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">X-Road</h1>
          <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest">Colombia</span>
        </div>
      </div>
    </div>
  )
}

function NavItems({ location, navigation, t, onNavigate }) {
  return (
    <div className="space-y-1">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href
        return (
          <Link
            key={item.nameKey}
            to={item.href}
            onClick={onNavigate}
            className={clsx(
              'group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden',
              isActive
                ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/10 text-white border border-blue-500/20 shadow-lg shadow-blue-500/10'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white hover:border hover:border-slate-700/50'
            )}
          >
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full" />
            )}
            <item.icon className={clsx(
              'h-5 w-5 transition-all duration-300',
              isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400 group-hover:scale-110'
            )} />
            <span className="relative z-10">{t(item.nameKey)}</span>
            {isActive && <ChevronRight className="ml-auto h-4 w-4 text-blue-400" />}
          </Link>
        )
      })}
    </div>
  )
}

function SidebarUser({ user, isAdmin, handleLogout }) {
  return (
    <div className="border-t border-slate-700/30 p-4">
      <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-slate-800/30 border border-slate-700/20">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
          {isAdmin() ? (
            <Shield className="w-5 h-5 text-white" />
          ) : (
            <User className="w-5 h-5 text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{user?.name || 'Usuario'}</p>
          <p className="text-xs text-slate-500">{isAdmin() ? 'Administrador' : 'Usuario'}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LanguageSelector />
        <button
          onClick={handleLogout}
          className="flex-1 flex items-center justify-center gap-2 p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20"
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-xs font-medium">Salir</span>
        </button>
      </div>
    </div>
  )
}
