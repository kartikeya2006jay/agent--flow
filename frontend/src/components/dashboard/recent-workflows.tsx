'use client'

import { Workflow } from '@/types/workflows'
import { getStatusColor, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface RecentWorkflowsProps {
  workflows: Workflow[]
  limit?: number
}

export function RecentWorkflows({ workflows, limit = 5 }: RecentWorkflowsProps) {
  const recent = workflows.slice(0, limit)
  
  if (recent.length === 0) {
    return <p className="text-muted-foreground text-sm">No recent workflows</p>
  }
  
  return (
    <div className="space-y-3">
      {recent.map((workflow) => (
        <Link 
          key={workflow.id} 
          href={`/workflows/${workflow.id}`}
          className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{workflow.action_id}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(workflow.created_at)}
              </p>
            </div>
            <span className={`text-xs font-medium ${getStatusColor(workflow.status)}`}>
              {workflow.status}
            </span>
          </div>
          {workflow.progress !== undefined && workflow.progress < 100 && (
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ width: `${workflow.progress}%` }}
              />
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}
