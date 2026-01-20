-- Fix infinite recursion in workspace_members RLS policy
-- Replace self-referencing subquery with security definer function

DROP POLICY IF EXISTS "Members can view workspace members" ON public.workspace_members;

CREATE POLICY "Members can view workspace members"
ON public.workspace_members
FOR SELECT
TO authenticated
USING (workspace_id = get_user_workspace_id(auth.uid()));