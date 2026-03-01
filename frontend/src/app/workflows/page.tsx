'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bot, ArrowLeft, Search, Filter, RefreshCw, CheckCircle, Clock, Loader2, Eye, Play } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Workflow {
  id: string
  action_id: string
  action_name?: string
  status: string
  progress: number
  created_at: string
  trace_id?: string
  result?: any
}

export default function WorkflowsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const loadWorkflows = () => {
    try {
      const stored = localStorage.getItem('agentflow_workflows')
      const parsed = stored ? JSON.parse(stored) : []
      
      if (parsed.length === 0) {
        const demo: Workflow[] = [
          { id: `wf_demo_1`, action_id: 'approve_refund', action_name: 'Approve Refund', status: 'completed', progress: 100, created_at: new Date(Date.now()-1800000).toISOString(), trace_id: `trace_${Math.random().toString(36).substring(2,8)}` },
          { id: `wf_demo_2`, action_id: 'onboard_employee', action_name: 'Onboard Employee', status: 'completed', progress: 100, created_at: new Date(Date.now()-3600000).toISOString(), trace_id: `trace_${Math.random().toString(36).substring(2,8)}`, result: { ticket_id: 'TKT-001' } },
        ]
        setWorkflows(demo)
      } else {
        setWorkflows(parsed)
      }
    } catch (e) {
      setWorkflows([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadWorkflows()
    
    const handleStorage = () => loadWorkflows()
    window.addEventListener('storage', handleStorage)
    
    const progressInterval = setInterval(() => {
      setWorkflows(prev => {
        const updated = prev.map(wf => {
          if (wf.status === 'running' && wf.progress < 100) {
            const newProgress = Math.min(100, wf.progress + Math.random() * 15 + 5)
            return {
              ...wf,
              progress: Math.round(newProgress),
              status: newProgress >= 100 ? 'completed' : 'running'
            }
          }
          return wf
        })
        localStorage.setItem('agentflow_workflows', JSON.stringify(updated))
        return updated
      })
    }, 2000)

    return () => {
      window.removeEventListener('storage', handleStorage)
      clearInterval(progressInterval)
    }
  }, [])

  // ✅ Search by workflow ID, action name, OR trace ID
  const filtered = workflows.filter(w => {
    const okStatus = filter === 'all' || w.status === filter
    const query = searchQuery.toLowerCase()
    const okSearch = !query || 
      w.action_name?.toLowerCase().includes(query) || 
      w.action_id?.toLowerCase().includes(query) ||
      w.id?.toLowerCase().includes(query) ||
      w.trace_id?.toLowerCase().includes(query)
    return okStatus && okSearch
  })

  const stats = {
    total: workflows.length,
    completed: workflows.filter(w => w.status === 'completed').length,
    running: workflows.filter(w => w.status === 'running').length,
  }

  if (isLoading) return <div className="p-6"><Loader2 className="h-8 w-8 animate-spin"/></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-1">
              <ArrowLeft className="h-4 w-4"/>Back
            </Button>
            <div>
              <h1 className="text-xl font-bold">Workflows</h1>
              <p className="text-sm text-slate-500">{workflows.length} executions</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadWorkflows} className="gap-1">
            <RefreshCw className="h-4 w-4"/>Refresh
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-xs text-slate-500">Total</div>
            </CardContent>
          </Card>
          <Card className="card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-xs text-slate-500">Completed</div>
            </CardContent>
          </Card>
          <Card className="card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
              <div className="text-xs text-slate-500">Running</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                <Input 
                  placeholder="Search by action, workflow ID, or trace ID..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="input pl-10"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-40 select-trigger">
                  <Filter className="h-4 w-4 mr-2"/>
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {searchQuery && (
              <div className="mt-2 flex items-center gap-2">
                <p className="text-xs text-slate-500">
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''} found
                </p>
                {filtered.length === 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')} className="h-6 text-xs">
                    Clear search
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workflows List */}
        {filtered.length === 0 ? (
          <Card className="card">
            <CardContent className="p-12 text-center">
              <Bot className="h-12 w-12 text-slate-400 mx-auto mb-4"/>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? 'No workflows found' : 'No workflows yet'}
              </h3>
              <p className="text-slate-600 mb-4">
                {searchQuery ? 'Try a different search term' : 'Execute an action to create your first workflow'}
              </p>
              {searchQuery ? (
                <Button variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button>
              ) : (
                <Button onClick={() => router.push('/actions')} className="btn-primary gap-2">
                  <Play className="h-4 w-4"/>Execute Action
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map((wf, i) => (
                <motion.div 
                  key={wf.id} 
                  initial={{opacity:0,y:20}} 
                  animate={{opacity:1,y:0}} 
                  exit={{opacity:0,y:-20}}
                  transition={{delay:i*0.05}}
                >
                  <Card className="card border border-slate-200 hover:border-blue-500/50 transition-all">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className={`p-2 rounded-lg ${wf.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'}`}>
                            {wf.status === 'completed' ? (
                              <CheckCircle className="h-4 w-4 text-green-600"/>
                            ) : (
                              <Clock className="h-4 w-4 text-blue-600 animate-pulse"/>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-slate-900 truncate">{wf.action_name || wf.action_id}</h4>
                              <Badge className={wf.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                                {wf.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500 mt-1 font-mono text-xs bg-slate-100 px-2 py-0.5 rounded inline-block">
                              {wf.id}
                            </p>
                            {wf.trace_id && (
                              <p className="text-xs text-slate-400 mt-1 font-mono">
                                Trace: <span className="text-slate-600">{wf.trace_id}</span>
                              </p>
                            )}
                            <p className="text-xs text-slate-400 mt-1">
                              Created: {new Date(wf.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="lg:w-48">
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span>Progress</span>
                            <span className="font-medium text-blue-600">{wf.progress}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                            <motion.div 
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                              initial={{ width: `${wf.progress - 10}%` }}
                              animate={{ width: `${wf.progress}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                          </div>
                          {wf.status === 'running' && (
                            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin"/> Processing...
                            </p>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => toast({title:'Workflow Details',description:JSON.stringify(wf.result || {}, null, 2)})}
                          >
                            <Eye className="h-4 w-4"/>View
                          </Button>
                        </div>
                      </div>
                      
                      {/* Result Section */}
                      {wf.result && Object.keys(wf.result).length > 0 && wf.status !== 'running' && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <p className="text-xs font-semibold text-slate-500 mb-2">Result:</p>
                          <pre className="text-xs bg-slate-50 p-3 rounded overflow-auto max-h-32">
                            {JSON.stringify(wf.result, null, 2)}
                          </pre>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  )
}
