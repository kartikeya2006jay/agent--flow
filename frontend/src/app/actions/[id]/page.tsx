'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, Shield, CheckCircle, Play } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const randomId = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(4)}`

export default function ActionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const actionId = params.id as string
  const [action, setAction] = useState<any>(null)
  const [formData, setFormData] = useState({ order_id: '', amount: '', reason: '' })
  const [isExecuting, setIsExecuting] = useState(false)

  useEffect(() => {
    const builtIn: Record<string, any> = {
      approve_refund: { id: 'approve_refund', name: 'Approve Refund', target_agents: ['support', 'finance'], risk_level: 'medium' },
      onboard_employee: { id: 'onboard_employee', name: 'Onboard Employee', target_agents: ['hr', 'it_ops'], risk_level: 'low' },
      create_ticket: { id: 'create_ticket', name: 'Create Ticket', target_agents: ['support'], risk_level: 'low' },
      issue_payment: { id: 'issue_payment', name: 'Issue Payment', target_agents: ['finance'], risk_level: 'high' },
      update_crm: { id: 'update_crm', name: 'Update CRM', target_agents: ['sales'], risk_level: 'low' },
    }
    const custom = JSON.parse(localStorage.getItem('agentflow_custom_actions') || '[]')
    const found = builtIn[actionId] || custom.find((a: any) => a.id === actionId)
    if (found) setAction(found)
  }, [actionId])

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsExecuting(true)
    
    // Generate IDs
    const wfId = randomId('wf')
    const traceId = randomId('trace')
    const auditId = randomId('audit')
    
    // Create workflow object
    const workflow = {
      id: wfId,
      action_id: actionId,
      action_name: action?.name,
      status: 'success',
      progress: 100,
      created_at: new Date().toISOString(),
      trace_id: traceId,
      result: { message: 'Executed', ticket_id: `TKT-${randomId('').toUpperCase().slice(0,6)}` },
      policy_decision: 'ALLOW',
      risk_score: action?.risk_level === 'high' ? 75 : 50,
    }
    
    // Create audit object
    const audit = {
      id: auditId,
      trace_id: traceId,
      workflow_id: wfId,
      action_id: actionId,
      action_name: action?.name,
      user_id: 'usr_demo',
      status: 'success',
      policy_decision: 'ALLOW',
      risk_score: workflow.risk_score,
      created_at: new Date().toISOString(),
      details: { order_id: formData.order_id, amount: formData.amount, reason: formData.reason }
    }
    
    // ✅ SAVE TO LOCALSTORAGE - GUARANTEED
    try {
      // Save workflow
      const wfExisting = JSON.parse(localStorage.getItem('agentflow_workflows') || '[]')
      wfExisting.unshift(workflow)
      localStorage.setItem('agentflow_workflows', JSON.stringify(wfExisting))
      
      // Save audit
      const auditExisting = JSON.parse(localStorage.getItem('agentflow_audit_logs') || '[]')
      auditExisting.unshift(audit)
      localStorage.setItem('agentflow_audit_logs', JSON.stringify(auditExisting))
      
      // Force refresh
      window.dispatchEvent(new Event('storage'))
      
      toast({ title: '✅ Done!', description: `Workflow: ${wfId}` })
      
      // Redirect after showing result
      setTimeout(() => router.push('/workflows'), 1000)
    } catch (err: any) {
      toast({ variant: 'destructive', title: '❌ Error', description: err.message })
    } finally {
      setIsExecuting(false)
    }
  }

  if (!action) return <div className="p-6"><Loader2 className="h-8 w-8 animate-spin"/></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="gap-2"><ArrowLeft className="h-4 w-4"/>Back</Button>
        <Card className="card shadow-lg border-2 border-blue-100">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-600"><Shield className="h-6 w-6 text-white"/></div>
              <div><CardTitle className="text-2xl font-bold">{action.name}</CardTitle></div>
            </div>
            <Badge className={action.risk_level === 'low' ? 'bg-green-100 text-green-800' : action.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>{action.risk_level?.toUpperCase()}</Badge>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleExecute} className="space-y-4">
              <div className="space-y-2"><Label>Order ID</Label><Input value={formData.order_id} onChange={(e) => setFormData(p => ({...p, order_id: e.target.value}))} className="input"/></div>
              <div className="space-y-2"><Label>Amount ($)</Label><Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData(p => ({...p, amount: e.target.value}))} className="input"/></div>
              <div className="space-y-2"><Label>Reason</Label><Input value={formData.reason} onChange={(e) => setFormData(p => ({...p, reason: e.target.value}))} className="input"/></div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="btn-primary flex-1" disabled={isExecuting}>{isExecuting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Executing...</> : <><Play className="h-4 w-4 mr-2"/>Execute</>}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
