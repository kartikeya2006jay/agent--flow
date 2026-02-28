'use client'

import { ActionDefinition } from '@/types/actions'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getRiskStyles } from '@/lib/utils'
import Link from 'next/link'

interface ActionListProps {
  actions: ActionDefinition[]
  compact?: boolean
  isLoading?: boolean
}

export function ActionList({ actions, compact = false, isLoading = false }: ActionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse h-16 rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (actions.length === 0) {
    return <p className="text-muted-foreground text-sm">No actions available</p>
  }

  return (
    <div className={compact ? 'space-y-2' : 'grid gap-3'}>
      {actions.map((action) => (
        <Link key={action.id} href={`/actions/${action.id}`} className="block">
          <Card className={compact ? 'py-2 px-3' : 'p-4'}>
            <CardContent className={compact ? 'p-0' : 'p-0'}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={compact ? 'text-sm font-medium' : 'font-medium'}>
                    {action.name}
                  </p>
                  {!compact && action.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  )}
                </div>
                <Badge className={getRiskStyles(action.risk_level)}>
                  {action.risk_level}
                </Badge>
              </div>
              {!compact && (
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <span>Agents: {action.target_agents.join(', ')}</span>
                  {action.estimated_cost && (
                    <span>• Est. cost: ${action.estimated_cost}</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
