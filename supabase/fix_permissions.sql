-- Fix permissions for all tables
-- Run this in Supabase SQL Editor

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant all permissions on existing tables to service_role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant select/insert/update/delete on tables to authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant select/insert on tables to anon (public access where RLS allows)
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA public TO anon;

-- Set default permissions for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT ON TABLES TO anon;

-- Verify testimonials table has RLS and policies
SELECT * FROM pg_policies WHERE tablename = 'testimonials';
