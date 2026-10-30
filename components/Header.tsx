import React from 'react';
import { Trophy, Star, Sparkles } from 'lucide-react';

interface HeaderProps {
  score: number;
  topScore: number;
  level: number;
  onOpenLeaderboard: () => void;
}

export default function Header({
  score,
  topScore,
  level,
  onOpenLeaderboard,
}: HeaderProps) {
  return (
    <header className="w-full py-2 sm:py-4 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* 타이틀: 도전! 컵 섞기 야바위 게임 🥤 (모바일 text-lg font-bold, PC text-2xl font-extrabold) */}
        <h1 className="text-lg sm:text-2xl font-bold sm:font-extrabold text-pink-500 drop-shadow-sm flex items-center gap-2 text-center select-none">
          도전! 컵 섞기 야바위 게임 🥤
        </h1>

        {/* 상태 패널 & 🏆 랭킹 보기 액션 */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <div className="bg-white/95 backdrop-blur-md shadow-md rounded-2xl px-3 sm:px-5 py-2 sm:py-2.5 flex items-center gap-3 sm:gap-5 text-slate-700 font-semibold border border-pink-100 text-xs sm:text-sm">
            <div className="flex items-center gap-1" aria-label={`Score: ${score}`}>
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-slate-500">Score:</span>{' '}
              <span className="text-pink-500 font-bold">{score}</span>
            </div>
            <div className="flex items-center gap-1" aria-label={`Best: ${topScore}`}>
              <Trophy className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-slate-500">Best:</span>{' '}
              <span className="text-purple-500 font-bold">{topScore}</span>
            </div>
            <div className="flex items-center gap-1" aria-label={`Lv.${level}`}>
              <Star className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-500">Lv.</span>{' '}
              <span className="text-sky-600 font-bold">{level}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenLeaderboard}
            aria-label="🏆 랭킹 보기"
            className="bg-purple-400 hover:bg-purple-500 text-white font-bold py-2 sm:py-2.5 px-3 sm:px-4 rounded-2xl shadow-md transition-all transform active:scale-95 flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <span>🏆 랭킹 보기</span>
          </button>
        </div>
      </div>
    </header>
  );
}
