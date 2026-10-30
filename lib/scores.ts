import { ensureTableExists } from '@/lib/db';
import { ScoreRecord } from '@/types/game';

// In-memory fallback repository when DATABASE_URL is not configured or during local test without DB
const memoryScores: ScoreRecord[] = [];

/**
 * TOP 5 기록 조회 (score DESC, created_at ASC)
 */
export async function getTop5Scores(): Promise<ScoreRecord[]> {
  const sql = await ensureTableExists();
  if (sql) {
    const rows = await sql`
      SELECT id, nickname, score, level, created_at
      FROM game_scores
      ORDER BY score DESC, created_at ASC
      LIMIT 5;
    `;
    return rows.map((r) => ({
      id: String(r.id),
      nickname: String(r.nickname),
      score: Number(r.score),
      level: Number(r.level),
      createdAt: new Date(r.created_at).toISOString(),
    }));
  }

  return [...memoryScores]
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    .slice(0, 5);
}

/**
 * 점수 기록 저장 (POST /api/scores)
 */
export async function saveScore(
  nickname: string,
  score: number,
  level: number
): Promise<ScoreRecord> {
  const trimmed = nickname.trim();
  if (trimmed.length < 2 || trimmed.length > 8) {
    throw new Error('INVALID_INPUT');
  }
  if (!Number.isInteger(score) || score < 0) {
    throw new Error('INVALID_INPUT');
  }
  if (!Number.isInteger(level) || level < 1) {
    throw new Error('INVALID_INPUT');
  }

  const sql = await ensureTableExists();
  if (sql) {
    const rows = await sql`
      INSERT INTO game_scores (nickname, score, level)
      VALUES (${trimmed}, ${score}, ${level})
      RETURNING id, nickname, score, level, created_at;
    `;
    if (rows && rows.length > 0) {
      const r = rows[0];
      return {
        id: String(r.id),
        nickname: String(r.nickname),
        score: Number(r.score),
        level: Number(r.level),
        createdAt: new Date(r.created_at).toISOString(),
      };
    }
  }

  const memRecord: ScoreRecord = {
    id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    nickname: trimmed,
    score,
    level,
    createdAt: new Date().toISOString(),
  };
  memoryScores.push(memRecord);
  return memRecord;
}
