// src/components/QuizView.tsx
import React, { useState, useEffect } from 'react';
import { useVocab } from '../context/VocabContext';
import { QuizQuestion } from '../types';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCw,
  Heart,
  ArrowRight,
  Sparkles,
  Gamepad2,
  ChevronDown
} from 'lucide-react';
import { playGermanAudio, playChimeSound } from '../utils/audio';

const SET_LABELS: Record<string, { label: string; emoji: string }> = {
  all: { label: 'Tất cả (412 từ)', emoji: '📚' },
  'einheit-1': { label: 'Einheit 1: Deutsch lernen', emoji: '📘' },
  'einheit-2': { label: 'Einheit 2: Familie', emoji: '👨‍👩‍👧‍👦' },
  'einheit-3': { label: 'Einheit 3: Mobilität', emoji: '🚗' },
  'station-1': { label: 'Station 1: Beruf & Magazin', emoji: '💼' }
};

const QUIZ_SIZE = 10;

export const QuizView: React.FC = () => {
  const {
    vocabulary,
    sets,
    activeSetId,
    setActiveSetId,
    setActiveTab,
    completeStudySession,
    userProfile,
    useHeart
  } = useVocab();

  const [localSetId, setLocalSetId] = useState<string>(activeSetId || 'all');
  const [showFilter, setShowFilter] = useState(false);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const generateQuestions = (unitId = localSetId) => {
    const pool = unitId === 'all'
      ? vocabulary
      : vocabulary.filter(w => w.unitId === unitId);

    if (pool.length < 4) return;

    const shuffledVocab = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffledVocab.slice(0, QUIZ_SIZE);

    const generated: QuizQuestion[] = selected.map((item, idx) => {
      const isNoun = !!item.article && ['der', 'die', 'das'].includes(item.article);
      const roll = idx % 3;
      const questionType = isNoun && roll === 1
        ? 'article'
        : roll === 0
          ? 'meaning'
          : 'german';

      if (questionType === 'article') {
        return {
          id: `q-${idx}`,
          type: 'multiple-choice-article',
          prompt: `Chọn mạo từ đúng cho danh từ:`,
          word: item,
          options: ['der', 'die', 'das'],
          correctAnswer: item.article!,
          explanation: `"${item.german}" mang mạo từ "${item.article}". Nghĩa: ${item.vietnamese}.`
        };
      } else if (questionType === 'meaning') {
        // Pick 3 distractors from all vocabulary (not just pool)
        const distractors = vocabulary
          .filter(v => v.id !== item.id && v.vietnamese !== item.vietnamese)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(v => v.vietnamese);

        const options = [...distractors, item.vietnamese].sort(() => Math.random() - 0.5);

        return {
          id: `q-${idx}`,
          type: 'multiple-choice-meaning',
          prompt: `Nghĩa tiếng Việt của từ tiếng Đức này là gì?`,
          word: item,
          options,
          correctAnswer: item.vietnamese,
          explanation: `"${item.displayGerman || item.german}" có nghĩa là "${item.vietnamese}". Ví dụ: ${item.example || '—'}`
        };
      } else {
        const distractors = vocabulary
          .filter(v => v.id !== item.id && v.german !== item.german)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(v => v.german);

        const options = [...distractors, item.german].sort(() => Math.random() - 0.5);

        return {
          id: `q-${idx}`,
          type: 'fill-blank',
          prompt: `Từ tiếng Đức nào tương ứng với nghĩa sau?`,
          word: item,
          options,
          correctAnswer: item.german,
          explanation: `"${item.displayGerman || item.german}" mang nghĩa "${item.vietnamese}".`
        };
      }
    });

    setQuestions(generated);
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setScore(0);
    setWrongCount(0);
    setIsFinished(false);
  };

  // Sync with global activeSetId on mount
  useEffect(() => {
    const initId = activeSetId || 'all';
    setLocalSetId(initId);
    generateQuestions(initId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSetId]);

  const currentQ = questions[currentIdx];

  // Auto-play audio when question changes
  useEffect(() => {
    if (currentQ && !isAnswered) {
      const timer = setTimeout(() => {
        playGermanAudio(currentQ.word.german);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [currentIdx]);

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || isAnswered || !currentQ) return;

    const correct = selectedOption === currentQ.correctAnswer;
    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      playChimeSound('correct');
      setScore(prev => prev + 1);
    } else {
      playChimeSound('wrong');
      setWrongCount(w => w + 1);
      useHeart();
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      setIsFinished(true);
      const earnedXp = score * 15;
      completeStudySession(earnedXp, score, wrongCount);
    }
  };

  const handleChangeUnit = (unitId: string) => {
    setLocalSetId(unitId);
    setShowFilter(false);
    setActiveSetId(unitId === 'all' ? null : unitId);
    generateQuestions(unitId);
  };

  const allSets = [
    { id: 'all', title: 'Tất cả (412 từ)' },
    ...sets.filter(s => s.category === 'official')
  ];

  // ========== LOADING ==========
  if (questions.length === 0) {
    return (
      <div className="text-center py-16 pb-mobile-nav">
        <RotateCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-xs sm:text-sm text-gray-500">Đang chuẩn bị câu hỏi trắc nghiệm...</p>
      </div>
    );
  }

  // ========== FINISHED SCREEN ==========
  if (isFinished) {
    const accuracy = Math.round((score / questions.length) * 100);
    const grade =
      accuracy >= 90 ? { label: 'Xuất sắc! Từ vựng của bạn rất vững! 🌟', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' }
      : accuracy >= 70 ? { label: 'Tốt lắm! Tiếp tục ôn luyện nhé 👍', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' }
      : accuracy >= 50 ? { label: 'Cần ôn thêm một số từ khó 📖', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' }
      : { label: 'Cùng thử lại nào! Luyện thêm sẽ tốt hơn 💪', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' };

    return (
      <div className="max-w-xl mx-auto py-8 px-4 text-center pb-mobile-nav">
        <div className="w-20 h-20 mx-auto mb-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center text-4xl">
          🎉
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-1">
          Hoàn thành bài kiểm tra!
        </h2>

        {/* Grade banner */}
        <div className={`inline-block px-4 py-2 rounded-xl border text-xs font-bold mb-6 ${grade.bg} ${grade.color}`}>
          {grade.label}
        </div>

        {/* Score stats */}
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-blue-600">
                {score}/{questions.length}
              </div>
              <div className="text-[11px] text-gray-500 font-medium mt-0.5">Câu đúng</div>
            </div>

            <div className="border-x border-gray-100">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                {accuracy}%
              </div>
              <div className="text-[11px] text-gray-500 font-medium mt-0.5">Độ chính xác</div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black text-amber-600">
                +{score * 15}
              </div>
              <div className="text-[11px] text-gray-500 font-medium mt-0.5">XP nhận được</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            onClick={() => generateQuestions(localSetId)}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px] text-sm"
          >
            <RotateCw className="w-4 h-4" />
            Làm lượt mới
          </button>

          <button
            onClick={() => setActiveTab('match')}
            className="px-5 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl border border-purple-200 transition-all flex items-center justify-center gap-2 min-h-[44px] text-sm"
          >
            <Gamepad2 className="w-4 h-4" />
            Thử Game Nối từ
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl active:scale-95 transition-all min-h-[44px] text-sm"
          >
            Về Trang chủ
          </button>
        </div>
      </div>
    );
  }

  // ========== QUIZ SCREEN ==========
  return (
    <div className="max-w-xl mx-auto py-4 md:py-6 px-2 sm:px-4 pb-mobile-nav">

      {/* Unit Filter Bar */}
      <div className="flex items-center gap-2 mb-4">
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
          onClick={() => generateQuestions(localSetId)}
          title="Bộ câu hỏi ngẫu nhiên mới"
          className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-xs min-h-[40px]"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Progress + Hearts bar */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentIdx + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-xs font-bold text-gray-500 whitespace-nowrap">
            {currentIdx + 1}/{questions.length}
          </span>

          <div className="flex items-center gap-1 text-rose-700 font-bold text-xs bg-rose-50 px-2 py-1 rounded-full border border-rose-200">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>{userProfile.hearts}</span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="notion-card p-5 sm:p-7 mb-5">

        {/* Question type badge */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            currentQ.type === 'multiple-choice-article'
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : currentQ.type === 'multiple-choice-meaning'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {currentQ.type === 'multiple-choice-article'
              ? '📝 Chọn mạo từ'
              : currentQ.type === 'multiple-choice-meaning'
              ? '🔍 Tìm nghĩa'
              : '✍️ Tìm từ tiếng Đức'}
          </span>

          <button
            onClick={() => playGermanAudio(currentQ.word.german)}
            className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Nghe phát âm"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* The word being asked about (always shown as context) */}
        <div className="text-center mb-5 p-4 rounded-xl bg-gray-50/80 border border-gray-100">
          <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">
            Từ tiếng Đức
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">
            {currentQ.type === 'fill-blank'
              ? currentQ.word.vietnamese
              : currentQ.word.displayGerman || (currentQ.word.article
                  ? `${currentQ.word.article} ${currentQ.word.german}`
                  : currentQ.word.german)}
          </div>
          {currentQ.type !== 'fill-blank' && currentQ.word.type && (
            <div className="text-[11px] text-gray-400 font-medium">{currentQ.word.type}</div>
          )}
        </div>

        {/* Question prompt */}
        <h2 className="text-sm sm:text-base font-bold text-gray-700 mb-4 text-center">
          {currentQ.prompt}
        </h2>

        {/* Answer options */}
        <div className={`grid gap-2.5 ${currentQ.type === 'multiple-choice-article' ? 'grid-cols-3' : 'grid-cols-1'}`}>
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedOption === opt;
            const isTargetCorrect = opt === currentQ.correctAnswer;

            let btnStyle = 'bg-white border-gray-200 text-gray-800 hover:border-gray-300 hover:bg-gray-50';

            if (isAnswered) {
              if (isTargetCorrect) {
                btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-400/40';
              } else if (isSelected && !isCorrect) {
                btnStyle = 'bg-rose-50 border-rose-500 text-rose-900 ring-1 ring-rose-400/40';
              } else {
                btnStyle = 'opacity-40 bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed';
              }
            } else if (isSelected) {
              btnStyle = 'bg-blue-50 border-blue-600 text-blue-900 ring-1 ring-blue-500/30';
            }

            return (
              <button
                key={i}
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt)}
                className={`
                  p-3.5 sm:p-4 rounded-xl border-2 font-semibold text-xs sm:text-sm transition-all duration-150
                  flex items-center justify-between text-left active:scale-[0.99] min-h-[50px]
                  ${btnStyle}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 ${
                    isAnswered && isTargetCorrect
                      ? 'bg-emerald-500 text-white'
                      : isAnswered && isSelected && !isCorrect
                      ? 'bg-rose-500 text-white'
                      : isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{opt}</span>
                </div>

                {isAnswered && isTargetCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback/Explanation */}
        {isAnswered && (
          <div className={`mt-4 p-4 rounded-xl border text-xs sm:text-sm animate-in slide-in-from-bottom-2 duration-200 ${
            isCorrect
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-1.5 font-bold mb-1.5">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Chính xác! +15 XP
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Chưa đúng! Đáp án đúng: <span className="font-extrabold underline">{currentQ.correctAnswer}</span>
                </>
              )}
            </div>
            <p className="opacity-80 font-normal leading-relaxed">
              {currentQ.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="flex items-center justify-center gap-2">
        {!isAnswered ? (
          <button
            onClick={handleCheckAnswer}
            disabled={!selectedOption}
            className={`
              w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95
              flex items-center justify-center gap-2 min-h-[48px]
              ${selectedOption
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }
            `}
          >
            Kiểm tra đáp án
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[48px]"
          >
            {currentIdx + 1 < questions.length ? 'Câu tiếp theo' : 'Xem kết quả'}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Overlay to close filter dropdown */}
      {showFilter && (
        <div className="fixed inset-0 z-10" onClick={() => setShowFilter(false)} />
      )}
    </div>
  );
};
