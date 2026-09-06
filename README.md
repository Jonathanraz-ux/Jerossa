# Jerossa

Place de marché React + Vite + Supabase.

## Installation

1. Copier `.env.example` vers `.env.local` et renseigner :
   - `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` (valeurs publiques du projet Supabase) ;
   - `SUPABASE_ACCESS_TOKEN` (utilisé uniquement par la CLI Supabase en local, jamais dans le navigateur).
2. `npm install` puis `npm run dev`.
3. Appliquer les migrations : `supabase db push` (ou un reset via `supabase db reset`).

## Création du compte administrateur (manuelle)

Pour éviter tout secret versionné, aucun compte administrateur n'est créé par les migrations.

1. Créer un compte via l'interface d'inscription du site.
2. Promouvoir son profil dans le SQL Editor de Supabase :

```sql
update public.profiles
set role = 'admin'
where id = auth.uid();
```

N'inscrivez jamais d'e-mail ni de mot de passe en dur dans le référentiel.
