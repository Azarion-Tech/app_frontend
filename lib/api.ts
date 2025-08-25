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
    skip?: number;
    limit?: number;
    status?: string;
  }) => {
    const response = await api.get("/jobs", { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  cancel: async (id: number) => {
    const response = await api.post(`/jobs/${id}/cancel`);
    return response.data;
  },

  retry: async (id: number) => {
    const response = await api.post(`/jobs/${id}/retry`);
    return response.data;
  },

  // Trigger sync jobs
  syncProducts: async (marketplace?: string) => {
    const response = await api.post("/jobs/sync-products", { marketplace });
    return response.data;
  },

  syncOrders: async (marketplace?: string) => {
    const response = await api.post("/jobs/sync-orders", { marketplace });
    return response.data;
  },
};

// Privacy/LGPD API
export const privacyApi = {
  exportData: async () => {
    const response = await api.get("/privacy/export");
    return response.data;
  },

  deleteData: async () => {
    const response = await api.delete("/privacy/delete");
    return response.data;
  },

  rectifyData: async (data: any) => {
    const response = await api.put("/privacy/rectify", data);
    return response.data;
  },

  getAuditLog: async (params?: { skip?: number; limit?: number }) => {
    const response = await api.get("/privacy/audit-log", { params });
    return response.data;
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async () => {
    const response = await api.get("/dashboard/stats");
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
