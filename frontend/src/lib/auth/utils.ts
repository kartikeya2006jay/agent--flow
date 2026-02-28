import { config } from '../config'
import { User } from '@/types'

const STORAGE_KEYS = {
  token: config.auth.tokenKey,
  user: config.auth.userKey,
  meta: `${config.auth.tokenKey}_meta`,
}

export const authStorage = {
  // Save auth data with remember preference
  save: (token: string, user: User, remember: boolean): void => {
    if (typeof window === 'undefined') return
    
    const storage = remember ? window.localStorage : window.sessionStorage
    const meta = { remember, savedAt: new Date().toISOString() }
    
    storage.setItem(STORAGE_KEYS.token, token)
    storage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
    storage.setItem(STORAGE_KEYS.meta, JSON.stringify(meta))
    
    // If remember=true, also copy to localStorage for cross-tab sync
    if (remember) {
      window.localStorage.setItem(STORAGE_KEYS.token, token)
      window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
      window.localStorage.setItem(STORAGE_KEYS.meta, JSON.stringify(meta))
    }
  },
  
  // Load auth data (tries localStorage first, then sessionStorage)
  load: (): { token: string | null; user: User | null; remember: boolean } => {
    if (typeof window === 'undefined') return { token: null, user: null, remember: false }
    
    // Try localStorage first (persistent)
    let token = window.localStorage.getItem(STORAGE_KEYS.token)
    let userStr = window.localStorage.getItem(STORAGE_KEYS.user)
    let metaStr = window.localStorage.getItem(STORAGE_KEYS.meta)
    
    // Fallback to sessionStorage (temporary)
    if (!token) {
      token = window.sessionStorage.getItem(STORAGE_KEYS.token)
      userStr = window.sessionStorage.getItem(STORAGE_KEYS.user)
      metaStr = window.sessionStorage.getItem(STORAGE_KEYS.meta)
    }
    
    const user = userStr ? JSON.parse(userStr) : null
    const meta = metaStr ? JSON.parse(metaStr) : { remember: false }
    
    return { token, user, remember: meta.remember || false }
  },
  
  // Clear all auth data
  clear: (): void => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(STORAGE_KEYS.token)
    window.localStorage.removeItem(STORAGE_KEYS.user)
    window.localStorage.removeItem(STORAGE_KEYS.meta)
    window.sessionStorage.removeItem(STORAGE_KEYS.token)
    window.sessionStorage.removeItem(STORAGE_KEYS.user)
    window.sessionStorage.removeItem(STORAGE_KEYS.meta)
  },
  
  // Check if token looks valid (basic JWT structure)
  isValidToken: (token: string | null): boolean => {
    if (!token) return false
    const parts = token.split('.')
    return parts.length === 3 && parts[0] === 'eyJ'
  }
}

// Convenience exports
export const saveAuth = authStorage.save
export const loadAuth = authStorage.load
export const clearAuth = authStorage.clear
export const isValidToken = authStorage.isValidToken

// Backwards compatibility aliases
export const setAuthToken = (token: string, user: User, remember = true) => 
  saveAuth(token, user, remember)
export const getAuthToken = () => loadAuth().token
export const getAuthUser = () => loadAuth().user
