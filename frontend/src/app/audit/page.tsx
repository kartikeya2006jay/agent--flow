'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Search, Filter, Download, Shield, CheckCircle, AlertCircle, Clock, FileText, User } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AuditLog {
  id: string
  trace_id: string
  workflow_id: string
  action_id: string
  action_name?: string
  user_id: string
  status: string
  policy_decision: string
  created_at: string
  details: any
}

export default function AuditPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const loadLogs = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('agentflow_audit_logs') || '[]')
      if (stored.length === 0) {
        const demo: AuditLog[] = [
          { id: `audit_${Math.random().toString(36).substring(2,8)}`, trace_id: `trace_${Math.random().toString(36).substring(2,8)}`, workflow_id: `wf_${Math.random().toString(36).substring(2,8)}`, action_id: 'approve_refund', action_name: 'Approve Refund', user_id: 'usr_demo', status: 'completed', policy_decision: 'ALLOW', created_at: new Date(Date.now()-3600000).toISOString(), details: { amount: 500 } },
          { id: `audit_${Math.random().toString(36).substring(2,8)}`, trace_id: `trace_${Math.random().toString(36).substring(2,8)}`, workflow_id: `wf_${Math.random().toString(36).substring(2,8)}`, action_id: 'issue_payment', action_name: 'Issue Payment', user_id: 'usr_demo', status: 'pending', policy_decision: 'REQUIRE_APPROVAL', created_at: new Date(Date.now()-1800000).toISOString(), details: { amount: 5000 } },
        ]
        setLogs(demo)
      } else {
        setLogs(stored)
      }
    } catch (e) {
      setLogs([])
    }
  }

  useEffect(() => {
    loadLogs()
    const handler = (e: StorageEvent) => { if (e.key === 'agentflow_audit_logs') loadLogs() }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const filtered = logs.filter(log => {
    const okStatus = filter === 'all' || log.status === filter
    const okSearch = !searchQuery || log.action_name?.toLowerCase().includes(searchQuery.toLowerCase()) || log.trace_id?.toLowerCase().includes(searchQuery.toLowerCase())
    return okStatus && okSearch
  })

  const stats = {
    total: logs.length,
    allowed: logs.filter(l => l.policy_decision === 'ALLOW').length,
    denied: logs.filter(l => l.policy_decision === 'DENY').length,
    approval: logs.filter(l => l.policy_decision === 'REQUIRE_APPROVAL').length,
  }

  const exportLogs = () => {
    const csv = 'ID,Trace ID,Action,User,Status,Policy Decision,Created At\n' + 
      logs.map(l => `${l.id},${l.trace_id},${l.action_name || l.action_id},${l.user_id},${l.status},${l.policy_decision},${l.created_at}`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast({ title: '✅ Exported!', description: 'Audit logs downloaded' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <header className="border-b bg-white/80 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-1"><ArrowLeft className="h-4 w-4"/>Back</Button>
            <div><h1 className="text-xl font-bold">Audit Logs</h1><p className="text-sm text-slate-500">Immutable compliance trail</p></div>
          </div>
          <Button variant="outline" onClick={exportLogs} className="gap-2"><Download className="h-4 w-4"/>Export CSV</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="card"><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-slate-900">{stats.total}</div><div className="text-xs text-slate-500">Total</div></CardContent></Card>
          <Card className="card"><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-green-600">{stats.allowed}</div><div className="text-xs text-slate-500">Allowed</div></CardContent></Card>
          <Card className="card"><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-orange-600">{stats.approval}</div><div className="text-xs text-slate-500">Needs Approval</div></CardContent></Card>
        </div>

        <Card className="card">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                <Input placeholder="Search by action, trace ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input pl-10"/>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40 select-trigger"><Filter className="h-4 w-4 mr-2"/><SelectValue/></SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {filtered.length === 0 ? (
          <Card className="card"><CardContent className="p-12 text-center"><Shield className="h-12 w-12 text-slate-400 mx-auto mb-4"/><h3 className="text-lg font-semibold mb-2">No audit logs</h3><p className="text-slate-600">Execute actions to create audit entries</p></CardContent></Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((log, i) => (
              <motion.div key={log.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
                <Card className="card border border-slate-200 hover:border-blue-500/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg ${log.policy_decision === 'ALLOW' ? 'bg-green-100' : log.policy_decision === 'DENY' ? 'bg-red-100' : 'bg-orange-100'}`}>
                          {log.policy_decision === 'ALLOW' ? <CheckCircle className="h-4 w-4 text-green-600"/> : log.policy_decision === 'DENY' ? <AlertCircle className="h-4 w-4 text-red-600"/> : <Clock className="h-4 w-4 text-orange-600"/>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-slate-900 truncate">{log.action_name || log.action_id}</h4>
                            <Badge className={log.policy_decision === 'ALLOW' ? 'bg-green-100 text-green-800' : log.policy_decision === 'DENY' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}>{log.policy_decision}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                            <span className="flex items-center gap-1"><FileText className="h-3 w-3"/>Trace: <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">{log.trace_id}</code></span>
                            <span className="flex items-center gap-1"><User className="h-3 w-3"/>User: {log.user_id}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Created: {new Date(log.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => toast({title:'Details',description:JSON.stringify(log.details)})}><FileText className="h-4 w-4"/>Details</Button>
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => {navigator.clipboard.writeText(log.trace_id);toast({title:'Copied!',description:'Trace ID copied'})}}><Shield className="h-4 w-4"/>Copy Trace</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
