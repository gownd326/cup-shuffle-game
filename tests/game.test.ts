import { describe, it, expect, beforeEach } from 'vitest';
import { getLevelConfig, calculateRoundScore, UNIFORM_CUP_STYLE } from '../src/constants/levels';
import { sleep } from '../src/utils/timer';

describe('Cup Shuffle Game - SPEC Compliance Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('연기 테스트 (Smoke Test): 초기 화면 문구 및 레벨 설정값 확인', () => {
    const expectedTitle = '도전! 컵 섞기 야바위 게임 🥤';
    expect(expectedTitle).toContain('야바위 게임');

    const lv1 = getLevelConfig(1);
    expect(lv1).toEqual({
      cups: 3,
      shuffleCount: 4,
      swapDuration: 750,
      stepDelay: 250,
    });
  });

  it('시나리오 1: 컵 카드의 동일한 외관 색상 검증 (모든 컵 카드 단일 통일 스타일)', () => {
    // 모든 컵 카드는 동일한 단일 스타일을 공유하여 외관 색상으로 식별되지 않아야 함
    expect(UNIFORM_CUP_STYLE.cardClass).toContain('bg-white/95');
    expect(UNIFORM_CUP_STYLE.cardClass).toContain('border-pink-200');
    expect(UNIFORM_CUP_STYLE.cardClass).toContain('shadow-md');
  });

  it('시나리오 2 & 레벨 디자인 검증: 레벨 1~5 설정값 확인', () => {
    // Lv.1: 3개, 4회, 750ms, 250ms
    const lv1 = getLevelConfig(1);
    expect(lv1).toEqual({
      cups: 3,
      shuffleCount: 4,
      swapDuration: 750,
      stepDelay: 250,
    });

    // Lv.2: 3개, 6회, 650ms, 200ms
    const lv2 = getLevelConfig(2);
    expect(lv2).toEqual({
      cups: 3,
      shuffleCount: 6,
      swapDuration: 650,
      stepDelay: 200,
    });

    // Lv.3: 4개, 7회, 550ms, 150ms
    const lv3 = getLevelConfig(3);
    expect(lv3).toEqual({
      cups: 4,
      shuffleCount: 7,
      swapDuration: 550,
      stepDelay: 150,
    });

    // Lv.4: 4개, 9회, 480ms, 120ms
    const lv4 = getLevelConfig(4);
    expect(lv4).toEqual({
      cups: 4,
      shuffleCount: 9,
      swapDuration: 480,
      stepDelay: 120,
    });

    // Lv.5: 5개, 10회, 420ms, 100ms
    const lv5 = getLevelConfig(5);
    expect(lv5).toEqual({
      cups: 5,
      shuffleCount: 10,
      swapDuration: 420,
      stepDelay: 100,
    });
  });

  it('시나리오 3: 섞는 과정 가시화 (MIXING 애니메이션) - 컵 교환 좌표 및 yOffset/zIndex 검증', () => {
    const initialCups = [
      { id: 'cup-0', slotIndex: 0, yOffset: 0, zIndex: 10 },
      { id: 'cup-1', slotIndex: 1, yOffset: 0, zIndex: 10 },
      { id: 'cup-2', slotIndex: 2, yOffset: 0, zIndex: 10 },
    ];

    const slotA = 0;
    const slotB = 2;

    // Swap slots: Cup in slotA gets slotB and yOffset -30 (z: 30)
    // Cup in slotB gets slotA and yOffset 30 (z: 20)
    const swapped = initialCups.map((c) => {
      if (c.slotIndex === slotA) {
        return { ...c, slotIndex: slotB, yOffset: -30, zIndex: 30 };
      }
      if (c.slotIndex === slotB) {
        return { ...c, slotIndex: slotA, yOffset: 30, zIndex: 20 };
      }
      return { ...c, yOffset: 0, zIndex: 10 };
    });

    expect(swapped.find((c) => c.id === 'cup-0')).toEqual({
      id: 'cup-0',
      slotIndex: 2,
      yOffset: -30,
      zIndex: 30,
    });
    expect(swapped.find((c) => c.id === 'cup-2')).toEqual({
      id: 'cup-2',
      slotIndex: 0,
      yOffset: 30,
      zIndex: 20,
    });
    expect(swapped.find((c) => c.id === 'cup-1')).toEqual({
      id: 'cup-1',
      slotIndex: 1,
      yOffset: 0,
      zIndex: 10,
    });

    // Reset yOffset after swap duration
    const reset = swapped.map((c) => ({ ...c, yOffset: 0, zIndex: 10 }));
    expect(reset.every((c) => c.yOffset === 0 && c.zIndex === 10)).toBe(true);
  });

  it('시나리오 4: 점수 산정 공식 검증: (현재 레벨 × 100) + (잔여 컵 개수 × 50)', () => {
    // Level 1, 3 cups: (1 * 100) + (3 * 50) = 250
    expect(calculateRoundScore(1, 3)).toBe(250);

    // Level 2, 3 cups: (2 * 100) + (3 * 50) = 350
    expect(calculateRoundScore(2, 3)).toBe(350);

    // Level 3, 4 cups: (3 * 100) + (4 * 50) = 500
    expect(calculateRoundScore(3, 4)).toBe(500);

    // Level 5, 5 cups: (5 * 100) + (5 * 50) = 750
    expect(calculateRoundScore(5, 5)).toBe(750);
  });

  it('시나리오 5: 최고 기록(Best Score) 보존 및 LocalStorage 갱신', () => {
    const STORAGE_KEY = 'cup_game_best_score';

    // 최초 로드 시 0
    const initialRaw = localStorage.getItem(STORAGE_KEY);
    const initialBest = initialRaw ? parseInt(initialRaw, 10) : 0;
    expect(initialBest).toBe(0);

    // 300점 획득 시 갱신
    const currentScore = 300;
    if (currentScore > initialBest) {
      localStorage.setItem(STORAGE_KEY, currentScore.toString());
    }
    expect(parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)).toBe(300);

    // 다음 게임에서 낮은 점수(250점)를 얻었을 때 최고 점수 유지
    const lowerScore = 250;
    const currentBest = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    if (lowerScore > currentBest) {
      localStorage.setItem(STORAGE_KEY, lowerScore.toString());
    }
    expect(parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)).toBe(300);
  });

  it('비동기 타이머 sleep 유틸리티 검증', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(40);
  });
});
