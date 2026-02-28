'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { ActionDefinition, ActionExecutionRequest, ActionContext } from '@/types/actions'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/lib/auth/store'
import { useActions } from '@/hooks/use-actions'
import { useToast } from '@/hooks/use-toast'

interface ActionFormProps {
  action: ActionDefinition
  onSuccess?: (result: unknown) => void
}

// Dynamic schema builder - no hardcoding field names
function buildActionSchema(action: ActionDefinition) {
  // In production: parse action.input_schema from backend
  // For MVP: use sensible defaults based on action ID
  const baseSchema: Record<string, z.ZodTypeAny> = {}
  
  // Common fields across actions
  if (action.target_agents.includes('support') || action.target_agents.includes('finance')) {
    baseSchema.order_id = z.string().min(1, 'Order ID required')
    baseSchema.amount = z.number().min(0, 'Amount must be positive')
    baseSchema.reason = z.string().min(1, 'Reason required')
  }
  if (action.target_agents.includes('hr')) {
    baseSchema.name = z.string().min(1, 'Name required')
    baseSchema.dept = z.string().min(1, 'Department required')
    baseSchema.start_date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
  }
  if (action.target_agents.includes('sales')) {
    baseSchema.lead_id = z.string().min(1, 'Lead ID required')
    baseSchema.stage = z.string().min(1, 'Stage required')
    baseSchema.notes = z.string().optional()
  }
  
  return z.object(baseSchema)
}

export function ActionForm({ action, onSuccess }: ActionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { executeAction } = useActions()
  const { user } = useAuthStore()
  
  const schema = buildActionSchema(action)
  type FormData = z.infer<typeof schema>
  
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {} as FormData,
  })
  
  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not authenticated' })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Build dynamic context from config + user
      const context: ActionContext = {
        user_id: user.id,
        enterprise_id: user.enterprise_id,
        enterprise_type: user.enterprise_type,
        risk_level: action.risk_level,
        request_source: 'dashboard',
      }
      
      const payload: ActionExecutionRequest = {
        action: action.id,
        target_agents: action.target_agents,
        data: data as Record<string, unknown>,
        context,
        timeout_ms: 30000,
      }
      
      const result = await executeAction({ actionId: action.id, payload })
      
      toast({ 
        title: result.status === 'success' ? 'Executed' : 'Pending Approval',
        description: result.result?.message || result.error,
      })
      
      onSuccess?.(result)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Execution failed',
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Dynamic form fields based on schema
  const fields = Object.keys(schema.shape || {})
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field) => (
          <FormField
            key={field}
            control={form.control}
            name={field as keyof FormData}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="capitalize">{field.replace('_', ' ')}</FormLabel>
                <FormControl>
                  <Input 
                    {...formField} 
                    type={field.includes('date') ? 'date' : field.includes('amount') ? 'number' : 'text'}
                    placeholder={`Enter ${field.replace('_', ' ')}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Executing...' : `Execute ${action.name}`}
          </Button>
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
        </div>
      </form>
    </Form>
  )
}
