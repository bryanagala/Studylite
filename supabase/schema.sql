-- StudyLite Supabase schema + seed scaffolding
-- Run in Supabase SQL editor after creating a project.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'admin')),
  level int not null default 1,
  xp int not null default 0,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  daily_goal_minutes int not null default 15,
  study_goal text,
  selected_subject_ids text[] not null default '{}',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.topics (
  id text primary key,
  subject_id text not null references public.subjects(id) on delete cascade,
  name text not null,
  description text not null
);

create table if not exists public.lessons (
  id text primary key,
  topic_id text not null references public.topics(id) on delete cascade,
  title text not null,
  content jsonb not null,
  estimated_minutes int not null default 5,
  difficulty text not null default 'easy',
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id text primary key,
  lesson_id text not null references public.lessons(id) on delete cascade,
  topic_id text not null references public.topics(id) on delete cascade,
  question_text text not null,
  question_type text not null,
  options jsonb not null,
  correct_answer text not null,
  explanation text not null,
  difficulty text not null default 'easy',
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null references public.lessons(id),
  score int not null,
  total_questions int not null,
  xp_earned int not null default 0,
  completed_at timestamptz not null default now()
);

create table if not exists public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id text not null references public.questions(id),
  quiz_attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  selected_answer text not null,
  is_correct boolean not null,
  topic_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null references public.lessons(id),
  mission_date date not null,
  completed boolean not null default false,
  xp_reward int not null default 100,
  completed_at timestamptz,
  unique (user_id, mission_date)
);

create table if not exists public.achievements (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null,
  requirement_type text not null,
  requirement_value int not null
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null references public.achievements(id),
  earned_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null references public.lessons(id),
  started_at timestamptz not null,
  completed_at timestamptz,
  duration_seconds int not null default 0
);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid not null references public.profiles(id) on delete cascade,
  opponent_id text not null,
  opponent_name text not null,
  topic_id text not null references public.topics(id),
  lesson_id text not null references public.lessons(id),
  status text not null default 'active',
  challenger_score int,
  opponent_score int,
  winner_id text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  type text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.question_attempts enable row level security;
alter table public.daily_missions enable row level security;
alter table public.user_achievements enable row level security;
alter table public.study_sessions enable row level security;
alter table public.challenges enable row level security;
alter table public.notifications enable row level security;

create policy "Profiles are readable by authenticated users"
  on public.profiles for select to authenticated using (true);
create policy "Users update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

create policy "Own quiz attempts" on public.quiz_attempts
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own question attempts" on public.question_attempts
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own daily missions" on public.daily_missions
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own achievements" on public.user_achievements
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own study sessions" on public.study_sessions
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own challenges" on public.challenges
  for all to authenticated using (auth.uid() = challenger_id) with check (auth.uid() = challenger_id);
create policy "Own notifications" on public.notifications
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Public read subjects" on public.subjects for select to authenticated using (true);
create policy "Public read topics" on public.topics for select to authenticated using (true);
create policy "Public read lessons" on public.lessons for select to authenticated using (true);
create policy "Public read questions" on public.questions for select to authenticated using (true);
create policy "Public read achievements catalog" on public.achievements for select to authenticated using (true);

alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.lessons enable row level security;
alter table public.questions enable row level security;
alter table public.achievements enable row level security;
