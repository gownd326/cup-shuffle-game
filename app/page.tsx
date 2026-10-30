'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '@/components/Header';
import StatusAlert from '@/components/StatusAlert';
import GameBoard from '@/components/GameBoard';
import GameOverModal from '@/components/GameOverModal';
import LeaderboardModal from '@/components/LeaderboardModal';
import { GameState, CupItemData, ScoreRecord } from '@/types/game';
import { getLevelConfig, calculateRoundScore } from '@/constants/levels';
import { playSound } from '@/utils/sound';
import { sleep } from '@/utils/timer';

const BEST_SCORE_STORAGE_KEY = 'cup_best_score';

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

  // Load top score on initial mount
  useEffect(() => {
    const loadInitialTop = async () => {
      try {
        const res = await fetch('/api/scores/top5');
        if (res.ok) {
          const data: ScoreRecord[] = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setTopScore(data[0].score);
            return;
          }
        }
      } catch {
        // ignore
      }
      const fallback = Number(localStorage.getItem(BEST_SCORE_STORAGE_KEY) || '0');
      setTopScore(fallback);
    };
    loadInitialTop();
  }, []);

  // Fetch leaderboard data helper
  const loadLeaderboardData = useCallback(async () => {
    setIsLoadingLeaderboard(true);
    setLeaderboardError(null);
    try {
      const res = await fetch('/api/scores/top5');
      if (!res.ok) {
        throw new Error('랭킹을 불러오지 못했습니다.');
      }
      const top5: ScoreRecord[] = await res.json();
      setLeaderboardScores(top5);
      if (top5.length > 0 && top5[0].score > topScore) {
        setTopScore(top5[0].score);
      }
    } catch {
      setLeaderboardError('랭킹을 불러오지 못했습니다. 네트워크를 확인해주세요.');
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, [topScore]);

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

  // Pick two random slot indices for shuffle
  const pickTwoRandomSlots = (count: number, lastPair: [number, number]): [number, number] => {
    let a = Math.floor(Math.random() * count);
    let b = Math.floor(Math.random() * count);
    while (b === a || (count > 2 && a === lastPair[1] && b === lastPair[0])) {
      b = Math.floor(Math.random() * count);
    }
    return [a, b];
  };

  // Run the full round sequence: PREVIEW (1.5s ball visible) -> MIXING (ball hidden) -> CHOOSING (ball hidden)
  const runRound = useCallback(
    async (roundLevel: number) => {
      const config = getLevelConfig(roundLevel);
      setCurrentSwapDuration(config.swapDuration);

      // Create initial cups and pick random ball cup
      const newCups = createCupList(config.cups);
      const chosenBallIndex = Math.floor(Math.random() * config.cups);
      const chosenBallCupId = newCups[chosenBallIndex].id;

      setCups(newCups);
      setBallCupId(chosenBallCupId);
      // PREVIEW: 정답 컵 위로 들리고 공 1.5초간 노출
      setRevealedCupIds([chosenBallCupId]);
      setGameState('PREVIEW');
      playSound('start');

      await sleep(1500);
      if (!isPlayingRef.current) return;

      // Close cup and enter MIXING (공 완전히 은폐)
      setRevealedCupIds([]);
      await sleep(300);
      if (!isPlayingRef.current) return;

      setGameState('MIXING');

      let lastPair: [number, number] = [-1, -1];
      for (let step = 0; step < config.shuffleCount; step++) {
        if (!isPlayingRef.current) return;

        const [slotA, slotB] = pickTwoRandomSlots(config.cups, lastPair);
        lastPair = [slotA, slotB];

        // 1. Swap slotIndex and apply arch yOffset
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

        await sleep(config.swapDuration);
        if (!isPlayingRef.current) return;

        // 2. Reset yOffsets back to 0px
        setCups((prev) =>
          prev.map((c) => ({
            ...c,
            yOffset: 0,
            zIndex: 10,
          }))
        );

        await sleep(config.stepDelay);
        if (!isPlayingRef.current) return;
      }

      // Mixing finished -> CHOOSING (공 여전히 은폐)
      setGameState('CHOOSING');
    },
    [createCupList]
  );

  const handleStartGame = () => {
    isPlayingRef.current = true;
    setLevel(1);
    setScore(0);
    setHighlightedRecordId(null);
    setIsScoreSaved(false); // Reset saved flag on new game start
    runRound(1);
  };

  // Handle player choice during CHOOSING
  const handleCupClick = async (clickedCupId: string) => {
    if (gameState !== 'CHOOSING') return;

    setGameState('REVEAL');
    const isCorrect = clickedCupId === ballCupId;

    if (isCorrect) {
      // Correct! Open chosen cup
      setRevealedCupIds([clickedCupId]);
      playSound('correct');

      const config = getLevelConfig(level);
      const roundEarned = calculateRoundScore(level, config.cups);
      const newScore = score + roundEarned;
      setScore(newScore);

      if (newScore > topScore) {
        setTopScore(newScore);
        try {
          localStorage.setItem(BEST_SCORE_STORAGE_KEY, newScore.toString());
        } catch {
          // ignore
        }
      }

      await sleep(350);
      setGameState('ROUND_CLEAR');

      // 1.2s celebration then next level per SPEC
      await sleep(1200);
      if (!isPlayingRef.current) return;

      const nextLevel = level + 1;
      setLevel(nextLevel);
      runRound(nextLevel);
    } else {
      // Incorrect! Reveal clicked cup & correct cup -> GAME_OVER
      setRevealedCupIds([clickedCupId, ballCupId]);
      playSound('incorrect');

      await sleep(600);
      isPlayingRef.current = false;
      setGameState('GAME_OVER');

      if (score > topScore) {
        setTopScore(score);
        try {
          localStorage.setItem(BEST_SCORE_STORAGE_KEY, score.toString());
        } catch {
          // ignore
        }
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
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || '점수 저장에 실패했습니다.');
      }

      const result = await res.json();
      if (result.record?.id) {
        setHighlightedRecordId(result.record.id);
      }
      setIsScoreSaved(true); // Disable button & input immediately per SPEC

      // Refresh leaderboard & update top score
      await loadLeaderboardData();
      setIsLeaderboardOpen(true);
    } finally {
      setIsSavingScore(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-sky-100 flex flex-col justify-between items-center p-3 sm:p-4 select-none overflow-x-hidden">
      <Header
        score={score}
        topScore={topScore}
        level={level}
        onOpenLeaderboard={handleOpenLeaderboard}
      />

      <main className="flex-1 w-full flex flex-col items-center justify-center my-auto px-2">
        <StatusAlert gameState={gameState} />

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

      {/* 실시간 명예의 전당 TOP 5 모달 */}
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
