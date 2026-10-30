'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/Header';
import GameBoard from '@/components/GameBoard';
import GameOverModal from '@/components/GameOverModal';
import LeaderboardModal from '@/components/LeaderboardModal';
import { GameState, CupItemData, ScoreRecord, ApiTop5Response } from '@/types/game';
import { getLevelConfig } from '@/constants/levels';
import { calculateRoundScore, pickTwoRandomSlots } from '@/utils/game';
import { getStoredBestScore, saveStoredBestScore } from '@/utils/storage';
import { playSound } from '@/utils/sound';
import { sleep } from '@/utils/timer';

export default function HomePage() {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [score, setScore] = useState<number>(0);
  const [topScore, setTopScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);

  // Cup state managed without reordering the array, only updating slotIndex and yOffset
  const [cups, setCups] = useState<CupItemData[]>([]);
  const [ballCupId, setBallCupId] = useState<string>('cup-0');
  const [revealedCupIds, setRevealedCupIds] = useState<string[]>([]);
  const [currentSwapDuration, setCurrentSwapDuration] = useState<number>(750);

  // Modal and score saving states
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [leaderboardScores, setLeaderboardScores] = useState<ScoreRecord[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [highlightedRecordId, setHighlightedRecordId] = useState<string | null>(null);
  const [isSavingScore, setIsSavingScore] = useState<boolean>(false);
  const [isScoreSaved, setIsScoreSaved] = useState<boolean>(false);

  // Active run cancel guard
  const isPlayingRef = useRef<boolean>(false);

  // Load top score from localStorage on initial mount
  useEffect(() => {
    const stored = getStoredBestScore();
    setTopScore(stored);
  }, []);

  // Fetch leaderboard data helper
  const loadLeaderboardData = useCallback(async () => {
    setIsLoadingLeaderboard(true);
    setLeaderboardError(null);
    try {
      const res = await fetch('/api/scores/top5');
      if (!res.ok) {
        throw new Error('LEADERBOARD_UNAVAILABLE');
      }
      const data: ApiTop5Response = await res.json();
      const records = Array.isArray(data.records) ? data.records : [];
      setLeaderboardScores(records);
    } catch {
      setLeaderboardError('랭킹을 불러오지 못했어요. 다시 시도해 주세요.');
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, []);

  const handleOpenLeaderboard = () => {
    setIsLeaderboardOpen(true);
    loadLeaderboardData();
  };

  const handleCloseLeaderboard = () => {
    setIsLeaderboardOpen(false);
  };

  // Initialize cup objects according to count
  const createCupList = useCallback((count: number): CupItemData[] => {
    return Array.from({ length: count }, (_, idx) => ({
      id: `cup-${idx}`,
      slotIndex: idx,
      yOffset: 0,
      zIndex: 10,
    }));
  }, []);

  // Set initial idle stage cups
  useEffect(() => {
    const config = getLevelConfig(1);
    setCups(createCupList(config.cups));
  }, [createCupList]);

  // Run the full round sequence: PREVIEW (1.5s ball visible) -> MIXING (ball hidden) -> CHOOSING (ball hidden)
  const runRound = useCallback(
    async (roundLevel: number) => {
      const config = getLevelConfig(roundLevel);
      // 움직임 줄이기 설정 확인
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const swapDuration = prefersReducedMotion ? 100 : config.swapDuration;
      setCurrentSwapDuration(swapDuration);

      // Create initial cups and pick random ball cup
      const newCups = createCupList(config.cups);
      const chosenBallIndex = Math.floor(Math.random() * config.cups);
      const chosenBallCupId = newCups[chosenBallIndex].id;

      setCups(newCups);
      setBallCupId(chosenBallCupId);
      // PREVIEW: 정답 컵 위로 50px 들리고 공 1,500ms 동안 공개
      setRevealedCupIds([chosenBallCupId]);
      setGameState('PREVIEW');
      playSound('start');

      await sleep(1500);
      if (!isPlayingRef.current) return;

      // Close cup and enter MIXING (공은 DOM에 렌더링되지 않음)
      setRevealedCupIds([]);
      await sleep(250);
      if (!isPlayingRef.current) return;

      setGameState('MIXING');

      let lastPair: [number, number] = [-1, -1];
      for (let step = 0; step < config.shuffleCount; step++) {
        if (!isPlayingRef.current) return;

        const [slotA, slotB] = pickTwoRandomSlots(config.cups, lastPair);
        lastPair = [slotA, slotB];

        // 슬롯 교환
        setCups((prev) =>
          prev.map((c) => {
            if (c.slotIndex === slotA) {
              return { ...c, slotIndex: slotB, yOffset: -30, zIndex: 30 };
            }
            if (c.slotIndex === slotB) {
              return { ...c, slotIndex: slotA, yOffset: 30, zIndex: 20 };
            }
            return { ...c, yOffset: 0, zIndex: 10 };
          })
        );
        playSound('shuffle');

        // 이동 완료 대기 (이동시간 + 안전 여유 100ms 이내)
        await sleep(swapDuration);
        if (!isPlayingRef.current) return;

        // Reset yOffsets back to 0px
        setCups((prev) =>
          prev.map((c) => ({
            ...c,
            yOffset: 0,
            zIndex: 10,
          }))
        );

        // 교환 사이 대기 시간
        await sleep(config.stepDelay);
        if (!isPlayingRef.current) return;
      }

      // 섞기가 모두 끝난 뒤 CHOOSING 전환
      setGameState('CHOOSING');
    },
    [createCupList]
  );

  const handleStartGame = () => {
    isPlayingRef.current = true;
    setLevel(1);
    setScore(0);
    setHighlightedRecordId(null);
    setIsScoreSaved(false);
    runRound(1);
  };

  // Handle player choice during CHOOSING
  const handleCupClick = async (clickedCupId: string) => {
    if (gameState !== 'CHOOSING') return;

    setGameState('REVEAL');
    const isCorrect = clickedCupId === ballCupId;

    if (isCorrect) {
      // 정답인 경우: 선택한 컵 열기
      setRevealedCupIds([clickedCupId]);
      playSound('correct');

      const config = getLevelConfig(level);
      const roundEarned = calculateRoundScore(level, config.cups);
      const newScore = score + roundEarned;
      setScore(newScore);

      if (newScore > topScore) {
        setTopScore(newScore);
        saveStoredBestScore(newScore);
      }

      await sleep(350);
      setGameState('ROUND_CLEAR');

      // 정답 점수를 더하고 1,200ms 뒤 다음 레벨을 시작한다
      await sleep(1200);
      if (!isPlayingRef.current) return;

      const nextLevel = level + 1;
      setLevel(nextLevel);
      runRound(nextLevel);
    } else {
      // 오답인 경우: 선택 컵과 정답 컵을 함께 연다
      setRevealedCupIds([clickedCupId, ballCupId]);
      playSound('incorrect');

      await sleep(600);
      isPlayingRef.current = false;
      setGameState('GAME_OVER');

      if (score > topScore) {
        setTopScore(score);
        saveStoredBestScore(score);
      }
    }
  };

  // Submit score via POST /api/scores
  const handleSaveScore = async (nickname: string) => {
    setIsSavingScore(true);
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, score, level }),
      });

      if (!res.ok) {
        throw new Error('SAVE_FAILED');
      }

      const result = await res.json();
      if (result.record?.id) {
        setHighlightedRecordId(result.record.id);
      }
      setIsScoreSaved(true);

      // Refresh leaderboard
      await loadLeaderboardData();
    } finally {
      setIsSavingScore(false);
    }
  };

  // 상태별 안내 문구 (SPEC 4)
  const getStatusMessage = () => {
    switch (gameState) {
      case 'IDLE':
        return '게임을 시작하고 공이 숨겨진 컵을 찾아보세요!';
      case 'PREVIEW':
        return '공이 들어 있는 컵을 기억하세요!';
      case 'MIXING':
        return '컵을 잘 따라가세요!';
      case 'CHOOSING':
        return '공이 들어 있는 컵을 선택하세요.';
      case 'ROUND_CLEAR':
        return '정답이에요! 다음 레벨로 이동합니다.';
      case 'GAME_OVER':
      default:
        return '아쉽네요! 게임이 끝났어요.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCE7F3] via-[#F3E8FF] to-[#E0F2FE] flex flex-col justify-between items-center px-3 sm:px-4 py-3 sm:py-4 select-none overflow-x-hidden">
      <Header
        score={score}
        topScore={topScore}
        level={level}
        onOpenLeaderboard={handleOpenLeaderboard}
      />

      <main className="flex-1 w-full flex flex-col items-center justify-center my-auto px-2">
        {/* 안내 문구 (SPEC 4) */}
        <div className="mb-3 sm:mb-5 flex items-center justify-center w-full px-2">
          <div
            role="status"
            aria-live="polite"
            className="bg-white/95 border border-pink-100 rounded-2xl px-4 sm:px-6 py-2 sm:py-2.5 text-pink-600 font-bold shadow-sm transition-all duration-300 text-center text-xs sm:text-sm"
          >
            {getStatusMessage()}
          </div>
        </div>

        <GameBoard
          level={level}
          gameState={gameState}
          cups={cups}
          ballCupId={ballCupId}
          revealedCupIds={revealedCupIds}
          swapDuration={currentSwapDuration}
          onCupClick={handleCupClick}
          onGameStart={handleStartGame}
        />
      </main>

      {/* 게임 오버 모달 (점수 1회 저장 및 재도전) */}
      <GameOverModal
        isOpen={gameState === 'GAME_OVER'}
        score={score}
        level={level}
        isScoreSaved={isScoreSaved}
        isSaving={isSavingScore}
        onSaveScore={handleSaveScore}
        onRestart={handleStartGame}
      />

      {/* TOP 5 랭킹 모달 */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={handleCloseLeaderboard}
        scores={leaderboardScores}
        isLoading={isLoadingLeaderboard}
        error={leaderboardError}
        onRetry={loadLeaderboardData}
        highlightedRecordId={highlightedRecordId}
      />
    </div>
  );
}
