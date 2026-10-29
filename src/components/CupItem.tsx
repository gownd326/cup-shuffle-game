import React from 'react';
import { CupItemData, GameState } from '../types/game';

interface CupItemProps {
  cup: CupItemData;
  slotWidth: number;
  swapDuration: number;
  gameState: GameState;
  hasBall: boolean;
  isOpen: boolean;
  onClick: (cupId: string) => void;
}

export default function CupItem({
  cup,
  slotWidth,
  swapDuration,
  gameState,
  hasBall,
  isOpen,
  onClick,
}: CupItemProps) {
  const isChoosing = gameState === 'CHOOSING';
  const isMixing = gameState === 'MIXING';

  // slotIndex * slotWidth, yOffset (-30px, +30px, 0px)
  const x = cup.slotIndex * slotWidth;
  const y = cup.yOffset;

  // translateY: PREVIEW -> -50px, REVEAL/CHOOSING selection open -> -40px per SPEC
  const liftY = isOpen ? (gameState === 'PREVIEW' ? -50 : -40) : 0;

  return (
    <div
      data-testid={cup.id}
      style={{
        position: 'absolute',
        left: 0,
        transform: `translateX(${x}px) translateY(${y}px)`,
        transition: isMixing
          ? `transform ${swapDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
          : 'transform 300ms ease-out',
        zIndex: cup.zIndex,
      }}
      className={`w-20 sm:w-24 h-48 flex flex-col items-center justify-end select-none ${
        isMixing ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      {/* Floor Slot & Red Ball (🔴 per SPEC) */}
      <div className="relative w-full h-10 flex items-center justify-center">
        {/* Floor Slot marker */}
        <div className="w-12 h-2.5 bg-pink-100 rounded-full shadow-inner" />

        {/* Ball: 붉은 구슬 (🔴), 정답 컵 아래 위치하며 컵이 들렸을 때만 시각적으로 노출 */}
        {hasBall && (
          <div
            data-testid="ball"
            aria-label="숨겨진 공"
            className="absolute -top-1 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xl sm:text-2xl filter drop-shadow animate-bounce-slow"
          >
            🔴
          </div>
        )}
      </div>

      {/* Cup Card Graphic */}
      <div
        style={{
          transform: `translateY(${liftY}px)`,
          transition: 'transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        className="absolute bottom-2 flex flex-col items-center"
      >
        <button
          type="button"
          data-testid="cup-card-button"
          disabled={!isChoosing}
          onClick={() => onClick(cup.id)}
          aria-label={`${cup.slotIndex + 1}번 컵 선택`}
          className="focus:outline-none focus:ring-2 focus:ring-pink-300 rounded-2xl"
        >
          <div className="w-20 h-30 rounded-2xl bg-white/95 border-2 border-pink-200 shadow-md flex items-center justify-center text-4xl cursor-pointer hover:shadow-lg transition-shadow">
            <span className="select-none">🥤</span>
          </div>
        </button>
      </div>
    </div>
  );
}
