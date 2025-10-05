// Base types matching FastAPI schemas

export interface User {
  id: number
  email: string
  name: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface Product {
  id: number
  name: string
  description?: string
  price: number
  stock_quantity: number
  sku: string
  category?: string
  image_url?: string
  is_active: boolean
  owner_id: number
  created_at: string
  updated_at?: string
}

export interface ProductCreate {
  name: string
  description?: string
  price: number
  stock_quantity: number
  sku: string
  category?: string
  image_url?: string
}

export interface ProductUpdate {
  name?: string
  description?: string
  price?: number
  stock_quantity?: number
  category?: string
  image_url?: string
  is_active?: boolean
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  unit_price: number
  product_sku: string
  product_name: string
  product_image_url?: string
  marketplace_item_id?: string
  marketplace_variation_id?: string
  total_price: number
  cost_price?: number
  status: string
  created_at: string
  updated_at?: string
}

export interface Order {
  id: number
  order_number: string
  user_id: number
  marketplace: string
  marketplace_order_id?: string
  marketplace_order_url?: string
  customer_name: string
  customer_email?: string
  customer_document?: string
  shipping_address_line1: string
  shipping_address_line2?: string
  shipping_city: string
  shipping_state: string
  shipping_zipcode: string
  shipping_country: string
  shipping_cost: number
  tax_amount: number
  discount_amount: number
  marketplace_fee: number
  payment_fee: number
  shipping_method?: string
  tracking_code?: string
  shipping_carrier?: string
  estimated_delivery_date?: string
  actual_delivery_date?: string
  subtotal: number
  total_amount: number
  net_amount?: number
  status: string
  payment_status: string
  fulfillment_status: string
  notes?: string
  marketplace_data?: string
  order_date?: string
  created_at: string
  updated_at?: string
  items: OrderItem[]
}

export interface BackgroundJob {
  id: number
  job_id: string
  user_id: number
  task_name: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  result?: any
  error_message?: string
  created_at: string
  updated_at?: string
  started_at?: string
  completed_at?: string
}

export interface AuthToken {
  access_token: string
  token_type: string
  expires_in: number
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  email: string
  name: string
  password: string
}

export interface PaginationParams {
  skip?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  skip: number
  limit: number
  has_next: boolean
  has_previous: boolean
}

export interface ProductStats {
  total_products: number
  active_products: number
  inactive_products: number
  total_stock_value: number
  total_stock_units: number
  low_stock_products: number
  out_of_stock_products: number
  categories_count: number
}

export interface OrderStats {
  total_orders: number
  pending_orders: number
  confirmed_orders: number
  shipped_orders: number
  delivered_orders: number
  cancelled_orders: number
  total_revenue: number
  net_revenue: number
  average_order_value: number
}

export interface MarketplaceStats {
  total_integrations: number
  active_integrations: number
  connected_integrations: number
  total_linked_products: number
  total_marketplace_orders: number
}

export interface RecentOrder {
  id: number
  order_number: string
  status: string
  total_amount: number
  created_at: string
}

export interface RecentProduct {
  id: number
  name: string
  sku: string
  price: number
  stock_quantity: number
  created_at: string
}

export interface RecentSync {
  id: number
  marketplace: string
  operation: string
  status: string
  created_at: string
}

export interface RecentAuditLog {
  id: number
  action: string
  resource_type: string
  timestamp: string
}

export interface RecentActivity {
  recent_orders: RecentOrder[]
  recent_products: RecentProduct[]
  recent_syncs: RecentSync[]
  recent_audit_logs: RecentAuditLog[]
}

export interface DashboardStats {
  user_info: {
    id: number
    name: string
    email: string
    member_since: string
  }
  products: ProductStats
  orders: OrderStats
  marketplaces: MarketplaceStats
  recent_activity: RecentActivity
}

// Order and Product Status Enums
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum MarketplaceType {
  MERCADO_LIVRE = 'mercadolivre',
  AMAZON = 'amazon',
  MAGALU = 'magalu',
}

export enum SyncStatus {
  PENDING = 'pending',
  SYNCED = 'synced',
  ERROR = 'error',
}

// Marketplace Integration types
export interface MarketplaceIntegration {
  id: number
  user_id: number
  marketplace: string
  marketplace_account_id?: string
  api_credentials?: any
  is_active: boolean
  is_connected: boolean
  last_sync?: string
  sync_frequency?: string
  auto_sync_enabled: boolean
  created_at: string
  updated_at?: string
}

export interface MarketplaceIntegrationCreate {
  marketplace: string
  marketplace_account_id?: string
  api_credentials: any
  sync_frequency?: string
  auto_sync_enabled?: boolean
}

export interface MarketplaceIntegrationUpdate {
  marketplace_account_id?: string
  api_credentials?: any
  is_active?: boolean
  sync_frequency?: string
  auto_sync_enabled?: boolean
}

// Sync Log types
export interface SyncLog {
  id: number
  product_id: number
  marketplace: string
  operation: string
  status: string
  marketplace_product_id?: string
  error_message?: string
  request_data?: any
  response_data?: any
  duration_ms?: number
  created_at: string
  updated_at?: string
}

export interface MarketplaceLink {
  id: number
  product_id: number
  marketplace: string
  marketplace_product_id: string
  marketplace_product_url?: string
  sync_status: string
  last_sync?: string
  auto_sync_enabled: boolean
  created_at: string
  updated_at?: string
}

// UI State types
export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
}

export interface FilterState {
  search?: string
  category?: string
  status?: string
  dateRange?: {
    from: Date
    to: Date
  }
}