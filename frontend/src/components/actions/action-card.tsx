'use client'

import { ActionDefinition } from '@/types/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getRiskStyles } from '@/lib/utils'
import { ArrowRight, Bot } from 'lucide-react'
import Link from 'next/link'

interface ActionCardProps {
  action: ActionDefinition
}

export function ActionCard({ action }: ActionCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{action.name}</CardTitle>
          <Badge className={getRiskStyles(action.risk_level)}>
            {action.risk_level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {action.description && (
          <p className="text-sm text-muted-foreground">{action.description}</p>
        )}
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Bot className="h-4 w-4" />
          <span>{action.target_agents.join(' → ')}</span>
        </div>
        
        {action.estimated_cost && (
          <p className="text-xs text-muted-foreground">
            Estimated cost: ${action.estimated_cost}
          </p>
        )}
        
        <Button asChild className="w-full">
          <Link href={`/actions/${action.id}`}>
            Execute Action
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
