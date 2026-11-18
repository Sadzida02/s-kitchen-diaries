-- Run once in Supabase (SQL Editor -> New query -> Run).
-- Lets the site remember which comments and photos have already been announced to you by email.
alter table public.comments add column if not exists notified boolean not null default false;
alter table public.recreations add column if not exists notified boolean not null default false;
-- everything that exists now counts as already announced
update public.comments set notified = true;
update public.recreations set notified = true;
