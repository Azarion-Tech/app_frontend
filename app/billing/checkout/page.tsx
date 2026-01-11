'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBillingStore } from '@/stores/billingStore';
import { useAuthStore } from '@/stores/authStore';
import CreditCardForm from '@/components/billing/CreditCardForm';
import type { PaymentMethod } from '@/types/billing';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planIdentifier = searchParams.get('plan');

  const { user } = useAuthStore();
  const {
    plans,
    customer,
    loading,
    error,
    fetchPlans,
    fetchCustomer,
    createCustomer,
    createSubscription,
    getPlan,
  } = useBillingStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const selectedPlan = planIdentifier ? getPlan(planIdentifier) : null;

  useEffect(() => {
    if (!planIdentifier) {
      router.push('/billing/plans');
      return;
    }

    fetchPlans();
    fetchCustomer().catch(() => {
      // Customer doesn't exist yet, will be created during checkout
    });
  }, [planIdentifier, fetchPlans, fetchCustomer, router]);

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleCreateCustomer = async () => {
    if (customer) return customer;

    if (!user?.email || !user?.name) {
      throw new Error('Dados do usuário incompletos');
    }

    return await createCustomer({
      email: user.email,
      name: user.name,
    });
  };

  const handleCardPayment = async (token: string, brand: string, lastFour: string) => {
    if (!selectedPlan) return;

    setProcessing(true);
    setErrorMessage('');

    try {
      // Ensure customer exists
      const currentCustomer = await handleCreateCustomer();

      // Create subscription
      await createSubscription({
        plan_identifier: selectedPlan.identifier,
        payment_method: 'credit_card',
        customer_payment_method_id: token,
      });

      setSuccessMessage('Assinatura criada com sucesso!');

      // Redirect to subscriptions page after 2 seconds
      setTimeout(() => {
        router.push('/billing/subscriptions');
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || err.message || 'Erro ao processar pagamento');
      setProcessing(false);
    }
  };

  const handlePixPayment = async () => {
    if (!selectedPlan) return;

    setProcessing(true);
    setErrorMessage('');

    try {
      // Ensure customer exists
      await handleCreateCustomer();

      // Create subscription with PIX
      const subscription = await createSubscription({
        plan_identifier: selectedPlan.identifier,
        payment_method: 'pix',
      });

      // TODO: Show PIX QR code from first invoice
      setSuccessMessage('Assinatura criada! Aguardando pagamento via PIX...');

      setTimeout(() => {
        router.push('/billing/subscriptions');
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || err.message || 'Erro ao gerar PIX');
      setProcessing(false);
    }
  };

  if (!selectedPlan && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Plano não encontrado</h2>
          <button
            onClick={() => router.push('/billing/plans')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Voltar para planos
          </button>
        </div>
      </div>
    );
  }

  if (loading && !selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finalizar Assinatura</h1>
          <p className="text-gray-600">Complete seu pagamento para ativar o plano</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Success Message */}
              {successMessage && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-600 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p className="text-green-800 font-medium">{successMessage}</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {(errorMessage || error) && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{errorMessage || error}</p>
                </div>
              )}

              {/* Payment Method Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {selectedPlan?.payable_with_credit_card && (
                    <button
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                        paymentMethod === 'credit_card'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      disabled={processing}
                    >
                      <svg
                        className="w-8 h-8 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <span className="font-medium">Cartão de Crédito</span>
                    </button>
                  )}

                  {selectedPlan?.payable_with_pix && (
                    <button
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                        paymentMethod === 'pix'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      disabled={processing}
                    >
                      <svg
                        className="w-8 h-8 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                        />
                      </svg>
                      <span className="font-medium">PIX</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Form */}
              {paymentMethod === 'credit_card' && (
                <CreditCardForm
                  onSuccess={handleCardPayment}
                  onError={(err) => setErrorMessage(err)}
                  loading={processing}
                />
              )}

              {paymentMethod === 'pix' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Após confirmar, você receberá um QR Code PIX para pagamento instantâneo.
                    </p>
                  </div>

                  <button
                    onClick={handlePixPayment}
                    disabled={processing}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    {processing ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processando...
                      </>
                    ) : (
                      'Gerar QR Code PIX'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          {selectedPlan && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Pedido</h2>

                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Plano</p>
                    <p className="font-medium text-gray-900">{selectedPlan.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Valor</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(selectedPlan.value_cents)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Cobrança {selectedPlan.interval_type === 'months' ? 'mensal' : 'anual'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Pagamento seguro via iugu</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/billing/plans')}
            className="text-blue-600 hover:text-blue-700 font-medium"
            disabled={processing}
          >
            ← Voltar para planos
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
