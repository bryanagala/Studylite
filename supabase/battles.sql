-- StudyLite Live Battle tables (Supabase Realtime ready)
-- Run after core schema. Wire RLS so players only see their battles.

create table if not exists public.battles (
  id uuid primary key default gen_random_uuid(),
  subject_id text not null references public.subjects(id),
  status text not null default 'waiting',
  current_question int not null default 0,
  total_questions int not null default 10,
  question_time_limit int not null default 10,
  question_started_at timestamptz,
  created_by uuid not null references public.profiles(id),
  winner_id uuid references public.profiles(id),
  is_demo boolean not null default false,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.battle_players (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  user_id text not null,
  display_name text not null,
  is_bot boolean not null default false,
  score int not null default 0,
  correct_answers int not null default 0,
  wrong_answers int not null default 0,
  timeouts int not null default 0,
  rating int not null default 1000,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (battle_id, user_id)
);

create table if not exists public.battle_questions (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  question_id text not null references public.questions(id),
  question_order int not null,
  unique (battle_id, question_order)
);

create table if not exists public.battle_answers (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  question_id text not null,
  user_id text not null,
  selected_answer text,
  is_correct boolean not null default false,
  response_time_ms int,
  points int not null default 0,
  submitted_at timestamptz not null default now(),
  unique (battle_id, question_id, user_id)
);

create table if not exists public.battle_invites (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  receiver_id uuid not null references public.profiles(id),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

alter table public.battles enable row level security;
alter table public.battle_players enable row level security;
alter table public.battle_questions enable row level security;
alter table public.battle_answers enable row level security;
alter table public.battle_invites enable row level security;

-- Basic policies: participants can read their battles (refine when wiring Realtime).
create policy "Battle participants read battles"
  on public.battles for select to authenticated
  using (
    exists (
      select 1 from public.battle_players bp
      where bp.battle_id = battles.id and bp.user_id = auth.uid()::text
    )
    or created_by = auth.uid()
  );
