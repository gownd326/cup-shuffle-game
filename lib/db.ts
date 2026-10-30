import { neon, neonConfig } from '@neondatabase/serverless';

neonConfig.fetchConnectionCache = true;

let isTableChecked = false;

/**
 * 서버 전용 Neon DB 연결 인스턴스 반환
 * DATABASE_URL 은 서버 전용 환경변수로만 읽고 브라우저에 절대 노출하지 않음
 */
export function getDbClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }
  return neon(connectionString);
}

export type DbClient = ReturnType<typeof getDbClient>;

/**
 * 서비스 실행 또는 API 최초 호출 시 game_scores 테이블 및 인덱스 자동 확인/생성 (Auto-migration)
 */
export async function ensureTableExists(): Promise<DbClient> {
  const sql = getDbClient();
  if (!sql) return null;

  if (!isTableChecked) {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS game_scores (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nickname VARCHAR(8) NOT NULL CHECK (char_length(nickname) BETWEEN 2 AND 8),
          score INTEGER NOT NULL CHECK (score >= 0),
          level INTEGER NOT NULL CHECK (level >= 1),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_game_scores_ranking
          ON game_scores (score DESC, created_at ASC);
      `;
      isTableChecked = true;
    } catch (err) {
      console.error('Failed to ensure table exists in Neon DB:', err);
    }
  }

  return sql;
}
