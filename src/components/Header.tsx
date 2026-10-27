import React from 'react';

interface HeaderProps {
  score: number;
  bestScore: number;
  level: number;
}

export default function Header({ score, bestScore, level }: HeaderProps) {
  return (
    <header className="w-full bg-slate-800 border-b border-slate-700 py-4 px-6 shadow-md">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>🥤</span> 컵 섞기 야바위
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm sm:text-base font-medium">
          <div className="bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
            <span className="text-slate-400">현재 점수:</span> <span className="text-orange-400 font-bold">{score}</span>
          </div>
          <div className="bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
            <span className="text-slate-400">최고 점수:</span> <span className="text-yellow-400 font-bold">{bestScore}</span>
          </div>
          <div className="bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
            <span className="text-slate-400">레벨:</span> <span className="text-blue-400 font-bold">{level}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
