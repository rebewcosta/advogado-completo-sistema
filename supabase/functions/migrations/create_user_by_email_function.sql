
-- This SQL creates a function to check if a user exists by email safely
CREATE OR REPLACE FUNCTION public.get_user_by_email(email_to_check TEXT)
RETURNS TABLE (count BIGINT)
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY 
  SELECT COUNT(*)::BIGINT 
  FROM auth.users 
  WHERE email = email_to_check;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_by_email TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_by_email TO anon;
