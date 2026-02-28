'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, RefreshCw, Bot, Shield, GitBranch, Zap, Database, TrendingUp, Activity, Clock, CheckCircle } from 'lucide-react'

interface AgentNode {
  id: string
  name: string
  type: 'support' | 'hr' | 'finance' | 'it_ops' | 'sales'
  status: 'active' | 'processing' | 'idle' | 'error'
  x: number
  y: number
  workflows: number
  successRate: number
}

interface Connection {
  from: string
  to: string
  active: boolean
  messages: number
}

export default function OrchestrationPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<AgentNode[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [stats, setStats] = useState({ totalWorkflows: 0, activeAgents: 0, avgLatency: 0 })

  // Initialize agent network
  useEffect(() => {
    const initialAgents: AgentNode[] = [
      { id: 'support', name: 'Support Agent', type: 'support', status: 'active', x: 50, y: 30, workflows: 0, successRate: 95 },
      { id: 'finance', name: 'Finance Agent', type: 'finance', status: 'idle', x: 80, y: 50, workflows: 0, successRate: 98 },
      { id: 'hr', name: 'HR Agent', type: 'hr', status: 'idle', x: 20, y: 50, workflows: 0, successRate: 97 },
      { id: 'it_ops', name: 'IT/Ops Agent', type: 'it_ops', status: 'idle', x: 35, y: 70, workflows: 0, successRate: 96 },
      { id: 'sales', name: 'Sales Agent', type: 'sales', status: 'idle', x: 65, y: 70, workflows: 0, successRate: 94 },
    ]
    setAgents(initialAgents)

    const initialConnections: Connection[] = [
      { from: 'support', to: 'finance', active: false, messages: 0 },
      { from: 'hr', to: 'it_ops', active: false, messages: 0 },
      { from: 'support', to: 'sales', active: false, messages: 0 },
    ]
    setConnections(initialConnections)
  }, [])

  // ✅ LIVE SIMULATION - Animate agent activity
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        // Random status changes for demo
        const rand = Math.random()
        let newStatus = agent.status
        if (rand > 0.8) newStatus = 'processing'
        else if (rand > 0.6) newStatus = 'active'
        else newStatus = 'idle'
        
        return {
          ...agent,
          status: newStatus,
          workflows: agent.workflows + (rand > 0.7 ? 1 : 0),
        }
      }))

      // Activate connections randomly
      setConnections(prev => prev.map(conn => ({
        ...conn,
        active: Math.random() > 0.7,
        messages: conn.messages + (Math.random() > 0.7 ? 1 : 0),
      })))

      // Update stats
      const workflows = JSON.parse(localStorage.getItem('agentflow_workflows') || '[]')
      setStats({
        totalWorkflows: workflows.length,
        activeAgents: agents.filter(a => a.status === 'active' || a.status === 'processing').length,
        avgLatency: Math.floor(Math.random() * 200) + 50,
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [agents])

  const getAgentIcon = (type: string) => {
    if (type === 'finance') return Shield
    if (type === 'hr') return GitBranch
    if (type === 'sales') return TrendingUp
    if (type === 'support') return Zap
    if (type === 'it_ops') return Database
    return Bot
  }

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'bg-green-500'
    if (status === 'processing') return 'bg-blue-500 animate-pulse'
    if (status === 'error') return 'bg-red-500'
    return 'bg-slate-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-20">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-1">
              <ArrowLeft className="h-4 w-4"/>Back
            </Button>
            <div>
              <h1 className="text-xl font-bold">Multi-Agent Orchestration</h1>
              <p className="text-sm text-slate-500">Live agent network visualization</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCw className="h-4 w-4"/>Refresh
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100"><Activity className="h-5 w-5 text-blue-600"/></div>
              <div><div className="text-2xl font-bold">{stats.totalWorkflows}</div><div className="text-xs text-slate-500">Total Workflows</div></div>
            </CardContent>
          </Card>
          <Card className="card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100"><Bot className="h-5 w-5 text-green-600"/></div>
              <div><div className="text-2xl font-bold">{stats.activeAgents}</div><div className="text-xs text-slate-500">Active Agents</div></div>
            </CardContent>
          </Card>
          <Card className="card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100"><Clock className="h-5 w-5 text-purple-600"/></div>
              <div><div className="text-2xl font-bold">{stats.avgLatency}ms</div><div className="text-xs text-slate-500">Avg Latency</div></div>
            </CardContent>
          </Card>
          <Card className="card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100"><CheckCircle className="h-5 w-5 text-orange-600"/></div>
              <div><div className="text-2xl font-bold">98%</div><div className="text-xs text-slate-500">Success Rate</div></div>
            </CardContent>
          </Card>
        </div>

        {/* Network Visualization */}
        <Card className="card border-2 border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600"/>
              Live Agent Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-[500px] bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200 overflow-hidden">
              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {connections.map((conn, i) => {
                  const fromAgent = agents.find(a => a.id === conn.from)
                  const toAgent = agents.find(a => a.id === conn.to)
                  if (!fromAgent || !toAgent) return null
                  return (
                    <motion.line
                      key={i}
                      x1={`${fromAgent.x}%`}
                      y1={`${fromAgent.y}%`}
                      x2={`${toAgent.x}%`}
                      y2={`${toAgent.y}%`}
                      stroke={conn.active ? '#3b82f6' : '#cbd5e1'}
                      strokeWidth={conn.active ? 3 : 1}
                      strokeDasharray={conn.active ? '5,5' : '0'}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ 
                        pathLength: 1, 
                        opacity: conn.active ? 1 : 0.3,
                        strokeDashoffset: conn.active ? -20 : 0
                      }}
                      transition={{ duration: 1.5, repeat: conn.active ? Infinity : 0, repeatDelay: 0.5 }}
                    />
                  )
                })}
              </svg>

              {/* Agent Nodes */}
              <AnimatePresence>
                {agents.map((agent) => {
                  const Icon = getAgentIcon(agent.type)
                  return (
                    <motion.div
                      key={agent.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${agent.x}%`, top: `${agent.y}%` }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                    >
                      <div className={`relative p-4 rounded-2xl bg-white border-2 shadow-lg ${
                        agent.status === 'processing' ? 'border-blue-500 shadow-blue-500/30' : 
                        agent.status === 'active' ? 'border-green-500 shadow-green-500/30' : 
                        'border-slate-300'
                      }`}>
                        {/* Status Indicator */}
                        <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full ${getStatusColor(agent.status)} border-2 border-white`}/>
                        
                        {/* Icon */}
                        <div className={`p-3 rounded-xl mb-2 ${
                          agent.type === 'finance' ? 'bg-blue-100' : 
                          agent.type === 'hr' ? 'bg-purple-100' : 
                          agent.type === 'sales' ? 'bg-orange-100' : 
                          agent.type === 'support' ? 'bg-green-100' : 'bg-slate-100'
                        }`}>
                          <Icon className={`h-6 w-6 ${
                            agent.type === 'finance' ? 'text-blue-600' : 
                            agent.type === 'hr' ? 'text-purple-600' : 
                            agent.type === 'sales' ? 'text-orange-600' : 
                            agent.type === 'support' ? 'text-green-600' : 'text-slate-600'
                          }`}/>
                        </div>
                        
                        {/* Info */}
                        <div className="text-center">
                          <div className="font-semibold text-sm text-slate-900">{agent.name}</div>
                          <div className="text-xs text-slate-500 mt-1">{agent.workflows} workflows</div>
                          <div className="text-xs text-green-600 font-medium mt-0.5">{agent.successRate}% success</div>
                        </div>

                        {/* Active Pulse Animation */}
                        {agent.status === 'processing' && (
                          <div className="absolute inset-0 rounded-2xl border-2 border-blue-500 animate-ping opacity-30"/>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-700 mb-2">Agent Status</div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"/><span>Active</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"/><span>Processing</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-400"/><span>Idle</span></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Details */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => {
            const Icon = getAgentIcon(agent.type)
            return (
              <Card key={agent.id} className="card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-blue-600"/>
                      <span className="font-semibold">{agent.name}</span>
                    </div>
                    <Badge className={agent.status === 'active' ? 'bg-green-100 text-green-800' : agent.status === 'processing' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}>
                      {agent.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Workflows:</span><span className="font-medium">{agent.workflows}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Success Rate:</span><span className="font-medium text-green-600">{agent.successRate}%</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Avg Latency:</span><span className="font-medium">{Math.floor(Math.random() * 200) + 50}ms</span></div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
