import { useQuery } from '@tanstack/react-query';
import { workflowsService } from '@/lib/api/services';
import { config } from '@/lib/config';

export function useWorkflows(params?: { limit?: number; status?: string }) {
  const { data: workflows, isLoading, error } = useQuery({
    queryKey: ['workflows', params],
    queryFn: async () => {
      const response = await workflowsService.list(params);
      if (response.error) throw new Error(response.error.message);
      return response.data || [];
    },
    staleTime: config.features.pollingIntervalMs,
    refetchInterval: config.features.pollingIntervalMs,
  });
  
  return { workflows: workflows || [], isLoading, error };
}