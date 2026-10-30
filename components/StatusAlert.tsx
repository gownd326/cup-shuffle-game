import React from 'react';
import { GameState } from '@/types/game';

interface StatusAlertProps {
  gameState: GameState;
}

export default function StatusAlert({ gameState }: StatusAlertProps) {
  const getStatusMessage = () => {
    switch (gameState) {
      case 'IDLE':
        return '게임 시작 버튼을 눌러주세요!';
      case 'PREVIEW':
        return '공의 위치를 잘 기억하세요!';
      case 'MIXING':
        return '컵이 움직이는 곳을 집중해서 보세요!';
      case 'CHOOSING':
        return '공이 숨겨진 컵을 골라보세요!';
      case 'REVEAL':
        return '공이 숨겨진 컵을 확인하는 중... 🔍';
      case 'ROUND_CLEAR':
        return '정답입니다! 다음 라운드로 출발! 🎉';
      case 'GAME_OVER':
      default:
        return '아쉽네요! 게임 오버 🥺';
    }
  };

  return (
    <div className="mb-3 sm:mb-5 flex items-center justify-center w-full px-2">
      <div
        role="status"
        aria-live="polite"
        className="bg-white/95 border border-pink-100 rounded-2xl px-4 sm:px-6 py-2 sm:py-2.5 text-pink-600 font-bold shadow-sm transition-all duration-300 text-center text-xs sm:text-sm"
      >
        {getStatusMessage()}
      </div>
    </div>
  );
}
