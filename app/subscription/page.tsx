'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Calendar, AlertTriangle, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react'
import { toast } from 'react-toastify'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { subscriptionApi } from '@/lib/api'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function SubscriptionPage() {
  const router = useRouter()
  const { subscription, payments, pricing, loadSubscription, loadPayments, loadPricing, isLoading, cancel } = useSubscriptionStore()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    loadSubscription()
    loadPayments()
    loadPricing()
  }, [loadSubscription, loadPayments, loadPricing])

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
      trial: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Trial' },
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Ativo' },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Cancelado' },
      expired: { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Expirado' },
      pending_payment: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, label: 'Pagamento Pendente' },
      no_subscription: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Sem Assinatura' }
    }

    const config = statusConfig[status] || statusConfig.no_subscription
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="h-4 w-4" />
        {config.label}
      </span>
    )
  }

  const handleCancelSubscription = async () => {
    setIsCancelling(true)
    try {
      await cancel(cancelReason)
      toast.success('Assinatura cancelada com sucesso')
      setShowCancelModal(false)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao cancelar assinatura')
    } finally {
      setIsCancelling(false)
    }
  }

  const getExpirationDate = () => {
    if (!subscription) return null
    if (subscription.status === 'trial' && subscription.trial_ends_at) {
      return new Date(subscription.trial_ends_at)
    }
    if (subscription.current_period_end) {
      return new Date(subscription.current_period_end)
    }
    return null
  }

  const expirationDate = getExpirationDate()

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Minha Assinatura</h1>
          {subscription?.status !== 'active' && subscription?.status !== 'trial' && (
            <Button onClick={() => router.push('/pricing')}>
              Ver Planos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Current Subscription Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Status da Assinatura</span>
              {subscription && getStatusBadge(subscription.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : subscription && subscription.status !== 'no_subscription' ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Plano Atual</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {subscription.plan === 'free_trial' ? 'Trial Gratuito' :
                       subscription.plan === 'monthly' ? 'Mensal' : 'Anual'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dias Restantes</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {subscription.days_remaining} dias
                    </p>
                  </div>
                  {expirationDate && (
                    <div>
                      <p className="text-sm text-gray-500">
                        {subscription.status === 'trial' ? 'Trial Expira em' : 'Renova em'}
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(expirationDate.toISOString())}
                      </p>
                    </div>
                  )}
                  {subscription.card_last_four && (
                    <div>
                      <p className="text-sm text-gray-500">Metodo de Pagamento</p>
                      <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                        {subscription.card_brand} **** {subscription.card_last_four}
                      </p>
                    </div>
                  )}
                </div>

                {/* Trial Warning */}
                {subscription.status === 'trial' && subscription.days_remaining <= 3 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Seu trial esta acabando!</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        {subscription.card_last_four
                          ? 'Seu cartao sera cobrado automaticamente quando o trial expirar.'
                          : 'Adicione um metodo de pagamento para continuar usando apos o trial.'}
                      </p>
                      {!subscription.card_last_four && (
                        <Button
                          size="sm"
                          className="mt-3"
                          onClick={() => router.push('/pricing')}
                        >
                          Adicionar Cartao
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  {subscription.status === 'trial' && (
                    <Button onClick={() => router.push('/pricing')}>
                      Fazer Upgrade
                    </Button>
                  )}
                  {subscription.status === 'active' && subscription.plan === 'monthly' && (
                    <Button variant="outline" onClick={() => router.push('/pricing')}>
                      Mudar para Anual (Economize 20%)
                    </Button>
                  )}
                  {(subscription.status === 'trial' || subscription.status === 'active') && (
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setShowCancelModal(true)}
                    >
                      Cancelar Assinatura
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Voce nao tem uma assinatura ativa</h3>
                <p className="text-gray-500 mb-6">Comece seu trial gratuito de 7 dias agora!</p>
                <Button onClick={() => router.push('/pricing')}>
                  Ver Planos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        {payments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Historico de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Data</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Descricao</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Valor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b last:border-0">
                        <td className="py-3 px-4 text-gray-900">
                          {payment.paid_at ? formatDate(payment.paid_at) : formatDate(payment.created_at)}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {payment.description || 'Assinatura Azarion'}
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-medium">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            payment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {payment.status === 'approved' ? 'Aprovado' :
                             payment.status === 'pending' ? 'Pendente' :
                             payment.status === 'rejected' ? 'Rejeitado' :
                             payment.status === 'refunded' ? 'Reembolsado' :
                             payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Cancelar Assinatura</h3>
              <p className="text-gray-600 mb-4">
                Tem certeza que deseja cancelar sua assinatura? Voce continuara tendo acesso ate o final do periodo atual.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo do cancelamento (opcional)
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-900"
                  rows={3}
                  placeholder="Conte-nos por que esta cancelando..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelModal(false)}
                  disabled={isCancelling}
                >
                  Voltar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  disabled={isCancelling}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isCancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
