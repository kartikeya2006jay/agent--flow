'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateAgentModal } from '@/components/agents/create-agent-modal'
import { Bot, Shield, Zap, ArrowRight, Play, GitBranch, Database, TrendingUp, Plus } from 'lucide-react'
import { RAGChatbot } from '@/components/rag/rag-chatbot'

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
  const router = useRouter()
  const [actions, setActions] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState('All')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Load actions on mount and when storage changes
  const loadActions = () => {
    const builtIn = [
      { id: 'approve_refund', name: 'Approve Refund', target_agents: ['support', 'finance'], risk_level: 'medium', estimated_cost: 0.02, description: 'Customer refund approval with fraud detection' },
      { id: 'onboard_employee', name: 'Onboard Employee', target_agents: ['hr', 'it_ops'], risk_level: 'low', estimated_cost: 0.03, description: 'Automated employee onboarding with IT provisioning' },
      { id: 'create_ticket', name: 'Create Ticket', target_agents: ['support'], risk_level: 'low', estimated_cost: 0.01, description: 'Intelligent ticket routing with priority assessment' },
      { id: 'issue_payment', name: 'Issue Payment', target_agents: ['finance'], risk_level: 'high', estimated_cost: 0.05, description: 'Vendor payment processing with approval workflows' },
      { id: 'update_crm', name: 'Update CRM', target_agents: ['sales'], risk_level: 'low', estimated_cost: 0.01, description: 'Lead scoring and CRM synchronization' },
    ]
    const custom = JSON.parse(localStorage.getItem('agentflow_custom_actions') || '[]')
    setActions([...builtIn, ...custom])
  }

  useEffect(() => {
    loadActions()
    const handler = () => loadActions()
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const safeActions = Array.isArray(actions) ? actions : []
  const filteredActions = activeFilter === 'All' ? safeActions : safeActions.filter((a: any) => getDomain(a.target_agents) === activeFilter)

  const handleAgentCreated = () => {
    loadActions() // Reload to show new agent
  }

  const handleExecute = (actionId: string) => {
    router.push(`/actions/${actionId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-20">
      {/* Header - Clean, No Overlap */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-600">
                <Bot className="h-5 w-5 text-white"/>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Action Library</h1>
                <p className="text-sm text-slate-500">{filteredActions.length} actions {activeFilter !== 'All' ? `in ${activeFilter}` : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"/>
                Live
              </Badge>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">← Dashboard</Button>
              </Link>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 text-white hover:bg-blue-700 gap-2">
                <Plus className="h-4 w-4"/>
                Create Custom Agent
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Tabs - Clean Layout */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2">
          {['All', 'Finance', 'HR', 'Support', 'Sales', 'IT/Ops'].map((domain) => {
            const count = safeActions.filter((a: any) => getDomain(a.target_agents) === domain).length
            return (
              <Button 
                key={domain} 
                variant={activeFilter === domain ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setActiveFilter(domain)}
                className={activeFilter === domain ? 'bg-blue-600 text-white' : ''}
              >
                {domain}
                {count > 0 && <Badge variant="secondary" className="ml-2 text-xs">{count}</Badge>}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Actions Grid - Clean, No Overlap */}
      <div className="container mx-auto px-4 pb-8">
        {filteredActions.length === 0 ? (
          <Card className="border border-slate-200">
            <CardContent className="p-12 text-center">
              <Bot className="h-12 w-12 text-slate-400 mx-auto mb-4"/>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No actions found</h3>
              <p className="text-slate-600 mb-4">Try a different filter or create a custom action</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 text-white gap-2">
                <Plus className="h-4 w-4"/>Create Custom Action
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredActions.map((action: any) => {
              const Icon = getIcon(action.target_agents)
              return (
                <motion.div key={action.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} layout>
                  <Card className="border border-slate-200 hover:border-blue-500/50 transition-all h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <Icon className="h-5 w-5 text-blue-600"/>
                          </div>
                          <div>
                            <CardTitle className="text-lg text-slate-900">{action.name}</CardTitle>
                            <CardDescription className="text-sm text-slate-600">{getIndustry(action.target_agents)}</CardDescription>
                          </div>
                        </div>
                        <Badge className={action.risk_level === 'low' ? 'bg-green-100 text-green-800' : action.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                          {action.risk_level?.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-slate-600">{action.description || 'Governed workflow execution'}</p>
                      <div className="flex flex-wrap gap-1">
                        {getCompliance(action.target_agents).map(t => (
                          <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1">Workflow Steps:</p>
                        <div className="flex items-center gap-1 flex-wrap">
                          {action.target_agents?.map((agent:string,i:number) => (
                            <div key={agent} className="flex items-center">
                              <div className="px-2 py-1 bg-slate-100 rounded text-xs">{agent.replace('_',' ')}</div>
                              {i < action.target_agents.length-1 && <ArrowRight className="h-3 w-3 text-slate-400 mx-1"/>}
                            </div>
                          ))}
                        </div>
                      </div>
                      {action.estimated_cost && (
                        <div className="text-sm pt-2 border-t">
                          <span className="text-slate-500">Cost:</span> <span className="font-bold text-slate-900">${action.estimated_cost}</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 pt-0">
                      <Button className="w-full bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleExecute(action.id)}>
                        <Play className="h-4 w-4 mr-2"/>Execute Action
                      </Button>
                      <Link href={`/actions/${action.id}`} className="w-full">
                        <Button variant="ghost" size="sm" className="w-full text-xs">View Details →</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Chatbot */}
      <RAGChatbot domain="actions" placeholder="Ask about agents..." compact />

      {/* Create Agent Modal */}
      <CreateAgentModal open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onCreated={handleAgentCreated}/>
    </div>
  )
}
