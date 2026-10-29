import React, { useState, useEffect, useRef } from 'react';
import { GameState, CupItemData } from '../types/game';
import CupItem from './CupItem';

interface GameBoardProps {
  gameState: GameState;
  cups: CupItemData[];
  ballCupId: string;
  revealedCupIds: string[];
  swapDuration: number;
  onCupClick: (cupId: string) => void;
  onGameStart: () => void;
}

export default function GameBoard({
  gameState,
  cups,
  ballCupId,
  revealedCupIds,
  swapDuration,
  onCupClick,
  onGameStart,
}: GameBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [slotWidth, setSlotWidth] = useState<number>(100);

  // Responsive slot width calculation:
  // slot spacing between 80px (mobile) ~ 110px (desktop)
  useEffect(() => {
    const updateSlotWidth = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const count = Math.max(cups.length, 3);
      const cupWidth = window.innerWidth < 640 ? 80 : 96;

      // Calculate slotWidth to distribute cups evenly inside container
      const availableWidth = containerWidth - 48; // padding
      const computedSlot = Math.floor((availableWidth - cupWidth) / (count - 1));
      const clamped = Math.max(76, Math.min(110, computedSlot));
      setSlotWidth(clamped);
    };

    updateSlotWidth();
    window.addEventListener('resize', updateSlotWidth);
    return () => window.removeEventListener('resize', updateSlotWidth);
  }, [cups.length]);

  const cupCount = cups.length;
  const cupWidth = typeof window !== 'undefined' && window.innerWidth < 640 ? 80 : 96;
  const trackTotalWidth = (cupCount - 1) * slotWidth + cupWidth;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center">
      {/* Stage Container */}
      <div
        ref={containerRef}
        className="relative h-64 w-full flex items-center justify-center bg-white/60 rounded-3xl border-2 border-pink-100 p-6 shadow-inner overflow-hidden"
      >
        {/* Track Area where absolute cups slide */}
        <div
          style={{ width: `${trackTotalWidth}px` }}
          className="relative h-44 flex items-center"
        >
          {cups.map((cup) => {
            const hasBall = cup.id === ballCupId;
            const isOpen = revealedCupIds.includes(cup.id);

            return (
              <CupItem
                key={cup.id}
                cup={cup}
                slotWidth={slotWidth}
                swapDuration={swapDuration}
                gameState={gameState}
                hasBall={hasBall}
                isOpen={isOpen}
                onClick={onCupClick}
              />
            );
          })}
        </div>
      </div>

      {/* Action Button: Visible during IDLE or GAME_OVER */}
      {(gameState === 'IDLE' || gameState === 'GAME_OVER') && (
        <div className="mt-8">
          <button
            type="button"
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
