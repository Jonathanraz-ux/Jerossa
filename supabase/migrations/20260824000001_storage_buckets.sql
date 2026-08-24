-- ==================================================
-- JEROSSA — Storage
-- Buckets :
--   product-images  (public)  — photos des produits
--   seller-documents (privé)  — pièces justificatives vendeurs
-- Convention de chemins : {auth.uid()}/{fichier}
-- ==================================================

-- --------------------------------------------------
-- 1. BUCKETS
-- --------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880,
   array['image/jpeg', 'image/png', 'image/webp']),
  ('seller-documents', 'seller-documents', false, 10485760,
   array['image/jpeg', 'image/png', 'application/pdf'])
on conflict (id) do nothing;

-- --------------------------------------------------
-- 2. PRODUCT-IMAGES (public)
-- --------------------------------------------------

-- Lecture publique (visiteurs inclus)
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
on storage.objects for select
using (bucket_id = 'product-images');

-- Upload : utilisateur authentifié, uniquement dans son dossier {uid}
drop policy if exists "product_images_insert_own" on storage.objects;
create policy "product_images_insert_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Modification / suppression : propriétaire du dossier
drop policy if exists "product_images_update_own" on storage.objects;
create policy "product_images_update_own"
on storage.objects for update to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "product_images_delete_own" on storage.objects;
create policy "product_images_delete_own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Gestion complète par un administrateur
drop policy if exists "product_images_admin_all" on storage.objects;
create policy "product_images_admin_all"
on storage.objects for all to authenticated
using (
  bucket_id = 'product-images'
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- --------------------------------------------------
-- 3. SELLER-DOCUMENTS (privé)
-- --------------------------------------------------

-- Lecture : propriétaire du dossier ou administrateur
drop policy if exists "seller_docs_select_own_or_admin" on storage.objects;
create policy "seller_docs_select_own_or_admin"
on storage.objects for select to authenticated
using (
  bucket_id = 'seller-documents'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
);

-- Upload : utilisateur authentifié, uniquement dans son dossier {uid}
drop policy if exists "seller_docs_insert_own" on storage.objects;
create policy "seller_docs_insert_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'seller-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Modification / suppression : propriétaire ou administrateur
drop policy if exists "seller_docs_update_own_or_admin" on storage.objects;
create policy "seller_docs_update_own_or_admin"
on storage.objects for update to authenticated
using (
  bucket_id = 'seller-documents'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
);

drop policy if exists "seller_docs_delete_own_or_admin" on storage.objects;
create policy "seller_docs_delete_own_or_admin"
on storage.objects for delete to authenticated
using (
  bucket_id = 'seller-documents'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
);
