import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { actionsService } from '@/lib/api/services';
import { ActionDefinition, ActionExecutionRequest, ActionExecutionResponse } from '@/types';

export function useActions() {
  const queryClient = useQueryClient();
  
  // List actions - auto-refetch on window focus
  const { data: actions, isLoading, error, refetch } = useQuery({
    queryKey: ['actions'],
    queryFn: async () => {
      const response = await actionsService.list();
      if (response.error) throw new Error(response.error.message);
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Execute action mutation
  const executeMutation = useMutation({
    mutationFn: async ({ actionId, payload }: { 
      actionId: string; 
      payload: ActionExecutionRequest 
    }) => {
      const response = await actionsService.execute(actionId, payload);
      if (response.error) throw new Error(response.error.message);
      return response.data as ActionExecutionResponse;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      if (data.status === 'pending_approval') {
        queryClient.invalidateQueries({ queryKey: ['approvals'] });
      }
    },
  });
  
  return {
    actions: actions || [],
    isLoading,
    error,
    refetch,
    executeAction: executeMutation.mutateAsync,
    isExecuting: executeMutation.isPending,
  };
}