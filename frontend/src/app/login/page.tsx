'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { config } from '@/lib/config'

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('agentflow_token')
    const userStr = localStorage.getItem('agentflow_user')
    if (token && userStr) {
      console.log('✅ Found saved auth, redirecting...')
      router.replace('/dashboard')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const form = e.currentTarget
    const username = (form.elements.namedItem('username') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const remember = (form.elements.namedItem('remember') as HTMLInputElement).checked
    
    console.log('🔐 Attempting auth:', { username, remember, mode })
    
    try {
      // Direct fetch to backend - no abstraction layers
      const response = await fetch(`${config.api.baseUrl}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username, password })
      })
      
      const data = await response.json()
      console.log('📡 Backend response:', data)
      
      if (!response.ok || data.detail) {
        throw new Error(data.detail || `HTTP ${response.status}`)
      }
      
      if (data.access_token && data.user) {
        // Choose storage based on "remember me"
        const storage = remember ? localStorage : sessionStorage
        
        // Save auth data
        storage.setItem('agentflow_token', data.access_token)
        storage.setItem('agentflow_user', JSON.stringify(data.user))
        
        console.log('✅ Auth saved, redirecting to dashboard...')
        
        // Force redirect (more reliable than router.push in some cases)
        window.location.href = '/dashboard'
        return // Prevent further execution
      }
      
      throw new Error('Invalid response from server')
      
    } catch (err: any) {
      console.error('❌ Auth error:', err)
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-6 border rounded-lg bg-card">
        <h1 className="text-2xl font-bold mb-2">
          {config.app.name} - {mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </h1>
        <p className="text-muted-foreground mb-6">
          {mode === 'signin' 
            ? 'Enter your credentials to continue' 
            : 'Create your account to get started'}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {mode === 'signin' ? 'Username or Email' : 'Choose a Username'}
            </label>
            <input
              name="username"
              type="text"
              required
              disabled={loading}
              className="w-full p-2 border rounded bg-background"
              placeholder="Enter username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              {mode === 'signin' ? 'Password' : 'Create a Password'}
            </label>
            <input
              name="password"
              type="password"
              required
              disabled={loading}
              className="w-full p-2 border rounded bg-background"
              placeholder="Enter password"
            />
          </div>
          
          <label className="flex items-center gap-2">
            <input 
              name="remember" 
              type="checkbox" 
              defaultChecked 
              disabled={loading}
            />
            <span className="text-sm">Keep me signed in</span>
          </label>
          
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </p>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 bg-primary text-primary-foreground rounded font-medium disabled:opacity-50"
          >
            {loading ? 'Processing...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
          </span>{' '}
          <button
            type="button"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
            className="text-primary hover:underline font-medium"
            disabled={loading}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
        
        {config.app.env === 'development' && (
          <p className="mt-4 text-xs text-muted-foreground text-center border-t pt-3">
            Demo mode: Any credentials work • Check console for debug logs
          </p>
        )}
      </div>
    </div>
  )
}
