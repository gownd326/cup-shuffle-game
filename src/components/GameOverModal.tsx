import React, { useState } from 'react';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  level: number;
  isScoreSaved: boolean;
  isSaving: boolean;
  onSaveScore: (nickname: string) => Promise<void>;
  onRestart: () => void;
}

export default function GameOverModal({
  isOpen,
  score,
  level,
  isScoreSaved,
  isSaving,
  onSaveScore,
  onRestart,
}: GameOverModalProps) {
  const [nickname, setNickname] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isScoreSaved || isSaving) return;

    const trimmed = nickname.trim();
    if (trimmed.length < 2 || trimmed.length > 8) {
      setErrorMessage('닉네임은 2~8자 사이여야 합니다.');
      return;
    }
    setErrorMessage(null);
    try {
      await onSaveScore(trimmed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '점수 등록에 실패했습니다.';
      setErrorMessage(msg);
    }
  };

  const isInputDisabled = isSaving || isScoreSaved;

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
          아쉽네요! 점수를 등록하고 전 세계 랭킹을 확인해보세요!
        </p>

        {/* 상단: 최종 획득 점수 및 도달 레벨 */}
        <div className="bg-pink-50/70 rounded-2xl p-4 mb-6 border border-pink-100 space-y-3">
          <div className="flex justify-between items-center text-sm sm:text-base">
            <span className="text-slate-500 font-medium">도달 레벨</span>
            <span className="font-bold text-sky-600">Lv.{level}</span>
          </div>
          <div className="flex justify-between items-center text-base sm:text-lg">
            <span className="text-slate-500 font-medium">최종 점수</span>
            <span className="font-bold text-pink-500">{score}점</span>
          </div>
        </div>

        {/* 닉네임 등록 폼 */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 text-left">
          <label htmlFor="nickname-input" className="block text-xs font-semibold text-slate-600">
            플레이어 닉네임 등록
          </label>
          <div className="flex gap-2">
            <input
              id="nickname-input"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임 입력 (2~8자)"
              maxLength={8}
              disabled={isInputDisabled}
              className={`flex-1 px-4 py-2.5 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none text-slate-700 text-sm transition-colors ${
                isScoreSaved ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white'
              }`}
            />
            {isScoreSaved ? (
              <button
                type="button"
                disabled={true}
                className="bg-slate-300 text-slate-500 font-bold py-2.5 px-5 rounded-xl cursor-not-allowed text-sm whitespace-nowrap"
              >
                저장 완료 ✓
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSaving}
                className="bg-pink-400 hover:bg-pink-500 text-white font-bold py-2.5 px-5 rounded-xl cursor-pointer text-sm whitespace-nowrap transition-all disabled:opacity-50"
              >
                {isSaving ? '저장 중...' : '기록 저장'}
              </button>
            )}
          </div>
          {errorMessage && (
            <p className="text-xs text-red-500 font-semibold">{errorMessage}</p>
          )}
        </form>

        {/* 하단 액션: 다시 도전하기 */}
        <button
          type="button"
          onClick={onRestart}
          className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-extrabold py-3.5 px-8 rounded-full shadow-lg shadow-pink-300/50 text-base sm:text-lg transform active:scale-95 transition-all cursor-pointer"
        >
          다시 도전하기
        </button>
      </div>
    </div>
  );
}
