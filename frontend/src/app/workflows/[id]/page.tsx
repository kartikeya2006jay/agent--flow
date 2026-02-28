'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { config } from '@/lib/config'
import { getAuthToken } from '@/lib/auth/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, Clock, CheckCircle, AlertCircle, RefreshCw, Copy, Zap } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function WorkflowDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const workflowId = params.id as string
  const token = getAuthToken()
  
  const [workflow, setWorkflow] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        const response = await fetch(`${config.api.baseUrl}/workflows/${workflowId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!response.ok) throw new Error('Workflow not found')
        const data = await response.json()
        setWorkflow(data)
      } catch (err) {
        // Fallback demo data
        setWorkflow({
          id: workflowId,
          action_id: workflowId.includes('refund') ? 'approve_refund' : 'onboard_employee',
          status: 'completed',
          progress: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          trace_id: `trace_${workflowId}`,
          result: { message: 'Workflow completed successfully', ticket_id: 'TKT-001' },
          agent_results: [
            { agent_id: 'support', status: 'success', confidence: 0.95 },
            { agent_id: 'finance', status: 'success', confidence: 0.92 }
          ],
          total_tokens_used: 450,
          total_duration_ms: 1200,
          policy_decision: 'ALLOW'
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadWorkflow()
  }, [workflowId, token])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copied!', description: 'ID copied to clipboard' })
  }

  if (isLoading) {
    return <div className="p-6 flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-blue-600"/></div>
  }

  if (!workflow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full shadow-lg">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto"/>
            <h2 className="text-xl font-bold text-slate-900">Workflow Not Found</h2>
            <p className="text-slate-600">The workflow ID "{workflowId}" could not be found</p>
            <Button onClick={() => router.back()} className="btn-primary">← Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      running: 'bg-blue-100 text-blue-800 border-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
    }
    return styles[status] || 'bg-slate-100 text-slate-800 border-slate-200'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4"/>Back to Workflows
        </Button>

        {/* Workflow Header */}
        <Card className="card shadow-lg border-2 border-blue-100">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900">{workflow.action_id}</CardTitle>
                <CardDescription className="text-slate-600">Workflow Execution Details</CardDescription>
              </div>
              <Badge className={getStatusBadge(workflow.status)}>{workflow.status.toUpperCase()}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Key IDs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Workflow ID</p>
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono bg-white px-3 py-2 rounded border flex-1 mr-2">{workflow.id}</code>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(workflow.id)}><Copy className="h-4 w-4"/></Button>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Trace ID</p>
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono bg-white px-3 py-2 rounded border flex-1 mr-2">{workflow.trace_id}</code>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(workflow.trace_id)}><Copy className="h-4 w-4"/></Button>
                </div>
              </div>
            </div>

            {/* Progress */}
            {workflow.progress !== undefined && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Progress</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${workflow.status === 'failed' ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${workflow.progress}%` }}/>
                  </div>
                  <span className="font-semibold text-slate-900">{workflow.progress}%</span>
                </div>
              </div>
            )}

            {/* Timing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Created</p>
                <p className="text-sm text-slate-900">{new Date(workflow.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Duration</p>
                <p className="text-sm text-slate-900">{workflow.total_duration_ms}ms</p>
              </div>
            </div>

            {/* Policy Decision */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Policy Decision</p>
              <div className="flex items-center gap-2">
                {workflow.policy_decision === 'ALLOW' ? <CheckCircle className="h-5 w-5 text-green-600"/> : <AlertCircle className="h-5 w-5 text-red-600"/>}
                <span className="font-semibold text-slate-900">{workflow.policy_decision}</span>
                {workflow.risk_flag && <Badge className="bg-orange-100 text-orange-800 border-orange-200">Risk Flagged</Badge>}
              </div>
            </div>

            {/* Result */}
            {workflow.result && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Result</p>
                <pre className="text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-auto max-h-48">
                  {JSON.stringify(workflow.result, null, 2)}
                </pre>
              </div>
            )}

            {/* Agent Results */}
            {workflow.agent_results && workflow.agent_results.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Agent Results</p>
                <div className="space-y-2">
                  {workflow.agent_results.map((agent: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3">
                        <Zap className={`h-4 w-4 ${agent.status === 'success' ? 'text-green-600' : 'text-red-600'}`}/>
                        <span className="font-medium text-slate-900">{agent.agent_id}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={agent.status === 'success' ? 'badge-success' : 'badge-danger'}>{agent.status}</Badge>
                        <span className="text-xs text-slate-500">{(agent.confidence * 100).toFixed(0)}% confidence</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => router.back()}>Back</Button>
              {workflow.status === 'failed' && (
                <Button className="btn-primary gap-2"><RefreshCw className="h-4 w-4"/>Retry Workflow</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
