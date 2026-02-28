'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    totalActions: number
    activeWorkflows: number
    pendingApprovals: number
    successRate: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const items = [
    {
      title: 'Total Actions',
      value: stats.totalActions,
      icon: Activity,
      color: 'text-blue-600',
    },
    {
      title: 'Active Workflows',
      value: stats.activeWorkflows,
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: AlertCircle,
      color: 'text-orange-600',
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: CheckCircle,
      color: 'text-green-600',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.title}
            </CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
