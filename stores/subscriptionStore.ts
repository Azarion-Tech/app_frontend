import { create } from 'zustand'
import { subscriptionApi } from '@/lib/api'
import { Subscription, PricingResponse, Payment } from '@/types'

interface SubscriptionState {
  subscription: Subscription | null
  pricing: PricingResponse | null
  payments: Payment[]
  isLoading: boolean
  error: string | null

  // Actions
  loadSubscription: () => Promise<void>
  loadPricing: () => Promise<void>
  loadPayments: () => Promise<void>
  startTrial: (cardToken?: string) => Promise<void>
  upgrade: (plan: string, cardToken: string) => Promise<void>
  cancel: (reason?: string) => Promise<void>
  clearError: () => void
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: null,
  pricing: null,
  payments: [],
  isLoading: false,
  error: null,

  loadSubscription: async () => {
    set({ isLoading: true, error: null })
    try {
      const subscription = await subscriptionApi.getStatus()
      set({ subscription, isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Erro ao carregar assinatura',
        isLoading: false
      })
    }
  },

  loadPricing: async () => {
    try {
      const pricing = await subscriptionApi.getPlans()
      set({ pricing })
    } catch (error: any) {
      set({ error: error.response?.data?.detail || 'Erro ao carregar planos' })
    }
  },

  loadPayments: async () => {
    try {
      const response = await subscriptionApi.getPaymentHistory()
      set({ payments: response.items })
    } catch (error: any) {
      console.error('Error loading payments:', error)
    }
  },

  startTrial: async (cardToken?: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await subscriptionApi.startTrial({ card_token: cardToken })
      set({ subscription: response.subscription, isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Erro ao iniciar trial',
        isLoading: false
      })
      throw error
    }
  },

  upgrade: async (plan: string, cardToken: string) => {
    set({ isLoading: true, error: null })
    try {
      const subscription = await subscriptionApi.upgrade({
        plan: plan as any,
        card_token: cardToken
      })
      set({ subscription, isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Erro ao fazer upgrade',
        isLoading: false
      })
      throw error
    }
  },

  cancel: async (reason?: string) => {
    set({ isLoading: true, error: null })
    try {
      await subscriptionApi.cancel(reason)
      await get().loadSubscription()
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Erro ao cancelar assinatura',
        isLoading: false
      })
      throw error
    }
  },

  clearError: () => set({ error: null })
}))
