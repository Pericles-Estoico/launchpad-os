-- Create RPC used by onboarding to create workspace and initial setup
DROP FUNCTION IF EXISTS public.create_workspace_with_setup(text);
CREATE OR REPLACE FUNCTION public.create_workspace_with_setup(_workspace_name text)
RETURNS public.workspaces
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_workspace public.workspaces%ROWTYPE;
  gate_def_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  INSERT INTO public.workspaces (name)
  VALUES (_workspace_name)
  RETURNING *
  INTO new_workspace;

  INSERT INTO public.workspace_members (workspace_id, user_id)
  VALUES (new_workspace.id, auth.uid());

  DELETE FROM public.user_roles
  WHERE user_id = auth.uid();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'admin');

  -- Mercado Livre gate definitions
  INSERT INTO public.gate_defs (workspace_id, marketplace, gate_key, gate_order, name, checklist, requires_auditor)
  VALUES
    (
      new_workspace.id,
      'mercadolivre',
      'seller_account',
      1,
      'Conta de Vendedor',
      jsonb_build_array(
        jsonb_build_object('id', 'item-0', 'label', 'Criar conta no ML'),
        jsonb_build_object('id', 'item-1', 'label', 'Verificar email'),
        jsonb_build_object('id', 'item-2', 'label', 'Adicionar dados bancários')
      ),
      false
    )
  RETURNING id INTO gate_def_id;

  INSERT INTO public.gate_runs (workspace_id, gate_def_id, status, checklist_status, evidence)
  VALUES (new_workspace.id, gate_def_id, 'open', '{}'::jsonb, '[]'::jsonb);

  INSERT INTO public.gate_defs (workspace_id, marketplace, gate_key, gate_order, name, checklist, requires_auditor)
  VALUES
    (
      new_workspace.id,
      'mercadolivre',
      'brand_registry',
      2,
      'Registro de Marca',
      jsonb_build_array(
        jsonb_build_object('id', 'item-0', 'label', 'Enviar documentação'),
        jsonb_build_object('id', 'item-1', 'label', 'Aguardar aprovação')
      ),
      true
    )
  RETURNING id INTO gate_def_id;

  INSERT INTO public.gate_runs (workspace_id, gate_def_id, status, checklist_status, evidence)
  VALUES (new_workspace.id, gate_def_id, 'locked', '{}'::jsonb, '[]'::jsonb);

  INSERT INTO public.gate_defs (workspace_id, marketplace, gate_key, gate_order, name, checklist, requires_auditor)
  VALUES
    (
      new_workspace.id,
      'mercadolivre',
      'catalog_ready',
      3,
      'Catálogo Pronto',
      jsonb_build_array(
        jsonb_build_object('id', 'item-0', 'label', 'Mínimo 10 produtos'),
        jsonb_build_object('id', 'item-1', 'label', 'Fotos aprovadas'),
        jsonb_build_object('id', 'item-2', 'label', 'Descrições completas')
      ),
      false
    )
  RETURNING id INTO gate_def_id;

  INSERT INTO public.gate_runs (workspace_id, gate_def_id, status, checklist_status, evidence)
  VALUES (new_workspace.id, gate_def_id, 'locked', '{}'::jsonb, '[]'::jsonb);

  INSERT INTO public.gate_defs (workspace_id, marketplace, gate_key, gate_order, name, checklist, requires_auditor)
  VALUES
    (
      new_workspace.id,
      'mercadolivre',
      'publish_gate',
      4,
      'Gate de Publicação',
      jsonb_build_array(
        jsonb_build_object('id', 'item-0', 'label', 'Revisar anúncios'),
        jsonb_build_object('id', 'item-1', 'label', 'Configurar frete'),
        jsonb_build_object('id', 'item-2', 'label', 'Definir preços')
      ),
      false
    )
  RETURNING id INTO gate_def_id;

  INSERT INTO public.gate_runs (workspace_id, gate_def_id, status, checklist_status, evidence)
  VALUES (new_workspace.id, gate_def_id, 'locked', '{}'::jsonb, '[]'::jsonb);

  -- Shopee gate definitions
  INSERT INTO public.gate_defs (workspace_id, marketplace, gate_key, gate_order, name, checklist, requires_auditor)
  VALUES
    (
      new_workspace.id,
      'shopee',
      'seller_account',
      1,
      'Conta de Vendedor',
      jsonb_build_array(
        jsonb_build_object('id', 'item-0', 'label', 'Criar conta na Shopee'),
        jsonb_build_object('id', 'item-1', 'label', 'Verificar celular'),
        jsonb_build_object('id', 'item-2', 'label', 'Adicionar dados bancários')
      ),
      false
    )
  RETURNING id INTO gate_def_id;

  INSERT INTO public.gate_runs (workspace_id, gate_def_id, status, checklist_status, evidence)
  VALUES (new_workspace.id, gate_def_id, 'open', '{}'::jsonb, '[]'::jsonb);

  INSERT INTO public.gate_defs (workspace_id, marketplace, gate_key, gate_order, name, checklist, requires_auditor)
  VALUES
    (
      new_workspace.id,
      'shopee',
      'brand_registry',
      2,
      'Registro de Marca',
      jsonb_build_array(
        jsonb_build_object('id', 'item-0', 'label', 'Enviar documentação'),
        jsonb_build_object('id', 'item-1', 'label', 'Aguardar aprovação')
      ),
      true
    )
  RETURNING id INTO gate_def_id;

  INSERT INTO public.gate_runs (workspace_id, gate_def_id, status, checklist_status, evidence)
  VALUES (new_workspace.id, gate_def_id, 'locked', '{}'::jsonb, '[]'::jsonb);

  INSERT INTO public.gate_defs (workspace_id, marketplace, gate_key, gate_order, name, checklist, requires_auditor)
  VALUES
    (
      new_workspace.id,
      'shopee',
      'catalog_ready',
      3,
      'Catálogo Pronto',
      jsonb_build_array(
        jsonb_build_object('id', 'item-0', 'label', 'Mínimo 5 produtos'),
        jsonb_build_object('id', 'item-1', 'label', 'Fotos aprovadas')
      ),
      false
    )
  RETURNING id INTO gate_def_id;

  INSERT INTO public.gate_runs (workspace_id, gate_def_id, status, checklist_status, evidence)
  VALUES (new_workspace.id, gate_def_id, 'locked', '{}'::jsonb, '[]'::jsonb);

  INSERT INTO public.gate_defs (workspace_id, marketplace, gate_key, gate_order, name, checklist, requires_auditor)
  VALUES
    (
      new_workspace.id,
      'shopee',
      'publish_gate',
      4,
      'Gate de Publicação',
      jsonb_build_array(
        jsonb_build_object('id', 'item-0', 'label', 'Revisar anúncios'),
        jsonb_build_object('id', 'item-1', 'label', 'Configurar frete')
      ),
      false
    )
  RETURNING id INTO gate_def_id;

  INSERT INTO public.gate_runs (workspace_id, gate_def_id, status, checklist_status, evidence)
  VALUES (new_workspace.id, gate_def_id, 'locked', '{}'::jsonb, '[]'::jsonb);

  -- Requirements library
  INSERT INTO public.requirements_library (workspace_id, marketplace, categories)
  VALUES
    (
      new_workspace.id,
      'mercadolivre',
      jsonb_build_array(
        jsonb_build_object(
          'name', 'Documentos',
          'items', jsonb_build_array(
            jsonb_build_object('id', '1', 'label', 'CNPJ ativo', 'verified', false),
            jsonb_build_object('id', '2', 'label', 'Contrato social', 'verified', false)
          )
        ),
        jsonb_build_object(
          'name', 'Imagens',
          'items', jsonb_build_array(
            jsonb_build_object('id', '3', 'label', 'Logo em alta resolução', 'verified', false)
          )
        )
      )
    ),
    (
      new_workspace.id,
      'shopee',
      jsonb_build_array(
        jsonb_build_object(
          'name', 'Documentos',
          'items', jsonb_build_array(
            jsonb_build_object('id', '1', 'label', 'CNPJ ativo', 'verified', false),
            jsonb_build_object('id', '2', 'label', 'RG do responsável', 'verified', false)
          )
        )
      )
    );

  RETURN new_workspace;
END;
$$;
