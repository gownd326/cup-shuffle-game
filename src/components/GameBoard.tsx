import React from 'react';
import { GameState } from '../types/game';
import CupItem from './CupItem';

interface GameBoardProps {
  gameState: GameState;
  cupCount: number;
  ballIndex: number;
  displayCups: number[];
  selectedCupIndex: number | null;
  isIncorrect: boolean;
  onCupClick: (cupId: number) => void;
  onGameStart: () => void;
}

export default function GameBoard({
  gameState,
  cupCount,
  ballIndex,
  displayCups,
  selectedCupIndex,
  isIncorrect,
  onCupClick,
  onGameStart,
}: GameBoardProps) {
  // Status text matching SPEC
  const getStatusText = () => {
    switch (gameState) {
      case 'IDLE':
        return '공이 숨겨진 컵을 눈여겨보세요!';
      case 'PREVIEW':
        return '공이 숨겨진 컵을 눈여겨보세요!';
      case 'MIXING':
        return '샤샥- 섞이는 중! 눈을 떼지 마세요!';
      case 'CHOOSING':
        return '어느 컵에 들어있을까요? 꾹 눌러보세요!';
      case 'ROUND_CLEAR':
        return '정답입니다! 다음 라운드로...';
      case 'GAME_OVER':
        return '게임 오버!';
      default:
        return '';
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center">
      <div className="mb-6 text-center flex items-center justify-center">
        <div className="bg-white border-2 border-pink-200 rounded-2xl px-6 py-3 text-pink-600 font-bold shadow-sm transition-all duration-300">
          {getStatusText()}
        </div>
      </div>

      <div className="relative h-56 w-full max-w-xl mx-auto flex items-center justify-center overflow-hidden bg-white/50 rounded-3xl border border-pink-100 shadow-inner p-4 gap-6">
        {displayCups.map((cupOriginalId, visualIdx) => {
          const hasBall = cupOriginalId === ballIndex;
          const isSelected = selectedCupIndex === cupOriginalId;

          return (
            <CupItem
              key={cupOriginalId}
              cupId={cupOriginalId}
              visualIdx={visualIdx}
              gameState={gameState}
              hasBall={hasBall}
              isSelected={isSelected}
              isIncorrect={isIncorrect}
              onClick={() => onCupClick(cupOriginalId)}
            />
          );
        })}
      </div>

      {(gameState === 'IDLE' || gameState === 'GAME_OVER') && (
        <div className="mt-8">
          <button
            onClick={onGameStart}
            className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-extrabold py-4 px-8 rounded-full shadow-lg shadow-pink-300/50 text-lg transform active:scale-95 transition-all cursor-pointer"
          >
            {gameState === 'IDLE' ? '게임 시작' : '다시 하기'}
          </button>
        </div>
      )}
    </div>
  );
}
