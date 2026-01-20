-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can create their own workspaces" ON public.workspaces;

-- Create a new policy that allows authenticated users to insert
-- The trigger will automatically set created_by = auth.uid()
CREATE POLICY "Authenticated users can create workspaces"
ON public.workspaces
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow insert if created_by is null (trigger will set it) or matches the user
  created_by IS NULL OR created_by = auth.uid()
);