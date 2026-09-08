import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Grid3X3,
  Handshake,
  Bell,
  MessageSquareHeart,
  ScrollText,
  FileBarChart,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/actores', label: 'Actores', icon: Users },
  { to: '/matriz', label: 'Matriz y Mapa', icon: Grid3X3 },
  { to: '/compromisos', label: 'Compromisos', icon: Handshake },
  { to: '/relacionamientos', label: 'Relacionamiento', icon: MessageSquareHeart },
  { to: '/alertas', label: 'Alertas', icon: Bell },
  { to: '/protocolo', label: 'Protocolo', icon: ScrollText },
  { to: '/reportes', label: 'Reportes', icon: FileBarChart },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Logo / marca */}
      <div className="flex items-center gap-3 border-b border-[#3a1616] px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff3b3b] to-[#ff8a3d] font-mono text-lg font-black text-[#1a0505] shadow-lg shadow-red-900/40">
          G
        </div>
        <div>
          <p className="font-mono text-sm font-bold tracking-widest text-white">
            GOV<span className="text-[#ff3b3b]">STAKE</span>
          </p>
          <p className="font-mono text-[10px] tracking-[0.2em] text-[#a08080]">360 · GESTIÓN</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#ff3b3b]/20 to-transparent text-white border border-[#ff3b3b]/40 shadow-[0_0_18px_rgba(255,59,59,0.15)]'
                  : 'text-[#a08080] hover:bg-white/5 hover:text-white border border-transparent'
              }`
            }
          >
            <Icon className="h-4.5 w-4.5 h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Pie: usuario + salir + volver al portal */}
      <div className="space-y-2 border-t border-[#3a1616] px-3 py-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3a1616] font-mono text-sm font-bold text-[#ff8a3d]">
            {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.name || 'Usuario'}</p>
            <p className="truncate text-[11px] uppercase tracking-wider text-[#a08080]">{user?.role || 'viewer'}</p>
          </div>
        </div>
        <a
          href="http://localhost:3000"
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-[#a08080] transition-all hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          Volver al portal
        </a>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-[#a08080] transition-all hover:bg-[#ff3b3b]/10 hover:text-[#ff3b3b]"
        >
          <LogOut className="h-4 w-4" />
          Salir
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#150505]">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-[#3a1616] bg-[#1a0a0a]/80 backdrop-blur-xl lg:block">
        {sidebar}
      </aside>

      {/* Sidebar móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-[#3a1616] bg-[#1a0a0a]">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 text-[#a08080] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Contenido */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-4 border-b border-[#3a1616] bg-[#1a0a0a]/60 px-5 py-4 backdrop-blur-xl lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="text-[#a08080] hover:text-white">
            <Menu className="h-6 w-6" />
          </button>
          <p className="font-mono text-sm font-bold tracking-widest text-white">
            GOV<span className="text-[#ff3b3b]">STAKE</span> 360
          </p>
        </header>
        <main className="flex-1 overflow-x-hidden p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}