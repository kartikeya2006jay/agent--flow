'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, X, Save, Sparkles } from 'lucide-react'

interface CreateAgentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

export function CreateAgentModal({ open, onOpenChange, onCreated }: CreateAgentModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({ name: '', description: '', agents: [] as string[], risk_level: 'medium', estimated_cost: '0.01', compliance_tags: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const agents = [
    { id: 'support', name: 'Support' }, { id: 'hr', name: 'HR' }, { id: 'finance', name: 'Finance' },
    { id: 'it_ops', name: 'IT/Ops' }, { id: 'sales', name: 'Sales' },
  ]

  const handleSubmit = async () => {
    if (!formData.name || formData.agents.length === 0) {
      toast({ variant: 'destructive', title: '❌ Error', description: 'Name and agents required' })
      return
    }
    setIsSubmitting(true)
    try {
      const newAction = {
        id: formData.name.toLowerCase().replace(/\s+/g, '_'),
        name: formData.name,
        description: formData.description || 'Custom workflow',
        target_agents: formData.agents,
        risk_level: formData.risk_level,
        estimated_cost: parseFloat(formData.estimated_cost) || 0.01,
        compliance_tags: formData.compliance_tags.split(',').map((t:string) => t.trim()).filter(Boolean),
      }
      
      const existing = JSON.parse(localStorage.getItem('agentflow_custom_actions') || '[]')
      existing.push(newAction)
      localStorage.setItem('agentflow_custom_actions', JSON.stringify(existing))
      
      window.dispatchEvent(new Event('storage'))
      
      toast({ title: '✅ Created!', description: `${formData.name} added to Action Library` })
      onCreated?.()
      setFormData({ name: '', description: '', agents: [], risk_level: 'medium', estimated_cost: '0.01', compliance_tags: '' })
      onOpenChange(false)
    } catch (err: any) {
      toast({ variant: 'destructive', title: '❌ Failed', description: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader className="space-y-2 pb-4 border-b border-slate-200 px-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <Sparkles className="h-5 w-5 text-white"/>
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900">Create Custom Agent</DialogTitle>
                <DialogDescription className="text-slate-600">Define a new governed workflow</DialogDescription>
              </div>
            </div>
            <DialogClose onClick={() => onOpenChange(false)}/>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 px-6 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label className="font-semibold text-slate-700">Action Name *</Label>
            <Input placeholder="e.g., Process Invoice" value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} className="input h-11"/>
          </div>
          
          <div className="space-y-2">
            <Label className="font-semibold text-slate-700">Description</Label>
            <textarea placeholder="Describe what this action does..." value={formData.description} onChange={(e) => setFormData(p => ({...p, description: e.target.value}))} className="w-full min-h-[80px] px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={3}/>
          </div>
          
          <div className="space-y-2">
            <Label className="font-semibold text-slate-700">Target Agents *</Label>
            <Select onValueChange={(v) => { if (!formData.agents.includes(v)) setFormData(p => ({...p, agents: [...p.agents, v]})) }}>
              <SelectTrigger className="w-full h-11 border border-slate-300 rounded-lg px-3"><SelectValue placeholder="➕ Add agent..."/></SelectTrigger>
              <SelectContent className="z-[10001] bg-white border border-slate-200 rounded-lg shadow-xl">
                {agents.map(a => <SelectItem key={a.id} value={a.id} className="cursor-pointer px-3 py-2 hover:bg-blue-50">{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 p-3 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 min-h-[50px]">
              {formData.agents.length === 0 ? <p className="text-slate-400 text-sm w-full text-center">No agents selected</p> : formData.agents.map(agent => <Badge key={agent} className="bg-blue-100 text-blue-800 border-blue-200 gap-2">{agent}<button onClick={() => setFormData(p => ({...p, agents: p.agents.filter(a => a !== agent)}))}><X className="h-3 w-3"/></button></Badge>)}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="font-semibold text-slate-700">Risk Level</Label>
            <Select value={formData.risk_level} onValueChange={(v) => setFormData(p => ({...p, risk_level: v}))}>
              <SelectTrigger className="w-full h-11 border border-slate-300 rounded-lg px-3"><SelectValue/></SelectTrigger>
              <SelectContent className="z-[10001] bg-white border border-slate-200 rounded-lg shadow-xl">
                <SelectItem value="low" className="cursor-pointer px-3 py-2 hover:bg-green-50">🟢 Low - Auto-approve</SelectItem>
                <SelectItem value="medium" className="cursor-pointer px-3 py-2 hover:bg-yellow-50">🟡 Medium - Single approval</SelectItem>
                <SelectItem value="high" className="cursor-pointer px-3 py-2 hover:bg-orange-50">🟠 High - Dual approval</SelectItem>
                <SelectItem value="critical" className="cursor-pointer px-3 py-2 hover:bg-red-50">🔴 Critical - Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">Cost ($)</Label>
              <Input type="number" step="0.01" value={formData.estimated_cost} onChange={(e) => setFormData(p => ({...p, estimated_cost: e.target.value}))} className="input h-11"/>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">Compliance</Label>
              <Input placeholder="GDPR, SOX" value={formData.compliance_tags} onChange={(e) => setFormData(p => ({...p, compliance_tags: e.target.value}))} className="input h-11"/>
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name || formData.agents.length === 0} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 gap-2 shadow-lg">
            <Save className="h-4 w-4"/>{isSubmitting ? 'Creating...' : 'Create Agent'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
