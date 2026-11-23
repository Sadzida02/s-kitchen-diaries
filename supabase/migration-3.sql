-- Run once in Supabase (SQL Editor -> New query -> Run).
-- Replies, @mentions, likes on visitor photos and an email on/off switch for each person.

-- ---------- replies and mentions ----------
alter table public.comments add column if not exists parent_id uuid references public.comments (id) on delete cascade;
alter table public.comments add column if not exists mentions uuid[] not null default '{}';
-- remembers that the reply and mention emails of a comment were already sent
alter table public.comments add column if not exists emails_sent boolean not null default false;
update public.comments set emails_sent = true;
create index if not exists comments_parent_idx on public.comments (parent_id);

-- ---------- email switch ----------
alter table public.profiles add column if not exists email_notifications boolean not null default true;

-- ---------- likes on visitor photos ----------
create table if not exists public.recreation_likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  recreation_id uuid not null references public.recreations (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recreation_id)
);
create index if not exists recreation_likes_idx on public.recreation_likes (recreation_id);

alter table public.recreation_likes enable row level security;
create policy "read photo likes" on public.recreation_likes for select using (true);
create policy "like a photo as yourself" on public.recreation_likes for insert with check (auth.uid() = user_id);
create policy "unlike your own photo like" on public.recreation_likes for delete using (auth.uid() = user_id);
