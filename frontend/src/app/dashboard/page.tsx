'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreateAgentModal } from '@/components/agents/create-agent-modal'
import { RAGChatbot } from '@/components/rag/rag-chatbot'
import { Bot, TrendingUp, Shield, Activity, CheckCircle, ArrowRight, Plus, Zap, GitBranch, Database, Sparkles } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [actions, setActions] = useState<any[]>([])
  const [isCreateAgentOpen, setIsCreateAgentOpen] = useState(false)

  useEffect(() => {
    const builtIn = [
      { id: 'approve_refund', name: 'Approve Refund', target_agents: ['support', 'finance'], risk_level: 'medium', estimated_cost: 0.02 },
      { id: 'onboard_employee', name: 'Onboard Employee', target_agents: ['hr', 'it_ops'], risk_level: 'low', estimated_cost: 0.03 },
      { id: 'create_ticket', name: 'Create Ticket', target_agents: ['support'], risk_level: 'low', estimated_cost: 0.01 },
      { id: 'issue_payment', name: 'Issue Payment', target_agents: ['finance'], risk_level: 'high', estimated_cost: 0.05 },
      { id: 'update_crm', name: 'Update CRM', target_agents: ['sales'], risk_level: 'low', estimated_cost: 0.01 },
    ]
    const custom = JSON.parse(localStorage.getItem('custom_actions') || '[]')
    setActions([...builtIn, ...custom])
  }, [])

  const handleAgentCreated = (newAction: any) => { setActions(prev => [...prev, newAction]) }

  const stats = { totalActions: actions.length, successRate: 95 }

  const getIcon = (agents?: string[]) => {
    if (agents?.includes('finance')) return Shield
    if (agents?.includes('hr')) return GitBranch
    if (agents?.includes('sales')) return TrendingUp
    if (agents?.includes('support')) return Zap
    if (agents?.includes('it_ops')) return Database
    return Bot
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <header className="border-b bg-white/80 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600"><Bot className="h-5 w-5 text-white"/></div>
            <div><h1 className="text-xl font-bold">Dashboard</h1><p className="text-sm text-slate-500">Monitor your workflows</p></div>
          </div>
          <Button onClick={() => setIsCreateAgentOpen(true)} className="bg-blue-600 text-white hover:bg-blue-700 gap-2"><Plus className="h-4 w-4"/>Create Custom Agent</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <motion.section initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="space-y-2">
          <h2 className="text-3xl font-bold">Welcome back 👋</h2>
          <p className="text-slate-600 text-lg">Here's what's happening with your agent workflows.</p>
        </motion.section>

        <motion.section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Total Actions', value: stats.totalActions, icon: Bot, color: 'text-blue-600' },
            { title: 'Success Rate', value: `${stats.successRate}%`, icon: CheckCircle, color: 'text-green-600' },
          ].map((stat) => (
            <motion.div key={stat.title} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
              <Card className="card hover:shadow-lg transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle><stat.icon className={`h-4 w-4 ${stat.color}`}/></CardHeader>
                <CardContent><div className="text-3xl font-bold">{stat.value}</div></CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.section>

        <motion.section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div><h3 className="text-lg font-semibold">Quick Actions</h3><p className="text-sm text-slate-500">Execute governed workflows</p></div>
              <Link href="/actions" className="text-sm text-blue-600 hover:underline flex items-center gap-1">View all <ArrowRight className="h-4 w-4"/></Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {actions.slice(0, 4).map((action) => {
                const Icon = getIcon(action.target_agents)
                return (
                  <motion.div key={action.id} whileHover={{y:-4}}>
                    <Link href={`/actions/${action.id}`}>
                      <Card className="card hover:border-blue-500/50 transition-all">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-blue-100"><Icon className="h-5 w-5 text-blue-600"/></div>
                              <div><CardTitle className="text-base">{action.name}</CardTitle><CardDescription className="text-sm">{action.target_agents?.join(' → ')}</CardDescription></div>
                            </div>
                            <Badge className={action.risk_level === 'low' ? 'bg-green-100 text-green-800' : action.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>{action.risk_level}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent><div className="flex items-center justify-between text-sm"><span className="text-slate-500">Est. cost:</span><span className="font-medium">${action.estimated_cost || '0.01'}</span></div></CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <motion.div className="space-y-4">
            <Card className="card border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50 hover:border-blue-500 transition-all cursor-pointer" onClick={() => setIsCreateAgentOpen(true)}>
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mx-auto"><Plus className="h-8 w-8 text-white"/></div>
                <div><h3 className="font-semibold">Create Custom Agent</h3><p className="text-sm text-slate-600 mt-1">Define a new governed workflow</p></div>
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-700"><Sparkles className="h-4 w-4 mr-2"/>Create Agent</Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>

        <motion.section className="space-y-4">
          <div className="flex items-center justify-between">
            <div><h3 className="text-lg font-semibold">Recent Workflows</h3><p className="text-sm text-slate-500">Latest executions</p></div>
            <Link href="/workflows" className="text-sm text-blue-600 hover:underline flex items-center gap-1">View all <ArrowRight className="h-4 w-4"/></Link>
          </div>
          <Card className="card"><CardContent className="p-8 text-center text-slate-500"><Activity className="h-8 w-8 mx-auto mb-3 opacity-50"/><p className="text-sm">Execute an action to see workflows here</p><Link href="/actions"><Button variant="outline" className="mt-4">Execute Action</Button></Link></CardContent></Card>
        </motion.section>
      </main>

      <CreateAgentModal open={isCreateAgentOpen} onOpenChange={setIsCreateAgentOpen} onCreated={handleAgentCreated}/>
      <RAGChatbot domain="dashboard" placeholder="Ask about agents, workflows..." compact />
    </div>
  )
}
