-- Fix workspaces SELECT policy to allow creator to see newly created workspace
-- The issue: INSERT with .select() requires SELECT policy to pass
-- But current SELECT policy checks workspace_members which doesn't exist yet

DROP POLICY IF EXISTS "Members can view workspace" ON public.workspaces;

-- Allow workspace members OR the creator to view the workspace
CREATE POLICY "Members can view workspace"
ON public.workspaces FOR SELECT TO authenticated
USING (
  id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  OR created_by = auth.uid()
);