-- game_scores 테이블 생성 (Neon PostgreSQL)
CREATE TABLE IF NOT EXISTS game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname VARCHAR(8) NOT NULL CHECK (char_length(nickname) BETWEEN 2 AND 8),
  score INTEGER NOT NULL CHECK (score >= 0),
  level INTEGER NOT NULL CHECK (level >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TOP 5 실시간 랭킹 조회를 위한 복합 인덱스 (score 내림차순, created_at 오름차순)
CREATE INDEX IF NOT EXISTS idx_game_scores_ranking
  ON game_scores (score DESC, created_at ASC);
