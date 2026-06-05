# Setup Supabase — Monster Tier List

## 1. Crée un projet Supabase

Sur https://supabase.com → New project.

## 2. Récupère l'URL et la clé `anon`

Project Settings → API → copie :
- `Project URL` → `VITE_SUPABASE_URL`
- `anon public` key → `VITE_SUPABASE_ANON_KEY`

Crée un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

## 3. Désactive la confirmation par email

Authentication → Providers → Email → **désactive** "Confirm email".
(L'app utilise un faux email `pseudo@monstertier.local`, il n'y a pas de boîte mail à confirmer.)

## 4. Exécute ce SQL dans le SQL Editor

```sql
-- Tables ------------------------------------------------------------

create table public.monsters (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  image_url text,
  created_at timestamptz not null default now()
);

create type public.tier_rank as enum ('S','A','B','C','D');

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  monster_id uuid not null references public.monsters(id) on delete cascade,
  tier public.tier_rank not null,
  updated_at timestamptz not null default now(),
  unique (user_id, monster_id)
);

create index votes_monster_idx on public.votes(monster_id);

-- Grants (PostgREST) ------------------------------------------------

grant select on public.monsters to anon, authenticated;
grant all on public.monsters to service_role;

grant select, insert, update, delete on public.votes to authenticated;
grant all on public.votes to service_role;

-- RLS ---------------------------------------------------------------

alter table public.monsters enable row level security;
create policy "monsters readable by all"
  on public.monsters for select using (true);

alter table public.votes enable row level security;
create policy "vote select own"  on public.votes for select using (auth.uid() = user_id);
create policy "vote insert own"  on public.votes for insert with check (auth.uid() = user_id);
create policy "vote update own"  on public.votes for update using (auth.uid() = user_id);
create policy "vote delete own"  on public.votes for delete using (auth.uid() = user_id);

-- Vue de classement (moyenne globale) -------------------------------

create or replace view public.monster_rankings
with (security_invoker = on) as
select
  m.id as monster_id,
  m.name,
  m.image_url,
  coalesce(avg(case v.tier
    when 'S' then 5 when 'A' then 4 when 'B' then 3 when 'C' then 2 when 'D' then 1
  end), 0)::float8 as avg_score,
  count(v.id)::int as vote_count
from public.monsters m
left join public.votes v on v.monster_id = m.id
group by m.id, m.name, m.image_url;

grant select on public.monster_rankings to anon, authenticated;
```

## 5. Seed les canettes Monster

> Les URLs ci-dessous pointent vers `monsterenergy.com`. Certaines peuvent
> casser (hotlink protection) — remplace-les par tes propres URLs si besoin
> (upload dans le Storage Supabase ou autre CDN).

