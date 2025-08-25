import { create } from 'zustand'
import { authApi, tokenStorage } from '@/lib/api'
import { User, LoginRequest, RegisterRequest, AuthToken } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => void
  loadUser: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  
  login: async (credentials: LoginRequest) => {
    set({ isLoading: true })
    try {
      const tokenData: AuthToken = await authApi.login(credentials)
      const { access_token } = tokenData
      
      // Store token
      tokenStorage.set(access_token)
      
      // Update state
      set({ 
        token: access_token, 
        isAuthenticated: true,
        isLoading: false 
      })
      
      // Note: In a real app, you might want to fetch user data here
      // For now, we'll extract basic info from the token if needed
      
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },
  
  register: async (userData: RegisterRequest) => {
    set({ isLoading: true })
    try {
      const user: User = await authApi.register(userData)
      
      // Auto login after registration
      await get().login({ 
        username: userData.email, 
        password: userData.password 
      })
      
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },
  
  logout: () => {
    tokenStorage.remove()
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false,
      isLoading: false 
    })
  },
  
  loadUser: () => {
    const token = tokenStorage.get()
    if (token) {
      set({ 
        token, 
        isAuthenticated: true 
      })
      
      // Here you could decode the JWT token to get user info
      // or make an API call to get current user data
    }
  },
  
  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
}))