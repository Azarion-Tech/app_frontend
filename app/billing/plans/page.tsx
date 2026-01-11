'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBillingStore } from '@/stores/billingStore';
import { useAuthStore } from '@/stores/authStore';
import type { IuguPlan } from '@/types/billing';

export default function PlansPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { plans, loading, error, fetchPlans } = useBillingStore();
  const [selectedPlan, setSelectedPlan] = useState<IuguPlan | null>(null);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSelectPlan = (plan: IuguPlan) => {
    setSelectedPlan(plan);
    // Redirect to checkout with plan identifier
    router.push(`/billing/checkout?plan=${plan.identifier}`);
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getIntervalText = (interval: number, intervalType: string) => {
    if (interval === 1) {
      switch (intervalType) {
        case 'months':
          return 'por mês';
        case 'weeks':
          return 'por semana';
        case 'days':
          return 'por dia';
        default:
          return '';
      }
    }

    switch (intervalType) {
      case 'months':
        return `a cada ${interval} meses`;
      case 'weeks':
        return `a cada ${interval} semanas`;
      case 'days':
        return `a cada ${interval} dias`;
      default:
        return '';
    }
  };

  if (loading && plans.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Selecione o plano ideal para seu negócio e comece a gerenciar seus marketplaces de forma profissional
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Plan Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">
                    {formatPrice(plan.value_cents)}
                  </span>
                  <span className="ml-2 text-blue-100">
                    {getIntervalText(plan.interval, plan.interval_type)}
                  </span>
                </div>
              </div>

              {/* Plan Description */}
              {plan.description && (
                <div className="px-6 py-4 border-b border-gray-200">
                  <p className="text-gray-600">{plan.description}</p>
                </div>
              )}

              {/* Payment Methods */}
              <div className="px-6 py-4 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Formas de pagamento:
                </p>
                <div className="flex gap-2 flex-wrap">
                  {plan.payable_with_credit_card && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Cartão de Crédito
                    </span>
                  )}
                  {plan.payable_with_pix && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      PIX
                    </span>
                  )}
                  {plan.payable_with_boleto && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Boleto
                    </span>
                  )}
                </div>
              </div>

              {/* Features - TODO: Parse from plan.features JSON */}
              <div className="px-6 py-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-700">Gestão ilimitada de produtos</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-700">Sincronização automática</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-700">Integrações com marketplaces</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-700">Suporte por email</span>
                  </li>
                </ul>
              </div>

              {/* CTA Button */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Assinar Agora
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Plans Message */}
        {!loading && plans.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum plano disponível</h3>
            <p className="mt-1 text-sm text-gray-500">
              Entre em contato com o suporte para mais informações.
            </p>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Voltar para o Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
