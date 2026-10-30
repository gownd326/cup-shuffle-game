import { LevelConfig } from '@/types/game';

// 모든 컵 카드는 단일한 디자인(bg-white border-2 border-pink-200 rounded-2xl shadow-md opacity-100)을 공유
export const UNIFORM_CUP_CARD_CLASS =
  'bg-white opacity-100 border-2 border-pink-200 rounded-2xl shadow-md';

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

  // Lv.5+
  return {
    ...LEVEL_CONFIGS[5],
    shuffleCount: 10 + Math.max(0, level - 5),
  };
}

export function calculateRoundScore(level: number, cupCount: number): number {
  return level * 100 + cupCount * 50;
}

export function computeResponsiveDimensions(
  cupCount: number,
  containerWidth: number
): { slotWidth: number; cupWidth: number } {
  const isMobile = containerWidth < 640;
  if (!isMobile) {
    if (cupCount <= 3) return { slotWidth: 100, cupWidth: 80 };
    if (cupCount === 4) return { slotWidth: 90, cupWidth: 74 };
    return { slotWidth: 80, cupWidth: 66 };
  }

  // 모바일: slotWidth = Math.min(containerWidth / cupCount, maxSlotWidth)
  const maxSlotWidth = cupCount <= 3 ? 85 : cupCount === 4 ? 70 : 58;
  const calculatedSlot = Math.min(
    Math.floor((containerWidth - 20) / cupCount),
    maxSlotWidth
  );
  const slotWidth = Math.max(48, calculatedSlot);
  const cupWidth = Math.max(42, slotWidth - 10);

  return { slotWidth, cupWidth };
}
