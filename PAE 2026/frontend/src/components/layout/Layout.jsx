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
  Shield
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

export default function Layout({ children }) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { t } = useTranslation()
  const { user, logout, isAdmin } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={clsx(
        'fixed inset-0 z-40 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col h-screen bg-white">
          {/* Mobile header with logo and title */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {/* Logo */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              {/* Title */}
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">X-Road</h1>
                <span className="text-sm font-medium text-primary-600">Colombia</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.nameKey}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={clsx(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className={clsx(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                  )} />
                  {t(item.nameKey)}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col h-screen border-r border-gray-200 bg-white">
          {/* Header with logo and title */}
          <div className="flex h-20 items-center px-6 pt-2 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {/* Logo */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              {/* Title */}
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">X-Road</h1>
                <span className="text-sm font-medium text-primary-600">Colombia</span>
              </div>
            </div>
            {/* Theme, Language controls and User */}
            <div className="ml-auto flex items-center space-x-3">
              <ThemeToggle />
              <LanguageSelector />
              {user && (
                <div className="flex items-center space-x-2 pl-3 border-l border-gray-200">
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-primary-50 rounded-lg">
                    {isAdmin() ? (
                      <Shield className="h-4 w-4 text-primary-600" />
                    ) : (
                      <User className="h-4 w-4 text-primary-600" />
                    )}
                    <span className="text-sm font-medium text-primary-700">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={t('common.logout') || 'Cerrar sesión'}
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.nameKey}
                  to={item.href}
                  className={clsx(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className={clsx(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                  )} />
                  {t(item.nameKey)}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center justify-between gap-x-4 bg-white px-4 shadow-sm lg:hidden border-b border-gray-200">
          <div className="flex items-center gap-x-4 min-w-0">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <div className="flex items-center min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="ml-2 text-lg font-bold text-gray-900 truncate">X-Road Colombia</h1>
            </div>
          </div>
          <div className="flex items-center gap-x-3 flex-shrink-0">
            <ThemeToggle />
            <LanguageSelector />
            {user && (
              <>
                <div className="hidden sm:flex items-center gap-x-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                  {isAdmin() ? (
                    <Shield className="h-4 w-4 text-primary-600" />
                  ) : (
                    <User className="h-4 w-4 text-primary-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[80px]">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t('common.logout') || 'Cerrar sesión'}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </header>

        {/* Desktop header bar */}
        <header className="hidden lg:flex h-16 items-center px-8 bg-white border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">
            {location.pathname === '/' && 'Dashboard'}
            {location.pathname === '/entidades' && 'Entidades'}
            {location.pathname === '/matriz' && 'Matriz de Servicios'}
            {location.pathname === '/mapa' && 'Mapa Interactivo'}
            {location.pathname === '/evaluacion' && 'Evaluación de Madurez'}
            {location.pathname === '/reportes' && 'Reportes'}
            {location.pathname === '/analisis-ia' && 'Análisis IA'}
          </h2>
        </header>

        <main className="flex-1 py-6 lg:py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}