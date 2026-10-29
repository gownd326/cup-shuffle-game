import { LevelConfig } from '../types/game';

// 야바위 게임의 공정성을 위해 모든 컵 카드는 완전히 동일한 단일 스타일을 적용합니다.
export const UNIFORM_CUP_STYLE = {
  cardClass: 'bg-white/95 border-2 border-pink-200 shadow-md',
};

export function getLevelConfig(level: number): LevelConfig {
  if (level === 1) {
    return { cups: 3, shuffleCount: 4, swapDuration: 750, stepDelay: 250 };
  }
  if (level === 2) {
    return { cups: 3, shuffleCount: 6, swapDuration: 650, stepDelay: 200 };
  }
  if (level === 3) {
    return { cups: 4, shuffleCount: 7, swapDuration: 550, stepDelay: 150 };
  }
  if (level === 4) {
    return { cups: 4, shuffleCount: 9, swapDuration: 480, stepDelay: 120 };
  }
  return {
    cups: 5,
    shuffleCount: 10 + Math.max(0, level - 5),
    swapDuration: 420,
    stepDelay: 100,
  };
}

export function calculateRoundScore(level: number, cupCount: number): number {
  return level * 100 + cupCount * 50;
}
