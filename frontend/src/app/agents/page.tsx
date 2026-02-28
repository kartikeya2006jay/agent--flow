'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreateAgentModal } from '@/components/agents/create-agent-modal'
import { Bot, Shield, GitBranch, Zap, Database, TrendingUp, Plus, ArrowLeft } from 'lucide-react'

export default function AgentsPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<any[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const loadAgents = () => {
    const builtIn = [
      { id: 'approve_refund', name: 'Approve Refund', target_agents: ['support', 'finance'], risk_level: 'medium', description: 'Customer refund approval' },
      { id: 'onboard_employee', name: 'Onboard Employee', target_agents: ['hr', 'it_ops'], risk_level: 'low', description: 'Employee onboarding' },
      { id: 'create_ticket', name: 'Create Ticket', target_agents: ['support'], risk_level: 'low', description: 'Ticket routing' },
      { id: 'issue_payment', name: 'Issue Payment', target_agents: ['finance'], risk_level: 'high', description: 'Vendor payment' },
      { id: 'update_crm', name: 'Update CRM', target_agents: ['sales'], risk_level: 'low', description: 'CRM sync' },
    ]
    const custom = JSON.parse(localStorage.getItem('agentflow_custom_actions') || '[]')
    setAgents([...builtIn, ...custom.map((a: any) => ({ ...a, isCustom: true }))])
  }

  useEffect(() => {
    loadAgents()
    const handler = () => loadAgents()
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const getIcon = (agents?: string[]) => {
    if (agents?.includes('finance')) return Shield
    if (agents?.includes('hr')) return GitBranch
    if (agents?.includes('sales')) return TrendingUp
    if (agents?.includes('support')) return Zap
    if (agents?.includes('it_ops')) return Database
    return Bot
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-20">
      <header className="border-b bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-1"><ArrowLeft className="h-4 w-4"/>Back</Button>
            <div><h1 className="text-xl font-bold">Agent Library</h1><p className="text-sm text-slate-500">{agents.length} agents available</p></div>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 text-white gap-2"><Plus className="h-4 w-4"/>Create Custom Agent</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => {
            const Icon = getIcon(agent.target_agents)
            return (
              <Card key={agent.id} className={`border-2 ${agent.isCustom ? 'border-purple-300 bg-purple-50/30' : 'border-slate-200'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${agent.isCustom ? 'bg-purple-100' : 'bg-blue-100'}`}>
                        <Icon className={`h-5 w-5 ${agent.isCustom ? 'text-purple-600' : 'text-blue-600'}`}/>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <CardDescription className="text-sm">{agent.target_agents?.join(' → ')}</CardDescription>
                      </div>
                    </div>
                    {agent.isCustom && <Badge className="bg-purple-100 text-purple-800">Custom</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-3">{agent.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Risk:</span>
                    <Badge className={agent.risk_level === 'low' ? 'bg-green-100 text-green-800' : agent.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                      {agent.risk_level?.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>

      <CreateAgentModal open={isCreateOpen} onOpenChange={setIsCreateOpen} onCreated={loadAgents}/>
    </div>
  )
}