```sql
insert into public.monsters (name, image_url) values
  ('Monster Original',          'https://www.monsterenergy.com/sites/default/files/2023-10/monster-energy-original.png'),
  ('Monster Ultra Zero',        'https://www.monsterenergy.com/sites/default/files/2023-10/monster-ultra-zero.png'),
  ('Monster Ultra White',       'https://www.monsterenergy.com/sites/default/files/2023-10/monster-ultra-white.png'),
  ('Monster Ultra Sunrise',     'https://www.monsterenergy.com/sites/default/files/2023-10/monster-ultra-sunrise.png'),
  ('Monster Ultra Paradise',    'https://www.monsterenergy.com/sites/default/files/2023-10/monster-ultra-paradise.png'),
  ('Monster Ultra Violet',      'https://www.monsterenergy.com/sites/default/files/2023-10/monster-ultra-violet.png'),
  ('Monster Ultra Red',         'https://www.monsterenergy.com/sites/default/files/2023-10/monster-ultra-red.png'),
  ('Monster Ultra Gold',        'https://www.monsterenergy.com/sites/default/files/2023-10/monster-ultra-gold.png'),
  ('Monster Ultra Peachy Keen', 'https://www.monsterenergy.com/sites/default/files/2023-10/monster-ultra-peachy-keen.png'),
  ('Monster Ultra Rosa',        'https://www.monsterenergy.com/sites/default/files/2023-10/monster-ultra-rosa.png'),
  ('Monster Ultra Fiesta',      'https://www.monsterenergy.com/sites/default/files/2023-10/monster-ultra-fiesta.png'),
  ('Monster Ultra Watermelon',  'https://www.monsterenergy.com/sites/default/files/2023-10/monster-ultra-watermelon.png'),
  ('Monster Ultra Strawberry Dreams', 'https://www.monsterenergy.com/sites/default/files/2024-04/monster-ultra-strawberry-dreams.png'),
  ('Monster Juiced Mango Loco', 'https://www.monsterenergy.com/sites/default/files/2023-10/monster-juiced-mango-loco.png'),
  ('Monster Juiced Pipeline Punch', 'https://www.monsterenergy.com/sites/default/files/2023-10/monster-juiced-pipeline-punch.png'),
  ('Monster Juiced Pacific Punch',  'https://www.monsterenergy.com/sites/default/files/2023-10/monster-juiced-pacific-punch.png'),
  ('Monster Juiced Monarch',    'https://www.monsterenergy.com/sites/default/files/2023-10/monster-juiced-monarch.png'),
  ('Monster Juiced Aussie Style Lemonade', 'https://www.monsterenergy.com/sites/default/files/2023-10/monster-juiced-aussie-lemonade.png'),
  ('Monster Khaotic',           'https://www.monsterenergy.com/sites/default/files/2023-10/monster-khaotic.png'),
  ('Monster Assault',           'https://www.monsterenergy.com/sites/default/files/2023-10/monster-assault.png'),
  ('Monster Lewis Hamilton 44', 'https://www.monsterenergy.com/sites/default/files/2023-10/monster-lewis-hamilton-44.png'),
  ('Monster Rehab Peach Tea',   'https://www.monsterenergy.com/sites/default/files/2023-10/monster-rehab-peach.png'),
  ('Monster Rehab Tea + Lemonade', 'https://www.monsterenergy.com/sites/default/files/2023-10/monster-rehab-lemonade.png'),
  ('Monster Espresso Vanilla',  'https://www.monsterenergy.com/sites/default/files/2023-10/monster-espresso-vanilla.png'),
  ('Monster Nitro Cosmic Peach','https://www.monsterenergy.com/sites/default/files/2023-10/monster-nitro-cosmic-peach.png')
on conflict (name) do nothing;
```

## 6. Lance le projet

```bash
bun install
bun dev
```

---

## Déploiement Vercel

Le template utilise TanStack Start (Nitro). Pour Vercel :

1. Push ton projet sur GitHub.
2. Sur vercel.com → New Project → Import.
3. Ajoute les variables d'env : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4. **Ajoute aussi** la variable `NITRO_PRESET=vercel` (build → preset Vercel).
5. Build command : `bun run build`. Output : laissé par défaut, Nitro gère.

Si tu préfères un build 100% statique sans SSR, change `NITRO_PRESET=static` —
toutes les routes sont déjà `ssr: false`.

---

## Idées d'amélioration

- **Top utilisateurs** : page qui montre les classements individuels les plus
  proches / éloignés de la moyenne.
- **Comparaison** : "Ton tier vs la communauté", diff visuel par canette.
- **Catégories** : Original / Ultra / Juiced / Coffee → filtre dans la tier list.
- **Système de commentaires** par canette (table `comments` avec RLS).
- **Storage Supabase** : upload des images de canettes au lieu du hotlink.
- **Realtime** : abonnement `monster_rankings` pour voir le classement bouger live.
- **Partage** : génère une image OG de ta tier list à partager.
- **Saison / millésime** : reset annuel + archive des classements passés.
