import axios, { AxiosResponse, AxiosError } from "axios";
import { AuthToken, LoginRequest, RegisterRequest, User } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management
const TOKEN_KEY = "marketplace_token";

export const tokenStorage = {
  get: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },
  set: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  remove: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
  },
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token expiration
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenStorage.remove();
      // Redirect to login if not already there
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/auth")
      ) {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthToken> => {
    const response: AxiosResponse<AuthToken> = await api.post(
      "/auth/login",
      credentials
    );
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<User> => {
    const response: AxiosResponse<User> = await api.post(
      "/auth/register",
      userData
    );
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response: AxiosResponse<User> = await api.get("/users/me");
    return response.data;
  },
};

// ML Integration API
export const mlIntegrationApi = {
    getAuthUrl: async () => {
        const response = await api.get("/ml-integration/auth-url");
        return response.data;
    },
};

// Products API
export const productsApi = {
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    category?: string;
    is_active?: boolean;
  }) => {
    const response = await api.get("/products", { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (productData: any) => {
    const response = await api.post("/products", productData);
    return response.data;
  },

  update: async (id: number, productData: any) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/products/stats");
    return response.data;
  },

  // Marketplace sync endpoints
  syncToMarketplace: async (id: number, marketplace: string) => {
    const response = await api.post(`/products/${id}/sync/${marketplace}`);
    return response.data;
  },

  getSyncStatus: async (id: number) => {
    const response = await api.get(`/products/${id}/sync-status`);
    return response.data;
  },
};

// Orders API
export const ordersApi = {
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const response = await api.get("/orders", { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  create: async (orderData: any) => {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  updateStatus: async (id: number, statusData: any) => {
    const response = await api.put(`/orders/${id}/status`, statusData);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/orders/stats");
    return response.data;
  },

  // Process order (background job)
  processOrder: async (id: number) => {
    const response = await api.post(`/orders/${id}/process`);
    return response.data;
  },
};

// Jobs API
export const jobsApi = {
  getAll: async (params?: {
    limit?: number;
    status?: string;
  }) => {
    const response = await api.get("/jobs/", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  retry: async (id: string) => {
    const response = await api.post(`/jobs/${id}/retry`);
    return response.data;
  },

  // Trigger sync jobs
  syncProducts: async (marketplace: string) => {
    const response = await api.post("/jobs/sync-products", null, {
      params: { marketplace }
    });
    return response.data;
  },

  importOrders: async (marketplace: string) => {
    const response = await api.post("/jobs/import-orders", null, {
      params: { marketplace }
    });
    return response.data;
  },

  runInventoryAnalysis: async () => {
    const response = await api.post("/jobs/inventory-analysis");
    return response.data;
  },

  runStockOptimization: async () => {
    const response = await api.post("/jobs/stock-optimization");
    return response.data;
  },

  sendWeeklySummary: async () => {
    const response = await api.post("/jobs/send-weekly-summary");
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/jobs/stats/summary");
    return response.data;
  },

  getQueueStats: async () => {
    const response = await api.get("/jobs/stats/queues");
    return response.data;
  },
};

// Privacy/LGPD API
export const privacyApi = {
  getPolicy: async () => {
    const response = await api.get("/privacy/policy");
    return response.data;
  },

  getConsentStatus: async () => {
    const response = await api.get("/privacy/consent-status");
    return response.data;
  },

  requestDataExport: async () => {
    const response = await api.post("/privacy/data-request");
    return response.data;
  },

  exportData: async () => {
    const response = await api.get("/privacy/export-data");
    return response.data;
  },

  requestAccountDeletion: async () => {
    const response = await api.post("/privacy/delete-account");
    return response.data;
  },

  rectifyData: async (data: any) => {
    const response = await api.post("/privacy/rectify-data", data);
    return response.data;
  },

  getProcessingActivities: async () => {
    const response = await api.get("/privacy/processing-activities");
    return response.data;
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async () => {
    const response = await api.get("/dashboard/overview");
    return response.data;
  },
  getProductStats: async () => {
    const response = await api.get("/dashboard/products/stats");
    return response.data;
  },
  getOrderStats: async (days: number = 30) => {
    const response = await api.get("/dashboard/orders/stats", { params: { days } });
    return response.data;
  },
  getRevenueTimeline: async (days: number = 30) => {
    const response = await api.get("/dashboard/revenue/timeline", { params: { days } });
    return response.data;
  },
  getAlerts: async () => {
    const response = await api.get("/dashboard/alerts");
    return response.data;
  },
};

// Marketplace Integrations API
export const integrationsApi = {
  getAll: async () => {
    const response = await api.get("/marketplace-integrations/");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/marketplace-integrations/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/marketplace-integrations/", data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/marketplace-integrations/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/marketplace-integrations/${id}`);
    return response.data;
  },

  testConnection: async (id: number) => {
    const response = await api.post(`/marketplace-integrations/${id}/test-connection`);
    return response.data;
  },

  getStats: async (id: number) => {
    const response = await api.get(`/marketplace-integrations/${id}/stats`);
    return response.data;
  },
};

// Sync Logs API
export const syncLogsApi = {
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    marketplace?: string;
    product_id?: number;
    status?: string;
    operation?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const response = await api.get("/sync-logs/", { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/sync-logs/${id}`);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/sync-logs/${id}`);
    return response.data;
  },

  getByProduct: async (productId: number) => {
    const response = await api.get(`/sync-logs/product/${productId}/logs`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/sync-logs/stats/summary");
    return response.data;
  },
};

// Marketplace Links API
export const marketplaceLinksApi = {
  getAll: async (params?: {
    skip?: number;
    limit?: number;
    marketplace?: string;
    sync_status?: string;
    product_id?: number;
  }) => {
    const response = await api.get("/marketplace-links/", { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/marketplace-links/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/marketplace-links/", data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/marketplace-links/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/marketplace-links/${id}`);
    return response.data;
  },

  triggerSync: async (id: number) => {
    const response = await api.post(`/marketplace-links/${id}/sync`);
    return response.data;
  },

  getByProduct: async (productId: number) => {
    const response = await api.get(`/marketplace-links/product/${productId}/links`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/marketplace-links/stats/summary");
    return response.data;
  },
};

// Health check
export const healthApi = {
  check: async () => {
    const response = await api.get("/health");
    return response.data;
  },
};

// User API
export const userApi = {
  getMlAccess: async (email: string) => {
    const response = await api.get(`/users/ml-access/${email}`);
    return response.data;
  },
};

// Error handling utility
export const handleApiError = (error: AxiosError): string => {
  if (error.response?.data) {
    const data = error.response.data as any;
    return data.detail || data.message || "Erro desconhecido";
  }
  if (error.message) {
    return error.message;
  }
  return "Erro de conexão";
};
