'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bot, Shield, GitBranch, Zap, Database, TrendingUp, Plus, Search, ArrowRight } from 'lucide-react'
import { CreateAgentModal } from '@/components/agents/create-agent-modal'

interface Agent {
  id: string
  name: string
  description: string
  target_agents: string[]
  risk_level: string
  estimated_cost: number
  compliance_tags: string[]
  isCustom?: boolean
}

export default function AgentsPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Load built-in + custom agents
  useEffect(() => {
    const builtIn: Agent[] = [
      { id: 'approve_refund', name: 'Approve Refund', description: 'Customer refund approval with fraud detection', target_agents: ['support', 'finance'], risk_level: 'medium', estimated_cost: 0.02, compliance_tags: ['PCI-DSS', 'GDPR', 'SOX'] },
      { id: 'onboard_employee', name: 'Onboard Employee', description: 'Automated employee onboarding with IT provisioning', target_agents: ['hr', 'it_ops'], risk_level: 'low', estimated_cost: 0.03, compliance_tags: ['HIPAA', 'SOC2'] },
      { id: 'create_ticket', name: 'Create Ticket', description: 'Intelligent ticket routing with priority assessment', target_agents: ['support'], risk_level: 'low', estimated_cost: 0.01, compliance_tags: ['ISO27001'] },
      { id: 'issue_payment', name: 'Issue Payment', description: 'Vendor payment processing with approval workflows', target_agents: ['finance'], risk_level: 'high', estimated_cost: 0.05, compliance_tags: ['PCI-DSS', 'SOX', 'AML'] },
      { id: 'update_crm', name: 'Update CRM', description: 'Lead scoring and CRM synchronization', target_agents: ['sales'], risk_level: 'low', estimated_cost: 0.01, compliance_tags: ['GDPR', 'CCPA'] },
    ]
    
    const custom = JSON.parse(localStorage.getItem('agentflow_custom_actions') || '[]').map((a: any) => ({ ...a, isCustom: true }))
    
    setAgents([...builtIn, ...custom])
  }, [])

  const handleAgentCreated = (newAgent: Agent) => {
    setAgents(prev => [...prev, { ...newAgent, isCustom: true }])
  }

  const getIcon = (agents?: string[]) => {
    if (agents?.includes('finance')) return Shield
    if (agents?.includes('hr')) return GitBranch
    if (agents?.includes('sales')) return TrendingUp
    if (agents?.includes('support')) return Zap
    if (agents?.includes('it_ops')) return Database
    return Bot
  }

  const filtered = agents.filter(a => 
    !searchQuery || 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <header className="border-b bg-white/80 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-1"><ArrowRight className="h-4 w-4 rotate-180"/>Back</Button>
            <div><h1 className="text-xl font-bold">Agent Library</h1><p className="text-sm text-slate-500">{agents.length} available agents</p></div>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 text-white hover:bg-blue-700 gap-2"><Plus className="h-4 w-4"/>Create Custom Agent</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Search */}
        <Card className="card">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
              <Input placeholder="Search agents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input pl-10"/>
            </div>
          </CardContent>
        </Card>

        {/* Agents Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((agent, i) => {
            const Icon = getIcon(agent.target_agents)
            return (
              <motion.div key={agent.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
                <Card className={`card h-full border-2 hover:border-blue-500/50 transition-all ${agent.isCustom ? 'border-purple-300 bg-purple-50/30' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${agent.isCustom ? 'bg-purple-100' : 'bg-blue-100'}`}>
                          <Icon className={`h-5 w-5 ${agent.isCustom ? 'text-purple-600' : 'text-blue-600'}`}/>
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-slate-900">{agent.name}</CardTitle>
                          <CardDescription className="text-sm text-slate-600">{agent.target_agents.join(' → ')}</CardDescription>
                        </div>
                      </div>
                      {agent.isCustom && <Badge className="bg-purple-100 text-purple-800 border-purple-200">Custom</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-slate-600">{agent.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.compliance_tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <span className="text-slate-500">Risk:</span>
                      <Badge className={agent.risk_level === 'low' ? 'bg-green-100 text-green-800' : agent.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                        {agent.risk_level.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Est. cost:</span>
                      <span className="font-bold text-slate-900">${agent.estimated_cost}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <Card className="card"><CardContent className="p-12 text-center"><Bot className="h-12 w-12 text-slate-400 mx-auto mb-4"/><h3 className="text-lg font-semibold mb-2">No agents found</h3><p className="text-slate-600">Try a different search or create a custom agent</p></CardContent></Card>
        )}
      </main>

      <CreateAgentModal open={isCreateOpen} onOpenChange={setIsCreateOpen} onCreated={handleAgentCreated}/>
    </div>
  )
}
