-- 1. Add created_by column to workspaces table
ALTER TABLE public.workspaces 
ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON public.workspaces;

-- 3. Create a more secure policy that checks the creator
CREATE POLICY "Users can create their own workspaces"
ON public.workspaces
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());