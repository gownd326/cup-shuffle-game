-- game_scores 테이블 생성
create table if not exists public.game_scores (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (char_length(nickname) between 2 and 8),
  score integer not null check (score >= 0),
  level integer not null default 1,
  created_at timestamptz not null default now()
);

-- RLS 활성화
alter table public.game_scores enable row level security;

-- 읽기 정책 (모든 유저 공개 조회)
drop policy if exists "Allow public read on game_scores" on public.game_scores;
create policy "Allow public read on game_scores"
on public.game_scores for select
using (true);

-- 쓰기 정책 (누구나 점수 등록 가능)
drop policy if exists "Allow public insert on game_scores" on public.game_scores;
create policy "Allow public insert on game_scores"
on public.game_scores for insert
with check (true);
