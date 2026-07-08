-- InterviewPrep AI — CORRECTED schema (matches the app code exactly)
-- This safely drops any old/mismatched tables first, then rebuilds everything.
-- Run this whole block in one go in the Supabase SQL Editor.

drop table if exists public.answers cascade;
drop table if exists public.interview_sessions cascade;
drop table if exists public.questions cascade;
drop table if exists public.attempts cascade;
drop table if exists public.practice_sessions cascade;
drop table if exists public.interview_sets cascade;
drop table if exists public.profiles cascade;
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Profiles (mirrors auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  created_at timestamptz default now()
);

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Interview sets (a target role/company a user is preparing for)
create table public.interview_sets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  role_title text,
  company text,
  source_text text,
  created_at timestamptz default now()
);

-- Questions generated (or manually added) for a set
create table public.questions (
  id uuid default gen_random_uuid() primary key,
  set_id uuid references public.interview_sets on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  question text not null,
  topic text,
  difficulty text default 'medium',
  created_at timestamptz default now()
);

-- Practice attempts (one row per answered question)
create table public.attempts (
  id uuid default gen_random_uuid() primary key,
  question_id uuid references public.questions on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  answer_text text,
  score int check (score >= 0 and score <= 100),
  feedback text,
  created_at timestamptz default now()
);

-- Study/practice sessions (drives streaks + time analytics)
create table public.practice_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  set_id uuid references public.interview_sets on delete set null,
  duration_seconds int default 0,
  questions_answered int default 0,
  avg_score numeric,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.interview_sets enable row level security;
alter table public.questions enable row level security;
alter table public.attempts enable row level security;
alter table public.practice_sessions enable row level security;

create policy "profiles: view own" on public.profiles for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id);

create policy "sets: full access own" on public.interview_sets for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "questions: full access own" on public.questions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "attempts: full access own" on public.attempts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "sessions: full access own" on public.practice_sessions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
