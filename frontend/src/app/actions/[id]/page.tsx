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

export default function ActionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const actionId = params.id as string
  
  const [action, setAction] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  const [isExecuting, setIsExecuting] = useState(false)

  useEffect(() => {
    const builtIn: Record<string, any> = {
      approve_refund: { id: 'approve_refund', name: 'Approve Refund', target_agents: ['support', 'finance'], risk_level: 'medium', fields: [{key: 'order_id', label: 'Order ID'}, {key: 'amount', label: 'Amount ($)'}, {key: 'reason', label: 'Reason'}] },
      onboard_employee: { id: 'onboard_employee', name: 'Onboard Employee', target_agents: ['hr', 'it_ops'], risk_level: 'low', fields: [{key: 'employee_name', label: 'Employee Name'}, {key: 'department', label: 'Department'}, {key: 'start_date', label: 'Start Date'}] },
      create_ticket: { id: 'create_ticket', name: 'Create Ticket', target_agents: ['support'], risk_level: 'low', fields: [{key: 'customer_name', label: 'Customer Name'}, {key: 'issue', label: 'Issue'}, {key: 'priority', label: 'Priority'}] },
      issue_payment: { id: 'issue_payment', name: 'Issue Payment', target_agents: ['finance'], risk_level: 'high', fields: [{key: 'vendor_name', label: 'Vendor Name'}, {key: 'amount', label: 'Amount ($)'}, {key: 'invoice_number', label: 'Invoice Number'}] },
      update_crm: { id: 'update_crm', name: 'Update CRM', target_agents: ['sales'], risk_level: 'low', fields: [{key: 'lead_name', label: 'Lead Name'}, {key: 'company', label: 'Company'}, {key: 'value', label: 'Deal Value ($)'}] },
    }
    const custom = JSON.parse(localStorage.getItem('agentflow_custom_actions') || '[]')
    const found = builtIn[actionId] || custom.find((a: any) => a.id === actionId)
    
    if (found) {
      // For custom actions without fields, add default fields
      if (!found.fields || found.fields.length === 0) {
        found.fields = [
          {key: 'item_id', label: 'Item ID'},
          {key: 'amount', label: 'Amount ($)'},
          {key: 'description', label: 'Description'}
        ]
      }
      setAction(found)
      const initialData: any = {}
      found.fields.forEach((f: any) => { initialData[f.key] = '' })
      setFormData(initialData)
    }
  }, [actionId])

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsExecuting(true)
    
    const workflowId = `wf_${Date.now()}`
    const traceId = `trace_${Date.now()}`
    
    const workflow = {
      id: workflowId,
      action_id: actionId,
      action_name: action?.name || actionId,
      status: 'success',
      progress: 100,
      created_at: new Date().toISOString(),
      trace_id: traceId,
      result: formData,
      policy_decision: 'ALLOW',
      risk_score: action?.risk_level === 'high' ? 75 : action?.risk_level === 'medium' ? 50 : 25,
    }
    
    const existing = JSON.parse(localStorage.getItem('agentflow_workflows') || '[]')
    existing.unshift(workflow)
    localStorage.setItem('agentflow_workflows', JSON.stringify(existing))

    const audit = {
      id: `audit_${Date.now()}`,
      trace_id: traceId,
      workflow_id: workflowId,
      action_id: actionId,
      action_name: action?.name || actionId,
      user_id: 'user_demo',
      status: 'success',
      policy_decision: 'ALLOW',
      risk_score: workflow.risk_score,
      created_at: new Date().toISOString(),
      details: formData
    }
    const existingAudit = JSON.parse(localStorage.getItem('agentflow_audit_logs') || '[]')
    existingAudit.unshift(audit)
    localStorage.setItem('agentflow_audit_logs', JSON.stringify(existingAudit))

    window.dispatchEvent(new Event('storage'))

    toast({ title: '✅ Executed!', description: `${action?.name} completed` })
    setTimeout(() => router.push('/workflows'), 1500)
    setIsExecuting(false)
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
            <Badge className={action.risk_level === 'low' ? 'bg-green-100 text-green-800' : action.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>{action.risk_level?.toUpperCase()} RISK</Badge>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleExecute} className="space-y-4">
              {action.fields?.map((field: any) => (
                <div key={field.key} className="space-y-2">
                  <Label>{field.label}</Label>
                  <Input 
                    value={formData[field.key] || ''} 
                    onChange={(e) => setFormData((p: any) => ({...p, [field.key]: e.target.value}))} 
                    className="input"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="btn-primary flex-1" disabled={isExecuting}>
                  {isExecuting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Executing...</> : <><Play className="h-4 w-4 mr-2"/>Execute</>}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
