import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import StatusAlert from './components/StatusAlert';
import GameBoard from './components/GameBoard';
import GameOverModal from './components/GameOverModal';
import { GameState, CupItemData } from './types/game';
import {
  getLevelConfig,
  calculateRoundScore,
  CUP_COLOR_PALETTES,
} from './constants/levels';
import { playSound } from './utils/sound';
import { sleep } from './utils/timer';

const BEST_SCORE_STORAGE_KEY = 'cup_game_best_score';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);

  // Cup state managed without reordering the array, only updating slotIndex and yOffset
  const [cups, setCups] = useState<CupItemData[]>([]);
  const [ballCupId, setBallCupId] = useState<string>('cup-0');
  const [revealedCupIds, setRevealedCupIds] = useState<string[]>([]);
  const [currentSwapDuration, setCurrentSwapDuration] = useState<number>(750);

  // Active run cancel guard
  const isPlayingRef = useRef<boolean>(false);

  // Load best score on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(BEST_SCORE_STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) {
          setBestScore(parsed);
        }
      }
    } catch {
      // Storage unavailable fallback
    }
  }, []);

  // Initialize cup objects according to count
  const createCupList = useCallback((count: number): CupItemData[] => {
    return Array.from({ length: count }, (_, idx) => ({
      id: `cup-${idx}`,
      slotIndex: idx,
      yOffset: 0,
      zIndex: 10,
      color: CUP_COLOR_PALETTES[idx % CUP_COLOR_PALETTES.length],
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

  // Run the full round sequence: PREVIEW -> MIXING -> CHOOSING
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
      setRevealedCupIds([chosenBallCupId]);
      setGameState('PREVIEW');
      playSound('start');

      // PREVIEW stage: reveal ball for 1.5s
      await sleep(1500);
      if (!isPlayingRef.current) return;

      // Close cup and enter MIXING
      setRevealedCupIds([]);
      await sleep(300);
      if (!isPlayingRef.current) return;

      setGameState('MIXING');

      // Async shuffle loop per SPEC Section 3.3
      let lastPair: [number, number] = [-1, -1];
      for (let step = 0; step < config.shuffleCount; step++) {
        if (!isPlayingRef.current) return;

        const [slotA, slotB] = pickTwoRandomSlots(config.cups, lastPair);
        lastPair = [slotA, slotB];

        // 1. Swap slotIndex and apply arch yOffset: A goes up (-30px, z: 30), B goes down (30px, z: 20)
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

        // Wait for movement to finish
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

        // Wait for step delay cooldown
        await sleep(config.stepDelay);
        if (!isPlayingRef.current) return;
      }

      // Mixing finished -> CHOOSING
      setGameState('CHOOSING');
    },
    [createCupList]
  );

  const handleStartGame = () => {
    isPlayingRef.current = true;
    setLevel(1);
    setScore(0);
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

      if (newScore > bestScore) {
        setBestScore(newScore);
        try {
          localStorage.setItem(BEST_SCORE_STORAGE_KEY, newScore.toString());
        } catch {
          // ignore storage error
        }
      }

      await sleep(350);
      setGameState('ROUND_CLEAR');

      // 1.2s celebration then proceed to next level per SPEC
      await sleep(1200);
      if (!isPlayingRef.current) return;

      const nextLevel = level + 1;
      setLevel(nextLevel);
      runRound(nextLevel);
    } else {
      // Incorrect! Open clicked cup and also reveal the winning cup
      setRevealedCupIds([clickedCupId, ballCupId]);
      playSound('incorrect');

      await sleep(600);
      isPlayingRef.current = false;
      setGameState('GAME_OVER');

      if (score > bestScore) {
        setBestScore(score);
        try {
          localStorage.setItem(BEST_SCORE_STORAGE_KEY, score.toString());
        } catch {
          // ignore storage error
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-sky-100 text-slate-700 flex flex-col justify-between selection:bg-pink-300 selection:text-pink-900">
      <Header score={score} bestScore={bestScore} level={level} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <StatusAlert gameState={gameState} />

        <GameBoard
          gameState={gameState}
          cups={cups}
          ballCupId={ballCupId}
          revealedCupIds={revealedCupIds}
          swapDuration={currentSwapDuration}
          onCupClick={handleCupClick}
          onGameStart={handleStartGame}
        />
      </main>

      <GameOverModal
        isOpen={gameState === 'GAME_OVER'}
        score={score}
        level={level}
        bestScore={bestScore}
        onRestart={handleStartGame}
      />
    </div>
  );
}
