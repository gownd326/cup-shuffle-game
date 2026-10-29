import React from 'react';
import { ScoreRecord } from '../types/game';
import { RefreshCw, X } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  scores: ScoreRecord[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  highlightedRecordId?: string | null;
}

export default function LeaderboardModal({
  isOpen,
  onClose,
  scores,
  isLoading,
  error,
  onRetry,
  highlightedRecordId,
}: LeaderboardModalProps) {
  if (!isOpen) return null;

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return (
      <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-extrabold text-xs flex items-center justify-center">
        {rank}
      </span>
    );
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '-';
      const m = d.getMonth() + 1;
      const day = d.getDate();
      const h = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${m}/${day} ${h}:${min}`;
    } catch {
      return '-';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaderboard-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white/95 border-2 border-pink-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl transform transition-all relative">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 헤더: 🏆 실시간 명예의 전당 TOP 5 */}
        <div className="text-center mb-6">
          <h2
            id="leaderboard-title"
            className="text-2xl sm:text-3xl font-extrabold text-pink-500 flex items-center justify-center gap-2"
          >
            🏆 실시간 명예의 전당 TOP 5
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            전 세계 플레이어들의 최고 점수 기록입니다!
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">실시간 랭킹을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center space-y-4">
            <p className="text-pink-600 font-medium text-sm">
              {error}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 bg-pink-400 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>다시 시도</span>
            </button>
          </div>
        ) : scores.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            아직 등록된 랭킹 기록이 없습니다. 첫 번째 챔피언에 도전해보세요!
          </div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {scores.slice(0, 5).map((record, index) => {
              const rank = index + 1;
              const isHighlight =
                highlightedRecordId && record.id === highlightedRecordId;

              return (
                <div
                  key={record.id}
                  data-testid={`ranking-row-${rank}`}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isHighlight
                      ? 'bg-pink-100/80 border-pink-400 shadow-md ring-2 ring-pink-300'
                      : 'bg-white/80 border-pink-100 hover:border-pink-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 flex items-center justify-center">
                      {getRankBadge(rank)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 text-sm sm:text-base">
                          {record.nickname}
                        </span>
                        {isHighlight && (
                          <span className="bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            MY
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {formatDate(record.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-pink-500 text-sm sm:text-base">
                      {record.score.toLocaleString()}점
                    </div>
                    <div className="text-[11px] text-sky-600 font-semibold">
                      Lv.{record.level}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-sm transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
