ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS city text;

COMMENT ON COLUMN public.profiles.city IS 'City of the user (e.g. Antananarivo, Port Louis)';
