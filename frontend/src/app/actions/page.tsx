'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { config } from '@/lib/config'
import { getAuthToken } from '@/lib/auth/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bot, Shield, Zap, ArrowRight, Play, Loader2, GitBranch, Database, TrendingUp, Plus, X, Save, RefreshCw, AlertCircle } from 'lucide-react'
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
  const { toast } = useToast()
  const router = useRouter()
  const token = getAuthToken()
  
  const [actions, setActions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [activeFilter, setActiveFilter] = useState('All')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [customAction, setCustomAction] = useState({ 
    name: '', description: '', agents: [], risk_level: 'medium', 
    estimated_cost: '0.01', compliance_tags: '' 
  })

  // Load actions from backend
  const loadActions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${config.api.baseUrl}/actions/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to load')
      const data = await response.json()
      setActions(Array.isArray(data) ? data : [])
      setBackendStatus('online')
    } catch (err) {
      // Fallback to built-in actions
      const builtIn = [
        { id: 'approve_refund', name: 'Approve Refund', target_agents: ['support', 'finance'], risk_level: 'medium', estimated_cost: 0.02, description: 'Customer refund approval with fraud detection' },
        { id: 'onboard_employee', name: 'Onboard Employee', target_agents: ['hr', 'it_ops'], risk_level: 'low', estimated_cost: 0.03, description: 'Automated employee onboarding with IT provisioning' },
        { id: 'create_ticket', name: 'Create Ticket', target_agents: ['support'], risk_level: 'low', estimated_cost: 0.01, description: 'Intelligent ticket routing with priority assessment' },
        { id: 'issue_payment', name: 'Issue Payment', target_agents: ['finance'], risk_level: 'high', estimated_cost: 0.05, description: 'Vendor payment processing with approval workflows' },
        { id: 'update_crm', name: 'Update CRM', target_agents: ['sales'], risk_level: 'low', estimated_cost: 0.01, description: 'Lead scoring and CRM synchronization' },
      ]
      setActions(builtIn)
      setBackendStatus('offline')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadActions() }, [])

  const safeActions = Array.isArray(actions) ? actions : []
  const filteredActions = activeFilter === 'All' ? safeActions : safeActions.filter((a: any) => getDomain(a.target_agents) === activeFilter)

  const handleExecute = async (actionId: string) => {
    router.push(`/actions/${actionId}`)
  }

  const handleCreateAction = async () => {
    if (!customAction.name || customAction.agents.length === 0) {
      toast({ variant: 'destructive', title: '❌ Error', description: 'Name and at least one agent required' })
      return
    }
    try {
      const newAction = {
        id: customAction.name.toLowerCase().replace(/\s+/g, '_'),
        name: customAction.name,
        description: customAction.description || 'Custom governed workflow',
        target_agents: customAction.agents,
        risk_level: customAction.risk_level,
        estimated_cost: parseFloat(customAction.estimated_cost) || 0.01,
        compliance_tags: customAction.compliance_tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      }

      // Try backend first
      try {
        const response = await fetch(`${config.api.baseUrl}/actions/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(newAction),
        })
        if (response.ok) {
          await response.json()
          toast({ title: '✅ Created!', description: `${customAction.name} saved to backend` })
        }
      } catch (backendErr) {
        // Fallback: save to localStorage so it appears on page
        const existing = JSON.parse(localStorage.getItem('custom_actions') || '[]')
        existing.push(newAction)
        localStorage.setItem('custom_actions', JSON.stringify(existing))
        toast({ title: '✅ Created!', description: `${customAction.name} saved locally` })
      }

      // Reset and refresh
      setCustomAction({ name: '', description: '', agents: [], risk_level: 'medium', estimated_cost: '0.01', compliance_tags: '' })
      setIsCreateDialogOpen(false)
      loadActions() // Reload to show new action

    } catch (err: any) {
      toast({ variant: 'destructive', title: '❌ Failed', description: err.message })
    }
  }

  const handleAddAgent = (agent: string) => {
    if (!customAction.agents.includes(agent)) {
      setCustomAction(prev => ({ ...prev, agents: [...prev.agents, agent] }))
    }
  }
  const handleRemoveAgent = (agent: string) => {
    setCustomAction(prev => ({ ...prev, agents: prev.agents.filter(a => a !== agent) }))
  }

  const availableAgents = [
    { id: 'support', name: '🎧 Support', desc: 'Zendesk, Intercom' },
    { id: 'hr', name: '👥 HR', desc: 'Workday, BambooHR' },
    { id: 'finance', name: '💰 Finance', desc: 'Stripe, SAP' },
    { id: 'it_ops', name: '⚙️ IT/Ops', desc: 'Jira, ServiceNow' },
    { id: 'sales', name: '📈 Sales', desc: 'Salesforce, HubSpot' },
  ]

  if (isLoading) {
    return <div className="p-6"><div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-4"/><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map(i => <div key={i} className="h-80 rounded-2xl bg-slate-100 animate-pulse border" />)}</div></div>
  }

  // Backend offline UI
  if (backendStatus === 'offline' && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full shadow-lg">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-yellow-600"/>
            </div>
            <h2 className="text-xl font-bold">Using Demo Data</h2>
            <p className="text-slate-600">Backend not connected. Showing built-in actions.</p>
            <p className="text-xs text-slate-500 bg-slate-100 p-3 rounded">
              Start backend: <code>cd backend && uvicorn app.main:app --port 8001</code>
            </p>
            <Button onClick={loadActions} className="btn-primary gap-2 w-full">
              <RefreshCw className="h-4 w-4"/>Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/30">
                <Bot className="h-5 w-5 text-white"/>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Action Library</h1>
                <p className="text-sm text-slate-500">{filteredActions.length} actions {activeFilter !== 'All' ? `in ${activeFilter}` : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={backendStatus === 'online' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                <span className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse mr-2`}/>
                {backendStatus === 'online' ? 'Live' : 'Demo'}
              </Badge>
              <Link href="/dashboard"><Button variant="outline" size="sm">← Dashboard</Button></Link>
              
              {/* CREATE CUSTOM AGENT - WORKING */}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 btn-primary shadow-lg shadow-blue-500/30">
                    <Plus className="h-4 w-4"/>Create Custom Agent
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Create Custom Agent</DialogTitle>
                    <DialogDescription>Define a new governed workflow with custom agents</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="font-medium">Action Name *</Label>
                      <Input placeholder="e.g., Process Vendor Invoice" value={customAction.name} onChange={(e) => setCustomAction(prev => ({ ...prev, name: e.target.value }))} className="input"/>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Description</Label>
                      <textarea placeholder="Describe what this action does..." value={customAction.description} onChange={(e) => setCustomAction(prev => ({ ...prev, description: e.target.value }))} className="textarea min-h-[80px]"/>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Target Agents *</Label>
                      <Select onValueChange={handleAddAgent}>
                        <SelectTrigger className="select-trigger"><SelectValue placeholder="➕ Select agent to add..."/></SelectTrigger>
                        <SelectContent className="z-50">
                          {availableAgents.map(a => <SelectItem key={a.id} value={a.id} className="cursor-pointer">{a.name} - {a.desc}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2 p-3 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 min-h-[50px]">
                        {customAction.agents.length === 0 ? (
                          <p className="text-slate-400 text-sm w-full text-center">No agents selected</p>
                        ) : (
                          customAction.agents.map(agent => (
                            <Badge key={agent} className="badge badge-primary gap-2 shadow-sm">
                              {agent.replace('_', ' ')}
                              <button onClick={() => handleRemoveAgent(agent)} className="hover:text-red-600"><X className="h-3 w-3"/></button>
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Risk Level</Label>
                      <Select value={customAction.risk_level} onValueChange={(v) => setCustomAction(prev => ({ ...prev, risk_level: v }))}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent className="z-50">
                          <SelectItem value="low">🟢 Low - Auto-approve</SelectItem>
                          <SelectItem value="medium">🟡 Medium - Single approval</SelectItem>
                          <SelectItem value="high">🟠 High - Dual approval</SelectItem>
                          <SelectItem value="critical">🔴 Critical - Executive approval</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Estimated Cost ($)</Label>
                      <Input type="number" step="0.01" value={customAction.estimated_cost} onChange={(e) => setCustomAction(prev => ({ ...prev, estimated_cost: e.target.value }))} className="input"/>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Compliance Tags</Label>
                      <Input placeholder="GDPR, SOX, HIPAA" value={customAction.compliance_tags} onChange={(e) => setCustomAction(prev => ({ ...prev, compliance_tags: e.target.value }))} className="input"/>
                      <p className="text-xs text-slate-500">Auto-generated based on agents if empty</p>
                    </div>
                  </div>
                  <DialogFooter className="gap-3">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateAction} className="btn-primary gap-2 shadow-lg shadow-blue-500/30">
                      <Save className="h-4 w-4"/>Create Action
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2">
          {['All', 'Finance', 'HR', 'Support', 'Sales', 'IT/Ops'].map(domain => {
            const count = safeActions.filter((a: any) => getDomain(a.target_agents) === domain).length
            return (
              <Button 
                key={domain} 
                variant={activeFilter === domain ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setActiveFilter(domain)}
                className={`transition-all ${activeFilter === domain ? 'btn-primary shadow-md shadow-blue-500/30' : 'btn-secondary hover:bg-slate-200'}`}
              >
                {domain}
                {count > 0 && <Badge variant="secondary" className={`ml-2 text-xs ${activeFilter === domain ? 'bg-white/20 text-white' : ''}`}>{count}</Badge>}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Actions Grid */}
      <div className="container mx-auto px-4 pb-8">
        {filteredActions.length === 0 ? (
          <Card className="card shadow-lg"><CardContent className="p-12 text-center"><Bot className="h-12 w-12 text-slate-400 mx-auto mb-4"/><h3 className="text-lg font-semibold mb-2">No actions found</h3><p className="text-slate-500 mb-4">Try a different filter or create a custom action</p><Button onClick={() => setIsCreateDialogOpen(true)} className="btn-primary gap-2"><Plus className="h-4 w-4"/>Create Custom Action</Button></CardContent></Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredActions.map((action: any) => {
              const Icon = getIcon(action.target_agents)
              return (
                <motion.div key={action.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} layout>
                  <Card className="card h-full border-2 hover:border-blue-500/50 transition-all hover:shadow-xl">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 shadow-sm">
                            <Icon className="h-5 w-5 text-blue-600"/>
                          </div>
                          <div>
                            <CardTitle className="text-lg font-semibold text-slate-900">{action.name}</CardTitle>
                            <CardDescription className="text-sm text-slate-600">{getIndustry(action.target_agents)}</CardDescription>
                          </div>
                        </div>
                        <Badge className={`${action.risk_level === 'low' ? 'badge-success' : action.risk_level === 'medium' ? 'badge-warning' : 'badge-danger'} border font-medium shadow-sm`}>
                          {action.risk_level?.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-slate-600 leading-relaxed">{action.description || 'Governed workflow execution with policy enforcement'}</p>
                      <div className="flex flex-wrap gap-1.5">{getCompliance(action.target_agents).map(t => <Badge key={t} variant="secondary" className="text-xs shadow-sm">{t}</Badge>)}</div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Workflow Steps:</p>
                        <div className="flex items-center gap-1 overflow-x-auto pb-2">
                          {action.target_agents?.map((agent:string,i:number) => (
                            <div key={agent} className="flex items-center flex-shrink-0">
                              <div className="px-3 py-1.5 bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg text-xs font-medium border border-slate-200 shadow-sm">
                                {agent.replace('_', ' ')}
                              </div>
                              {i < action.target_agents.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-slate-400 mx-1 flex-shrink-0"/>}
                            </div>
                          ))}
                        </div>
                      </div>
                      {action.estimated_cost && (
                        <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-200">
                          <span className="text-slate-500 font-medium">Estimated cost:</span>
                          <span className="font-bold text-slate-900">${action.estimated_cost}</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2.5 pt-0">
                      <Button className="w-full btn-primary shadow-lg shadow-blue-500/30" onClick={() => handleExecute(action.id)}>
                        <Play className="h-4 w-4 mr-2"/>Execute Action
                      </Button>
                      <Link href={`/actions/${action.id}`} className="w-full">
                        <Button variant="ghost" size="sm" className="w-full text-xs text-slate-600 hover:text-slate-900">
                          View Details →
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <RAGChatbot domain="actions" placeholder="Ask about agents, policies, or execution..." compact />
    </div>
  )
}
