-- ============================================================
-- Migration 006: Add testimonials table
-- ============================================================

-- Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- RLS Policies

-- Anyone can insert a testimonial (anonymous submissions allowed)
CREATE POLICY "testimonials_insert_anon"
  ON public.testimonials
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can read approved testimonials
CREATE POLICY "testimonials_select_approved"
  ON public.testimonials
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Admins can read all testimonials
CREATE POLICY "testimonials_select_admin"
  ON public.testimonials
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can update testimonials
CREATE POLICY "testimonials_update_admin"
  ON public.testimonials
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete testimonials
CREATE POLICY "testimonials_delete_admin"
  ON public.testimonials
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
