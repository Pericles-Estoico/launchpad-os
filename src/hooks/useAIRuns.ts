import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type AIRun = Database['public']['Tables']['ai_runs']['Row'];
type AIRunInsert = Database['public']['Tables']['ai_runs']['Insert'];

export function useAIRuns(productId?: string) {
  const { workspaceId } = useAuth();

  return useQuery({
    queryKey: ['ai_runs', workspaceId, productId],
    queryFn: async () => {
      if (!workspaceId) return [];
      
      let query = supabase
        .from('ai_runs')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });
      
      if (productId) {
        query = query.eq('product_id', productId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as AIRun[];
    },
    enabled: !!workspaceId,
  });
}

export function useCreateAIRun() {
  const queryClient = useQueryClient();
  const { workspaceId } = useAuth();

  return useMutation({
    mutationFn: async (run: Omit<AIRunInsert, 'workspace_id'>) => {
      if (!workspaceId) throw new Error('No workspace');
      
      const { data, error } = await supabase
        .from('ai_runs')
        .insert({ ...run, workspace_id: workspaceId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai_runs'] });
    },
  });
}
