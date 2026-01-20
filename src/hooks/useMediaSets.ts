import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type MediaSet = Database['public']['Tables']['media_sets']['Row'];
type MediaSetInsert = Database['public']['Tables']['media_sets']['Insert'];
type MediaSetUpdate = Database['public']['Tables']['media_sets']['Update'];

export function useMediaSets() {
  const { workspaceId } = useAuth();

  return useQuery({
    queryKey: ['media_sets', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      
      // Media sets are linked through products, so we need to get products first
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('workspace_id', workspaceId);
      
      if (productsError) throw productsError;
      
      const productIds = products.map(p => p.id);
      if (productIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('media_sets')
        .select('*')
        .in('product_id', productIds);
      
      if (error) throw error;
      return data as MediaSet[];
    },
    enabled: !!workspaceId,
  });
}

export function useMediaSet(productId: string | undefined) {
  return useQuery({
    queryKey: ['media_set', productId],
    queryFn: async () => {
      if (!productId) return null;
      
      const { data, error } = await supabase
        .from('media_sets')
        .select('*')
        .eq('product_id', productId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      return data as MediaSet;
    },
    enabled: !!productId,
  });
}

export function useCreateMediaSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mediaSet: MediaSetInsert) => {
      const { data, error } = await supabase
        .from('media_sets')
        .insert(mediaSet)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media_sets'] });
    },
  });
}

export function useUpdateMediaSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: MediaSetUpdate }) => {
      const { data, error } = await supabase
        .from('media_sets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['media_sets'] });
      queryClient.invalidateQueries({ queryKey: ['media_set'] });
    },
  });
}
