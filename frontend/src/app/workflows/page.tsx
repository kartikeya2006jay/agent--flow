'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bot, ArrowLeft, Search, Filter, RefreshCw, CheckCircle, Clock, Loader2, Eye, Play, FileText, Copy, ExternalLink } from 'lucide-react'
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
          { id: `wf_demo_1`, action_id: 'approve_refund', action_name: 'Approve Refund', status: 'completed', progress: 100, created_at: new Date(Date.now()-1800000).toISOString(), trace_id: `trace_${Math.random().toString(36).substring(2,8)}`, result: { order_id: 'ORD-12345', amount: 500, status: 'approved' } },
          { id: `wf_demo_2`, action_id: 'onboard_employee', action_name: 'Onboard Employee', status: 'completed', progress: 100, created_at: new Date(Date.now()-3600000).toISOString(), trace_id: `trace_${Math.random().toString(36).substring(2,8)}`, result: { employee_id: 'EMP-001', department: 'Engineering' } },
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: '✅ Copied!', description: 'Copied to clipboard' })
  }

  // ✅ Beautiful Result Display Component
  const ResultDisplay = ({ result }: { result: any }) => {
    if (!result || Object.keys(result).length === 0) return null

    return (
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
              <FileText className="h-3.5 w-3.5 text-white"/>
            </div>
            <p className="text-sm font-semibold text-slate-700">Execution Result</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs gap-1"
              onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
            >
              <Copy className="h-3 w-3"/>Copy
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs gap-1"
              onClick={() => {
                const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'result.json'
                a.click()
              }}
            >
              <ExternalLink className="h-3 w-3"/>Download
            </Button>
          </div>
        </div>
        
        {/* Key-Value Pairs Display */}
        <div className="grid gap-2">
          {Object.entries(result).map(([key, value]) => (
            <motion.div 
              key={key}
              initial={{opacity: 0, x: -10}}
              animate={{opacity: 1, x: 0}}
              className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-slate-50 to-white border border-slate-200 hover:border-blue-300 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500"/>
                <span className="text-sm font-medium text-slate-600 capitalize">{key.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 bg-white px-3 py-1 rounded-md border border-slate-200">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyToClipboard(String(value))}
                >
                  <Copy className="h-3 w-3"/>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Raw JSON Toggle */}
        <details className="mt-3 group">
          <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700 flex items-center gap-1">
            <ExternalLink className="h-3 w-3"/>View Raw JSON
          </summary>
          <div className="mt-2 relative">
            <pre className="text-xs bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto max-h-48 font-mono border border-slate-700">
              {JSON.stringify(result, null, 2)}
            </pre>
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute top-2 right-2 h-6 text-xs bg-slate-800 text-white hover:bg-slate-700"
              onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
            >
              <Copy className="h-3 w-3 mr-1"/>Copy
            </Button>
          </div>
        </details>
      </div>
    )
  }

  if (isLoading) return <div className="p-6"><Loader2 className="h-8 w-8 animate-spin"/></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
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
                  <Card className="card border border-slate-200 hover:border-blue-500/50 transition-all shadow-sm hover:shadow-md">
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
                              <p className="text-xs text-slate-400 mt-1 font-mono flex items-center gap-1">
                                Trace: <span className="text-slate-600">{wf.trace_id}</span>
                                <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => copyToClipboard(wf.trace_id)}>
                                  <Copy className="h-2.5 w-2.5"/>
                                </Button>
                              </p>
                            )}
                            <p className="text-xs text-slate-400 mt-1">
                              Created: {new Date(wf.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
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
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="h-4 w-4"/>View
                          </Button>
                        </div>
                      </div>
                      
                      {/* ✅ Beautiful Result Display */}
                      {wf.result && Object.keys(wf.result).length > 0 && wf.status !== 'running' && (
                        <ResultDisplay result={wf.result}/>
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
