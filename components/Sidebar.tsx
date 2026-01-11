'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  Shield,
  Activity,
  Link as LinkIcon,
  FileText,
  CreditCard,
  Users,
  Receipt,
  Wallet
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Produtos', href: '/products', icon: Package },
  { name: 'Pedidos', href: '/orders', icon: ShoppingCart },
  { name: 'Integracoes', href: '/integrations', icon: LinkIcon },
  { name: 'Logs de Sync', href: '/sync-logs', icon: FileText },
  { name: 'Jobs', href: '/jobs', icon: Activity },
  { name: 'Privacidade', href: '/privacy', icon: Shield },
]

const billingNavigation = [
  { name: 'Planos', href: '/billing/plans', icon: Wallet },
  { name: 'Assinaturas', href: '/billing/subscriptions', icon: CreditCard },
  { name: 'Faturas', href: '/billing/invoices', icon: Receipt },
]

const adminNavigation = [
  { name: 'Admin', href: '/admin', icon: Users },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-4">
          <h1 className="text-xl font-bold text-white">Gestão Marketplace</h1>
        </div>
        <nav className="mt-8 flex-1 space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
              >
                <item.icon
                  className="mr-3 h-6 w-6 flex-shrink-0"
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}

          {/* Billing Section */}
          <div className="pt-4 mt-4 border-t border-gray-700">
            <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Billing
            </p>
          </div>
          {billingNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                  isActive
                    ? 'bg-blue-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
              >
                <item.icon
                  className="mr-3 h-6 w-6 flex-shrink-0"
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}

          {/* Admin Section */}
          {isAdmin && (
            <>
              <div className="pt-4 mt-4 border-t border-gray-700">
                <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Administracao
                </p>
              </div>
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                      isActive
                        ? 'bg-purple-800 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    )}
                  >
                    <item.icon
                      className="mr-3 h-6 w-6 flex-shrink-0"
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
            </>
          )}
        </nav>
      </div>
      
      <div className="flex flex-shrink-0 border-t border-gray-700 p-4">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5" aria-hidden="true" />
          Sair
        </button>
      </div>
    </div>
  )
}