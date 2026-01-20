import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type Activity = Database['public']['Tables']['activities']['Row'];
type ActivityInsert = Database['public']['Tables']['activities']['Insert'];

export function useActivities(limit: number = 20) {
  const { workspaceId } = useAuth();

  return useQuery({
    queryKey: ['activities', workspaceId, limit],
    queryFn: async () => {
      if (!workspaceId) return [];
      
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as Activity[];
    },
    enabled: !!workspaceId,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  const { workspaceId, user } = useAuth();

  return useMutation({
    mutationFn: async (activity: Omit<ActivityInsert, 'workspace_id' | 'user_id'>) => {
      if (!workspaceId) throw new Error('No workspace');
      
      const { data, error } = await supabase
        .from('activities')
        .insert({ 
          ...activity, 
          workspace_id: workspaceId,
          user_id: user?.id 
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
