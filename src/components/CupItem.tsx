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

  // Transform coordinates per SPEC:
  // slotIndex * slotWidth, yOffset (-30px, +30px, 0px)
  const x = cup.slotIndex * slotWidth;
  const y = cup.yOffset;

  return (
    <div
      data-testid={cup.id}
      style={{
        position: 'absolute',
        left: 0,
        transform: `translate3d(${x}px, ${y}px, 0)`,
        transition: isMixing
          ? `transform ${swapDuration}ms cubic-bezier(0.25, 1, 0.5, 1)`
          : 'transform 300ms ease-out',
        zIndex: cup.zIndex,
      }}
      className={`w-20 sm:w-24 h-40 flex flex-col items-center justify-end select-none ${
        isMixing ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      {/* Floor Slot & Golden Ball */}
      <div className="relative w-full h-10 flex items-center justify-center">
        {/* Slot marker dot */}
        <div className="w-12 h-2.5 bg-pink-100 rounded-full shadow-inner" />

        {/* Golden Ball sitting on the floor */}
        {hasBall && (
          <div
            data-testid="golden-ball"
            aria-label="황금 구슬"
            className="absolute -top-1 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xl sm:text-2xl filter drop-shadow animate-bounce-slow"
          >
            🟡
          </div>
        )}
      </div>

      {/* Cup Graphic (lifts up by 45px when isOpen) */}
      <div
        style={{
          transform: isOpen ? 'translateY(-45px)' : 'translateY(0px)',
          transition: 'transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        className="absolute bottom-3 flex flex-col items-center"
      >
        <button
          type="button"
          disabled={!isChoosing}
          onClick={() => onClick(cup.id)}
          aria-label={`${cup.slotIndex + 1}번 컵 선택`}
          className={`w-20 h-28 sm:w-22 sm:h-30 rounded-t-3xl shadow-lg border-2 ${
            cup.color.border
          } bg-gradient-to-b ${cup.color.gradient} ${
            cup.color.shadow
          } flex flex-col items-center justify-center relative transform transition-transform duration-200 ${
            isChoosing
              ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl active:scale-95'
              : 'cursor-default'
          }`}
        >
          {/* Pastel Cup Rim and Pattern */}
          <div className="w-14 h-2 bg-white/70 rounded-full mb-3" />
          <span className="text-3xl sm:text-4xl drop-shadow-sm select-none">🥤</span>
          <span className="text-[10px] sm:text-xs font-bold text-white/90 mt-1">
            {cup.slotIndex + 1}
          </span>
        </button>
      </div>
    </div>
  );
}
