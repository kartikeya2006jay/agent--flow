'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { config } from '@/lib/config'
import { getAuthToken } from '@/lib/auth/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ActionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const actionId = params.id as string
  const token = getAuthToken()
  const [formData, setFormData] = useState({ order_id: '', amount: '', reason: '' })
  const [isExecuting, setIsExecuting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const { data: action, isLoading } = useQuery({
    queryKey: ['action', actionId],
    queryFn: async () => {
      const response = await fetch(`${config.api.baseUrl}/actions/${actionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Action not found')
      return await response.json()
    },
    enabled: !!token && !!actionId,
  })

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsExecuting(true)
    setResult(null)

    try {
      const payload = {
        action: actionId,
        target_agents: action?.target_agents || ['support'],
        data: {
          order_id: formData.order_id || `ORD-${Date.now()}`,
          amount: parseFloat(formData.amount) || 500,
          reason: formData.reason || 'Demo execution'
        },
        context: {
          user_id: 'usr_demo',
          enterprise_id: 'demo-enterprise',
          risk_level: action?.risk_level || 'medium',
          request_source: 'dashboard'
        },
        timeout_ms: 30000
      }

      const response = await fetch(`${config.api.baseUrl}/actions/${actionId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.detail || 'Execution failed')
      }

      setResult(result)
      toast({ title: '✅ Execution Successful!', description: `Workflow: ${result.workflow_id}` })

    } catch (err: any) {
      toast({ variant: 'destructive', title: '❌ Execution Failed', description: err.message })
    } finally {
      setIsExecuting(false)
    }
  }

  if (isLoading) return <div className="p-6"><p className="text-slate-500">Loading action...</p></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {/* Action Card */}
        <Card className="card shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100"><Shield className="h-6 w-6 text-blue-600"/></div>
              <div>
                <CardTitle className="text-2xl">{action?.name || actionId}</CardTitle>
                <p className="text-slate-500 text-sm">Execute this governed workflow</p>
              </div>
            </div>
            <Badge className={action?.risk_level === 'low' ? 'badge-success' : action?.risk_level === 'medium' ? 'badge-warning' : 'badge-danger'}>
              {action?.risk_level?.toUpperCase() || 'MEDIUM'} RISK
            </Badge>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleExecute} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="order_id">Order ID</Label>
                <Input id="order_id" placeholder="Enter Order ID" value={formData.order_id} onChange={(e) => setFormData(prev => ({ ...prev, order_id: e.target.value }))} className="input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" step="0.01" placeholder="Enter Amount" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} className="input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input id="reason" placeholder="Enter Reason" value={formData.reason} onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))} className="input" />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="btn-primary flex-1" disabled={isExecuting}>
                  {isExecuting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Executing...</> : 'Execute Action'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setFormData({ order_id: '', amount: '', reason: '' })}>Reset</Button>
              </div>
            </form>

            {/* Execution Result */}
            {result && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-green-700 font-semibold"><CheckCircle className="h-5 w-5"/>Execution Complete</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><strong>Workflow ID:</strong><br/><code className="bg-white px-2 py-1 rounded">{result.workflow_id}</code></div>
                  <div><strong>Status:</strong><br/><span className="text-green-700 font-medium">{result.status}</span></div>
                  <div><strong>Trace ID:</strong><br/><code className="bg-white px-2 py-1 rounded">{result.trace_id}</code></div>
                  <div><strong>Duration:</strong><br/><span>{result.total_duration_ms}ms</span></div>
                </div>
                {result.result && (
                  <div className="pt-3 border-t border-green-200">
                    <strong>Result:</strong>
                    <pre className="mt-2 text-xs bg-white p-3 rounded overflow-auto max-h-40">{JSON.stringify(result.result, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
