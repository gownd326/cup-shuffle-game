export type GameState = 'IDLE' | 'PREVIEW' | 'MIXING' | 'CHOOSING' | 'ROUND_CLEAR' | 'GAME_OVER';

export interface LevelConfig {
  cups: number;
  shuffleCount: number;
  speed: number;
}
