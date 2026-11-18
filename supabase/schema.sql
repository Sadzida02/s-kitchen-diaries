-- Sweet & Salty Diaries: database for accounts, recipes, likes, comments and recreations.
-- Run this whole file once in Supabase: SQL Editor -> New query -> paste -> Run.

-- ---------- profiles (one per account) ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Home cook',
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- a profile is created automatically when someone signs up
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1), 'Home cook'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- is the current user the administrator?
create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------- recipes ----------
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  taste text not null check (taste in ('sweet', 'salty')),
  tags text[] not null default '{}',
  difficulty text not null default 'easy' check (difficulty in ('easy', 'medium', 'hard')),
  cover_image text,
  added date not null default current_date,
  podium int check (podium between 1 and 5),
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.recipe_translations (
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  lang text not null check (lang in ('en', 'bs')),
  title text not null,
  intro text not null default '',
  ingredients text not null default '',
  steps text not null default '',
  primary key (recipe_id, lang)
);

create table public.recipe_photos (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  path text not null,
  sort int not null default 0
);

-- ---------- what people do ----------
create table public.likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create table public.recreations (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  image_path text not null,
  caption text check (char_length(caption) <= 300),
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('comment', 'recreation')),
  target_id uuid not null,
  reporter_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index on public.comments (recipe_id, created_at desc);
create index on public.recreations (recipe_id, created_at desc);
create index on public.likes (recipe_id);

-- ---------- row level security: who may do what ----------
alter table public.profiles enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_translations enable row level security;
alter table public.recipe_photos enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.recreations enable row level security;
alter table public.reports enable row level security;

-- profiles: everyone can see names and pictures; you edit only your own (never your role)
create policy "profiles are public" on public.profiles for select using (true);
create policy "edit own profile" on public.profiles for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

-- recipes: visitors see published ones, the admin sees and changes everything
create policy "read published recipes" on public.recipes for select using (published or public.is_admin());
create policy "admin writes recipes" on public.recipes for all using (public.is_admin()) with check (public.is_admin());
create policy "read translations" on public.recipe_translations for select using (true);
create policy "admin writes translations" on public.recipe_translations for all using (public.is_admin()) with check (public.is_admin());
create policy "read photos" on public.recipe_photos for select using (true);
create policy "admin writes photos" on public.recipe_photos for all using (public.is_admin()) with check (public.is_admin());

-- likes
create policy "read likes" on public.likes for select using (true);
create policy "like as yourself" on public.likes for insert with check (auth.uid() = user_id);
create policy "unlike your own" on public.likes for delete using (auth.uid() = user_id);

-- comments
create policy "read comments" on public.comments for select using (true);
create policy "comment as yourself" on public.comments for insert with check (auth.uid() = user_id);
create policy "delete own or admin" on public.comments for delete using (auth.uid() = user_id or public.is_admin());

-- recreations
create policy "read recreations" on public.recreations for select using (true);
create policy "upload as yourself" on public.recreations for insert with check (auth.uid() = user_id);
create policy "delete own recreation or admin" on public.recreations for delete using (auth.uid() = user_id or public.is_admin());

-- reports: anyone signed in can report, only the admin reads them
create policy "report as yourself" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "admin reads reports" on public.reports for select using (public.is_admin());
create policy "admin clears reports" on public.reports for delete using (public.is_admin());

-- ---------- photo storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('recipe-photos', 'recipe-photos', true, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('recreations', 'recreations', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "anyone views photos" on storage.objects for select
  using (bucket_id in ('recipe-photos', 'recreations'));
create policy "admin uploads recipe photos" on storage.objects for all
  using (bucket_id = 'recipe-photos' and public.is_admin())
  with check (bucket_id = 'recipe-photos' and public.is_admin());
create policy "users upload into their own folder" on storage.objects for insert
  with check (bucket_id = 'recreations' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "users or admin delete recreation files" on storage.objects for delete
  using (bucket_id = 'recreations' and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin()));

-- ---------- after your first login: make yourself the administrator ----------
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'YOUR-EMAIL');
