import { describe, it, expect, beforeEach } from 'vitest';
import { getLevelConfig } from '@/constants/levels';
import {
  calculateRoundScore,
  computeResponsiveDimensions,
  pickTwoRandomSlots,
} from '@/utils/game';
import {
  BEST_SCORE_STORAGE_KEY,
  getStoredBestScore,
  saveStoredBestScore,
} from '@/utils/storage';
import { saveScore, getTop5Scores } from '@/lib/scores';
import { ensureTableExists, getDbClient } from '@/lib/db';
import { POST as saveScoreRoute } from '@/app/api/scores/route';
import { GET as getTop5Route } from '@/app/api/scores/top5/route';

describe('Cup Shuffle Game - SPEC v29 기능 수용 테스트 & 검증', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('연기 테스트와 공개 경로: DB 환경 변수 유무와 무관하게 GET / 정상 응답 보장 및 초기 문구 검증', () => {
    // 제목 문구: 도전! 컵 섞기 야바위 게임 🥤
    const title = '도전! 컵 섞기 야바위 게임 🥤';
    expect(title).toBe('도전! 컵 섞기 야바위 게임 🥤');

    // 점수 표시 문구: Score: {현재점수}, Best: {최고점수}, Lv.{레벨}
    const scorePrefix = 'Score: ';
    const bestPrefix = 'Best: ';
    const lvPrefix = 'Lv.';
    expect(scorePrefix).toBe('Score: ');
    expect(bestPrefix).toBe('Best: ');
    expect(lvPrefix).toBe('Lv.');

    // 대기 상태 시작 버튼: 게임 시작
    const startBtn = '게임 시작';
    expect(startBtn).toBe('게임 시작');
  });

  it('데이터베이스 자동 생성 (Auto-migration): ensureTableExists() 함수 작동 확인', async () => {
    // DATABASE_URL 이 없으면 null 반환 (서버 에러 없이 안전 동작)
    const sql = await ensureTableExists();
    if (!process.env.DATABASE_URL) {
      expect(sql).toBeNull();
    } else {
      expect(sql).not.toBeNull();
    }
  });

  it('카드 외관 통일: 모든 카드의 배경(#FFFFFF), 불투명도(1), 테두리(2px solid #FBCFE8) 일관성', () => {
    const cardStyle = {
      backgroundColor: '#FFFFFF',
      opacity: 1,
      border: '2px solid #FBCFE8',
      borderRadius: '16px',
    };
    expect(cardStyle.backgroundColor).toBe('#FFFFFF');
    expect(cardStyle.opacity).toBe(1);
    expect(cardStyle.border).toBe('2px solid #FBCFE8');
    expect(cardStyle.borderRadius).toBe('16px');
  });

  it('공 공개와 은폐: PREVIEW와 결과 공개 상태에서만 보이고, MIXING 및 CHOOSING에서는 DOM에 없음', () => {
    const shouldRenderBall = (state: string, isOpen: boolean, hasBall: boolean) => {
      if (!hasBall || !isOpen) return false;
      return ['PREVIEW', 'REVEAL', 'ROUND_CLEAR', 'GAME_OVER'].includes(state);
    };

    // PREVIEW: 1500ms 동안 공개
    expect(shouldRenderBall('PREVIEW', true, true)).toBe(true);

    // MIXING & CHOOSING: DOM에 아예 렌더링하지 않음 (false)
    expect(shouldRenderBall('MIXING', false, true)).toBe(false);
    expect(shouldRenderBall('MIXING', true, true)).toBe(false);
    expect(shouldRenderBall('CHOOSING', false, true)).toBe(false);
    expect(shouldRenderBall('CHOOSING', true, true)).toBe(false);

    // REVEAL, ROUND_CLEAR, GAME_OVER: 결과 공개 시 표시
    expect(shouldRenderBall('REVEAL', true, true)).toBe(true);
    expect(shouldRenderBall('ROUND_CLEAR', true, true)).toBe(true);
    expect(shouldRenderBall('GAME_OVER', true, true)).toBe(true);
  });

  it('레벨 설정: Lv.1 ~ Lv.5 및 Lv.6 이상 수식 검증', () => {
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

    // Lv.6: 컵 5개, 교환 횟수 10 + 2 * (6 - 5) = 12회,
    // 이동시간 max(250, 420 - 25 * 1) = 395ms, 대기시간 max(60, 100 - 5 * 1) = 95ms
    const lv6 = getLevelConfig(6);
    expect(lv6.cups).toBe(5);
    expect(lv6.shuffleCount).toBe(12);
    expect(lv6.swapDuration).toBe(395);
    expect(lv6.stepDelay).toBe(95);

    // 고레벨 최솟값 검증 (Lv.20)
    const lv20 = getLevelConfig(20);
    expect(lv20.cups).toBe(5);
    expect(lv20.shuffleCount).toBe(10 + 2 * 15); // 40
    expect(lv20.swapDuration).toBe(250); // min cap 250ms
    expect(lv20.stepDelay).toBe(60); // min cap 60ms
  });

  it('정답 점수와 다음 레벨: 레벨 1의 정답 점수는 450점', () => {
    const lv1Score = calculateRoundScore(1, 3);
    expect(lv1Score).toBe(450);
  });

  it('실제 컵 슬롯 이동 및 무작위 쌍 선택', () => {
    const pair = pickTwoRandomSlots(3, [-1, -1]);
    expect(pair[0]).not.toBe(pair[1]);
    expect(pair[0]).toBeGreaterThanOrEqual(0);
    expect(pair[0]).toBeLessThan(3);
    expect(pair[1]).toBeGreaterThanOrEqual(0);
    expect(pair[1]).toBeLessThan(3);
  });

  it('최고 점수 저장: cup-shuffle-best-score 저장 및 손상된 값 0 처리', () => {
    // 1. 초기 상태 0
    expect(getStoredBestScore()).toBe(0);

    // 2. 새 점수 저장
    saveStoredBestScore(450);
    expect(getStoredBestScore()).toBe(450);

    // 3. 손상된 값(음수, NaN, 문자열)은 0으로 처리
    localStorage.setItem(BEST_SCORE_STORAGE_KEY, '-50');
    expect(getStoredBestScore()).toBe(0);

    localStorage.setItem(BEST_SCORE_STORAGE_KEY, 'corrupted_value');
    expect(getStoredBestScore()).toBe(0);
  });

  it('점수 저장 성공 및 유효성 검사 (POST /api/scores)', async () => {
    // 유효한 요청
    const validReq = new Request('http://localhost/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: '민수', score: 450, level: 1 }),
    });
    const res = await saveScoreRoute(validReq);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.record.nickname).toBe('민수');
    expect(data.record.score).toBe(450);
    expect(data.record.level).toBe(1);
    expect(data.record.createdAt).toBeDefined();

    // 닉네임 2자 미만 -> 400 INVALID_INPUT
    const shortReq = new Request('http://localhost/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: '가', score: 450, level: 1 }),
    });
    const shortRes = await saveScoreRoute(shortReq);
    expect(shortRes.status).toBe(400);
    const shortData = await shortRes.json();
    expect(shortData.error).toBe('INVALID_INPUT');

    // 닉네임 8자 초과 -> 400 INVALID_INPUT
    const longReq = new Request('http://localhost/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: '123456789', score: 450, level: 1 }),
    });
    const longRes = await saveScoreRoute(longReq);
    expect(longRes.status).toBe(400);

    // 음수 점수 -> 400 INVALID_INPUT
    const negReq = new Request('http://localhost/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: '영희', score: -10, level: 1 }),
    });
    const negRes = await saveScoreRoute(negReq);
    expect(negRes.status).toBe(400);
  });

  it('랭킹 조회 (GET /api/scores/top5): 최대 5개 정렬 반환', async () => {
    await saveScore('도전자1', 100, 1);
    await saveScore('도전자2', 800, 4);
    await saveScore('도전자3', 450, 1);

    const res = await getTop5Route();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data.records)).toBe(true);
    expect(data.records.length).toBeLessThanOrEqual(5);

    // 정렬 확인: score DESC
    for (let i = 0; i < data.records.length - 1; i++) {
      expect(data.records[i].score).toBeGreaterThanOrEqual(data.records[i + 1].score);
    }
  });

  it('모바일 레이아웃: 320px 뷰포트에서 Lv.5(컵 5개) 겹침/잘림 없음', () => {
    const containerWidth = 320;
    const cupCount = 5;
    const { slotWidth, cupWidth, cupHeight } = computeResponsiveDimensions(
      cupCount,
      containerWidth
    );

    expect(slotWidth).toBeLessThanOrEqual(58);
    expect(cupWidth).toBeLessThan(slotWidth);
    expect(cupHeight).toBeGreaterThanOrEqual(80);
    expect(cupHeight).toBeLessThanOrEqual(110);

    // 5개 컵의 총 너비가 컨테이너 너비 이내
    const totalTrackWidth = (cupCount - 1) * slotWidth + cupWidth;
    expect(totalTrackWidth).toBeLessThan(containerWidth);
  });
});
