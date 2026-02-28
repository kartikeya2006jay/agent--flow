'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActions } from '@/hooks/use-actions'
import { config } from '@/lib/config'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bot, Shield, Zap, ArrowRight, Play, Loader2, GitBranch, Database, TrendingUp, Plus, X, Save } from 'lucide-react'
import { RAGChatbot } from '@/components/rag/rag-chatbot'
import { useToast } from '@/hooks/use-toast'

const getIcon = (agents?: string[]) => {
  if (agents?.includes('finance')) return Shield
  if (agents?.includes('hr')) return GitBranch
  if (agents?.includes('sales')) return TrendingUp
  if (agents?.includes('support')) return Zap
  if (agents?.includes('it_ops')) return Database
  return Bot
}

const getIndustry = (agents?: string[]) => {
  if (!agents) return 'Enterprise'
  if (agents.includes('finance')) return 'Finance & Accounting'
  if (agents.includes('hr')) return 'HR & Operations'
  if (agents.includes('sales')) return 'Sales & Marketing'
  if (agents.includes('support')) return 'Customer Support'
  if (agents.includes('it_ops')) return 'IT & DevOps'
  return 'Enterprise'
}

const getDomain = (agents?: string[]) => {
  if (!agents) return 'All'
  if (agents.includes('finance')) return 'Finance'
  if (agents.includes('hr')) return 'HR'
  if (agents.includes('sales')) return 'Sales'
  if (agents.includes('support')) return 'Support'
  if (agents.includes('it_ops')) return 'IT/Ops'
  return 'All'
}

const getCompliance = (agents?: string[]) => {
  if (!agents) return ['SOC2']
  const tags: string[] = []
  if (agents.includes('finance')) tags.push('PCI-DSS', 'SOX')
  if (agents.includes('hr')) tags.push('HIPAA', 'GDPR')
  if (agents.includes('support')) tags.push('GDPR', 'ISO27001')
  if (agents.includes('sales')) tags.push('GDPR', 'CCPA')
  if (agents.includes('it_ops')) tags.push('SOC2', 'ISO27001')
  return tags
}

