import React from 'react';

interface BallProps {
  isRevealed: boolean;
}

/**
 * Ball Component (공)
 * - SPEC 3.1 & 4.1:
 *   - PREVIEW: 정답 컵이 위로 들리며 1.5초간 노출 (isRevealed = true)
 *   - MIXING & CHOOSING: 완전히 숨김 처리 (opacity-0 pointer-events-none hidden)
 *   - REVEAL / ROUND_CLEAR / GAME_OVER: 열리는 순간 visibility: visible
 * - SPEC 4.1 & 6.1:
 *   - z-10 bottom-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-500 shadow-inner flex items-center justify-center
 *   - 강렬한 붉은색 bg-red-500 (#EF4444) 및 광택 하이라이트
 */
export default function Ball({ isRevealed }: BallProps) {
  if (!isRevealed) {
    return (
      <div
        data-testid="ball"
        aria-hidden="true"
        className="opacity-0 pointer-events-none hidden"
      />
    );
  }

  return (
    <div
      data-testid="ball"
      aria-label="숨겨진 공"
      className="absolute z-10 bottom-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-500 shadow-inner flex items-center justify-center transition-all duration-200"
    >
      {/* Gloss Highlight */}
      <div className="w-2 h-2 rounded-full bg-white/70 -mt-2 -ml-2" />
    </div>
  );
}
