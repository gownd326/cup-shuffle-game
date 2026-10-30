/**
 * 개인 최고 점수 localStorage 읽기·쓰기
 * - SPEC 3.2: 키 cup-shuffle-best-score
 * - 저장값이 없거나 유효한 0 이상의 정수가 아니면 0으로 처리한다.
 */

export const BEST_SCORE_STORAGE_KEY = 'cup-shuffle-best-score';

export function getStoredBestScore(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(BEST_SCORE_STORAGE_KEY);
    if (!raw) return 0;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) {
      return 0;
    }
    return parsed;
  } catch {
    return 0;
  }
}

export function saveStoredBestScore(score: number): void {
  if (typeof window === 'undefined') return;
  try {
    if (Number.isFinite(score) && Number.isInteger(score) && score >= 0) {
      localStorage.setItem(BEST_SCORE_STORAGE_KEY, score.toString());
    }
  } catch {
    // ignore
  }
}
