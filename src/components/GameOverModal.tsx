import React from 'react';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  bestScore: number;
  onRestart: () => void;
}

export default function GameOverModal({
  isOpen,
  score,
  bestScore,
  onRestart,
}: GameOverModalProps) {
  if (!isOpen) return null;

  const isNewBest = score >= bestScore && score > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white/95 border border-pink-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center transform transition-all animate-in fade-in zoom-in duration-200">
        <div className="text-4xl sm:text-5xl mb-3">💥</div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-700 mb-2">게임 오버!</h3>
        <p className="text-slate-500 text-sm sm:text-base mb-6">
          아쉽게도 틀린 컵을 선택하셨습니다.
        </p>

        <div className="bg-pink-50/70 rounded-2xl p-4 mb-6 border border-pink-100 space-y-3">
          <div className="flex justify-between items-center text-base sm:text-lg">
            <span className="text-slate-500 font-medium">이번 게임 점수</span>
            <span className="font-bold text-pink-500">{score}점</span>
          </div>
          <div className="flex justify-between items-center text-base sm:text-lg">
            <span className="text-slate-500 font-medium">최고 점수</span>
            <span className="font-bold text-purple-500">{bestScore}점</span>
          </div>
          {isNewBest && (
            <div className="pt-2 border-t border-pink-200 text-pink-600 font-bold text-sm sm:text-base animate-pulse">
              🎉 최고 점수 경신!
            </div>
          )}
        </div>

        <button
          onClick={onRestart}
          className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-extrabold py-4 px-8 rounded-full shadow-lg shadow-pink-300/50 text-lg transform active:scale-95 transition-all cursor-pointer"
        >
          다시 하기
        </button>
      </div>
    </div>
  );
}
