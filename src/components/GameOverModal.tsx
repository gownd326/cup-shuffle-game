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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center transform transition-all animate-in fade-in zoom-in duration-200">
        <div className="text-4xl sm:text-5xl mb-3">💥</div>
        <h3 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2">게임 오버!</h3>
        <p className="text-slate-400 text-sm sm:text-base mb-6">
          아쉽게도 틀린 컵을 선택하셨습니다.
        </p>

        <div className="bg-slate-900/80 rounded-xl p-4 mb-6 border border-slate-700/60 space-y-3">
          <div className="flex justify-between items-center text-base sm:text-lg">
            <span className="text-slate-400">이번 게임 점수</span>
            <span className="font-bold text-orange-400">{score}점</span>
          </div>
          <div className="flex justify-between items-center text-base sm:text-lg">
            <span className="text-slate-400">최고 점수</span>
            <span className="font-bold text-yellow-400">{bestScore}점</span>
          </div>
          {isNewBest && (
            <div className="pt-2 border-t border-slate-800 text-green-400 font-bold text-sm sm:text-base animate-pulse">
              🎉 최고 점수 경신!
            </div>
          )}
        </div>

        <button
          onClick={onRestart}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform active:scale-95 transition duration-200 text-lg"
        >
          다시 하기
        </button>
      </div>
    </div>
  );
}
