import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useOnboarding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const createWorkspace = useMutation({
    mutationFn: async (workspaceName: string) => {
      if (!user) throw new Error('User not authenticated');
      setIsCreating(true);

      try {
        // 1. Create workspace (created_by is set automatically by trigger)
        const { data: workspace, error: workspaceError } = await supabase
          .from('workspaces')
          .insert({ name: workspaceName })
          .select()
          .single();

        if (workspaceError) throw workspaceError;

        // 2. Add user as workspace member
        const { error: memberError } = await supabase
          .from('workspace_members')
          .insert({
            workspace_id: workspace.id,
            user_id: user.id,
          });

        if (memberError) throw memberError;

        // 3. Give user admin role
        // First, delete existing role if any
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', user.id);

        // Then insert admin role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'admin',
          });

        if (roleError) throw roleError;

        // 4. Create initial gate definitions for marketplaces
        const gateDefs = [
          { marketplace: 'mercadolivre' as const, gate_key: 'seller_account', gate_order: 1, name: 'Conta de Vendedor', checklist: ['Criar conta no ML', 'Verificar email', 'Adicionar dados bancários'] },
          { marketplace: 'mercadolivre' as const, gate_key: 'brand_registry', gate_order: 2, name: 'Registro de Marca', checklist: ['Enviar documentação', 'Aguardar aprovação'], requires_auditor: true },
          { marketplace: 'mercadolivre' as const, gate_key: 'catalog_ready', gate_order: 3, name: 'Catálogo Pronto', checklist: ['Mínimo 10 produtos', 'Fotos aprovadas', 'Descrições completas'] },
          { marketplace: 'mercadolivre' as const, gate_key: 'publish_gate', gate_order: 4, name: 'Gate de Publicação', checklist: ['Revisar anúncios', 'Configurar frete', 'Definir preços'] },
          { marketplace: 'shopee' as const, gate_key: 'seller_account', gate_order: 1, name: 'Conta de Vendedor', checklist: ['Criar conta na Shopee', 'Verificar celular', 'Adicionar dados bancários'] },
          { marketplace: 'shopee' as const, gate_key: 'brand_registry', gate_order: 2, name: 'Registro de Marca', checklist: ['Enviar documentação', 'Aguardar aprovação'], requires_auditor: true },
          { marketplace: 'shopee' as const, gate_key: 'catalog_ready', gate_order: 3, name: 'Catálogo Pronto', checklist: ['Mínimo 5 produtos', 'Fotos aprovadas'] },
          { marketplace: 'shopee' as const, gate_key: 'publish_gate', gate_order: 4, name: 'Gate de Publicação', checklist: ['Revisar anúncios', 'Configurar frete'] },
        ];

        for (const gateDef of gateDefs) {
          const { data: gateDefData, error: gateDefError } = await supabase
            .from('gate_defs')
            .insert({
              workspace_id: workspace.id,
              ...gateDef,
              checklist: gateDef.checklist.map((item, i) => ({ id: `item-${i}`, label: item })),
            })
            .select()
            .single();

          if (gateDefError) throw gateDefError;

          // Create initial gate run (first one unlocked, rest locked)
          const { error: gateRunError } = await supabase
            .from('gate_runs')
            .insert([{
              workspace_id: workspace.id,
              gate_def_id: gateDefData.id,
              status: (gateDef.gate_order === 1 ? 'open' : 'locked') as 'open' | 'locked',
              checklist_status: {},
              evidence: [],
            }]);
          
          if (gateRunError) console.warn('Gate run error:', gateRunError);
        }

        // 5. Create initial requirements library
        const requirements = [
          {
            marketplace: 'mercadolivre' as const,
            categories: [
              { name: 'Documentos', items: [{ id: '1', label: 'CNPJ ativo', verified: false }, { id: '2', label: 'Contrato social', verified: false }] },
              { name: 'Imagens', items: [{ id: '3', label: 'Logo em alta resolução', verified: false }] },
            ],
          },
          {
            marketplace: 'shopee' as const,
            categories: [
              { name: 'Documentos', items: [{ id: '1', label: 'CNPJ ativo', verified: false }, { id: '2', label: 'RG do responsável', verified: false }] },
            ],
          },
        ];

        for (const req of requirements) {
          await supabase
            .from('requirements_library')
            .insert({
              workspace_id: workspace.id,
              marketplace: req.marketplace,
              categories: req.categories,
            });
        }

        return workspace;
      } finally {
        setIsCreating(false);
      }
    },
    onSuccess: () => {
      // Invalidate all queries to refetch with new workspace
      queryClient.invalidateQueries();
      // Force page reload to get new session data
      window.location.reload();
    },
  });

  return {
    createWorkspace: createWorkspace.mutate,
    isCreating: isCreating || createWorkspace.isPending,
    error: createWorkspace.error,
  };
}
