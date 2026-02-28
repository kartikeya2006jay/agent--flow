import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { config } from '../config'
import { User } from '@/types'
import { loadAuth, saveAuth, clearAuth, isValidToken } from './utils'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  // Sync with storage
  syncFromStorage: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Actions
      setUser: (user) => set({ user, isAuthenticated: true, error: null }),
      
      setToken: (token) => {
        // Validate token before storing
        if (!isValidToken(token)) {
          set({ error: 'Invalid token format' })
          return
        }
        set({ token, isAuthenticated: true, error: null })
      },
      
      logout: () => {
        clearAuth()
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false, 
          error: null 
        })
      },
      
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      // Sync state with localStorage/sessionStorage on mount
      syncFromStorage: () => {
        const { token, user, remember } = loadAuth()
        if (token && user && isValidToken(token)) {
          set({ token, user, isAuthenticated: true, error: null })
        }
      },
    }),
    {
      name: config.auth.tokenKey,
      storage: createJSONStorage(() => ({
        // Custom storage that respects "remember me"
        getItem: (name) => {
          const { token, user } = loadAuth()
          if (name === config.auth.tokenKey) return JSON.stringify(token)
          if (name === config.auth.userKey) return JSON.stringify(user)
          return null
        },
        setItem: (name, value) => {
          const { token: existingToken, user: existingUser, remember } = loadAuth()
          if (name === config.auth.tokenKey) {
            const token = JSON.parse(value)
            if (existingUser) saveAuth(token, existingUser, remember)
          }
          if (name === config.auth.userKey) {
            const user = JSON.parse(value)
            if (existingToken) saveAuth(existingToken, user, remember)
          }
        },
        removeItem: (name) => clearAuth(),
      })),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Export a hook that auto-syncs on first use
export const useAuth = () => {
  const store = useAuthStore()
  // Auto-sync from storage on first render
  if (!store.isAuthenticated && !store.isLoading) {
    store.syncFromStorage()
  }
  return store
}
