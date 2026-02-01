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
  isLoading: true,  // Inicia como true até verificar se existe token
  isAuthenticated: false,
  
  login: async (credentials: LoginRequest) => {
    set({ isLoading: true })
    try {
      const tokenData: AuthToken = await authApi.login(credentials)
      const { access_token } = tokenData

      // Store token
      tokenStorage.set(access_token)

      // Update state with token first
      set({
        token: access_token,
        isAuthenticated: true,
      })

      // Fetch user data
      const userData = await authApi.getCurrentUser()

      set({
        user: userData,
        isLoading: false
      })

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
  
  loadUser: async () => {
    const token = tokenStorage.get()
    if (token) {
      set({
        token,
        isAuthenticated: true,
        isLoading: true
      })

      try {
        // Fetch current user data
        const userData = await authApi.getCurrentUser()
        set({
          user: userData,
          isLoading: false
        })
      } catch (error) {
        // If token is invalid, clear it
        tokenStorage.remove()
        set({
          token: null,
          isAuthenticated: false,
          user: null,
          isLoading: false
        })
      }
    } else {
      // Sem token - finaliza carregamento e marca como não autenticado
      set({
        isLoading: false,
        isAuthenticated: false
      })
    }
  },
  
  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
}))