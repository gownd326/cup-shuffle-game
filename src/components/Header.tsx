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
    <header className="w-full py-6 px-4">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-pink-500 drop-shadow-sm flex items-center gap-2 text-center">
          도전! 컵 섞기 야바위 게임 🥤
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Dashboard info: [현재 점수: 0] / [전체 1위 점수: 2500] / [현재 레벨: Lv.1] */}
          <div className="bg-white/80 backdrop-blur-md shadow-md rounded-2xl px-5 py-3 flex items-center gap-4 sm:gap-6 text-slate-700 font-semibold border border-pink-100 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-slate-500">현재 점수:</span>{' '}
              <span className="text-pink-500 font-bold">{score}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-purple-400" />
              <span className="text-slate-500">전체 1위 점수:</span>{' '}
              <span className="text-purple-500 font-bold">{topScore}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-sky-400" />
              <span className="text-slate-500">현재 레벨:</span>{' '}
              <span className="text-sky-600 font-bold">Lv.{level}</span>
            </div>
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={onOpenLeaderboard}
            aria-label="🏆 랭킹 보기"
            className="bg-purple-400 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-2xl shadow-md transition-all transform active:scale-95 flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer whitespace-nowrap"
          >
            <span>🏆 랭킹 보기</span>
          </button>
        </div>
      </div>
    </header>
  );
}
