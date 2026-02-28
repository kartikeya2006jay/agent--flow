import { useQuery } from '@tanstack/react-query'
import { auditService } from '@/lib/api/services'

export function useAudit(params?: Record<string, unknown>) {
  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ['audit', 'logs', params],
    queryFn: async () => {
      const response = await auditService.queryLogs(params)
      if (response.error) throw new Error(response.error.message)
      return response.data || []
    },
  })
  
  return { logs, isLoading, error }
}