export default function ActionsPage() {
  const { actions = [], isLoading, error, refetch, executeAction, createAction, isExecuting, isCreating } = useActions()
  const { toast } = useToast()
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('All')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [customAction, setCustomAction] = useState({ name: '', description: '', agents: [], risk_level: 'medium', estimated_cost: '0.01', compliance_tags: '' })

  const safeActions = Array.isArray(actions) ? actions : []
  const filteredActions = activeFilter === 'All' ? safeActions : safeActions.filter((a: any) => getDomain(a.target_agents) === activeFilter)

  const handleExecute = async (actionId: string) => {
    try {
      const action = safeActions.find((a: any) => a.id === actionId)
      const payload = {
        action: actionId,
        target_agents: action?.target_agents || ['support'],
         { order_id: `ORD-${Date.now()}`, amount: 500, reason: 'Demo' },
        context: { user_id: 'usr_demo', enterprise_id: 'demo', risk_level: action?.risk_level || 'medium' },
        timeout_ms: 30000
      }
      const result = await executeAction({ actionId, payload })
      toast({ title: '✅ Execution Started!', description: `Workflow: ${result.workflow_id}` })
      router.push(`/actions/${actionId}`)
    } catch (err: any) {
      toast({ variant: 'destructive', title: '❌ Failed', description: err.message })
    }
  }

  const handleCreateAction = async () => {
    if (!customAction.name || customAction.agents.length === 0) {
      toast({ variant: 'destructive', title: '❌ Error', description: 'Name and agents required' })
      return
    }
    try {
      await createAction({
        id: customAction.name.toLowerCase().replace(/\s+/g, '_'),
        name: customAction.name,
        description: customAction.description,
        target_agents: customAction.agents,
        risk_level: customAction.risk_level,
        estimated_cost: parseFloat(customAction.estimated_cost),
        compliance_tags: customAction.compliance_tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      })
      toast({ title: '✅ Created!', description: `${customAction.name} added` })
      setCustomAction({ name: '', description: '', agents: [], risk_level: 'medium', estimated_cost: '0.01', compliance_tags: '' })
      setIsCreateDialogOpen(false)
      refetch()
    } catch (err: any) {
      toast({ variant: 'destructive', title: '❌ Failed', description: err.message })
    }
  }

  const handleAddAgent = (agent: string) => {
    if (!customAction.agents.includes(agent)) setCustomAction(prev => ({ ...prev, agents: [...prev.agents, agent] }))
  }
  const handleRemoveAgent = (agent: string) => {
    setCustomAction(prev => ({ ...prev, agents: prev.agents.filter(a => a !== agent) }))
  }

  const availableAgents = [
    { id: 'support', name: 'Support', desc: 'Zendesk, Intercom' },
    { id: 'hr', name: 'HR', desc: 'Workday, BambooHR' },
    { id: 'finance', name: 'Finance', desc: 'Stripe, SAP' },
    { id: 'it_ops', name: 'IT/Ops', desc: 'Jira, ServiceNow' },
    { id: 'sales', name: 'Sales', desc: 'Salesforce, HubSpot' },
  ]

  if (isLoading) return <div className="p-6"><div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-4"/><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map(i => <div key={i} className="h-80 rounded-2xl bg-slate-100 animate-pulse" />)}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600"><Bot className="h-5 w-5 text-white"/></div>
            <div><h1 className="text-xl font-bold">Action Library</h1><p className="text-sm text-slate-500">{filteredActions.length} actions {activeFilter !== 'All' ? `in ${activeFilter}` : ''}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-700 gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>Live</Badge>
            <Link href="/dashboard"><Button variant="outline" size="sm">← Dashboard</Button></Link>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild><Button className="gap-2 btn-primary"><Plus className="h-4 w-4"/>Create Custom Agent</Button></DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Create Custom Agent</DialogTitle><DialogDescription>Define a new governed workflow</DialogDescription></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2"><Label>Action Name *</Label><Input placeholder="e.g., Process Invoice" value={customAction.name} onChange={(e) => setCustomAction(prev => ({ ...prev, name: e.target.value }))} className="input"/></div>
                  <div className="space-y-2"><Label>Description</Label><textarea placeholder="Describe..." value={customAction.description} onChange={(e) => setCustomAction(prev => ({ ...prev, description: e.target.value }))} className="textarea min-h-[80px]"/></div>
                  <div className="space-y-2"><Label>Agents *</Label><Select onValueChange={handleAddAgent}><SelectTrigger><SelectValue placeholder="Add agent..."/></SelectTrigger><SelectContent>{availableAgents.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent></Select><div className="flex flex-wrap gap-2 p-3 border-2 border-dashed rounded-xl bg-slate-50 min-h-[50px]">{customAction.agents.length === 0 ? <p className="text-slate-400 text-sm">No agents</p> : customAction.agents.map(agent => <Badge key={agent} className="gap-2">{agent}<button onClick={() => handleRemoveAgent(agent)}><X className="h-3 w-3"/></button></Badge>)}</div></div>
                  <div className="space-y-2"><Label>Risk Level</Label><Select value={customAction.risk_level} onValueChange={(v) => setCustomAction(prev => ({ ...prev, risk_level: v }))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Cost ($)</Label><Input type="number" step="0.01" value={customAction.estimated_cost} onChange={(e) => setCustomAction(prev => ({ ...prev, estimated_cost: e.target.value }))} className="input"/></div>
                  <div className="space-y-2"><Label>Compliance</Label><Input placeholder="GDPR, SOX" value={customAction.compliance_tags} onChange={(e) => setCustomAction(prev => ({ ...prev, compliance_tags: e.target.value }))} className="input"/></div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button><Button onClick={handleCreateAction} disabled={isCreating} className="btn-primary gap-2"><Save className="h-4 w-4"/>{isCreating ? 'Creating...' : 'Create'}</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {['All', 'Finance', 'HR', 'Support', 'Sales', 'IT/Ops'].map(domain => {
            const count = safeActions.filter((a: any) => getDomain(a.target_agents) === domain).length
            return <Button key={domain} variant={activeFilter === domain ? 'default' : 'ghost'} size="sm" onClick={() => setActiveFilter(domain)} className={activeFilter === domain ? 'btn-primary' : 'btn-secondary'}>{domain} {count > 0 && <Badge variant="secondary" className="ml-2 text-xs">{count}</Badge>}</Button>
          })}
        </div>

        {filteredActions.length === 0 ? (
          <Card><CardContent className="p-12 text-center"><Bot className="h-12 w-12 text-slate-400 mx-auto mb-4"/><h3 className="text-lg font-semibold mb-2">No actions</h3><Button onClick={() => setIsCreateDialogOpen(true)} className="btn-primary gap-2"><Plus className="h-4 w-4"/>Create Custom</Button></CardContent></Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredActions.map((action: any) => {
              const Icon = getIcon(action.target_agents)
              return (
                <motion.div key={action.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} layout>
                  <Card className="card h-full border-2 hover:border-blue-500/50 transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100"><Icon className="h-5 w-5 text-blue-600"/></div>
                          <div><CardTitle className="text-lg">{action.name}</CardTitle><CardDescription className="text-sm">{getIndustry(action.target_agents)}</CardDescription></div>
                        </div>
                        <Badge className={action.risk_level === 'low' ? 'badge-success' : action.risk_level === 'medium' ? 'badge-warning' : 'badge-danger'}>{action.risk_level?.toUpperCase()}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-slate-600">{action.description || 'Governed workflow'}</p>
                      <div className="flex flex-wrap gap-1">{getCompliance(action.target_agents).map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}</div>
                      <div><p className="text-xs font-semibold text-slate-500 mb-1">Steps:</p><div className="flex items-center gap-1 flex-wrap">{action.target_agents?.map((agent:string,i:number) => <div key={agent} className="flex items-center"><div className="px-2 py-1 bg-slate-100 rounded text-xs">{agent.replace('_',' ')}</div>{i < action.target_agents.length-1 && <ArrowRight className="h-3 w-3 text-slate-400 mx-1"/>}</div>)}</div></div>
                      {action.estimated_cost && <div className="text-sm pt-2 border-t"><span className="text-slate-500">Cost:</span> <span className="font-bold">${action.estimated_cost}</span></div>}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 pt-0">
                      <Button className="w-full btn-primary" onClick={() => handleExecute(action.id)} disabled={isExecuting}>{isExecuting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Executing...</> : <><Play className="h-4 w-4 mr-2"/>Execute</>}</Button>
                      <Link href={`/actions/${action.id}`} className="w-full"><Button variant="ghost" size="sm" className="w-full text-xs">View Details →</Button></Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
      <RAGChatbot domain="actions" placeholder="Ask about agents..." compact />
    </div>
  )
}
