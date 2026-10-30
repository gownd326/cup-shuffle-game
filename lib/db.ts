import { neon, neonConfig } from '@neondatabase/serverless';

neonConfig.fetchConnectionCache = true;

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
