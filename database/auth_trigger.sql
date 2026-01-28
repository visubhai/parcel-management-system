-- =============================================================================
-- AUTH TRIGGER
-- Run this in Supabase SQL Editor to auto-create a user profile when you sign up.
-- =============================================================================

-- 1. Create the Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.app_users (id, full_name, username, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'username', new.email),
    'ADMIN' -- Default Role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. (Optional) Fix Existing Users
-- If you already created a user and can't login, run this line (replace UUID):
-- INSERT INTO public.app_users (id, full_name, role) VALUES ('YOUR_USER_UUID_HERE', 'Super Admin', 'SUPER_ADMIN');
