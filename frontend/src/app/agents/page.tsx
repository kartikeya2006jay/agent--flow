'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CreateAgentModal } from '@/components/agents/create-agent-modal'
import { Bot, Shield, GitBranch, Zap, Database, TrendingUp, Plus, ArrowLeft, Eye, Activity, Play, X, Search } from 'lucide-react'

interface Agent {
  id: string
  name: string
  description: string
  target_agents: string[]
  risk_level: string
  estimated_cost?: number
  compliance_tags?: string[]
  isCustom?: boolean
}

interface Workflow {
  id: string
  action_id: string
  action_name: string
  status: string
  created_at: string
  trace_id: string
  result?: any
}

export default function AgentsPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const loadAgents = () => {
    const builtIn: Agent[] = [
      { id: 'approve_refund', name: 'Approve Refund', description: 'Customer refund approval with fraud detection', target_agents: ['support', 'finance'], risk_level: 'medium', estimated_cost: 0.02, compliance_tags: ['PCI-DSS', 'GDPR', 'SOX'] },
      { id: 'onboard_employee', name: 'Onboard Employee', description: 'Automated employee onboarding with IT provisioning', target_agents: ['hr', 'it_ops'], risk_level: 'low', estimated_cost: 0.03, compliance_tags: ['HIPAA', 'SOC2'] },
      { id: 'create_ticket', name: 'Create Ticket', description: 'Intelligent ticket routing with priority assessment', target_agents: ['support'], risk_level: 'low', estimated_cost: 0.01, compliance_tags: ['ISO27001'] },
      { id: 'issue_payment', name: 'Issue Payment', description: 'Vendor payment processing with approval workflows', target_agents: ['finance'], risk_level: 'high', estimated_cost: 0.05, compliance_tags: ['PCI-DSS', 'SOX', 'AML'] },
      { id: 'update_crm', name: 'Update CRM', description: 'Lead scoring and CRM synchronization', target_agents: ['sales'], risk_level: 'low', estimated_cost: 0.01, compliance_tags: ['GDPR', 'CCPA'] },
    ]
    const custom = JSON.parse(localStorage.getItem('agentflow_custom_actions') || '[]').map((a: any) => ({ ...a, isCustom: true }))
    setAgents([...builtIn, ...custom])
  }

  const loadWorkflows = () => {
    const wf = JSON.parse(localStorage.getItem('agentflow_workflows') || '[]')
    setWorkflows(wf)
  }

  useEffect(() => {
    loadAgents()
    loadWorkflows()
    const handler = () => { loadAgents(); loadWorkflows() }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const handleAgentCreated = () => {
    loadAgents()
  }

  const getIcon = (agents?: string[]) => {
    if (agents?.includes('finance')) return Shield
    if (agents?.includes('hr')) return GitBranch
    if (agents?.includes('sales')) return TrendingUp
    if (agents?.includes('support')) return Zap
    if (agents?.includes('it_ops')) return Database
    return Bot
  }

  const getWorkflowsForAgent = (agentId: string) => {
    return workflows.filter(w => w.action_id === agentId)
  }

  const filteredAgents = agents.filter(a => 
    !searchQuery || 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-20">
      <header className="border-b bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => {setSelectedAgent(null); router.back()}} className="gap-1"><ArrowLeft className="h-4 w-4"/>Back</Button>
            <div><h1 className="text-xl font-bold">Agent Library</h1><p className="text-sm text-slate-500">{agents.length} agents available</p></div>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 text-white hover:bg-blue-700 gap-2"><Plus className="h-4 w-4"/>Create Custom Agent</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Search */}
        {!selectedAgent && (
          <Card className="card">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                <Input placeholder="Search agents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input pl-10"/>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agent Detail View */}
        {selectedAgent && (
          <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="space-y-6">
            {/* Agent Info Card */}
            <Card className="card border-2 border-blue-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${selectedAgent.isCustom ? 'bg-purple-100' : 'bg-blue-100'}`}>
                      {(() => {
                        const Icon = getIcon(selectedAgent.target_agents)
                        return <Icon className={`h-6 w-6 ${selectedAgent.isCustom ? 'text-purple-600' : 'text-blue-600'}`}/>
                      })()}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{selectedAgent.name}</CardTitle>
                      <CardDescription className="text-slate-600">{selectedAgent.description}</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedAgent(null)} className="gap-1"><X className="h-4 w-4"/>Close</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-slate-500"/>
                    <span className="text-sm text-slate-600">Agents:</span>
                    <div className="flex gap-1">
                      {selectedAgent.target_agents.map((agent, i) => (
                        <Badge key={agent} variant="secondary" className="text-xs">{agent.replace('_', ' ')}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">Risk:</span>
                    <Badge className={selectedAgent.risk_level === 'low' ? 'bg-green-100 text-green-800' : selectedAgent.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                      {selectedAgent.risk_level?.toUpperCase()}
                    </Badge>
                  </div>
                  {selectedAgent.estimated_cost && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">Cost:</span>
                      <span className="font-medium">${selectedAgent.estimated_cost}</span>
                    </div>
                  )}
                </div>
                {selectedAgent.compliance_tags && selectedAgent.compliance_tags.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Compliance:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedAgent.compliance_tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={() => router.push(`/actions/${selectedAgent.id}`)} className="gap-2"><Play className="h-4 w-4"/>Execute Action</Button>
                  <Button variant="outline" onClick={() => setIsCreateOpen(true)} className="gap-2"><Plus className="h-4 w-4"/>Create Similar Action</Button>
                </div>
              </CardContent>
            </Card>

            {/* Workflows Performed by This Agent */}
            <Card className="card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-blue-600"/>Workflows Performed by {selectedAgent.name}</CardTitle>
                <CardDescription>{getWorkflowsForAgent(selectedAgent.id).length} executions</CardDescription>
              </CardHeader>
              <CardContent>
                {getWorkflowsForAgent(selectedAgent.id).length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <Activity className="h-8 w-8 mx-auto mb-3 opacity-50"/>
                    <p className="text-sm">No workflows executed yet for this agent</p>
                    <Button onClick={() => router.push(`/actions/${selectedAgent.id}`)} className="mt-4 gap-2"><Play className="h-4 w-4"/>Execute First Action</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getWorkflowsForAgent(selectedAgent.id).map((wf) => (
                      <motion.div key={wf.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="p-4 border border-slate-200 rounded-xl hover:border-blue-500/50 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-2.5 h-2.5 rounded-full ${wf.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'}`}/>
                            <div>
                              <p className="font-medium text-slate-900">{wf.action_name}</p>
                              <p className="text-xs text-slate-500 font-mono">{wf.trace_id}</p>
                              <p className="text-xs text-slate-400">{new Date(wf.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={wf.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{wf.status}</Badge>
                            <Button variant="outline" size="sm" onClick={() => router.push(`/workflows/${wf.id}`)}><Eye className="h-4 w-4"/></Button>
                          </div>
                        </div>
                        {wf.result && Object.keys(wf.result).length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <p className="text-xs text-slate-500 mb-1">Result:</p>
                            <pre className="text-xs bg-slate-50 p-3 rounded overflow-auto max-h-20">{JSON.stringify(wf.result, null, 2)}</pre>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Agent Grid */}
        {!selectedAgent && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAgents.map((agent, i) => {
              const Icon = getIcon(agent.target_agents)
              const workflowCount = workflows.filter(w => w.action_id === agent.id).length
              return (
                <motion.div key={agent.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
                  <Card className={`card h-full border-2 hover:border-blue-500/50 transition-all ${agent.isCustom ? 'border-purple-300 bg-purple-50/30' : 'border-slate-200'}`}>
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
                      {agent.compliance_tags && agent.compliance_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {agent.compliance_tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                          {agent.compliance_tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">+{agent.compliance_tags.length - 3}</Badge>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm pt-2 border-t">
                        <span className="text-slate-500">Risk:</span>
                        <Badge className={agent.risk_level === 'low' ? 'bg-green-100 text-green-800' : agent.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                          {agent.risk_level?.toUpperCase()}
                        </Badge>
                      </div>
                      {agent.estimated_cost && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Est. cost:</span>
                          <span className="font-bold text-slate-900">${agent.estimated_cost}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm pt-2 border-t">
                        <span className="text-slate-500">Executions:</span>
                        <span className="font-bold text-blue-600">{workflowCount}</span>
                      </div>
                      <div className="flex gap-2 pt-3">
                        <Button onClick={() => setSelectedAgent(agent)} variant="outline" size="sm" className="flex-1 gap-1"><Eye className="h-4 w-4"/>View Details</Button>
                        <Button onClick={() => router.push(`/actions/${agent.id}`)} size="sm" className="flex-1 gap-1"><Play className="h-4 w-4"/>Execute</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}

        {filteredAgents.length === 0 && !selectedAgent && (
          <Card className="card"><CardContent className="p-12 text-center"><Bot className="h-12 w-12 text-slate-400 mx-auto mb-4"/><h3 className="text-lg font-semibold mb-2">No agents found</h3><p className="text-slate-600">Try a different search or create a custom agent</p></CardContent></Card>
        )}
      </main>

      <CreateAgentModal open={isCreateOpen} onOpenChange={setIsCreateOpen} onCreated={handleAgentCreated}/>
    </div>
  )
}
