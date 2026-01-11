/**
 * Billing Store - Zustand state management for iugu billing
 */

import { create } from 'zustand';
import { billingApi } from '@/lib/api';
import type {
  IuguCustomer,
  IuguPlan,
  IuguSubscription,
  IuguInvoice,
  CreateCustomerRequest,
  CreateSubscriptionRequest,
} from '@/types/billing';

interface BillingState {
  // State
  customer: IuguCustomer | null;
  plans: IuguPlan[];
  subscriptions: IuguSubscription[];
  invoices: IuguInvoice[];
  loading: boolean;
  error: string | null;

  // Customer actions
  fetchCustomer: () => Promise<void>;
  createCustomer: (data: CreateCustomerRequest) => Promise<IuguCustomer>;

  // Plan actions
  fetchPlans: () => Promise<void>;
  getPlan: (identifier: string) => IuguPlan | undefined;

  // Subscription actions
  fetchSubscriptions: () => Promise<void>;
  createSubscription: (data: CreateSubscriptionRequest) => Promise<IuguSubscription>;
  cancelSubscription: (subscriptionId: number, reason?: string) => Promise<void>;
  changePlan: (subscriptionId: number, newPlanIdentifier: string) => Promise<void>;
  suspendSubscription: (subscriptionId: number) => Promise<void>;
  activateSubscription: (subscriptionId: number) => Promise<void>;

  // Invoice actions
  fetchInvoices: () => Promise<void>;
  getInvoice: (invoiceId: number) => Promise<IuguInvoice>;

  // Helpers
  hasActiveSubscription: () => boolean;
  getActiveSubscription: () => IuguSubscription | null;
  clearError: () => void;
  reset: () => void;
}

export const useBillingStore = create<BillingState>((set, get) => ({
  // Initial state
  customer: null,
  plans: [],
  subscriptions: [],
  invoices: [],
  loading: false,
  error: null,

  // Customer actions
  fetchCustomer: async () => {
    set({ loading: true, error: null });
    try {
      const customer = await billingApi.getMyCustomer();
      set({ customer, loading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao buscar cliente';
      set({ error: errorMessage, loading: false });
    }
  },

  createCustomer: async (data: CreateCustomerRequest) => {
    set({ loading: true, error: null });
    try {
      const customer = await billingApi.createCustomer(data);
      set({ customer, loading: false });
      return customer;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao criar cliente';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Plan actions
  fetchPlans: async () => {
    set({ loading: true, error: null });
    try {
      const response = await billingApi.getPlans({ active_only: true });
      set({ plans: response.items, loading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao buscar planos';
      set({ error: errorMessage, loading: false });
    }
  },

  getPlan: (identifier: string) => {
    return get().plans.find((plan) => plan.identifier === identifier);
  },

  // Subscription actions
  fetchSubscriptions: async () => {
    set({ loading: true, error: null });
    try {
      const subscriptions = await billingApi.getMySubscriptions();
      set({ subscriptions, loading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao buscar assinaturas';
      set({ error: errorMessage, loading: false });
    }
  },

  createSubscription: async (data: CreateSubscriptionRequest) => {
    set({ loading: true, error: null });
    try {
      const subscription = await billingApi.createSubscription(data);
      set((state) => ({
        subscriptions: [...state.subscriptions, subscription],
        loading: false,
      }));
      return subscription;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao criar assinatura';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  cancelSubscription: async (subscriptionId: number, reason?: string) => {
    set({ loading: true, error: null });
    try {
      await billingApi.cancelSubscription(subscriptionId, { reason });
      set((state) => ({
        subscriptions: state.subscriptions.map((sub) =>
          sub.id === subscriptionId
            ? { ...sub, active: false, suspended: true }
            : sub
        ),
        loading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao cancelar assinatura';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  changePlan: async (subscriptionId: number, newPlanIdentifier: string) => {
    set({ loading: true, error: null });
    try {
      await billingApi.changePlan(subscriptionId, { new_plan_identifier: newPlanIdentifier });
      // Refresh subscriptions to get updated data
      await get().fetchSubscriptions();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao mudar plano';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  suspendSubscription: async (subscriptionId: number) => {
    set({ loading: true, error: null });
    try {
      await billingApi.suspendSubscription(subscriptionId);
      set((state) => ({
        subscriptions: state.subscriptions.map((sub) =>
          sub.id === subscriptionId ? { ...sub, suspended: true } : sub
        ),
        loading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao suspender assinatura';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  activateSubscription: async (subscriptionId: number) => {
    set({ loading: true, error: null });
    try {
      await billingApi.activateSubscription(subscriptionId);
      set((state) => ({
        subscriptions: state.subscriptions.map((sub) =>
          sub.id === subscriptionId ? { ...sub, suspended: false } : sub
        ),
        loading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao ativar assinatura';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Invoice actions
  fetchInvoices: async () => {
    set({ loading: true, error: null });
    try {
      const response = await billingApi.getMyInvoices();
      set({ invoices: response.items, loading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao buscar faturas';
      set({ error: errorMessage, loading: false });
    }
  },

  getInvoice: async (invoiceId: number) => {
    set({ loading: true, error: null });
    try {
      const invoice = await billingApi.getInvoice(invoiceId);
      set({ loading: false });
      return invoice;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao buscar fatura';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Helpers
  hasActiveSubscription: () => {
    const subs = get().subscriptions;
    return subs.some((sub) => sub.active && !sub.suspended);
  },

  getActiveSubscription: () => {
    const subs = get().subscriptions;
    return subs.find((sub) => sub.active && !sub.suspended) || null;
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      customer: null,
      plans: [],
      subscriptions: [],
      invoices: [],
      loading: false,
      error: null,
    });
  },
}));
