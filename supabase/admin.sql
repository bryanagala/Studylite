-- StudyLite Admin: roles + content write policies
-- Run in Supabase SQL editor AFTER creating your first admin user.

-- 1) Role column
alter table public.profiles
  add column if not exists role text not null default 'student'
  check (role in ('student', 'admin'));

create index if not exists profiles_role_idx on public.profiles (role);

-- 2) Helper: current user is admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 3) Auto-create profile on auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(profiles.full_name, ''), excluded.full_name),
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4) Admin content policies (subjects / topics / lessons / questions)
drop policy if exists "Admins manage subjects" on public.subjects;
create policy "Admins manage subjects"
  on public.subjects for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins manage topics" on public.topics;
create policy "Admins manage topics"
  on public.topics for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins manage lessons" on public.lessons;
create policy "Admins manage lessons"
  on public.lessons for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins manage questions" on public.questions;
create policy "Admins manage questions"
  on public.questions for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins manage achievements" on public.achievements;
create policy "Admins manage achievements"
  on public.achievements for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 5) Admins can read all profiles; promote/demote via service role or SQL
drop policy if exists "Admins read all profiles" on public.profiles;
create policy "Admins read all profiles"
  on public.profiles for select to authenticated
  using (public.is_admin() or auth.uid() = id);

drop policy if exists "Admins update any profile" on public.profiles;
create policy "Admins update any profile"
  on public.profiles for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 6) First admin (run AFTER you sign up via /admin/login):
-- update public.profiles set role = 'admin' where email = 'you@example.com';
