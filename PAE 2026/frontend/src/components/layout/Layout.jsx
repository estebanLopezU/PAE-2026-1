import { useState } from 'react'
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
  Globe
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
  '/evaluacion': 'Evaluacion de Madurez',
  '/reportes': 'Reportes',
  '/analisis-ia': 'Analisis IA'
}

export default function Layout({ children }) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { t } = useTranslation()
  const { user, logout, isAdmin } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={clsx(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-80 flex-col bg-white shadow-2xl">
          {/* Mobile header */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">X-Road</h1>
                <span className="text-xs font-medium text-blue-600">Colombia</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.nameKey}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={clsx(
                    'mx-3 mb-1 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {t(item.nameKey)}
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>
              )
            })}
          </nav>
          
          {/* Mobile user section */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500">{isAdmin() ? 'Administrador' : 'Usuario'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesion
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col h-screen bg-white border-r border-gray-200 shadow-sm">
          {/* Header */}
          <div className="flex h-20 items-center px-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">X-Road</h1>
                <span className="text-xs font-medium text-blue-600">Colombia</span>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.nameKey}
                    to={item.href}
                    className={clsx(
                      'group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <item.icon className={clsx(
                      'h-5 w-5 transition-transform',
                      !isActive && 'group-hover:scale-110'
                    )} />
                    {t(item.nameKey)}
                    {isActive && (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>
          
          {/* User section */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                {isAdmin() ? (
                  <Shield className="w-5 h-5 text-white" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500">{isAdmin() ? 'Administrador' : 'Usuario'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSelector />
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Cerrar sesion"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-40 h-16 flex items-center justify-between gap-x-4 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-4 lg:px-8 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* Page title */}
            <div className="hidden sm:block">
              <h2 className="text-lg font-semibold text-gray-900">
                {pageTitles[location.pathname] || 'Dashboard'}
              </h2>
            </div>
          </div>
          
          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {/* Mobile user avatar */}
            <div className="lg:hidden w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
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
        <footer className="border-t border-gray-200 bg-white px-4 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
            <p>X-Road Colombia 2026 - Plataforma de Interoperabilidad</p>
            <p>Ministerio de Tecnologias de la Informacion y las Comunicaciones</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
