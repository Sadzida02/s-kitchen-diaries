-- Run once in Supabase (SQL Editor -> New query -> Run), before importing the recipes.
alter table public.recipe_translations
  drop column if exists ingredients,
  drop column if exists steps,
  add column if not exists alt text,
  add column if not exists ingredient_groups jsonb not null default '[]',
  add column if not exists step_groups jsonb not null default '[]';
