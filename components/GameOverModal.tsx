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
      setErrorMessage('닉네임은 공백을 제외하고 2~8자로 입력해 주세요.');
      return;
    }
    setErrorMessage(null);
    try {
      await onSaveScore(trimmed);
    } catch {
      setErrorMessage('점수를 저장하지 못했어요. 다시 시도해 주세요.');
    }
  };

  const isInputDisabled = isSaving || isScoreSaved;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
    >
      <div className="bg-[#FFFFFF]/95 backdrop-blur-md border border-pink-100 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center transform transition-all">
        {/* 종료 모달 제목: 게임 오버 */}
        <h3
          id="game-over-title"
          className="text-2xl sm:text-3xl font-extrabold text-slate-700 mb-3"
        >
          게임 오버
        </h3>

        {/* 점수 문구: 최종 점수: {점수} */}
        <p className="bg-pink-50/70 border border-pink-100 rounded-2xl py-3 px-4 text-slate-700 font-bold text-sm sm:text-base mb-6">
          최종 점수: <span className="text-pink-500 font-extrabold">{score}</span>
        </p>

        {/* 닉네임 입력란 및 기록 저장 버튼 */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 text-left">
          <label
            htmlFor="nickname-input"
            className="block text-xs font-semibold text-slate-600"
          >
            닉네임 (2~8자)
          </label>
          <div className="flex gap-2">
            <input
              id="nickname-input"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임 (2~8자)"
              maxLength={8}
              disabled={isInputDisabled}
              className={`flex-1 px-4 py-2.5 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none text-slate-700 text-sm transition-colors ${
                isInputDisabled
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-white'
              }`}
            />
            <button
              type="submit"
              disabled={isInputDisabled}
              className={`py-2.5 px-5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                isScoreSaved
                  ? 'bg-[#CBD5E1] text-[#64748B] cursor-not-allowed'
                  : isSaving
                  ? 'bg-pink-300 text-white cursor-wait'
                  : 'bg-[#F472B6] hover:bg-[#EC4899] text-white cursor-pointer active:scale-95'
              }`}
            >
              {isScoreSaved
                ? '저장 완료 ✓'
                : isSaving
                ? '저장 중...'
                : '기록 저장'}
            </button>
          </div>
          {errorMessage && (
            <p className="text-xs text-red-500 font-semibold">{errorMessage}</p>
          )}
        </form>

        {/* 재시작 버튼 문구: 다시 도전하기 */}
        <button
          type="button"
          onClick={onRestart}
          className="w-full bg-[#F472B6] hover:bg-[#EC4899] text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-pink-200/50 text-base sm:text-lg transform active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-300"
        >
          다시 도전하기
        </button>
      </div>
    </div>
  );
}
