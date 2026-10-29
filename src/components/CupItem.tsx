import React, { useRef, useEffect, useState } from 'react';
import { GameState } from '../types/game';

interface CupItemProps {
  cupId: number;
  visualIdx: number;
  gameState: GameState;
  hasBall: boolean;
  isSelected: boolean;
  isIncorrect: boolean;
  onClick: () => void;
}

export default function CupItem({
  cupId,
  visualIdx,
  gameState,
  hasBall,
  isSelected,
  isIncorrect,
  onClick,
}: CupItemProps) {
  const showBallPreview = gameState === 'PREVIEW' && hasBall;
  const showResultBall = (gameState === 'CHOOSING' || gameState === 'ROUND_CLEAR' || gameState === 'GAME_OVER') && hasBall;

  const itemRef = useRef<HTMLDivElement>(null);
  const [prevLeft, setPrevLeft] = useState<number>(0);
  const [translateX, setTranslateX] = useState<number>(0);

  // Measure position shifts for smooth coordinate-based transform animation during MIXING
  useEffect(() => {
    if (!itemRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    setPrevLeft(rect.left);
  }, []);

  useEffect(() => {
    if (!itemRef.current || gameState !== 'MIXING') {
      setTranslateX(0);
      if (itemRef.current) {
        const rect = itemRef.current.getBoundingClientRect();
        setPrevLeft(rect.left);
      }
      return;
    }

    const rect = itemRef.current.getBoundingClientRect();
    const currentLeft = rect.left;
    const delta = prevLeft - currentLeft;

    if (delta !== 0) {
      setTranslateX((prev) => prev + delta);
      requestAnimationFrame(() => {
        setTranslateX(0);
      });
    }
    setPrevLeft(currentLeft);
  }, [visualIdx, gameState]);

  let cupTransform = 'translate-y-0';
  if (showBallPreview) {
    cupTransform = '-translate-y-8';
  } else if (gameState === 'ROUND_CLEAR' && hasBall) {
    cupTransform = '-translate-y-8';
  } else if (gameState === 'GAME_OVER' && hasBall) {
    cupTransform = '-translate-y-8';
  } else if (gameState === 'GAME_OVER' && isSelected && !hasBall) {
    cupTransform = 'translate-y-2';
  }

  return (
    <div
      ref={itemRef}
      style={{
        transform: `translateX(${translateX}px)`,
        transition: gameState === 'MIXING' ? 'transform 350ms cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
      }}
      className="flex flex-col items-center relative"
    >
      <div className="absolute -bottom-2 text-xs text-slate-500 font-bold select-none">
        {visualIdx + 1}
      </div>

      <div className="relative h-32 sm:h-36 flex items-end justify-center w-20 sm:w-24">
        {/* Ball inside or revealed */}
        {(showBallPreview || showResultBall) && (
          <div className="absolute bottom-2 w-7 h-7 sm:w-8 sm:h-8 bg-pink-400 rounded-full shadow-md animate-bounce-slow flex items-center justify-center text-xs font-bold text-white z-0">
            ⚽
          </div>
        )}

        {/* Cup with pastel theme and hover effects */}
        <button
          type="button"
          disabled={gameState !== 'CHOOSING'}
          onClick={onClick}
          className={`relative z-10 w-20 h-24 sm:w-24 sm:h-28 bg-gradient-to-b from-pink-300 to-purple-300 border-2 border-white ${
            isSelected && isIncorrect
              ? 'border-red-400 bg-red-100'
              : isSelected && !isIncorrect && gameState === 'ROUND_CLEAR'
              ? 'border-green-400 bg-green-100'
              : 'hover:-translate-y-2'
          } rounded-t-full shadow-lg flex flex-col items-center justify-center transform transition-all duration-200 ${cupTransform} ${
            gameState === 'CHOOSING' ? 'cursor-pointer hover:shadow-pink-200/50' : 'cursor-default pointer-events-none'
          }`}
        >
          <span className="text-3xl sm:text-4xl select-none drop-shadow-sm">🥤</span>
        </button>
      </div>
    </div>
  );
}
