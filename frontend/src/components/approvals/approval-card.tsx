'use client'

import { ApprovalRequest } from '@/types/approvals'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getRiskStyles } from '@/lib/utils'

interface ApprovalCardProps {
  approval: ApprovalRequest
  onDecide: (id: string, decision: 'approved' | 'rejected') => void
}

export function ApprovalCard({ approval, onDecide }: ApprovalCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{approval.action_id}</CardTitle>
          <Badge className={getRiskStyles(approval.risk_level)}>
            {approval.risk_level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Risk score: {approval.risk_score}/100
        </p>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="default"
            onClick={() => onDecide(approval.id, 'approved')}
          >
            Approve
          </Button>
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => onDecide(approval.id, 'rejected')}
          >
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
