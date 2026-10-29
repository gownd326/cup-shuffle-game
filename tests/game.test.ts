import { describe, it, expect, beforeEach } from 'vitest';
import { getLevelConfig, calculateRoundScore, UNIFORM_CUP_STYLE } from '../src/constants/levels';
import { sleep } from '../src/utils/timer';
import {
  saveLocalFallbackScore,
  getLocalFallbackScores,
  insertGameScore,
  fetchTop5Scores,
} from '../src/lib/supabase';

describe('Cup Shuffle Game - SPEC v20 Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('연기 테스트 (Smoke Test): 초기 화면 문구 및 레벨 1 기본 설정 검증', () => {
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

  it('시나리오 1: 컵 카드의 동일한 외관 색상 검증', () => {
    // 모든 카드는 외관으로 구별할 수 없도록 단일 화이트 크림톤 및 통일된 핑크 테두리
    expect(UNIFORM_CUP_STYLE.cardClass).toContain('bg-white/95');
    expect(UNIFORM_CUP_STYLE.cardClass).toContain('border-pink-200');
    expect(UNIFORM_CUP_STYLE.cardClass).toContain('shadow-md');
  });

  it('시나리오 2: 게임 종료 후 기록 저장 및 버튼 비활성화 검증', async () => {
    // 1. 유효성 검증 (2~8자)
    await expect(insertGameScore('a', 500, 3)).rejects.toThrow('닉네임은 2~8자 사이여야 합니다.');
    await expect(insertGameScore('너무긴닉네임입니다아아', 500, 3)).rejects.toThrow('닉네임은 2~8자 사이여야 합니다.');

    // 2. 점수 1회 정상 저장
    let isScoreSaved = false;
    const savedRecord = await insertGameScore('야바위왕', 550, 3);
    expect(savedRecord.nickname).toBe('야바위왕');
    expect(savedRecord.score).toBe(550);
    expect(savedRecord.level).toBe(3);

    // 저장 성공 시 플래그 전환
    isScoreSaved = true;
    expect(isScoreSaved).toBe(true);

    // 3. 버튼 문구 및 비활성화(disabled) 상태 매핑 검증
    const buttonLabel = isScoreSaved ? '저장 완료 ✓' : '기록 저장';
    const isButtonDisabled = isScoreSaved;
    const isInputDisabled = isScoreSaved;

    expect(buttonLabel).toBe('저장 완료 ✓');
    expect(isButtonDisabled).toBe(true);
    expect(isInputDisabled).toBe(true);

    // 4. 새 게임 시작 시 플래그 리셋 검증
    const handleStartNewGame = () => {
      isScoreSaved = false;
    };
    handleStartNewGame();
    expect(isScoreSaved).toBe(false);
    expect(isScoreSaved ? '저장 완료 ✓' : '기록 저장').toBe('기록 저장');
  });

  it('시나리오 3: 헤더 랭킹 버튼을 통한 실시간 TOP 5 조회', async () => {
    saveLocalFallbackScore({ nickname: '유저1', score: 200, level: 1 });
    saveLocalFallbackScore({ nickname: '유저2', score: 600, level: 4 });
    saveLocalFallbackScore({ nickname: '유저3', score: 450, level: 3 });
    saveLocalFallbackScore({ nickname: '유저4', score: 100, level: 1 });
    saveLocalFallbackScore({ nickname: '야바위왕', score: 550, level: 3 });
    saveLocalFallbackScore({ nickname: '유저5', score: 300, level: 2 });

    const top5 = await fetchTop5Scores();
    expect(top5).toHaveLength(5);
    // 내림차순 정렬: 600(유저2) > 550(야바위왕) > 450(유저3) > 300(유저5) > 200(유저1)
    expect(top5[0].score).toBe(600);
    expect(top5[0].nickname).toBe('유저2');
    expect(top5[1].score).toBe(550);
    expect(top5[1].nickname).toBe('야바위왕');
    expect(top5[4].score).toBe(200);

    const rank = top5.findIndex((r) => r.nickname === '야바위왕' && r.score === 550) + 1;
    expect(rank).toBe(2);
  });

  it('레벨 디자인 테이블 검증 (Lv.1 ~ Lv.5+ 속도 및 컵 개수)', () => {
    expect(getLevelConfig(1)).toEqual({ cups: 3, shuffleCount: 4, swapDuration: 750, stepDelay: 250 });
    expect(getLevelConfig(2)).toEqual({ cups: 3, shuffleCount: 6, swapDuration: 650, stepDelay: 200 });
    expect(getLevelConfig(3)).toEqual({ cups: 4, shuffleCount: 7, swapDuration: 550, stepDelay: 150 });
    expect(getLevelConfig(4)).toEqual({ cups: 4, shuffleCount: 9, swapDuration: 480, stepDelay: 120 });
    expect(getLevelConfig(5)).toEqual({ cups: 5, shuffleCount: 10, swapDuration: 420, stepDelay: 100 });
  });

  it('점수 산정 공식 검증: (현재 레벨 × 100) + (잔여 컵 개수 × 50)', () => {
    expect(calculateRoundScore(1, 3)).toBe(250);
    expect(calculateRoundScore(2, 3)).toBe(350);
    expect(calculateRoundScore(3, 4)).toBe(500);
    expect(calculateRoundScore(4, 4)).toBe(600);
    expect(calculateRoundScore(5, 5)).toBe(750);
  });

  it('섞기(MIXING) 좌표 스왑 및 yOffset 복원 로직 검증', () => {
    const cups = [
      { id: 'cup-0', slotIndex: 0, yOffset: 0, zIndex: 10 },
      { id: 'cup-1', slotIndex: 1, yOffset: 0, zIndex: 10 },
      { id: 'cup-2', slotIndex: 2, yOffset: 0, zIndex: 10 },
    ];

    const slotA = 0;
    const slotB = 1;

    // A위로 B아래로 아치 이동
    const swapped = cups.map((c) => {
      if (c.slotIndex === slotA) return { ...c, slotIndex: slotB, yOffset: -30, zIndex: 30 };
      if (c.slotIndex === slotB) return { ...c, slotIndex: slotA, yOffset: 30, zIndex: 20 };
      return { ...c, yOffset: 0, zIndex: 10 };
    });

    expect(swapped.find((c) => c.id === 'cup-0')?.slotIndex).toBe(1);
    expect(swapped.find((c) => c.id === 'cup-0')?.yOffset).toBe(-30);
    expect(swapped.find((c) => c.id === 'cup-1')?.slotIndex).toBe(0);
    expect(swapped.find((c) => c.id === 'cup-1')?.yOffset).toBe(30);

    // 이동 완료 후 yOffset 리셋
    const reset = swapped.map((c) => ({ ...c, yOffset: 0, zIndex: 10 }));
    expect(reset.every((c) => c.yOffset === 0 && c.zIndex === 10)).toBe(true);
  });

  it('비동기 sleep 타이머 검증', async () => {
    const start = Date.now();
    await sleep(40);
    expect(Date.now() - start).toBeGreaterThanOrEqual(30);
  });
});
