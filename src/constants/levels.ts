import { LevelConfig } from '../types/game';

export const CUP_COLOR_PALETTES = [
  {
    gradient: 'from-pink-300 to-pink-400',
    border: 'border-pink-200',
    shadow: 'shadow-pink-200/50',
  },
  {
    gradient: 'from-amber-200 to-yellow-300',
    border: 'border-amber-200',
    shadow: 'shadow-amber-200/50',
  },
  {
    gradient: 'from-sky-300 to-cyan-400',
    border: 'border-sky-200',
    shadow: 'shadow-sky-200/50',
  },
  {
    gradient: 'from-purple-300 to-purple-400',
    border: 'border-purple-200',
    shadow: 'shadow-purple-200/50',
  },
  {
    gradient: 'from-emerald-300 to-teal-400',
    border: 'border-emerald-200',
    shadow: 'shadow-emerald-200/50',
  },
];

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
