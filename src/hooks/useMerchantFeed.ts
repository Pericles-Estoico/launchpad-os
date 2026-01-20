import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type MerchantFeedRow = Database['public']['Tables']['merchant_feed_rows']['Row'];
type MerchantFeedRowInsert = Database['public']['Tables']['merchant_feed_rows']['Insert'];
type MerchantFeedRowUpdate = Database['public']['Tables']['merchant_feed_rows']['Update'];

export function useMerchantFeed() {
  const { workspaceId } = useAuth();

  return useQuery({
    queryKey: ['merchant_feed', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      
      const { data, error } = await supabase
        .from('merchant_feed_rows')
        .select('*, products(*)')
        .eq('workspace_id', workspaceId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!workspaceId,
  });
}

export function useCreateMerchantFeedRow() {
  const queryClient = useQueryClient();
  const { workspaceId } = useAuth();

  return useMutation({
    mutationFn: async (row: Omit<MerchantFeedRowInsert, 'workspace_id'>) => {
      if (!workspaceId) throw new Error('No workspace');
      
      const { data, error } = await supabase
        .from('merchant_feed_rows')
        .insert({ ...row, workspace_id: workspaceId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant_feed'] });
    },
  });
}

export function useUpdateMerchantFeedRow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: MerchantFeedRowUpdate }) => {
      const { data, error } = await supabase
        .from('merchant_feed_rows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant_feed'] });
    },
  });
}
