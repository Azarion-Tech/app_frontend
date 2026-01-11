/**
 * Billing Types - TypeScript definitions for iugu billing system
 */

export type IntervalType = 'months' | 'weeks' | 'days';

export type PaymentMethod = 'credit_card' | 'pix' | 'bank_slip';

export type InvoiceStatus =
  | 'pending'
  | 'paid'
  | 'canceled'
  | 'partially_paid'
  | 'refunded'
  | 'expired'
  | 'authorized'
  | 'in_analysis'
  | 'chargeback';

// Customer

export interface CustomerAddress {
  street?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

export interface IuguCustomer {
  id: number;
  user_id: number;
  iugu_id: string;
  email: string;
  name: string;
  cpf_cnpj?: string;
  phone?: string;
  street?: string;
  number?: string;
  district?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerRequest {
  email: string;
  name: string;
  cpf_cnpj?: string;
  phone?: string;
  address?: CustomerAddress;
}

// Plan

export interface PlanFeature {
  name: string;
  identifier: string;
  value: number;
}

export interface IuguPlan {
  id: number;
  iugu_id: string;
  identifier: string;
  name: string;
  description?: string;
  value_cents: number;
  value_brl: number;
  currency: string;
  interval: number;
  interval_type: IntervalType;
  payable_with_credit_card: boolean;
  payable_with_pix: boolean;
  payable_with_boleto: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanRequest {
  identifier: string;
  name: string;
  description?: string;
  value_cents: number;
  interval: number;
  interval_type: IntervalType;
  payable_with_credit_card?: boolean;
  payable_with_pix?: boolean;
  payable_with_boleto?: boolean;
  features?: PlanFeature[];
}

// Subscription

export interface IuguSubscription {
  id: number;
  user_id: number;
  customer_id: number;
  plan_id: number;
  iugu_id: string;
  active: boolean;
  suspended: boolean;
  expires_at?: string;
  cycled_at?: string;
  payment_method?: PaymentMethod;
  recent_invoices_count: number;
  created_at: string;
  updated_at: string;
  plan?: IuguPlan;
}

export interface CreateSubscriptionRequest {
  plan_identifier: string;
  customer_id?: number;
  only_charge_on_due_date?: boolean;
  ignore_due_email?: boolean;
  payment_method?: PaymentMethod;
  customer_payment_method_id?: string;
}

export interface ChangePlanRequest {
  new_plan_identifier: string;
}

export interface CancelSubscriptionRequest {
  reason?: string;
}

// Invoice

export interface InvoiceItem {
  description: string;
  quantity: number;
  price_cents: number;
}

export interface IuguInvoice {
  id: number;
  user_id: number;
  customer_id: number;
  subscription_id?: number;
  iugu_id: string;
  email: string;
  status: InvoiceStatus;
  total_cents: number;
  total_brl: number;
  total_paid_cents: number;
  due_date?: string;
  paid_at?: string;
  secure_url?: string;
  pix_qrcode?: string;
  pix_qrcode_text?: string;
  bank_slip_pdf_url?: string;
  bank_slip_digitable_line?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceRequest {
  email: string;
  due_date?: string;
  items: InvoiceItem[];
  payer?: CreateCustomerRequest;
  ensure_workday_due_date?: boolean;
  discount_cents?: number;
  customer_id?: string;
  ignore_due_email?: boolean;
  subscription_id?: string;
  payable_with?: PaymentMethod[];
}

// Dashboard

export interface BillingDashboard {
  active_subscriptions: number;
  total_revenue_cents: number;
  total_revenue_brl: number;
  pending_invoices: number;
  paid_invoices_this_month: number;
  mrr_cents: number;
  mrr_brl: number;
}

// Pagination

export interface PaginatedPlans {
  items: IuguPlan[];
  total: number;
  skip: number;
  limit: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PaginatedSubscriptions {
  items: IuguSubscription[];
  total: number;
  skip: number;
  limit: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PaginatedInvoices {
  items: IuguInvoice[];
  total: number;
  skip: number;
  limit: number;
  has_next: boolean;
  has_previous: boolean;
}

// Credit Card (for iugu.js)

export interface CreditCardData {
  number: string;
  verification_value: string;
  first_name: string;
  last_name: string;
  month: string;
  year: string;
}

export interface CreditCardToken {
  id: string;
  method: string;
  test: boolean;
  data: {
    brand: string;
    display_number: string;
    bin: string;
  };
  extra_info: {
    bin: string;
    year: number;
    month: number;
    brand: string;
  };
}

// iugu.js global interface
declare global {
  interface Window {
    Iugu: {
      setAccountID: (accountId: string) => void;
      setTestMode: (testMode: boolean) => void;
      createPaymentToken: (
        cardData: CreditCardData,
        callback: (response: CreditCardToken | { errors: Record<string, string> }) => void
      ) => void;
    };
  }
}
