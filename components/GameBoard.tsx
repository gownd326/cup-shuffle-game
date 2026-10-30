import React, { useState, useEffect, useRef } from 'react';
import { GameState, CupItemData } from '@/types/game';
import { computeResponsiveDimensions } from '@/constants/levels';
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

/**
 * GameBoard Component
 * - SPEC 3.3 & 4.1:
 *   - 모바일 겹침 방지: slotWidth = Math.min(containerWidth / cupCount, maxSlotWidth)
 *   - 컵 보드 컨테이너: relative w-full max-w-[560px] h-[210px] sm:h-[240px] mx-auto flex justify-center items-end px-2 overflow-hidden
 *   - 컵 레일 너비: cupCount * slotWidth 동적 지정
 */
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
  const [dimensions, setDimensions] = useState({ slotWidth: 100, cupWidth: 80 });

  useEffect(() => {
    const updateDimensions = () => {
      const containerWidth = containerRef.current
        ? containerRef.current.clientWidth
        : typeof window !== 'undefined'
        ? Math.min(window.innerWidth - 32, 560)
        : 560;

      const dim = computeResponsiveDimensions(cups.length || 3, containerWidth);
      setDimensions(dim);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [cups.length]);

  const cupCount = cups.length;
  const { slotWidth, cupWidth } = dimensions;
  // 컵 레일 가로 너비: (cupCount - 1) * slotWidth + cupWidth
  const railTotalWidth = Math.max(0, (cupCount - 1) * slotWidth) + cupWidth;

  const isMixing = gameState === 'MIXING';

  return (
    <div className="w-full max-w-[560px] mx-auto flex flex-col items-center">
      {/* 컵 보드 컨테이너 per SPEC 4.1 */}
      <div
        ref={containerRef}
        style={{ pointerEvents: isMixing ? 'none' : 'auto' }}
        className="relative w-full max-w-[560px] h-[210px] sm:h-[240px] mx-auto flex justify-center items-end px-2 overflow-hidden bg-white/60 backdrop-blur-md rounded-3xl border border-pink-100 shadow-sm"
      >
        {/* 컵 레일 (동적 width 중앙 정렬) */}
        <div
          style={{ width: `${railTotalWidth}px` }}
          className="relative h-full flex items-end justify-start"
        >
          {cups.map((cup) => {
            const hasBall = cup.id === ballCupId;
            const isOpen = revealedCupIds.includes(cup.id);

            return (
              <CupItem
                key={cup.id}
                cup={cup}
                slotWidth={slotWidth}
                cupWidth={cupWidth}
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

      {/* 게임 시작 버튼: IDLE 상태일 때 노출 */}
      {gameState === 'IDLE' && (
        <div className="mt-6 sm:mt-8">
          <button
            type="button"
            onClick={onGameStart}
            className="bg-pink-400 hover:bg-pink-500 active:scale-95 text-white font-bold py-3.5 sm:py-4 px-8 rounded-full shadow-lg shadow-pink-200/50 text-base sm:text-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            게임 시작
          </button>
        </div>
      )}
    </div>
  );
}
