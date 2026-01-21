import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { isLocalMode, setLocalWorkspaceId } from '@/lib/localMode';
import { useAppStore } from '@/store/useAppStore';

export function useOnboarding() {
  const { user, setWorkspaceId } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [localError, setLocalError] = useState<Error | null>(null);
  const setWorkspace = useAppStore((state) => state.setWorkspace);

  const createWorkspace = useMutation({
    mutationFn: async (workspaceName: string) => {
      if (!user) {
        const error = new Error('User not authenticated');
        setLocalError(error);
        throw error;
      }
      setIsCreating(true);

      try {
        setLocalError(null);
        console.log('Starting workspace creation for user:', user.id);
        const createLocalWorkspace = () => {
          const localWorkspaceId = `local-${crypto.randomUUID()}`;
          setLocalWorkspaceId(localWorkspaceId);
          setWorkspaceId(localWorkspaceId);
          setWorkspace({
            id: localWorkspaceId,
            name: workspaceName,
            tradeName: workspaceName,
            legalName: workspaceName,
          });
          return { id: localWorkspaceId, name: workspaceName };
        };

        if (isLocalMode) {
          return createLocalWorkspace();
        }

        try {
          const { data: createdWorkspace, error: workspaceError } = await supabase.rpc(
            'create_workspace_with_setup',
            {
              _workspace_name: workspaceName,
            }
          );

          console.log('Workspace setup result:', { createdWorkspace, workspaceError });

          if (workspaceError) {
            console.warn('Falling back to local workspace due to RPC error.', workspaceError);
            return createLocalWorkspace();
          }

          return createdWorkspace;
        } catch (error) {
          console.warn('Falling back to local workspace due to RPC exception.', error);
          return createLocalWorkspace();
        }
      } finally {
        setIsCreating(false);
      }
    },
    onSuccess: () => {
      // Invalidate all queries to refetch with new workspace
      queryClient.invalidateQueries();
      // Force page reload to get new session data when using remote DB
      if (!isLocalMode) {
        window.location.reload();
      }
    },
  });

  return {
    createWorkspace: createWorkspace.mutate,
    isCreating: isCreating || createWorkspace.isPending,
    error: localError,
  };
}
