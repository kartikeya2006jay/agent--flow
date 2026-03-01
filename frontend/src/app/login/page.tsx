'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Bot, Mail, Lock, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Demo mode - any credentials work
      await new Promise(resolve => setTimeout(resolve, 800))

      // Save user session to localStorage
      const user = {
        id: `user_${Date.now()}`,
        username: username || 'demo_user',
        email: `${username || 'demo'}@example.com`,
        role: 'admin',
        createdAt: new Date().toISOString(),
      }

      localStorage.setItem('agentflow_user', JSON.stringify(user))
      localStorage.setItem('agentflow_token', 'demo_token_' + Date.now())

      toast({
        title: isLogin ? '✅ Welcome Back!' : '✅ Account Created!',
        description: `Signed in as ${user.username}`,
      })

      // Redirect to dashboard
      setTimeout(() => router.push('/dashboard'), 800)

    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: '❌ Error',
        description: err.message || 'Failed to authenticate',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30">
            <Bot className="h-8 w-8 text-white"/>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">AgentFlow OS</h1>
          <p className="text-slate-600">Governed AI Agent Orchestration</p>
        </div>

        {/* Auth Card */}
        <Card className="card shadow-xl border-2 border-slate-200">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">{isLogin ? 'Sign In' : 'Create Account'}</CardTitle>
            <CardDescription>{isLogin ? 'Welcome back! Sign in to continue.' : 'Create your account to get started'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="font-medium">Choose a Username</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-medium">Create a Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-10 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 gap-2" disabled={isLoading}>
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin"/>Processing...</> : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-blue-600 hover:underline"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Mode Badge */}
        <div className="text-center space-y-2">
          <Badge className="bg-green-100 text-green-700 border-green-200 gap-2">
            <CheckCircle className="h-3 w-3"/>Demo Mode Active
          </Badge>
          <p className="text-xs text-slate-500">Demo mode: Any credentials work • No data stored on server</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <p className="text-2xl font-bold text-blue-600">5+</p>
            <p className="text-xs text-slate-500">Agents</p>
          </div>
          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <p className="text-2xl font-bold text-purple-600">100%</p>
            <p className="text-xs text-slate-500">Compliant</p>
          </div>
          <div className="p-3 rounded-xl bg-white border border-slate-200">
            <p className="text-2xl font-bold text-green-600">60s</p>
            <p className="text-xs text-slate-500">Auto Demo</p>
          </div>
        </div>
      </div>
    </div>
  )
}
