'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBillingStore } from '@/stores/billingStore';
import type { IuguSubscription } from '@/types/billing';

export default function SubscriptionsPage() {
  const router = useRouter();
  const {
    subscriptions,
    plans,
    loading,
    error,
    fetchSubscriptions,
    fetchPlans,
    cancelSubscription,
    suspendSubscription,
    activateSubscription,
    changePlan,
  } = useBillingStore();

  const [selectedSubscription, setSelectedSubscription] = useState<IuguSubscription | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [newPlanId, setNewPlanId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
    fetchPlans();
  }, [fetchSubscriptions, fetchPlans]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatPrice = (cents?: number) => {
    if (!cents) return '-';
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getStatusBadge = (subscription: IuguSubscription) => {
    if (!subscription.active) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Inativa</span>;
    }
    if (subscription.suspended) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Suspensa</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Ativa</span>;
  };

  const handleCancelSubscription = async () => {
    if (!selectedSubscription) return;

    setActionLoading(true);
    try {
      await cancelSubscription(selectedSubscription.id, cancelReason);
      setShowCancelModal(false);
      setSelectedSubscription(null);
      setCancelReason('');
    } catch (err) {
      // Error is handled by store
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendSubscription = async (subscription: IuguSubscription) => {
    setActionLoading(true);
    try {
      await suspendSubscription(subscription.id);
    } catch (err) {
      // Error is handled by store
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateSubscription = async (subscription: IuguSubscription) => {
    setActionLoading(true);
    try {
      await activateSubscription(subscription.id);
    } catch (err) {
      // Error is handled by store
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedSubscription || !newPlanId) return;

    setActionLoading(true);
    try {
      await changePlan(selectedSubscription.id, newPlanId);
      setShowChangePlanModal(false);
      setSelectedSubscription(null);
      setNewPlanId('');
    } catch (err) {
      // Error is handled by store
    } finally {
      setActionLoading(false);
    }
  };

  const availablePlans = plans.filter(
    (plan) => plan.identifier !== selectedSubscription?.plan?.identifier
  );

  if (loading && subscriptions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando assinaturas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Minhas Assinaturas</h1>
          <p className="text-gray-600">Gerencie suas assinaturas e planos</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Subscriptions List */}
        {subscriptions.length > 0 ? (
          <div className="space-y-6">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {subscription.plan?.name || 'Plano Desconhecido'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">ID: {subscription.iugu_id}</p>
                    </div>
                    {getStatusBadge(subscription)}
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Valor</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatPrice(subscription.price_cents || subscription.plan?.value_cents)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Próxima cobrança</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(subscription.cycled_at)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Método de pagamento</p>
                      <p className="text-lg font-semibold text-gray-900 capitalize">
                        {subscription.payment_method?.replace('_', ' ') || 'Não definido'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Faturas recentes</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {subscription.recent_invoices_count}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    {subscription.active && !subscription.suspended && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedSubscription(subscription);
                            setShowChangePlanModal(true);
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                          disabled={actionLoading}
                        >
                          Mudar Plano
                        </button>

                        <button
                          onClick={() => handleSuspendSubscription(subscription)}
                          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                          disabled={actionLoading}
                        >
                          Pausar
                        </button>

                        <button
                          onClick={() => {
                            setSelectedSubscription(subscription);
                            setShowCancelModal(true);
                          }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                          disabled={actionLoading}
                        >
                          Cancelar
                        </button>
                      </>
                    )}

                    {subscription.suspended && (
                      <button
                        onClick={() => handleActivateSubscription(subscription)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                        disabled={actionLoading}
                      >
                        Reativar
                      </button>
                    )}

                    <button
                      onClick={() => router.push('/billing/invoices')}
                      className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      Ver Faturas
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* No Subscriptions */
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Você ainda não tem assinaturas
            </h3>
            <p className="text-gray-600 mb-6">
              Escolha um plano para começar a usar todas as funcionalidades
            </p>
            <button
              onClick={() => router.push('/billing/plans')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Ver Planos Disponíveis
            </button>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && selectedSubscription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cancelar Assinatura
              </h3>
              <p className="text-gray-600 mb-4">
                Tem certeza que deseja cancelar sua assinatura do plano{' '}
                <strong>{selectedSubscription.plan?.name}</strong>?
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo do cancelamento (opcional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nos ajude a melhorar..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedSubscription(null);
                    setCancelReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                  disabled={actionLoading}
                >
                  Voltar
                </button>
                <button
                  onClick={handleCancelSubscription}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Cancelando...' : 'Confirmar Cancelamento'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Change Plan Modal */}
        {showChangePlanModal && selectedSubscription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mudar Plano</h3>
              <p className="text-gray-600 mb-4">
                Selecione o novo plano para sua assinatura:
              </p>

              <div className="mb-4 space-y-2">
                {availablePlans.map((plan) => (
                  <label
                    key={plan.id}
                    className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="newPlan"
                      value={plan.identifier}
                      checked={newPlanId === plan.identifier}
                      onChange={(e) => setNewPlanId(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{plan.name}</p>
                      <p className="text-sm text-gray-600">{formatPrice(plan.value_cents)}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowChangePlanModal(false);
                    setSelectedSubscription(null);
                    setNewPlanId('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleChangePlan}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  disabled={actionLoading || !newPlanId}
                >
                  {actionLoading ? 'Alterando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
