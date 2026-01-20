import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type WarTask = Database['public']['Tables']['war_tasks']['Row'];
type WarTaskInsert = Database['public']['Tables']['war_tasks']['Insert'];
type WarTaskUpdate = Database['public']['Tables']['war_tasks']['Update'];

export function useWarTasks() {
  const { workspaceId } = useAuth();

  return useQuery({
    queryKey: ['war_tasks', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      
      const { data, error } = await supabase
        .from('war_tasks')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('priority', { ascending: false });
      
      if (error) throw error;
      return data as WarTask[];
    },
    enabled: !!workspaceId,
  });
}

export function useCreateWarTask() {
  const queryClient = useQueryClient();
  const { workspaceId } = useAuth();

  return useMutation({
    mutationFn: async (task: Omit<WarTaskInsert, 'workspace_id'>) => {
      if (!workspaceId) throw new Error('No workspace');
      
      const { data, error } = await supabase
        .from('war_tasks')
        .insert({ ...task, workspace_id: workspaceId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['war_tasks'] });
    },
  });
}

export function useUpdateWarTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: WarTaskUpdate }) => {
      const { data, error } = await supabase
        .from('war_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['war_tasks'] });
    },
  });
}
