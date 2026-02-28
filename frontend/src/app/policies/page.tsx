'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Upload, FileText, Sparkles, Loader2, CheckCircle, AlertCircle, Shield, Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Policy {
  id: string
  title: string
  rule: string
  risk_level: string
  compliance: string[]
}

export default function PoliciesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [documentText, setDocumentText] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [policies, setPolicies] = useState<Policy[]>([])
  const [showDemo, setShowDemo] = useState(false)

  const handleExtract = async () => {
    if (!documentText.trim()) {
      toast({ variant: 'destructive', title: '❌ Error', description: 'Please enter document text' })
      return
    }
    
    setIsExtracting(true)
    try {
      const response = await fetch('/api/policies/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText, domain: 'enterprise' }),
      })
      
      const data = await response.json()
      
      if (data.policies && data.policies.length > 0) {
        setPolicies(data.policies)
        
        // Save to localStorage
        const existing = JSON.parse(localStorage.getItem('agentflow_policies') || '[]')
        existing.push(...data.policies)
        localStorage.setItem('agentflow_policies', JSON.stringify(existing))
        
        toast({ 
          title: '✅ Policies Extracted!', 
          description: `${data.policies.length} policies extracted ${data.mock ? '(demo)' : '(AI-powered)'}`
        })
      } else {
        throw new Error('No policies extracted')
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: '❌ Extraction Failed', description: err.message })
    } finally {
      setIsExtracting(false)
    }
  }

  const loadDemo = () => {
    const demoText = `COMPANY POLICY DOCUMENT

Section 1: Financial Controls
- All refunds under $1,000 USD may be automatically approved for customers with verified identity
- Refunds between $1,000 and $5,000 require single manager approval
- Refunds exceeding $5,000 require dual approval from Finance Director and Department Head
- All payment transactions must be logged with immutable audit trail

Section 2: Employee Management  
- New employee onboarding must be completed within 3 business days of start date
- IT provisioning (laptop, accounts, access) must be completed before Day 1
- All employees must complete compliance training within first week
- Employee data must be handled according to GDPR and HIPAA requirements

Section 3: Customer Support
- Priority 1 (Critical) tickets must be responded to within 15 minutes
- Priority 2 (High) tickets must be responded to within 1 hour
- All customer PII must be redacted before agent processing
- Customer data retention limited to 7 years per compliance requirements

Section 4: Security & Compliance
- All actions require policy evaluation before execution
- High-risk actions (score >70) require executive approval
- Audit logs must be retained for minimum 7 years
- SOC2 Type II compliance required for all financial workflows`
    
    setDocumentText(demoText)
    setShowDemo(true)
    toast({ title: '📄 Demo Loaded', description: 'Sample policy document loaded' })
  }

  const exportPolicies = () => {
    const csv = 'ID,Title,Risk Level,Compliance,Rule\n' + 
      policies.map(p => `${p.id},"${p.title}",${p.risk_level},"${p.compliance.join(';')}","${p.rule}"`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `policies_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast({ title: '✅ Exported!', description: 'Policies downloaded as CSV' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-20">
      <header className="border-b bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-1">
              <ArrowLeft className="h-4 w-4"/>Back
            </Button>
            <div>
              <h1 className="text-xl font-bold">AI Policy Generator</h1>
              <p className="text-sm text-slate-500">Upload documents → Auto-extract policies</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Upload Section */}
        <Card className="card border-2 border-purple-100">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                <Sparkles className="h-6 w-6 text-white"/>
              </div>
              <div>
                <CardTitle className="text-xl">Extract Policies from Document</CardTitle>
                <CardDescription>AI-powered policy extraction using OpenAI</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button onClick={loadDemo} variant="outline" className="gap-2">
                <FileText className="h-4 w-4"/>Load Demo Document
              </Button>
              {policies.length > 0 && (
                <Button onClick={exportPolicies} variant="outline" className="gap-2">
                  <Download className="h-4 w-4"/>Export CSV
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="font-semibold">Document Text</Label>
              <textarea 
                placeholder="Paste your policy document text here, or click 'Load Demo Document'..." 
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                className="w-full min-h-[200px] px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
            
            <Button 
              onClick={handleExtract} 
              disabled={isExtracting || !documentText.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 gap-2"
            >
              {isExtracting ? (
                <><Loader2 className="h-4 w-4 animate-spin"/>Extracting Policies...</>
              ) : (
                <><Upload className="h-4 w-4"/>Extract Policies with AI</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Extracted Policies */}
        {policies.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Extracted Policies ({policies.length})</h2>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">AI-Generated</Badge>
            </div>
            
            <div className="grid gap-4">
              {policies.map((policy, i) => (
                <Card key={policy.id} className="card border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100">
                          <Shield className="h-5 w-5 text-purple-600"/>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{policy.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">{policy.rule}</p>
                        </div>
                      </div>
                      <Badge className={
                        policy.risk_level === 'low' ? 'bg-green-100 text-green-800' : 
                        policy.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }>
                        {policy.risk_level.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {policy.compliance.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Info Card */}
        <Card className="card bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5"/>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">How It Works</p>
              <p>1. Paste your company policy document (PDF text, Word doc, etc.)</p>
              <p>2. Click "Extract Policies with AI"</p>
              <p>3. OpenAI analyzes the document and extracts governance rules</p>
              <p>4. Policies are saved and can be applied to workflows automatically</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
