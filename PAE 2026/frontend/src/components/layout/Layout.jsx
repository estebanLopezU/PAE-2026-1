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
  Menu,
  X
} from 'lucide-react'
import clsx from 'clsx'
import LanguageSelector from '../LanguageSelector'
import ThemeToggle from '../ThemeToggle'

const navigation = [
  { nameKey: 'navigation.dashboard', href: '/', icon: LayoutDashboard },
  { nameKey: 'navigation.entities', href: '/entidades', icon: Building2 },
  { nameKey: 'navigation.matrix', href: '/matriz', icon: Network },
  { nameKey: 'navigation.map', href: '/mapa', icon: Map },
  { nameKey: 'navigation.maturity', href: '/evaluacion', icon: ClipboardCheck },
  { nameKey: 'navigation.reports', href: '/reportes', icon: FileText },
]

export default function Layout({ children }) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={clsx(
        'fixed inset-0 z-40 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white">
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
        <div className="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-white">
          {/* Header with logo and title */}
          <div className="flex h-20 items-center px-6 border-b border-gray-100">
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
            {/* Theme and Language controls */}
            <div className="ml-auto flex items-center space-x-2">
              <ThemeToggle />
              <LanguageSelector />
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
      <div className="lg:pl-72">
        {/* Mobile header */}
        <div className="sticky top-0 z-10 flex h-16 items-center justify-between gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">
          <div className="flex items-center gap-x-4">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6 text-gray-500" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">X-Road Colombia</h1>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <LanguageSelector />
          </div>
        </div>

        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}