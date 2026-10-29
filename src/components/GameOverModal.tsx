import React from 'react';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  level: number;
  bestScore: number;
  onRestart: () => void;
}

export default function GameOverModal({
  isOpen,
  score,
  level,
  bestScore,
  onRestart,
}: GameOverModalProps) {
  if (!isOpen) return null;

  const isNewBest = score >= bestScore && score > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white/95 border-2 border-pink-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center transform transition-all">
        <div className="text-4xl sm:text-5xl mb-3">😢</div>
        <h3
          id="game-over-title"
          className="text-2xl sm:text-3xl font-extrabold text-slate-700 mb-2"
        >
          게임 오버!
        </h3>
        <p className="text-slate-500 text-sm sm:text-base mb-6">
          아쉽네요! 다시 도전해볼까요?
        </p>

        <div className="bg-pink-50/70 rounded-2xl p-4 mb-6 border border-pink-100 space-y-3">
          <div className="flex justify-between items-center text-sm sm:text-base">
            <span className="text-slate-500 font-medium">도달 레벨</span>
            <span className="font-bold text-sky-600">Lv.{level}</span>
          </div>
          <div className="flex justify-between items-center text-base sm:text-lg">
            <span className="text-slate-500 font-medium">최종 점수</span>
            <span className="font-bold text-pink-500">{score}점</span>
          </div>
          <div className="flex justify-between items-center text-base sm:text-lg">
            <span className="text-slate-500 font-medium">최고 점수</span>
            <span className="font-bold text-purple-500">{bestScore}점</span>
          </div>
          {isNewBest && (
            <div className="pt-2 border-t border-pink-200 text-pink-600 font-bold text-sm sm:text-base animate-pulse">
              🎉 최고 점수 갱신!
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-extrabold py-4 px-8 rounded-full shadow-lg shadow-pink-300/50 text-lg transform active:scale-95 transition-all cursor-pointer"
        >
          다시 하기
        </button>
      </div>
    </div>
  );
}
