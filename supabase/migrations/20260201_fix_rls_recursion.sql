-- Fix infinite recursion in organization_members RLS policy
-- The issue: The SELECT policy queries organization_members to check access,
-- which creates a circular dependency

-- Step 1: Drop the problematic policies
DROP POLICY IF EXISTS "Users can view members of their organizations" ON organization_members;
DROP POLICY IF EXISTS "Admins can add members to their organizations" ON organization_members;

-- Step 2: Create a security definer function to check membership
-- This function runs with elevated privileges and bypasses RLS
CREATE OR REPLACE FUNCTION public.user_is_org_member(org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
  );
$$;

-- Step 3: Create a security definer function to check admin status
CREATE OR REPLACE FUNCTION public.user_is_org_admin(org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Step 4: Recreate the SELECT policy using the security definer function
CREATE POLICY "Users can view members of their organizations"
  ON organization_members
  FOR SELECT
  USING (public.user_is_org_member(organization_id));

-- Step 5: Recreate the INSERT policy for admins using the security definer function
CREATE POLICY "Admins can add members to their organizations"
  ON organization_members
  FOR INSERT
  WITH CHECK (public.user_is_org_admin(organization_id));
