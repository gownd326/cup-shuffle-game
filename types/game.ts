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
  yOffset: number; // arch offset
  zIndex: number;
}

export interface LevelConfig {
  cups: number;
  shuffleCount: number;
  swapDuration: number;
  stepDelay: number;
  pcSlotWidth: number;
  pcCupWidth: number;
  mobileSlotWidth: number;
  mobileCupWidth: number;
}

export interface ScoreRecord {
  id: string;
  nickname: string;
  score: number;
  level: number;
  createdAt: string;
}

export interface ApiScoreResponse {
  success: boolean;
  record?: ScoreRecord;
  error?: string;
}

export interface ApiTop5Response {
  success?: boolean;
  records?: ScoreRecord[];
  error?: string;
}
