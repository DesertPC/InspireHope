-- Add locale preference to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locale TEXT;

-- Update existing profiles to default locale
UPDATE profiles SET locale = 'en' WHERE locale IS NULL;
