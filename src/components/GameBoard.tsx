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
  // Determine status text based on gameState
  const getStatusText = () => {
    switch (gameState) {
      case 'IDLE':
        return '시작 버튼을 눌러 게임을 시작하세요!';
      case 'PREVIEW':
        return '공의 위치를 기억하세요!';
      case 'MIXING':
        return '섞는 중...';
      case 'CHOOSING':
        return '공이 숨겨진 컵을 선택하세요!';
      case 'ROUND_CLEAR':
        return '정답입니다! 다음 레벨로...';
      case 'GAME_OVER':
        return '게임 오버!';
      default:
        return '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center p-6 bg-slate-800 rounded-2xl shadow-xl border border-slate-700">
      <div className="mb-8 text-center min-h-[3rem] flex items-center justify-center">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 transition-all duration-300">
          {getStatusText()}
        </h2>
      </div>

      <div className="flex justify-center gap-4 my-8 relative h-32 items-center w-full overflow-hidden px-4">
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
        <div className="mt-6">
          <button
            onClick={onGameStart}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform active:scale-95 transition duration-200 text-lg cursor-pointer"
          >
            {gameState === 'IDLE' ? '게임 시작' : '다시 하기'}
          </button>
        </div>
      )}
    </div>
  );
}
