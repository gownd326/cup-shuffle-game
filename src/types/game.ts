export type GameState =
  | 'IDLE'
  | 'PREVIEW'
  | 'MIXING'
  | 'CHOOSING'
  | 'REVEAL'
  | 'ROUND_CLEAR'
  | 'GAME_OVER';

export interface CupItemData {
  id: string; // 'cup-0', 'cup-1', ...
  slotIndex: number; // 0 ~ N-1
  yOffset: number; // -30, 30, or 0
  zIndex: number; // 10, 20, 30
}

export interface LevelConfig {
  cups: number;
  shuffleCount: number;
  swapDuration: number;
  stepDelay: number;
}

export interface ScoreRecord {
  id: string;
  nickname: string;
  score: number;
  level: number;
  created_at: string;
}
