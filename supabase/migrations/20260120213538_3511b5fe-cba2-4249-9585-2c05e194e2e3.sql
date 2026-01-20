-- Fix workspaces INSERT policy
-- The issue: the trigger sets created_by AFTER the policy check, so created_by is NULL during check
-- But we need to ensure the policy allows this

-- First, drop and recreate the INSERT policy to be more permissive
DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON public.workspaces;

-- Create a simpler INSERT policy - any authenticated user can create a workspace
CREATE POLICY "Authenticated users can create workspaces"
ON public.workspaces FOR INSERT TO authenticated
WITH CHECK (true);

-- The trigger will set created_by automatically, so we just need to allow the insert