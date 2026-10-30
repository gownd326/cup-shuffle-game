import React from 'react';
import { CupItemData, GameState } from '@/types/game';

interface CupItemProps {
  cup: CupItemData;
  slotWidth: number;
  cupWidth: number;
  cupHeight: number;
  swapDuration: number;
  gameState: GameState;
  hasBall: boolean;
  isOpen: boolean;
  onClick: (cupId: string) => void;
}

/**
 * CupItem Component
 * - SPEC:
 *   모든 컵 카드는 배경 #FFFFFF, 불투명도 1, 테두리 2px solid #FBCFE8, 모서리 둥글기 16px, 동일한 그림자
 *   카드 위치나 순서에 따라 외관을 바꾸지 않는다.
 *   공은 MIXING과 CHOOSING에서는 DOM에 렌더링하지 않는다.
 *   PREVIEW에서만 정답 컵을 위로 50px 들어 올리고 공을 표시한다.
 *   REVEAL, ROUND_CLEAR, GAME_OVER에서는 결과 확인에 필요한 공을 표시한다.
 */
export default function CupItem({
  cup,
  slotWidth,
  cupWidth,
  cupHeight,
  swapDuration,
  gameState,
  hasBall,
  isOpen,
  onClick,
}: CupItemProps) {
  const isChoosing = gameState === 'CHOOSING';
  const isMixing = gameState === 'MIXING';

  // slot coordinate calculation
  const x = cup.slotIndex * slotWidth;
  const y = cup.yOffset;

  // Lift distance: PREVIEW -> -50px, REVEAL/Open -> -40px
  const liftY = isOpen ? (gameState === 'PREVIEW' ? -50 : -40) : 0;

  // 공 렌더링 여부: MIXING과 CHOOSING에서는 DOM에 렌더링하지 않는다!
  const shouldRenderBall =
    hasBall &&
    isOpen &&
    (gameState === 'PREVIEW' ||
      gameState === 'REVEAL' ||
      gameState === 'ROUND_CLEAR' ||
      gameState === 'GAME_OVER');

  return (
    <div
      data-testid={cup.id}
      style={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: `${cupWidth}px`,
        transform: `translateX(${x}px) translateY(${y}px)`,
        transition: isMixing
          ? `transform ${swapDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
          : 'transform 300ms ease-out',
        zIndex: cup.zIndex,
      }}
      className={`h-[180px] sm:h-[210px] flex flex-col items-center justify-end select-none ${
        isMixing ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      {/* 슬롯 바닥 표시선 */}
      <div className="absolute bottom-2 w-full flex items-center justify-center pointer-events-none z-0">
        <div
          style={{ width: `${Math.max(28, cupWidth - 14)}px` }}
          className="h-2 bg-pink-200/60 rounded-full shadow-inner"
        />
      </div>

      {/* 공: MIXING, CHOOSING 에서는 아예 DOM에 렌더링하지 않음 */}
      {shouldRenderBall && (
        <div
          data-testid="ball"
          aria-label="숨겨진 공"
          className="absolute z-10 bottom-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#EF4444] shadow-inner flex items-center justify-center transition-all duration-200"
        >
          {/* Gloss Highlight */}
          <div className="w-2 h-2 rounded-full bg-white/70 -mt-2 -ml-2" />
        </div>
      )}

      {/* 컵 카드 본체: z-index 20 */}
      <div
        style={{
          transform: `translateY(${liftY}px)`,
          transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          zIndex: 20,
        }}
        className="relative flex flex-col items-center mb-2"
      >
        <button
          type="button"
          data-testid="cup-card-button"
          disabled={!isChoosing}
          onClick={() => onClick(cup.id)}
          aria-label={`${cup.slotIndex + 1}번 컵 선택`}
          style={{
            width: `${cupWidth}px`,
            height: `${cupHeight}px`,
            backgroundColor: '#FFFFFF',
            opacity: 1,
            border: '2px solid #FBCFE8',
            borderRadius: '16px',
          }}
          className="shadow-md flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-300 active:scale-95 disabled:cursor-default"
        >
          <span className="text-2xl sm:text-4xl select-none filter drop-shadow-sm">
            🥤
          </span>
        </button>
      </div>
    </div>
  );
}
