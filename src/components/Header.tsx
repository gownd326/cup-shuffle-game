import React from 'react';
import { Trophy, Star, Sparkles } from 'lucide-react';

interface HeaderProps {
  score: number;
  bestScore: number;
  level: number;
}

export default function Header({ score, bestScore, level }: HeaderProps) {
  return (
    <header className="w-full py-6 px-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-pink-500 drop-shadow-sm flex items-center gap-2 text-center">
          <span>✨</span> 알록달록 컵 섞기 대작전 <span>✨</span>
        </h1>
        <div className="bg-white/80 backdrop-blur-md shadow-md rounded-2xl px-5 py-3 flex items-center gap-4 sm:gap-6 text-slate-700 font-semibold border border-pink-100 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span className="text-slate-500">현재 점수:</span>{' '}
            <span className="text-pink-500 font-bold">{score}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-purple-400" />
            <span className="text-slate-500">최고 점수:</span>{' '}
            <span className="text-purple-500 font-bold">{bestScore}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-sky-400" />
            <span className="text-slate-500">현재 레벨:</span>{' '}
            <span className="text-sky-600 font-bold">Lv.{level}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
