import React from 'react';

interface HeaderProps {
  score: number;
  bestScore: number;
  level: number;
}

export default function Header({ score, bestScore, level }: HeaderProps) {
  return (
    <header className="w-full py-6 px-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-pink-500 drop-shadow-sm flex items-center gap-2">
          ✨ 알록달록 컵 섞기 대작전 ✨
        </h1>
        <div className="bg-white/80 backdrop-blur-md shadow-md rounded-2xl p-4 flex gap-6 text-slate-700 font-semibold border border-pink-100 text-sm sm:text-base">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">현재 점수:</span> <span className="text-pink-500 font-bold">{score}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">최고 점수:</span> <span className="text-purple-500 font-bold">{bestScore}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">레벨:</span> <span className="text-sky-600 font-bold">{level}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
