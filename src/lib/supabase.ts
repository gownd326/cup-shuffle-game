import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ScoreRecord } from '../types/game';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const FALLBACK_SCORES_KEY = 'cup_fallback_scores';
const BEST_SCORE_KEY = 'cup_best_score';

export function getLocalFallbackScores(): ScoreRecord[] {
  try {
    const raw = localStorage.getItem(FALLBACK_SCORES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

export function saveLocalFallbackScore(record: Omit<ScoreRecord, 'id' | 'created_at'>): ScoreRecord {
  const newRecord: ScoreRecord = {
    id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    nickname: record.nickname,
    score: record.score,
    level: record.level,
    created_at: new Date().toISOString(),
  };

  const existing = getLocalFallbackScores();
  const updated = [...existing, newRecord].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  try {
    localStorage.setItem(FALLBACK_SCORES_KEY, JSON.stringify(updated.slice(0, 50)));
  } catch {
    // LocalStorage quota error safe guard
  }

  return newRecord;
}

export async function fetchTop5Scores(): Promise<ScoreRecord[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('game_scores')
      .select('*')
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(5);

    if (error) {
      throw error;
    }
    return (data as ScoreRecord[]) || [];
  }

  // Fallback to local storage
  return getLocalFallbackScores().slice(0, 5);
}

export async function fetchTopScore(): Promise<number> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('game_scores')
        .select('score')
        .order('score', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const top = Number(data[0].score);
        try {
          const currentBest = Number(localStorage.getItem(BEST_SCORE_KEY) || '0');
          if (top > currentBest) {
            localStorage.setItem(BEST_SCORE_KEY, top.toString());
          }
        } catch {
          // ignore
        }
        return top;
      }
    } catch {
      // Fallback
    }
  }

  try {
    const localBest = Number(localStorage.getItem(BEST_SCORE_KEY) || '0');
    const localScores = getLocalFallbackScores();
    const highestLocal = localScores.length > 0 ? localScores[0].score : 0;
    return Math.max(localBest, highestLocal);
  } catch {
    return 0;
  }
}

export async function insertGameScore(
  nickname: string,
  score: number,
  level: number
): Promise<ScoreRecord> {
  const trimmed = nickname.trim();
  if (trimmed.length < 2 || trimmed.length > 8) {
    throw new Error('닉네임은 2~8자 사이여야 합니다.');
  }

  // Backup in localStorage
  try {
    const currentBest = Number(localStorage.getItem(BEST_SCORE_KEY) || '0');
    if (score > currentBest) {
      localStorage.setItem(BEST_SCORE_KEY, score.toString());
    }
  } catch {
    // ignore
  }

  if (supabase) {
    const { data, error } = await supabase
      .from('game_scores')
      .insert([
        {
          nickname: trimmed,
          score,
          level,
        },
      ])
      .select()
      .single();

    if (error) {
      // Backup in local fallback on error
      saveLocalFallbackScore({ nickname: trimmed, score, level });
      throw error;
    }
    return data as ScoreRecord;
  }

  // Fallback save
  return saveLocalFallbackScore({ nickname: trimmed, score, level });
}
