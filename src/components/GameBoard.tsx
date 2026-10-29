import React, { useState, useEffect, useRef } from 'react';
import { GameState, CupItemData } from '../types/game';
import { getLevelConfig } from '../constants/levels';
import CupItem from './CupItem';

interface GameBoardProps {
  level: number;
  gameState: GameState;
  cups: CupItemData[];
  ballCupId: string;
  revealedCupIds: string[];
  swapDuration: number;
  onCupClick: (cupId: string) => void;
  onGameStart: () => void;
}

export default function GameBoard({
  level,
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

  // Responsive slot width calculation per SPEC Table
  useEffect(() => {
    const updateSlotWidth = () => {
      const isMobile = window.innerWidth < 640;
      const config = getLevelConfig(level);
      setSlotWidth(isMobile ? config.slotWidthMobile : config.slotWidthDesktop);
    };

    updateSlotWidth();
    window.addEventListener('resize', updateSlotWidth);
    return () => window.removeEventListener('resize', updateSlotWidth);
  }, [level]);

  const cupCount = cups.length;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const cupCardWidth = isMobile ? 80 : 96;
  const trackTotalWidth = Math.max(0, (cupCount - 1) * slotWidth) + cupCardWidth;

  const isMixing = gameState === 'MIXING';

  return (
    <div className="w-full max-w-[600px] mx-auto p-2 sm:p-4 flex flex-col items-center justify-center">
      {/* Stage Container: 높이 220px 영역 확보 per SPEC 4.1 */}
      <div
        ref={containerRef}
        style={{ pointerEvents: isMixing ? 'none' : 'auto' }}
        className="relative h-[220px] w-full flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-pink-100 p-4 shadow-inner overflow-hidden"
      >
        {/* Track Area where absolute cups slide */}
        <div
          style={{ width: `${trackTotalWidth}px` }}
          className="relative h-48 flex items-center justify-start"
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

      {/* Action Button: Visible during IDLE */}
      {gameState === 'IDLE' && (
        <div className="mt-6 sm:mt-8">
          <button
            type="button"
            onClick={onGameStart}
            className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-extrabold py-3.5 sm:py-4 px-8 rounded-full shadow-lg shadow-pink-300/50 text-base sm:text-lg transform active:scale-95 transition-all cursor-pointer"
          >
            게임 시작
          </button>
        </div>
      )}
    </div>
  );
}
