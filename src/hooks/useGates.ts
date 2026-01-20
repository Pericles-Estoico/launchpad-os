import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type GateDef = Database['public']['Tables']['gate_defs']['Row'];
type GateDefInsert = Database['public']['Tables']['gate_defs']['Insert'];
type GateDefUpdate = Database['public']['Tables']['gate_defs']['Update'];
type GateRun = Database['public']['Tables']['gate_runs']['Row'];
type GateRunUpdate = Database['public']['Tables']['gate_runs']['Update'];

export function useGateDefs() {
  const { workspaceId } = useAuth();

  return useQuery({
    queryKey: ['gate_defs', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      
      const { data, error } = await supabase
        .from('gate_defs')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('gate_order', { ascending: true });
      
      if (error) throw error;
      return data as GateDef[];
    },
    enabled: !!workspaceId,
  });
}

export function useGateRuns() {
  const { workspaceId } = useAuth();

  return useQuery({
    queryKey: ['gate_runs', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      
      const { data, error } = await supabase
        .from('gate_runs')
        .select('*, gate_defs(*)')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!workspaceId,
  });
}

export function useCreateGateDef() {
  const queryClient = useQueryClient();
  const { workspaceId } = useAuth();

  return useMutation({
    mutationFn: async (gateDef: Omit<GateDefInsert, 'workspace_id'>) => {
      if (!workspaceId) throw new Error('No workspace');
      
      const { data, error } = await supabase
        .from('gate_defs')
        .insert({ ...gateDef, workspace_id: workspaceId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gate_defs'] });
    },
  });
}

export function useUpdateGateDef() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: GateDefUpdate }) => {
      const { data, error } = await supabase
        .from('gate_defs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gate_defs'] });
    },
  });
}

export function useDeleteGateDef() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('gate_defs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gate_defs'] });
    },
  });
}

export function useUpdateGateRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: GateRunUpdate }) => {
      const { data, error } = await supabase
        .from('gate_runs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gate_runs'] });
    },
  });
}
