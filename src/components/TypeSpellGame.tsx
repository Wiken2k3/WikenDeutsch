// src/components/TypeSpellGame.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useVocab } from '../context/VocabContext';
import { VocabularyItem } from '../types';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCw,
  ArrowRight,
  Eye,
  ChevronDown,
  Sparkles,
  Zap
} from 'lucide-react';
import { playGermanAudio, playChimeSound } from '../utils/audio';

const SPECIAL_GERMAN_CHARS = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'];

const SET_LABELS: Record<string, { label: string; emoji: string }> = {
  all: { label: 'Tất cả (412 từ)', emoji: '📚' },
  'einheit-1': { label: 'Einheit 1: Deutsch lernen', emoji: '📘' },
  'einheit-2': { label: 'Einheit 2: Familie', emoji: '👨‍👩‍👧‍👦' },
  'einheit-3': { label: 'Einheit 3: Mobilität', emoji: '🚗' },
  'station-1': { label: 'Station 1: Beruf & Magazin', emoji: '💼' }
};

const ROUND_SIZE = 10;

export const TypeSpellGame: React.FC = () => {
  const { vocabulary, sets, activeSetId, setActiveSetId, setActiveTab, completeStudySession, useHeart } = useVocab();

  const [localSetId, setLocalSetId] = useState<string>(activeSetId || 'all');
  const [showFilter, setShowFilter] = useState(false);

  const [queue, setQueue] = useState<VocabularyItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const initGame = (unitId = localSetId) => {
    const pool = unitId === 'all'
      ? vocabulary
      : vocabulary.filter(w => w.unitId === unitId);

    const available = pool.filter(w => w.german && w.vietnamese);
    if (available.length === 0) return;

    const sample = [...available].sort(() => Math.random() - 0.5).slice(0, ROUND_SIZE);
    setQueue(sample);
    setCurrentIdx(0);
    setInputVal('');
    setIsAnswered(false);
    setIsCorrect(false);
    setIsRevealed(false);
    setScore(0);
    setWrongCount(0);
    setIsFinished(false);
  };

  // Sync with global activeSetId on mount
  useEffect(() => {
    const initId = activeSetId || 'all';
    setLocalSetId(initId);
    initGame(initId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSetId]);

  const currentWord = queue[currentIdx];

  // Auto-play audio when card changes
  useEffect(() => {
    if (currentWord && !isAnswered && !isFinished) {
      const timer = setTimeout(() => {
        playGermanAudio(currentWord.german);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentIdx, isFinished]);

  // Auto-focus input
  useEffect(() => {
    if (!isAnswered && !isFinished) {
      inputRef.current?.focus();
    }
  }, [currentIdx, isAnswered, isFinished]);

  const handleCharInsert = (char: string) => {
    if (isAnswered) return;
    setInputVal(prev => prev + char);
    inputRef.current?.focus();
  };

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isAnswered || !currentWord) return;

    const cleanInput = inputVal.trim().toLowerCase();
    const cleanTarget = currentWord.german.trim().toLowerCase();
    // Accept: just the word, or "article word"
    const fullTarget = currentWord.article
      ? `${currentWord.article} ${currentWord.german}`.toLowerCase()
      : cleanTarget;

    const correct = cleanInput === cleanTarget || cleanInput === fullTarget;

    setIsAnswered(true);
    setIsCorrect(correct);
    setIsRevealed(false);

    if (correct) {
      playChimeSound('correct');
      setScore(s => s + 1);
    } else {
      playChimeSound('wrong');
      setWrongCount(w => w + 1);
      useHeart();
    }
  };

  const handleReveal = () => {
    if (isAnswered) return;
    setIsRevealed(true);
    setIsAnswered(true);
    setIsCorrect(false);
    setWrongCount(w => w + 1);
    playChimeSound('wrong');
    useHeart();
  };

  const handleNext = () => {
    if (currentIdx + 1 < queue.length) {
      setCurrentIdx(i => i + 1);
      setInputVal('');
      setIsAnswered(false);
      setIsCorrect(false);
      setIsRevealed(false);
    } else {
      setIsFinished(true);
      const earnedXp = score * 25;
      completeStudySession(earnedXp, score, wrongCount);
    }
  };

  const handleChangeUnit = (unitId: string) => {
    setLocalSetId(unitId);
    setShowFilter(false);
    setActiveSetId(unitId === 'all' ? null : unitId);
    initGame(unitId);
  };

  const allSets = [
    { id: 'all', title: 'Tất cả (412 từ)' },
    ...sets.filter(s => s.category === 'official')
  ];

  // ========== FINISHED SCREEN ==========
  if (isFinished) {
    const accuracy = queue.length > 0 ? Math.round((score / queue.length) * 100) : 0;
    const grade =
      accuracy >= 90 ? { label: 'Xuất sắc! 🌟', color: 'text-emerald-700' }
      : accuracy >= 70 ? { label: 'Tốt lắm! 👍', color: 'text-blue-700' }
      : accuracy >= 50 ? { label: 'Cần luyện thêm 📖', color: 'text-amber-700' }
      : { label: 'Cố lên nhé! 💪', color: 'text-rose-700' };

    return (
      <div className="max-w-md mx-auto py-8 px-4 text-center pb-mobile-nav">
        <div className="w-20 h-20 mx-auto mb-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-center text-4xl">
          ✨
        </div>

        <h2 className="text-xl font-extrabold text-gray-900 mb-1">
          Hoàn thành lượt gõ từ!
        </h2>
        <p className={`text-sm font-bold mb-6 ${grade.color}`}>{grade.label}</p>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-extrabold text-blue-600">{score}/{queue.length}</div>
              <div className="text-[11px] text-gray-500 font-medium mt-0.5">Gõ đúng</div>
            </div>
            <div className="border-x border-gray-100">
              <div className="text-2xl font-extrabold text-emerald-600">{accuracy}%</div>
              <div className="text-[11px] text-gray-500 font-medium mt-0.5">Chính xác</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-amber-600">+{score * 25}</div>
              <div className="text-[11px] text-gray-500 font-medium mt-0.5">XP nhận được</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            onClick={() => initGame(localSetId)}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm min-h-[44px]"
          >
            <RotateCw className="w-4 h-4" />
            Luyện thêm lượt nữa
          </button>

          <button
            onClick={() => setActiveTab('match')}
            className="w-full sm:w-auto px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-xs sm:text-sm min-h-[44px]"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            Game Nối từ
          </button>
        </div>
      </div>
    );
  }

  // ========== LOADING ==========
  if (queue.length === 0) {
    return (
      <div className="text-center py-16 pb-mobile-nav">
        <RotateCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
        <p className="text-gray-500 text-xs sm:text-sm">Đang tải câu đố chính tả...</p>
      </div>
    );
  }

  // ========== GAME SCREEN ==========
  return (
    <div className="max-w-md mx-auto py-4 md:py-6 px-2 sm:px-4 pb-mobile-nav">

      {/* Unit Filter Row */}
      <div className="flex items-center gap-2 mb-4">
        {/* Dropdown */}
        <div className="relative flex-1">
          <button
            onClick={() => setShowFilter(v => !v)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-gray-300 transition-colors shadow-xs min-h-[40px]"
          >
            <span className="flex items-center gap-1.5 truncate">
              <span>{SET_LABELS[localSetId]?.emoji || '📚'}</span>
              <span className="truncate">{SET_LABELS[localSetId]?.label || 'Tất cả'}</span>
            </span>
            <ChevronDown className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
          </button>

          {showFilter && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
              {allSets.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleChangeUnit(s.id)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                    localSetId === s.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <span>{SET_LABELS[s.id]?.emoji || '📁'}</span>
                  <span>{s.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => initGame(localSetId)}
          title="Bộ từ ngẫu nhiên mới"
          className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-xs min-h-[40px]"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all duration-300"
            style={{ width: `${((currentIdx + (isAnswered ? 1 : 0)) / queue.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold text-gray-500 whitespace-nowrap">
          {currentIdx + 1}/{queue.length}
        </span>
        {score > 0 && (
          <span className="text-xs font-bold text-amber-600 whitespace-nowrap">
            +{score * 25} XP
          </span>
        )}
      </div>

      {/* Main Card */}
      <div className="notion-card p-5 sm:p-7 text-center mb-4">

        {/* Audio prompt button */}
        <div className="mb-5">
          <button
            onClick={() => playGermanAudio(currentWord.german)}
            className="w-16 h-16 mx-auto rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-xs transition-all"
            title="Nghe lại phát âm"
          >
            <Volume2 className="w-7 h-7" />
          </button>
          <div className="text-[11px] text-gray-400 mt-2 font-medium">Bấm để nghe phát âm (hoặc tự động khi chuyển thẻ)</div>
        </div>

        {/* Vietnamese Meaning */}
        <div className="mb-5">
          <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">
            Nghĩa tiếng Việt
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
            {currentWord.vietnamese}
          </div>
          {currentWord.article && (
            <div className="text-xs font-semibold mt-1.5">
              <span className={`inline-block px-2 py-0.5 rounded-md border text-xs font-bold ${
                currentWord.article === 'der' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                currentWord.article === 'die' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                currentWord.article === 'das' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                'bg-gray-100 text-gray-700 border-gray-200'
              }`}>
                Mạo từ: {currentWord.article}
              </span>
            </div>
          )}
          {currentWord.type && (
            <div className="text-[11px] text-gray-400 mt-1">
              Từ loại: <span className="font-semibold text-gray-600">{currentWord.type}</span>
            </div>
          )}
        </div>

        {/* Input form */}
        <form onSubmit={handleCheck} className="space-y-3">
          <div>
            <input
              ref={inputRef}
              type="text"
              autoFocus
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              disabled={isAnswered}
              placeholder="Gõ từ tiếng Đức tại đây..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className={`w-full px-4 py-3.5 text-center text-base sm:text-lg font-bold rounded-xl outline-none transition-all border-2 ${
                isAnswered
                  ? isCorrect
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white text-gray-900'
              }`}
            />
          </div>

          {/* German special characters keyboard */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {SPECIAL_GERMAN_CHARS.map((char) => (
              <button
                type="button"
                key={char}
                onClick={() => handleCharInsert(char)}
                disabled={isAnswered}
                className="min-w-[44px] min-h-[44px] px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm border border-gray-200 active:scale-95 transition-all disabled:opacity-40"
              >
                {char}
              </button>
            ))}
          </div>

          {/* Feedback banner */}
          {isAnswered && (
            <div className={`p-3.5 rounded-xl border text-xs sm:text-sm animate-in slide-in-from-bottom-2 duration-200 ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {isCorrect ? (
                <div className="flex items-center justify-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Chính xác tuyệt đối! +25 XP
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-center gap-1.5 font-bold mb-1">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    {isRevealed ? 'Đã hiện đáp án:' : 'Chưa chính xác! Đáp án:'}
                  </div>
                  <div className="font-extrabold text-base text-center text-rose-700">
                    {currentWord.displayGerman || (currentWord.article
                      ? `${currentWord.article} ${currentWord.german}`
                      : currentWord.german)}
                  </div>
                  {currentWord.example && (
                    <div className="mt-2 text-[11px] text-rose-800/70 italic border-t border-rose-100 pt-2">
                      Ví dụ: "{currentWord.example}"
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {!isAnswered ? (
              <>
                <button
                  type="submit"
                  disabled={!inputVal.trim()}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 min-h-[44px] ${
                    inputVal.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  }`}
                >
                  Kiểm tra
                </button>

                <button
                  type="button"
                  onClick={handleReveal}
                  className="px-3 py-3 rounded-xl font-bold text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 transition-colors min-h-[44px] flex items-center gap-1.5 shrink-0"
                  title="Bỏ qua – Hiện đáp án"
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Xem đáp án</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                {currentIdx + 1 < queue.length ? 'Từ tiếp theo' : 'Xem kết quả'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Overlay to close filter dropdown */}
      {showFilter && (
        <div className="fixed inset-0 z-10" onClick={() => setShowFilter(false)} />
      )}
    </div>
  );
};
