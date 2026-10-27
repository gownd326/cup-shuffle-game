import React from 'react';
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

  let cupTransform = 'translate-y-0';
  if (showBallPreview) {
    cupTransform = '-translate-y-6';
  } else if (gameState === 'ROUND_CLEAR' && hasBall) {
    cupTransform = '-translate-y-6';
  } else if (gameState === 'GAME_OVER' && hasBall) {
    cupTransform = '-translate-y-6';
  } else if (gameState === 'GAME_OVER' && isSelected && !hasBall) {
    cupTransform = 'translate-y-2';
  }

  return (
    <div className="flex flex-col items-center relative">
      <div className="absolute -bottom-3 text-xs text-slate-400 font-semibold">
        {visualIdx + 1}
      </div>

      <div className="relative h-28 sm:h-32 flex items-end justify-center w-20 sm:w-24">
        {/* Ball inside or revealed */}
        {(showBallPreview || showResultBall) && (
          <div className="absolute bottom-2 w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-full shadow-lg animate-bounce-slow flex items-center justify-center text-xs font-bold text-white z-0">
            ⚽
          </div>
        )}

        {/* Cup */}
        <button
          type="button"
          disabled={gameState !== 'CHOOSING'}
          onClick={onClick}
          className={`relative z-10 w-20 h-24 sm:w-24 sm:h-28 bg-gradient-to-b from-slate-700 to-slate-800 border-2 ${
            isSelected && isIncorrect
              ? 'border-red-500 bg-red-950/40'
              : isSelected && !isIncorrect && gameState === 'ROUND_CLEAR'
              ? 'border-green-500 bg-green-950/40'
              : 'border-slate-600 hover:border-orange-500'
          } rounded-t-2xl rounded-b-lg shadow-xl flex flex-col items-center justify-center transform transition-all duration-300 ${cupTransform} ${
            gameState === 'CHOOSING' ? 'cursor-pointer hover:-translate-y-2 hover:shadow-orange-500/20' : 'cursor-default'
          }`}
        >
          <span className="text-3xl sm:text-4xl select-none">🥤</span>
        </button>
      </div>
    </div>
  );
}
