-- CineLog: расширение профилей пользователей.
-- Выполни один раз в Supabase -> SQL Editor -> Run.
-- Этот скрипт не удаляет и не перезаписывает существующие данные.

alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists bio text,
  add column if not exists favorite_genres text[] not null default '{}'::text[];

alter table public.profiles enable row level security;

-- Пользователь может создать только собственную запись профиля,
-- если по какой-то причине она не была создана триггером регистрации.
drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

-- Пользователь может менять только собственный профиль.
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
