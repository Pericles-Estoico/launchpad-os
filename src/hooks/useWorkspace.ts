import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type Workspace = Database['public']['Tables']['workspaces']['Row'];
type WorkspaceUpdate = Database['public']['Tables']['workspaces']['Update'];
type RequirementsLibrary = Database['public']['Tables']['requirements_library']['Row'];
type RequirementsLibraryInsert = Database['public']['Tables']['requirements_library']['Insert'];
type RequirementsLibraryUpdate = Database['public']['Tables']['requirements_library']['Update'];

export function useWorkspace() {
  const { workspaceId } = useAuth();

  return useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();
      
      if (error) throw error;
      return data as Workspace;
    },
    enabled: !!workspaceId,
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  const { workspaceId } = useAuth();

  return useMutation({
    mutationFn: async (updates: WorkspaceUpdate) => {
      if (!workspaceId) throw new Error('No workspace');
      
      const { data, error } = await supabase
        .from('workspaces')
        .update(updates)
        .eq('id', workspaceId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
    },
  });
}

export function useWorkspaceMembers() {
  const { workspaceId } = useAuth();

  return useQuery({
    queryKey: ['workspace_members', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          *,
          profiles!inner(id, name, email, avatar_url),
          user_roles!inner(role)
        `)
        .eq('workspace_id', workspaceId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!workspaceId,
  });
}

export function useRequirements() {
  const { workspaceId } = useAuth();

  return useQuery({
    queryKey: ['requirements', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      
      const { data, error } = await supabase
        .from('requirements_library')
        .select('*')
        .eq('workspace_id', workspaceId);
      
      if (error) throw error;
      return data as RequirementsLibrary[];
    },
    enabled: !!workspaceId,
  });
}

export function useCreateRequirement() {
  const queryClient = useQueryClient();
  const { workspaceId } = useAuth();

  return useMutation({
    mutationFn: async (requirement: Omit<RequirementsLibraryInsert, 'workspace_id'>) => {
      if (!workspaceId) throw new Error('No workspace');
      
      const { data, error } = await supabase
        .from('requirements_library')
        .insert({ ...requirement, workspace_id: workspaceId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
    },
  });
}

export function useUpdateRequirement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: RequirementsLibraryUpdate }) => {
      const { data, error } = await supabase
        .from('requirements_library')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
    },
  });
}

export function useDeleteRequirement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('requirements_library')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
    },
  });
}
