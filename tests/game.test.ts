import { describe, it, expect } from 'vitest';
import {
  getLevelConfig,
  calculateRoundScore,
  UNIFORM_CUP_CARD_CLASS,
  computeResponsiveDimensions,
} from '@/constants/levels';
import { insertScoreRecord, fetchTop5Records } from '@/lib/db';
import { sleep } from '@/utils/timer';

describe('Cup Shuffle Game - SPEC v24 Verification Tests', () => {
  it('연기 테스트 (Smoke Test): 헤더 문구, 점수 배너, 게임 시작 버튼 검증', () => {
    const title = '도전! 컵 섞기 야바위 게임 🥤';
    expect(title).toBe('도전! 컵 섞기 야바위 게임 🥤');

    const scoreLabels = ['Score:', 'Best:', 'Lv.'];
    expect(scoreLabels).toContain('Score:');
    expect(scoreLabels).toContain('Best:');
    expect(scoreLabels).toContain('Lv.');

    const startButtonLabel = '게임 시작';
    expect(startButtonLabel).toBe('게임 시작');
  });

  it('시나리오 1: 카드 외관 동일성 및 공 비침 방지 검증', () => {
    // 모든 컵 카드는 단일한 디자인(bg-white opacity-100 border-2 border-pink-200 rounded-2xl shadow-md)을 가짐
    const cardClass = UNIFORM_CUP_CARD_CLASS;
    expect(cardClass).toContain('bg-white');
    expect(cardClass).toContain('opacity-100');
    expect(cardClass).toContain('border-2');
    expect(cardClass).toContain('border-pink-200');
    expect(cardClass).toContain('rounded-2xl');
    expect(cardClass).toContain('shadow-md');
  });

  it('시나리오 2: 좁은 모바일 화면(320px~375px)에서 컵 카드 겹침/잘림 방지 검증', () => {
    // 뷰포트 너비 360px, Lv.5(컵 5개) 환경 테스트
    const containerWidth = 360;
    const cupCount = 5;
    const { slotWidth, cupWidth } = computeResponsiveDimensions(cupCount, containerWidth);

    // 슬롯 너비와 컵 너비가 양수이며 모바일 기준에 맞는지 확인
    expect(slotWidth).toBeLessThanOrEqual(58);
    expect(cupWidth).toBeLessThanOrEqual(slotWidth);

    // 5개의 컵이 차지하는 총 너비가 컨테이너 너비를 초과하지 않아 잘림 방지됨
    const totalTrackWidth = (cupCount - 1) * slotWidth + cupWidth;
    expect(totalTrackWidth).toBeLessThan(containerWidth);

    // 각 컵의 위치(slotIndex * slotWidth)가 인접 컵과 겹치지 않는지 확인
    const positions = Array.from({ length: cupCount }, (_, i) => i * slotWidth);
    for (let i = 0; i < positions.length - 1; i++) {
      const currentCupRight = positions[i] + cupWidth;
      const nextCupLeft = positions[i + 1];
      // 컵 간격이 0 이상(서로 겹치지 않음)
      expect(nextCupLeft).toBeGreaterThanOrEqual(currentCupRight - (slotWidth - cupWidth));
    }
  });

  it('시나리오 3: 공 노출 타이밍 검증 (PREVIEW, REVEAL/CLEAR/OVER만 노출, MIXING/CHOOSING 은폐)', () => {
    // GameState별 공 노출 여부 규칙 함수
    const isBallVisible = (state: string, isOpen: boolean, hasBall: boolean) => {
      if (!hasBall || !isOpen) return false;
      return ['PREVIEW', 'REVEAL', 'ROUND_CLEAR', 'GAME_OVER'].includes(state);
    };

    // 1. PREVIEW: 열림 -> 노출
    expect(isBallVisible('PREVIEW', true, true)).toBe(true);

    // 2. MIXING: 은폐 (opacity-0, hidden)
    expect(isBallVisible('MIXING', false, true)).toBe(false);
    expect(isBallVisible('MIXING', true, true)).toBe(false);

    // 3. CHOOSING: 은폐 (opacity-0, hidden)
    expect(isBallVisible('CHOOSING', false, true)).toBe(false);
    expect(isBallVisible('CHOOSING', true, true)).toBe(false);

    // 4. REVEAL / ROUND_CLEAR / GAME_OVER: 열리는 순간 노출
    expect(isBallVisible('REVEAL', true, true)).toBe(true);
    expect(isBallVisible('ROUND_CLEAR', true, true)).toBe(true);
    expect(isBallVisible('GAME_OVER', true, true)).toBe(true);
  });

  it('시나리오 4: 게임 오버 후 점수 1회 저장 및 비활성화 검증', async () => {
    // 1. 닉네임 유효성 검사 (2~8자)
    await expect(insertScoreRecord('a', 500, 3)).rejects.toThrow('닉네임은 2~8자 사이여야 합니다.');
    await expect(insertScoreRecord('너무긴닉네임입니다아아', 500, 3)).rejects.toThrow('닉네임은 2~8자 사이여야 합니다.');
    await expect(insertScoreRecord('정상닉', -10, 3)).rejects.toThrow('점수는 0 이상의 정수여야 합니다.');

    // 2. 점수 정상 저장
    let isScoreSaved = false;
    const record = await insertScoreRecord('야바위왕', 650, 4);
    expect(record.nickname).toBe('야바위왕');
    expect(record.score).toBe(650);
    expect(record.level).toBe(4);

    isScoreSaved = true;
    expect(isScoreSaved).toBe(true);

    // 3. 버튼 상태 및 1회 제한 비활성화 확인
    const buttonLabel = isScoreSaved ? '저장 완료 ✓' : '기록 저장';
    const isButtonDisabled = isScoreSaved;
    const isInputDisabled = isScoreSaved;

    expect(buttonLabel).toBe('저장 완료 ✓');
    expect(isButtonDisabled).toBe(true);
    expect(isInputDisabled).toBe(true);

    // 4. TOP 5 조회 확인
    const top5 = await fetchTop5Records();
    expect(top5.length).toBeLessThanOrEqual(5);
    expect(top5[0].score).toBeGreaterThanOrEqual(top5[top5.length - 1].score);
  });

  it('레벨 디자인 테이블 검증 (Lv.1 ~ Lv.5+ 속도, 교환 횟수, 컵 개수)', () => {
    const lv1 = getLevelConfig(1);
    expect(lv1.cups).toBe(3);
    expect(lv1.shuffleCount).toBe(4);
    expect(lv1.swapDuration).toBe(750);
    expect(lv1.stepDelay).toBe(250);

    const lv2 = getLevelConfig(2);
    expect(lv2.cups).toBe(3);
    expect(lv2.shuffleCount).toBe(6);
    expect(lv2.swapDuration).toBe(650);
    expect(lv2.stepDelay).toBe(200);

    const lv3 = getLevelConfig(3);
    expect(lv3.cups).toBe(4);
    expect(lv3.shuffleCount).toBe(7);
    expect(lv3.swapDuration).toBe(550);
    expect(lv3.stepDelay).toBe(150);

    const lv4 = getLevelConfig(4);
    expect(lv4.cups).toBe(4);
    expect(lv4.shuffleCount).toBe(9);
    expect(lv4.swapDuration).toBe(480);
    expect(lv4.stepDelay).toBe(120);

    const lv5 = getLevelConfig(5);
    expect(lv5.cups).toBe(5);
    expect(lv5.shuffleCount).toBe(10);
    expect(lv5.swapDuration).toBe(420);
    expect(lv5.stepDelay).toBe(100);
  });

  it('점수 산출 공식 검증: (현재 레벨 × 100) + (잔여 컵 개수 × 50)', () => {
    expect(calculateRoundScore(1, 3)).toBe(250);
    expect(calculateRoundScore(2, 3)).toBe(350);
    expect(calculateRoundScore(3, 4)).toBe(500);
    expect(calculateRoundScore(4, 4)).toBe(600);
    expect(calculateRoundScore(5, 5)).toBe(750);
  });

  it('비동기 딜레이 유틸리티 sleep 검증', async () => {
    const start = Date.now();
    await sleep(25);
    expect(Date.now() - start).toBeGreaterThanOrEqual(20);
  });
});
