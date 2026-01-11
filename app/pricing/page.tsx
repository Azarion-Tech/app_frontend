'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ArrowRight, CreditCard, Shield, Clock } from 'lucide-react'
import { toast } from 'react-toastify'
import { subscriptionApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { PlanPricing, SubscriptionPlan } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function PricingPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const { subscription, pricing, loadPricing, loadSubscription, isLoading } = useSubscriptionStore()

  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanPricing | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Card form state
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [expirationMonth, setExpirationMonth] = useState('')
  const [expirationYear, setExpirationYear] = useState('')
  const [cvv, setCvv] = useState('')

  useEffect(() => {
    loadPricing()
    if (isAuthenticated) {
      loadSubscription()
    }
  }, [loadPricing, loadSubscription, isAuthenticated])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const groups = cleaned.match(/.{1,4}/g)
    return groups ? groups.join(' ') : cleaned
  }

  const handleStartTrial = async () => {
    if (!isAuthenticated) {
      router.push('/auth/register')
      return
    }

    // If user already has trial, redirect to dashboard
    if (subscription?.status === 'trial' || subscription?.status === 'active') {
      router.push('/dashboard')
      return
    }

    setSelectedPlan(null)
    setShowPaymentForm(true)
  }

  const handleSelectPlan = (plan: PlanPricing) => {
    if (!isAuthenticated) {
      router.push('/auth/register')
      return
    }

    setSelectedPlan(plan)
    setShowPaymentForm(true)
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Tokenize card
      const tokenResponse = await subscriptionApi.tokenizeCard({
        card_number: cardNumber.replace(/\s/g, ''),
        card_holder_name: cardHolder,
        expiration_month: expirationMonth,
        expiration_year: expirationYear,
        cvv: cvv
      })

      if (selectedPlan) {
        // Upgrade to paid plan
        await subscriptionApi.upgrade({
          plan: selectedPlan.plan,
          card_token: tokenResponse.token
        })
        toast.success('Assinatura ativada com sucesso!')
      } else {
        // Start trial with card for auto-billing
        await subscriptionApi.startTrial({ card_token: tokenResponse.token })
        toast.success('Trial iniciado com sucesso! Voce tem 7 dias gratis.')
      }

      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao processar pagamento')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStartTrialWithoutCard = async () => {
    setIsProcessing(true)
    try {
      await subscriptionApi.startTrial()
      toast.success('Trial iniciado com sucesso! Voce tem 7 dias gratis.')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao iniciar trial')
    } finally {
      setIsProcessing(false)
    }
  }

  if (showPaymentForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {selectedPlan ? `Assinar ${selectedPlan.name}` : 'Iniciar Trial de 7 Dias'}
              </CardTitle>
              {selectedPlan && (
                <p className="text-center text-2xl font-bold text-blue-600 mt-2">
                  {formatCurrency(selectedPlan.price)}/{selectedPlan.billing_period === 'monthly' ? 'mes' : 'ano'}
                </p>
              )}
              {!selectedPlan && (
                <p className="text-center text-gray-600 mt-2">
                  Adicione um cartao para cobranca automatica apos o trial
                </p>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numero do Cartao
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      value={formatCardNumber(cardNumber)}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      className="pl-10"
                      required={!!selectedPlan}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome no Cartao
                  </label>
                  <Input
                    type="text"
                    placeholder="NOME COMO ESTA NO CARTAO"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    required={!!selectedPlan}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mes
                    </label>
                    <Input
                      type="text"
                      placeholder="MM"
                      value={expirationMonth}
                      onChange={(e) => setExpirationMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                      maxLength={2}
                      required={!!selectedPlan}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ano
                    </label>
                    <Input
                      type="text"
                      placeholder="AA"
                      value={expirationYear}
                      onChange={(e) => setExpirationYear(e.target.value.replace(/\D/g, '').slice(0, 2))}
                      maxLength={2}
                      required={!!selectedPlan}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <Input
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      required={!!selectedPlan}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span>Pagamento seguro processado pela InfinitePay</span>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processando...' : selectedPlan ? 'Assinar Agora' : 'Iniciar Trial com Cartao'}
                </Button>

                {!selectedPlan && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleStartTrialWithoutCard}
                    disabled={isProcessing}
                  >
                    Iniciar Trial sem Cartao
                  </Button>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowPaymentForm(false)}
                >
                  Voltar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comece com 7 dias gratis e tenha acesso completo a todas as funcionalidades.
            Cancele quando quiser.
          </p>
        </div>

        {/* Trial Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-12 text-white text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="h-8 w-8" />
            <h2 className="text-2xl font-bold">7 Dias Gratis</h2>
          </div>
          <p className="text-lg mb-6 opacity-90">
            Experimente todas as funcionalidades sem compromisso.
            Nao precisa de cartao de credito para comecar.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={handleStartTrial}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            Comecar Trial Gratis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricing?.plans.map((plan) => (
            <Card
              key={plan.plan}
              className={`relative ${plan.is_popular ? 'border-2 border-blue-500 shadow-xl' : ''}`}
            >
              {plan.is_popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Mais Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-gray-500">
                    /{plan.billing_period === 'monthly' ? 'mes' : 'ano'}
                  </span>
                </div>
                {plan.billing_period === 'yearly' && (
                  <p className="text-green-600 text-sm font-medium mt-2">
                    Economia de R$ 199,80 (2 meses gratis)
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.is_popular ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan)}
                >
                  Assinar {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Todas as funcionalidades incluidas
          </h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Sincronizacao Automatica</h4>
              <p className="text-gray-600 text-sm">Sincronize produtos e pedidos com os principais marketplaces</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Gestao de Estoque</h4>
              <p className="text-gray-600 text-sm">Controle seu estoque em tempo real e evite rupturas</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Relatorios Detalhados</h4>
              <p className="text-gray-600 text-sm">Acompanhe suas vendas e tome decisoes baseadas em dados</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Perguntas Frequentes
          </h3>
          <div className="space-y-4">
            <details className="bg-white rounded-lg p-4 shadow-sm">
              <summary className="font-medium cursor-pointer">Posso cancelar a qualquer momento?</summary>
              <p className="mt-2 text-gray-600">Sim, voce pode cancelar sua assinatura a qualquer momento. Voce continuara tendo acesso ate o fim do periodo pago.</p>
            </details>
            <details className="bg-white rounded-lg p-4 shadow-sm">
              <summary className="font-medium cursor-pointer">O que acontece apos o trial?</summary>
              <p className="mt-2 text-gray-600">Apos os 7 dias de trial, se voce tiver cadastrado um cartao, a cobranca sera feita automaticamente. Caso contrario, voce perdera acesso as funcionalidades premium.</p>
            </details>
            <details className="bg-white rounded-lg p-4 shadow-sm">
              <summary className="font-medium cursor-pointer">Quais marketplaces sao suportados?</summary>
              <p className="mt-2 text-gray-600">Atualmente suportamos Mercado Livre, Amazon Brasil e Magazine Luiza, com novos marketplaces sendo adicionados regularmente.</p>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}
