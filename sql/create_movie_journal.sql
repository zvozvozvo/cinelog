-- CineLog: личный дневник просмотров, пересмотров и рецензий.
-- Запусти этот файл один раз в Supabase SQL Editor.

create table if not exists public.movie_journal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tmdb_id bigint not null references public.movies(tmdb_id) on delete cascade,
  watched_on date not null default current_date,
  rating numeric(3,1) check (rating is null or (rating >= 0 and rating <= 10)),
  note text not null default '' check (char_length(note) <= 2000),
  created_at timestamptz not null default now()
);

create index if not exists movie_journal_user_movie_date_idx
on public.movie_journal (user_id, tmdb_id, watched_on desc);

alter table public.movie_journal enable row level security;

drop policy if exists movie_journal_select_own on public.movie_journal;
drop policy if exists movie_journal_insert_own on public.movie_journal;
drop policy if exists movie_journal_update_own on public.movie_journal;
drop policy if exists movie_journal_delete_own on public.movie_journal;

create policy movie_journal_select_own
on public.movie_journal
for select to authenticated
using (auth.uid() = user_id);

create policy movie_journal_insert_own
on public.movie_journal
for insert to authenticated
with check (auth.uid() = user_id);

create policy movie_journal_update_own
on public.movie_journal
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy movie_journal_delete_own
on public.movie_journal
for delete to authenticated
using (auth.uid() = user_id);

grant select, insert, update, delete
on public.movie_journal
to authenticated;
