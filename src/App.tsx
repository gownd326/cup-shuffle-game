import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import GameBoard from './components/GameBoard';
import GameOverModal from './components/GameOverModal';
import { GameState, LevelConfig } from './types/game';
import { playSound } from './utils/sound';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [cupCount, setCupCount] = useState<number>(3);
  const [ballIndex, setBallIndex] = useState<number>(0);
  const [selectedCupIndex, setSelectedCupIndex] = useState<number | null>(null);
  const [isIncorrect, setIsIncorrect] = useState<boolean>(false);
  const [displayCups, setDisplayCups] = useState<number[]>([]);

  const shuffleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load best score on mount
  useEffect(() => {
    const saved = localStorage.getItem('cup_game_best_score');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) {
        setBestScore(parsed);
      }
    }
  }, []);

  // Determine level configuration
  const getLevelConfig = (lvl: number): LevelConfig => {
    if (lvl === 1) return { cups: 3, shuffleCount: 4, speed: 500 };
    if (lvl === 2) return { cups: 3, shuffleCount: 6, speed: 400 };
    if (lvl === 3) return { cups: 4, shuffleCount: 7, speed: 350 };
    if (lvl === 4) return { cups: 4, shuffleCount: 9, speed: 300 };
    return { cups: 5, shuffleCount: 10 + (lvl - 5), speed: 250 };
  };

  // Initialize round cups
  const initRoundCups = useCallback((count: number) => {
    return Array.from({ length: count }, (_, i) => i);
  }, []);

  useEffect(() => {
    const config = getLevelConfig(level);
    setCupCount(config.cups);
    setDisplayCups(initRoundCups(config.cups));
  }, [level, initRoundCups]);

  // Start Game / Next Level trigger
  const startRound = useCallback(() => {
    playSound('start');
    const config = getLevelConfig(level);
    const newCupCount = config.cups;
    setCupCount(newCupCount);
    
    // Pick random ball index
    const correctCup = Math.floor(Math.random() * newCupCount);
    setBallIndex(correctCup);
    setDisplayCups(initRoundCups(newCupCount));
    setSelectedCupIndex(null);
    setIsIncorrect(false);

    // PREVIEW state
    setGameState('PREVIEW');

    // After 1 second preview, start mixing
    setTimeout(() => {
      setGameState('MIXING');
      executeShuffles(config.shuffleCount, config.speed, newCupCount, correctCup);
    }, 1000);
  }, [level, initRoundCups]);

  const handleGameStart = () => {
    setLevel(1);
    setScore(0);
    startRound();
  };

  // Execute shuffle animation sequence
  const executeShuffles = (totalShuffles: number, speed: number, currentCupCount: number, initialBallPos: number) => {
    let currentStep = 0;
    let currentBallPos = initialBallPos;
    let lastPair: [number, number] = [-1, -1];

    const stepShuffle = () => {
      if (currentStep < totalShuffles) {
        // Pick two distinct random cups to swap
        let idx1 = Math.floor(Math.random() * currentCupCount);
        let idx2 = Math.floor(Math.random() * currentCupCount);
        while (idx2 === idx1 || (currentCupCount > 2 && idx1 === lastPair[1] && idx2 === lastPair[0])) {
          idx2 = Math.floor(Math.random() * currentCupCount);
        }
        lastPair = [idx1, idx2];

        setDisplayCups((prev) => {
          const next = [...prev];
          const temp = next[idx1];
          next[idx1] = next[idx2];
          next[idx2] = temp;
          return next;
        });

        // Track ball movement if involved in swap
        if (currentBallPos === idx1) {
          currentBallPos = idx2;
        } else if (currentBallPos === idx2) {
          currentBallPos = idx1;
        }

        playSound('shuffle');
        currentStep++;
        shuffleTimerRef.current = setTimeout(stepShuffle, speed);
      } else {
        // Mixing finished, transition to CHOOSING
        setBallIndex(currentBallPos);
        setGameState('CHOOSING');
      }
    };

    shuffleTimerRef.current = setTimeout(stepShuffle, speed);
  };

  // Handle cup selection by user
  const handleCupClick = (cupId: number) => {
    if (gameState !== 'CHOOSING') return;

    setSelectedCupIndex(cupId);
    const isCorrectChoice = cupId === ballIndex;

    if (isCorrectChoice) {
      playSound('correct');
      setGameState('ROUND_CLEAR');

      // Calculate score
      const config = getLevelConfig(level);
      const bonus = level * 10;
      const roundScoreEarned = (level * 100) + (config.cups * 50) + bonus;
      const newScore = score + roundScoreEarned;
      setScore(newScore);

      // Check best score update immediately
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('cup_game_best_score', newScore.toString());
      }

      // Proceed to next level after 1 second
      setTimeout(() => {
        setLevel((prev) => prev + 1);
        startRound();
      }, 1000);
    } else {
      playSound('incorrect');
      setIsIncorrect(true);
      setGameState('GAME_OVER');

      // Final best score check
      if (score > bestScore) {
        setBestScore(score);
        localStorage.setItem('cup_game_best_score', score.toString());
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      <Header score={score} bestScore={bestScore} level={level} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <GameBoard
          gameState={gameState}
          cupCount={cupCount}
          ballIndex={ballIndex}
          displayCups={displayCups}
          selectedCupIndex={selectedCupIndex}
          isIncorrect={isIncorrect}
          onCupClick={handleCupClick}
          onGameStart={handleGameStart}
        />
      </main>

      <GameOverModal
        isOpen={gameState === 'GAME_OVER'}
        score={score}
        bestScore={bestScore}
        onRestart={handleGameStart}
      />
    </div>
  );
}
