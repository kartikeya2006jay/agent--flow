import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { approvalsService } from '@/lib/api/services'
import { ApprovalDecisionPayload } from '@/types/approvals'
import { config } from '@/lib/config'

export function useApprovals() {
  const queryClient = useQueryClient()
  
  const { data: pending = [], isLoading, error, refetch } = useQuery({
    queryKey: ['approvals', 'pending'],
    queryFn: async () => {
      const response = await approvalsService.listPending()
      if (response.error) throw new Error(response.error.message)
      return response.data || []
    },
    staleTime: config.features.pollingIntervalMs,
    refetchInterval: config.features.pollingIntervalMs,
  })
  
  const decideMutation = useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: ApprovalDecisionPayload }) => {
      const response = await approvalsService.decide(id, decision)
      if (response.error) throw new Error(response.error.message)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] })
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
    },
  })
  
  return {
    pending,
    isLoading,
    error,
    refetch,
    decideApproval: decideMutation.mutateAsync,
    isDeciding: decideMutation.isPending,
  }
}
