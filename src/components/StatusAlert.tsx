import React from 'react';
import { GameState } from '../types/game';

interface StatusAlertProps {
  gameState: GameState;
}

export default function StatusAlert({ gameState }: StatusAlertProps) {
  const getStatusMessage = () => {
    switch (gameState) {
      case 'PREVIEW':
        return '공이 숨겨진 컵을 잘 기억해두세요! 👁️';
      case 'MIXING':
        return '샤샤샥- 섞이는 중! 컵의 움직임을 끝까지 쫓아가세요! 👀';
      case 'CHOOSING':
        return '공이 들어있는 컵을 터치해보세요! 👆';
      case 'REVEAL':
        return '두근두근! 공이 어디에 있을까요? 🔍';
      case 'ROUND_CLEAR':
        return '정답입니다! 다음 라운드로 출발! 🎉';
      case 'GAME_OVER':
        return '아쉽네요! 다시 도전해볼까요? 😢';
      case 'IDLE':
      default:
        return '아래 "게임 시작" 버튼을 눌러 출발하세요! 🎮';
    }
  };

  return (
    <div className="mb-6 flex items-center justify-center">
      <div
        role="status"
        aria-live="polite"
        className="bg-white/90 border-2 border-pink-200 rounded-2xl px-6 py-3 text-pink-600 font-bold shadow-sm transition-all duration-300 text-center text-sm sm:text-base animate-in fade-in"
      >
        {getStatusMessage()}
      </div>
    </div>
  );
}
