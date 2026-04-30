-- ReadVault — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query → Paste → Run

-- ── Tables ──────────────────────────────────────────────────────────────────

create table if not exists public.books (
  user_id              uuid not null references auth.users(id) on delete cascade,
  id                   text not null,
  title                text not null default 'Untitled',
  author               text not null default 'Unknown author',
  genre                text,
  language             text,
  total_pages          int  not null default 0,
  progress             int  not null default 0,
  gradient             text,
  description          text,
  year                 int,
  cover                text,
  time_spent_minutes   int  not null default 0,
  daily_stats          jsonb not null default '{}'::jsonb,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.goals (
  user_id                    uuid not null references auth.users(id) on delete cascade,
  id                         text not null,
  type                       text not null,
  date                       text not null,
  payload                    jsonb not null default '{}'::jsonb,
  recurrence                 text not null default 'none',
  recurrence_interval_days   int,
  recurrence_end_date        text,
  completed_dates            jsonb not null default '{}'::jsonb,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.user_settings (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- ── Row Level Security: each user only sees their own rows ──────────────────

alter table public.books         enable row level security;
alter table public.goals         enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists "users own books"    on public.books;
drop policy if exists "users own goals"    on public.goals;
drop policy if exists "users own settings" on public.user_settings;

create policy "users own books" on public.books
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "users own goals" on public.goals
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "users own settings" on public.user_settings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
