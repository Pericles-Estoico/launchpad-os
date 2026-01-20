-- Add INSERT policies for onboarding flow

-- 1. Allow authenticated users to create workspaces
CREATE POLICY "Authenticated users can create workspaces"
ON public.workspaces
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. Allow users to add themselves as workspace members
CREATE POLICY "Users can add themselves to workspaces"
ON public.workspace_members
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 3. Allow users to manage their own roles (for onboarding)
CREATE POLICY "Users can insert own role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own role"
ON public.user_roles
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own role"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());