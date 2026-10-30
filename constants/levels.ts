import { LevelConfig } from '@/types/game';

export const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: {
    cups: 3,
    shuffleCount: 4,
    swapDuration: 750,
    stepDelay: 250,
    pcSlotWidth: 100,
    pcCupWidth: 80,
    mobileSlotWidth: 85,
    mobileCupWidth: 70,
  },
  2: {
    cups: 3,
    shuffleCount: 6,
    swapDuration: 650,
    stepDelay: 200,
    pcSlotWidth: 100,
    pcCupWidth: 80,
    mobileSlotWidth: 85,
    mobileCupWidth: 70,
  },
  3: {
    cups: 4,
    shuffleCount: 7,
    swapDuration: 550,
    stepDelay: 150,
    pcSlotWidth: 90,
    pcCupWidth: 74,
    mobileSlotWidth: 70,
    mobileCupWidth: 58,
  },
  4: {
    cups: 4,
    shuffleCount: 9,
    swapDuration: 480,
    stepDelay: 120,
    pcSlotWidth: 90,
    pcCupWidth: 74,
    mobileSlotWidth: 70,
    mobileCupWidth: 58,
  },
  5: {
    cups: 5,
    shuffleCount: 10,
    swapDuration: 420,
    stepDelay: 100,
    pcSlotWidth: 80,
    pcCupWidth: 66,
    mobileSlotWidth: 58,
    mobileCupWidth: 48,
  },
};

export function getLevelConfig(level: number): LevelConfig {
  if (level <= 1) return LEVEL_CONFIGS[1];
  if (level === 2) return LEVEL_CONFIGS[2];
  if (level === 3) return LEVEL_CONFIGS[3];
  if (level === 4) return LEVEL_CONFIGS[4];
  if (level === 5) return LEVEL_CONFIGS[5];

  // 레벨 6 이상: 컵 5개, 교환 횟수 10 + 2 * (레벨 - 5),
  // 1회 이동 시간 max(250, 420 - 25 * (레벨 - 5)), 대기 시간 max(60, 100 - 5 * (레벨 - 5))
  const delta = level - 5;
  const shuffleCount = 10 + 2 * delta;
  const swapDuration = Math.max(250, 420 - 25 * delta);
  const stepDelay = Math.max(60, 100 - 5 * delta);

  return {
    cups: 5,
    shuffleCount,
    swapDuration,
    stepDelay,
    pcSlotWidth: 80,
    pcCupWidth: 66,
    mobileSlotWidth: 58,
    mobileCupWidth: 48,
  };
}
