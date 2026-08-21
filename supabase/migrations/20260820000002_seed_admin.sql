-- ==================================================
-- JEROSSA — PHASE 9 : Seed admin de test
-- Crée un compte admin de test via auth.sign_up
-- puis assigne le rôle admin dans profiles.
--
-- ⚠️  À exécuter une seule fois (ou dans le shell Supabase).
-- En prod, on crée l'admin manuellement via le dashboard Supabase.
-- ==================================================

-- Insertion directe dans auth.users + profiles
-- (ne fonctionne que si exécuté en tant que service_role ou dans une migration)

-- 1. Créer l'utilisateur auth (idempotent : ne réinsère pas si l'email existe déjà)
-- ⚠️ Toutes les colonnes texte doivent être '' et jamais NULL,
-- sinon GoTrue échoue au login avec "Scan error ... converting NULL to string".
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data,
  is_super_admin, confirmation_token, email_change_token_new,
  recovery_token, email_change, phone, phone_change,
  phone_change_token_new
)
select
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@jerossa.mg',
  crypt('Admin@Jerossa2026', gen_salt('bf')),
  now(), now(), now(),
  '{"full_name": "Admin Jerossa", "role": "admin"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  false, '', '', '', '', '', '', ''
where not exists (
  select 1 from auth.users where email = 'admin@jerossa.mg'
);

-- 1b. Créer l'identité email (obligatoire pour grant_type=password,
-- sinon GoTrue renvoie une erreur 500 "Database error querying schema")
insert into auth.identities (
  user_id, provider, provider_id, identity_data,
  last_sign_in_at, created_at, updated_at
)
select
  u.id, 'email', 'email',
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  coalesce(u.last_sign_in_at, u.updated_at), u.created_at, u.updated_at
from auth.users u
where u.email = 'admin@jerossa.mg'
  and not exists (
    select 1 from auth.identities i
    where i.user_id = u.id and i.provider_id = 'email'
  );

-- 2. Créer le profil admin (le trigger handle_new_user ne se déclenche pas sur insert direct)
-- On utilise donc un INSERT direct avec l'ID de l'utilisateur ci-dessus.
-- Note : si le trigger se déclenche, il créera un profil 'customer' — on le met à jour après.
insert into public.profiles (id, full_name, role, country)
select id, 'Admin Jerossa', 'admin', 'MG'
from auth.users
where email = 'admin@jerossa.mg'
on conflict (id) do update set role = 'admin', full_name = 'Admin Jerossa';

-- --------------------------------------------------
-- RÉCAPITULATIF :
-- Email    : admin@jerossa.mg
-- Mot de passe : Admin@Jerossa2026
-- Rôle     : admin
-- --------------------------------------------------
