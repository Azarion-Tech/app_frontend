'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AuthGuardProps {
  children: React.ReactNode
  requireSubscription?: boolean
  requireAdmin?: boolean
}

// Pages that don't require subscription
const PUBLIC_SUBSCRIPTION_PAGES = ['/subscription', '/pricing', '/privacy']

export default function AuthGuard({ children, requireSubscription = true, requireAdmin = false }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, loadUser, isLoading, user } = useAuthStore()
  const { subscription, loadSubscription, isLoading: subscriptionLoading } = useSubscriptionStore()

  useEffect(() => {
    // Load user from storage on mount
    loadUser()
  }, [loadUser])

  useEffect(() => {
    // Load subscription after user is authenticated
    if (isAuthenticated) {
      loadSubscription()
    }
  }, [isAuthenticated, loadSubscription])

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    // Check admin access
    if (!isLoading && isAuthenticated && requireAdmin && user?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, requireAdmin, user, router])

  // Check if current page requires subscription
  const isPublicPage = PUBLIC_SUBSCRIPTION_PAGES.some(page => pathname?.startsWith(page))

  // Check subscription status
  const hasActiveSubscription = subscription?.is_active || user?.role === 'admin'
  const isInTrial = subscription?.status === 'trial'
  const trialDaysRemaining = subscription?.days_remaining || 0

  // Show loading state while checking authentication
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Show subscription required page if no active subscription and page requires it
  if (requireSubscription && !isPublicPage && !subscriptionLoading && !hasActiveSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assinatura Necessaria</h2>
          <p className="text-gray-600 mb-6">
            {subscription?.status === 'expired'
              ? 'Seu trial ou assinatura expirou. Assine um plano para continuar usando.'
              : subscription?.status === 'cancelled'
              ? 'Sua assinatura foi cancelada. Assine novamente para recuperar o acesso.'
              : 'Voce precisa de uma assinatura ativa para acessar esta funcionalidade.'}
          </p>
          <div className="space-y-3">
            <Button className="w-full" onClick={() => router.push('/pricing')}>
              Ver Planos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push('/subscription')}>
              Gerenciar Assinatura
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Trial Warning Banner */}
      {isInTrial && trialDaysRemaining <= 3 && !isPublicPage && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">
                Seu trial expira em {trialDaysRemaining} {trialDaysRemaining === 1 ? 'dia' : 'dias'}!
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => router.push('/pricing')}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Assinar Agora
            </Button>
          </div>
        </div>
      )}
      {children}
    </>
  )
}