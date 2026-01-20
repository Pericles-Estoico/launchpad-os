-- Fix RLS policies for onboarding flow
-- The issue is that get_user_workspace_id() doesn't see newly inserted workspace_members in same transaction

-- ============================================
-- FIX gate_defs policies
-- ============================================
DROP POLICY IF EXISTS "Admins can manage gate defs" ON public.gate_defs;

-- INSERT: Use subquery instead of function for immediate visibility
CREATE POLICY "Admins can insert gate defs"
ON public.gate_defs FOR INSERT TO authenticated
WITH CHECK (
  workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- UPDATE: Admins only
CREATE POLICY "Admins can update gate defs"
ON public.gate_defs FOR UPDATE TO authenticated
USING (
  workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- DELETE: Admins only
CREATE POLICY "Admins can delete gate defs"
ON public.gate_defs FOR DELETE TO authenticated
USING (
  workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- ============================================
-- FIX gate_runs policies
-- ============================================
DROP POLICY IF EXISTS "Cadastro can insert gate runs" ON public.gate_runs;

CREATE POLICY "Members can insert gate runs"
ON public.gate_runs FOR INSERT TO authenticated
WITH CHECK (
  workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
);

-- ============================================
-- FIX requirements_library policies
-- ============================================
DROP POLICY IF EXISTS "Admins can manage requirements" ON public.requirements_library;

-- INSERT
CREATE POLICY "Admins can insert requirements"
ON public.requirements_library FOR INSERT TO authenticated
WITH CHECK (
  workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- UPDATE
CREATE POLICY "Admins can update requirements"
ON public.requirements_library FOR UPDATE TO authenticated
USING (
  workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- DELETE
CREATE POLICY "Admins can delete requirements"
ON public.requirements_library FOR DELETE TO authenticated
USING (
  workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  AND has_role(auth.uid(), 'admin'::app_role)
);