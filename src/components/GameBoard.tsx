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
  // Determine status text based on gameState according to SPEC
  const getStatusText = () => {
    switch (gameState) {
      case 'IDLE':
        return '공의 위치를 눈여겨보세요!';
      case 'PREVIEW':
        return '공의 위치를 눈여겨보세요!';
      case 'MIXING':
        return '컵이 섞이는 중입니다... 눈으로 쫓아가세요!';
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
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center p-6 bg-slate-800 rounded-2xl shadow-xl border border-slate-700">
      <div className="mb-6 text-center min-h-[3rem] flex items-center justify-center">
        <h2 className="text-lg sm:text-xl font-bold text-slate-100 transition-all duration-300">
          {getStatusText()}
        </h2>
      </div>

      <div className="flex justify-center gap-6 my-12 relative h-40 w-full max-w-xl mx-auto overflow-hidden px-4 items-center">
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
        <div className="mt-4">
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
