'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { config } from '@/lib/config'
import { healthService, actionsService } from '@/lib/api/services'
import { ArrowRight, Bot, Shield, Zap, Activity, CheckCircle, Layers, Lock } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking')
  const [stats, setStats] = useState({ actions: 0, workflows: 0, agents: 5 })

  useEffect(() => {
    const checkAuthAndBackend = async () => {
      const token = localStorage.getItem('agentflow_token')
      const userStr = localStorage.getItem('agentflow_user')
      
      if (token && userStr) {
        router.replace('/dashboard')
        return
      }

      try {
        const health = await healthService.check()
        if (health.data?.status === 'healthy') {
          setBackendStatus('online')
          const actionsRes = await actionsService.list()
          if (actionsRes.data) {
            setStats(prev => ({ ...prev, actions: actionsRes.data.length }))
          }
        } else {
          setBackendStatus('offline')
        }
      } catch (error) {
        setBackendStatus('offline')
      } finally {
        setIsChecking(false)
      }
    }

    checkAuthAndBackend()
  }, [router])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" 
          />
          <p className="text-muted-foreground">Loading {config.app.name}...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">{config.app.name}</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              v{config.app.version}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link href="/login?mode=signup" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <Zap className="h-4 w-4" />
            <span>Multi-Agent Governance Platform</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Deploy Agent Swarms{' '}
            <span className="text-primary">Safely & Governed</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Orchestrate enterprise AI agents with standardized protocols, 
            policy enforcement, human-in-loop approval, and immutable audit trails.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/login?mode=signup" className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                Start Orchestrating
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/about" className="w-full sm:w-auto px-8 py-3 border border-input bg-background rounded-lg font-medium hover:bg-muted/50 transition-all flex items-center justify-center gap-2">
                See How It Works
              </Link>
            </motion.div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={backendStatus === 'online' ? 'text-green-600' : 'text-red-600'}>
              {backendStatus === 'online' ? 'Backend Online' : 'Backend Offline'}
            </span>
            {backendStatus === 'online' && (
              <span className="text-muted-foreground">
                • {stats.actions} actions available • {stats.agents} universal agents
              </span>
            )}
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20 bg-muted/30 rounded-3xl">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why {config.app.name}?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Enterprise-grade governance for AI agent orchestration</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Shield, title: 'Policy Enforcement', desc: 'RBAC + ABAC rules evaluated before every action', color: 'text-blue-600' },
            { icon: Lock, title: 'Human-in-Loop', desc: 'Auto-escalate high-risk decisions to humans', color: 'text-purple-600' },
            { icon: Layers, title: '4-Plane Architecture', desc: 'Interface → Control → Data → Agents', color: 'text-green-600' },
            { icon: Activity, title: 'Immutable Audit', desc: 'Every action traced, logged, compliance-ready', color: 'text-orange-600' },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
              className="p-6 bg-background rounded-xl border transition-shadow"
            >
              <feature.icon className={`h-10 w-10 ${feature.color} mb-4`} />
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Live Platform Stats</h2>
          <p className="text-muted-foreground">Real-time data from your backend</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { label: 'Available Actions', value: stats.actions, icon: CheckCircle },
            { label: 'Universal Agents', value: stats.agents, icon: Bot },
            { label: 'Backend Status', value: backendStatus === 'online' ? 'Healthy' : 'Offline', icon: Activity },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border text-center"
            >
              <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Orchestrate?</h2>
          <p className="mb-8 opacity-90 max-w-xl mx-auto">
            Start deploying governed agent workflows in minutes. No hardcoding, full audit trails, enterprise-ready.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/login?mode=signup" className="inline-flex items-center gap-2 px-8 py-3 bg-primary-foreground text-primary rounded-lg font-medium hover:bg-primary-foreground/90 transition-all">
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>{config.app.name} v{config.app.version} • {config.app.env === 'development' ? 'Development Mode' : 'Production'}</p>
          <p className="mt-2">
            <Link href="/about" className="hover:text-foreground">About</Link>
            {' • '}
            <Link href="/login" className="hover:text-foreground">Sign In</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
