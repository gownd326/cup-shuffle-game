import React from 'react';
import { CupItemData, GameState } from '@/types/game';
import Ball from './Ball';

interface CupItemProps {
  cup: CupItemData;
  slotWidth: number;
  cupWidth: number;
  swapDuration: number;
  gameState: GameState;
  hasBall: boolean;
  isOpen: boolean;
  onClick: (cupId: string) => void;
}

/**
 * CupItem Component
 * - SPEC: 모든 카드가 완전히 동일한 100% 단일 화이트 색상 (bg-white opacity-100 border-2 border-pink-200 rounded-2xl shadow-md)
 * - z-index: 20 (컵 카드가 공 그래픽 z-10보다 항상 위에 위치)
 * - liftY: PREVIEW -> -50px, REVEAL/CHOOSING selection open -> -40px
 * - Ball은 hasBall이고 isOpen일 때만 표시(PREVIEW 및 REVEAL/ROUND_CLEAR/GAME_OVER)
 */
export default function CupItem({
  cup,
  slotWidth,
  cupWidth,
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

  // Lift distance: PREVIEW -> -50px, REVEAL / Open -> -40px per SPEC
  const liftY = isOpen ? (gameState === 'PREVIEW' ? -50 : -40) : 0;

  // Ball visibility rule per SPEC 3.1:
  // MIXING and CHOOSING -> ball must be strictly hidden (no faint visibility)
  const isBallRevealed =
    hasBall &&
    isOpen &&
    (gameState === 'PREVIEW' ||
      gameState === 'REVEAL' ||
      gameState === 'ROUND_CLEAR' ||
      gameState === 'GAME_OVER');

  const cupHeight = Math.round(cupWidth * 1.35); // responsive aspect ratio

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
      {/* Floor Slot Marker */}
      <div className="absolute bottom-2 w-full flex items-center justify-center pointer-events-none z-0">
        <div
          style={{ width: `${Math.max(28, cupWidth - 14)}px` }}
          className="h-2 bg-pink-200/60 rounded-full shadow-inner"
        />
      </div>

      {/* Ball Element at z-10 bottom-4 per SPEC */}
      <Ball isRevealed={isBallRevealed} />

      {/* 컵 카드 본체: z-index 20 */}
      <div
        style={{
          transform: `translateY(${liftY}px)`,
          transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          zIndex: 20,
        }}
        className="relative flex flex-col items-center cursor-pointer mb-2"
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
            backgroundColor: 'rgb(255, 255, 255)',
            opacity: 1,
          }}
          className="bg-white opacity-100 border-2 border-pink-200 rounded-2xl shadow-md flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-300 active:scale-95 disabled:cursor-default"
        >
          <span className="text-2xl sm:text-4xl select-none filter drop-shadow-sm">
            🥤
          </span>
        </button>
      </div>
    </div>
  );
}
