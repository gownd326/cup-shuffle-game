import { neon, neonConfig } from '@neondatabase/serverless';
import { ScoreRecord } from '@/types/game';

neonConfig.fetchConnectionCache = true;

// In-memory fallback repository when DATABASE_URL is not set or Neon is unavailable
const memoryScores: ScoreRecord[] = [
  {
    id: 'mock-1',
    nickname: '야바위왕',
    score: 850,
    level: 5,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'mock-2',
    nickname: '매의눈',
    score: 600,
    level: 4,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'mock-3',
    nickname: '행운요정',
    score: 450,
    level: 3,
    created_at: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'mock-4',
    nickname: '도전자',
    score: 300,
    level: 2,
    created_at: new Date(Date.now() - 28800000).toISOString(),
  },
  {
    id: 'mock-5',
    nickname: '초보자',
    score: 150,
    level: 1,
    created_at: new Date(Date.now() - 43200000).toISOString(),
  },
];

export function getDbClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }
  return neon(connectionString);
}

export async function fetchTop5Records(): Promise<ScoreRecord[]> {
  const sql = getDbClient();
  if (sql) {
    try {
      // Ensure table exists on first query
      await sql`
        CREATE TABLE IF NOT EXISTS game_scores (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nickname VARCHAR(8) NOT NULL CHECK (char_length(nickname) >= 2),
          score INTEGER NOT NULL CHECK (score >= 0),
          level INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      const rows = await sql`
        SELECT id, nickname, score, level, created_at 
        FROM game_scores 
        ORDER BY score DESC, created_at ASC 
        LIMIT 5;
      `;
      return rows as unknown as ScoreRecord[];
    } catch (err) {
      console.warn('Neon DB query failed, falling back to in-memory score records', err);
    }
  }

  return [...memoryScores]
    .sort((a, b) => b.score - a.score || new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(0, 5);
}

export async function insertScoreRecord(
  nickname: string,
  score: number,
  level: number
): Promise<ScoreRecord> {
  const trimmed = nickname.trim();
  if (trimmed.length < 2 || trimmed.length > 8) {
    throw new Error('닉네임은 2~8자 사이여야 합니다.');
  }
  if (score < 0 || !Number.isInteger(score)) {
    throw new Error('점수는 0 이상의 정수여야 합니다.');
  }

  const sql = getDbClient();
  if (sql) {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS game_scores (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nickname VARCHAR(8) NOT NULL CHECK (char_length(nickname) >= 2),
          score INTEGER NOT NULL CHECK (score >= 0),
          level INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      const rows = await sql`
        INSERT INTO game_scores (nickname, score, level)
        VALUES (${trimmed}, ${score}, ${level})
        RETURNING id, nickname, score, level, created_at;
      `;
      if (rows && rows.length > 0) {
        return rows[0] as unknown as ScoreRecord;
      }
    } catch (err) {
      console.warn('Neon DB insert failed, saving to in-memory fallback', err);
    }
  }

  const fallbackRecord: ScoreRecord = {
    id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    nickname: trimmed,
    score,
    level,
    created_at: new Date().toISOString(),
  };
  memoryScores.push(fallbackRecord);
  return fallbackRecord;
}
