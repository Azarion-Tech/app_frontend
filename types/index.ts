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
  total_stock: number
  average_price: number
  total_value: number
}

export interface OrderStats {
  total_orders: number
  pending_orders: number
  completed_orders: number
  total_revenue: number
  average_order_value: number
}

export interface DashboardStats {
  products: ProductStats
  orders: OrderStats
  recent_orders: Order[]
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