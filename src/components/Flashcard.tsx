// src/components/Flashcard.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useVocab } from '../context/VocabContext';
import { VocabularyItem } from '../types';
import { 
  Volume2, 
  RotateCw, 
  Shuffle, 
  Sparkles, 
  Bot, 
  Bookmark, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Award, 
  Layers, 
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { playGermanAudio, playChimeSound } from '../utils/audio';

export const Flashcard: React.FC = () => {
  const { 
    vocabulary, 
    sets, 
    activeSetId, 
    setActiveTab, 
    rateWord, 
    toggleFavorite, 
    completeStudySession,
    setSelectedWordForDetail
  } = useVocab();

  // Stable session cards initialized only when activeSetId changes or restart is triggered
  const [cards, setCards] = useState<VocabularyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0, earnedXp: 0 });
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);

  // Initialize session cards when activeSetId changes
  const initSession = useCallback(() => {
    let list: VocabularyItem[];
    if (activeSetId) {
      list = vocabulary.filter(w => w.unitId === activeSetId);
    } else {
      const due = vocabulary.filter(w => w.srsLevel > 0 && w.nextReviewDate <= Date.now());
      list = due.length > 0 ? due : vocabulary.slice(0, 30);
    }

    const finalCards = list.length > 0 ? list : vocabulary.slice(0, 20);
    setCards([...finalCards]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
    setSessionStats({ correct: 0, wrong: 0, earnedXp: 0 });
  }, [activeSetId]); // Note: DO NOT include `vocabulary` here to prevent re-initializing when rating a word!

  useEffect(() => {
    initSession();
  }, [initSession]);

  const currentCard = cards[currentIndex];

  // Auto-pronounce German word when moving to a new card
  useEffect(() => {
    if (currentCard && autoPlayAudio && !isCompleted) {
      const timer = setTimeout(() => {
        playGermanAudio(currentCard.german);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isCompleted, autoPlayAudio]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  // Rate and advance to next card
  const handleRate = useCallback((rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentCard) return;

    // 1. Update SRS in global database
    rateWord(currentCard.id, rating);

    const isCorrect = rating === 'good' || rating === 'easy';
    const xpBonus = rating === 'easy' ? 15 : rating === 'good' ? 10 : rating === 'hard' ? 5 : 2;

    if (isCorrect) {
      playChimeSound('correct');
    } else {
      playChimeSound('wrong');
    }

    setSessionStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (!isCorrect ? 1 : 0),
      earnedXp: prev.earnedXp + xpBonus
    }));

    // 2. Anki Spaced Repetition behavior:
    // If 'again' (Chưa nhớ), append the card to the end of this session queue so user reviews it again!
    let nextCards = cards;
    if (rating === 'again') {
      nextCards = [...cards, currentCard];
      setCards(nextCards);
    }

    // 3. Smoothly advance to the NEXT card
    const nextIdx = currentIndex + 1;
    if (nextIdx < nextCards.length) {
      setIsFlipped(false);
      setCurrentIndex(nextIdx);
    } else {
      // Completed full session!
      setIsCompleted(true);
      completeStudySession(
        sessionStats.earnedXp + xpBonus, 
        sessionStats.correct + (isCorrect ? 1 : 0), 
        sessionStats.wrong + (!isCorrect ? 1 : 0)
      );
    }
  }, [currentCard, currentIndex, cards, sessionStats, rateWord, completeStudySession]);

  // Manual navigation
  const handleNext = () => {
    if (currentIndex + 1 < cards.length) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === '1') {
        handleRate('again');
      } else if (e.key === '2') {
        handleRate('hard');
      } else if (e.key === '3') {
        handleRate('good');
      } else if (e.key === '4') {
        handleRate('easy');
      } else if (e.key === 'a' || e.key === 'A' || e.key === 's' || e.key === 'S') {
        if (currentCard) playGermanAudio(currentCard.german);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleRate, currentCard, currentIndex, cards.length]);

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleRestart = () => {
    initSession();
  };

  const getArticleBadgeStyle = (article: string) => {
    switch (article) {
      case 'der':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'die':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'das':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'der/die':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const renderHighlightedExample = (example: string, word: string) => {
    if (!example || !word) return example;
    const cleanWord = word.split(',')[0].trim().split(' ')[0];
    const regex = new RegExp(`(${cleanWord})`, 'gi');
    const parts = example.split(regex);

    return parts.map((part, i) => 
      regex.test(part) ? (
        <span key={i} className="text-blue-600 font-extrabold underline decoration-blue-400 decoration-2 underline-offset-4">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const activeSet = sets.find(s => s.id === activeSetId);

  // Completion screen
  if (isCompleted) {
    const total = cards.length;
    const accuracy = total > 0 ? Math.round((sessionStats.correct / total) * 100) : 100;

    return (
      <div className="max-w-xl mx-auto py-8 px-4 text-center pb-mobile-nav">
        <div className="w-16 h-16 mx-auto mb-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center text-3xl">
          🏆
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">
          Hoàn thành phiên ôn tập!
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm mb-6">
          Toàn bộ thẻ đã được cập nhật chu kỳ Spaced Repetition (SRS) thành công.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
            <div className="text-2xl font-extrabold text-blue-600">
              +{sessionStats.earnedXp}
            </div>
            <div className="text-xs text-gray-500 mt-1 font-medium">XP nhận được</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
            <div className="text-2xl font-extrabold text-emerald-600">
              {accuracy}%
            </div>
            <div className="text-xs text-gray-500 mt-1 font-medium">Độ chính xác</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
            <div className="text-2xl font-extrabold text-amber-600">
              {sessionStats.correct}/{total}
            </div>
            <div className="text-xs text-gray-500 mt-1 font-medium">Đã nhớ tốt</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
          <button
            onClick={handleRestart}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
          >
            <RotateCw className="w-4 h-4" />
            Ôn tập lại bộ này
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Award className="w-4 h-4" />
            Làm bài Quiz
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl active:scale-95 transition-all min-h-[44px]"
          >
            Về Trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="text-center py-16 pb-mobile-nav">
        <Layers className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-gray-800">Không có thẻ nào để học</h3>
        <p className="text-xs text-gray-500 mt-1">Hãy chọn một bộ từ vựng khác trong thư viện.</p>
        <button
          onClick={() => setActiveTab('sets')}
          className="mt-4 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          Xem kho bộ từ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-3 md:py-6 px-2 sm:px-4 pb-mobile-nav">
      {/* Top Controls & Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('sets')}
            className="p-2 text-gray-500 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-colors"
            title="Quay lại danh sách bộ từ"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="text-[11px] sm:text-xs font-semibold text-gray-500">
              {activeSet ? activeSet.title : 'Tất cả từ vựng'}
            </div>
            <div className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
              Thẻ {currentIndex + 1} / {cards.length}
              <span className="text-[11px] font-normal text-gray-400">
                (Còn {cards.length - (currentIndex + 1)} từ)
              </span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {/* Previous Card */}
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`p-2 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${currentIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Thẻ trước [Phím ←]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Next Card */}
          <button
            onClick={handleNext}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Thẻ tiếp [Phím →]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleShuffle}
            className="p-2 text-gray-500 hover:text-blue-600 rounded-xl hover:bg-gray-100 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Xáo trộn thứ tự thẻ"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={() => setAutoPlayAudio(prev => !prev)}
            className={`p-2 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${autoPlayAudio ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-100'}`}
            title={autoPlayAudio ? "Tự động phát âm: Bật" : "Tự động phát âm: Tắt"}
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleFavorite(currentCard.id)}
            className={`p-2 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${currentCard.isFavorite ? 'text-amber-500 bg-amber-50' : 'text-gray-400 hover:bg-gray-100'}`}
            title="Đánh dấu yêu thích"
          >
            <Bookmark className={`w-4 h-4 ${currentCard.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mb-5">
        <div 
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* 3D Flashcard Container */}
      <div className="perspective-1000 w-full min-h-[340px] sm:min-h-[380px] md:min-h-[400px] mb-5">
        <div
          onClick={handleFlip}
          className={`
            relative w-full h-full min-h-[340px] sm:min-h-[380px] md:min-h-[400px] rounded-3xl transition-transform duration-500 transform-style-3d cursor-pointer select-none
            ${isFlipped ? 'rotate-y-180' : ''}
          `}
        >
          {/* ================= FRONT SIDE ================= */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 flex flex-col justify-between shadow-xs hover:border-blue-400 transition-colors">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {currentCard.article && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider border ${getArticleBadgeStyle(currentCard.article)}`}>
                    {currentCard.article}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200">
                  {currentCard.type}
                </span>
                {currentCard.plural && currentCard.plural !== '*' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    Pl: {currentCard.plural}
                  </span>
                )}
              </div>

              <div className="text-[11px] font-bold text-gray-400">
                Hộp {currentCard.srsLevel}/5
              </div>
            </div>

            {/* Center: German word & Audio */}
            <div className="my-auto text-center py-4">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">
                {currentCard.german}
              </h1>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playGermanAudio(currentCard.german);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all border border-blue-200 active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Phát âm (de-DE)
              </button>
            </div>

            {/* Bottom hint */}
            <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
              <span className="truncate max-w-[150px]">{currentCard.unitName}</span>
              <span className="flex items-center gap-1 font-medium text-gray-500">
                <RotateCw className="w-3.5 h-3.5" />
                Chạm để lật thẻ
              </span>
            </div>
          </div>

          {/* ================= BACK SIDE ================= */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white border-2 border-blue-300 rounded-3xl p-5 sm:p-7 flex flex-col justify-between shadow-sm">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Nghĩa & Ví dụ minh họa
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedWordForDetail(currentCard);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors border border-blue-200"
                title="Xem phân tích ngữ pháp"
              >
                <Bot className="w-3.5 h-3.5" />
                Hỏi AI
              </button>
            </div>

            {/* Center: Meaning & Example */}
            <div className="my-auto py-2">
              <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
                {currentCard.vietnamese}
              </div>

              {currentCard.example && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Beispielsatz (Ví dụ):
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playGermanAudio(currentCard.example);
                      }}
                      className="p-1 rounded text-gray-400 hover:text-blue-600 transition-colors"
                      title="Nghe câu ví dụ"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 italic font-medium leading-relaxed">
                    "{renderHighlightedExample(currentCard.example, currentCard.german)}"
                  </p>
                </div>
              )}
            </div>

            {/* Bottom info */}
            <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
              <span>{currentCard.type} {currentCard.plural ? `• Số nhiều: ${currentCard.plural}` : ''}</span>
              <span className="text-blue-600 font-medium">Bấm mức nhớ bên dưới để chuyển từ ↓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons (Anki / SM-2 Rating System) */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Rating 1: Chưa nhớ */}
          <button
            onClick={() => handleRate('again')}
            className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold active:scale-95 transition-all min-h-[50px] shadow-2xs"
            title="Chưa nhớ (Xếp lại vào cuối phiên để học lại)"
          >
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              Chưa nhớ
            </div>
            <span className="text-[10px] font-normal text-rose-600/80 mt-0.5">Lặp lại cuối [Phím 1]</span>
          </button>

          {/* Rating 2: Khó */}
          <button
            onClick={() => handleRate('hard')}
            className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold active:scale-95 transition-all min-h-[50px] shadow-2xs"
            title="Hơi khó (Ôn lại sau 1 ngày)"
          >
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              Hơi khó
            </div>
            <span className="text-[10px] font-normal text-amber-700/80 mt-0.5">1 ngày [Phím 2]</span>
          </button>

          {/* Rating 3: Đã nhớ */}
          <button
            onClick={() => handleRate('good')}
            className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold active:scale-95 transition-all min-h-[50px] shadow-2xs"
            title="Đã nhớ tốt (Chuyển sang từ tiếp theo và ôn lại sau 3 ngày)"
          >
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Đã nhớ
            </div>
            <span className="text-[10px] font-normal text-emerald-700/80 mt-0.5">3 ngày [Phím 3]</span>
          </button>

          {/* Rating 4: Rất dễ */}
          <button
            onClick={() => handleRate('easy')}
            className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-bold active:scale-95 transition-all min-h-[50px] shadow-2xs"
            title="Rất dễ (Chuyển sang từ tiếp theo và ôn lại sau 7 ngày)"
          >
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Rất dễ
            </div>
            <span className="text-[10px] font-normal text-blue-700/80 mt-0.5">7 ngày [Phím 4]</span>
          </button>
        </div>

        {/* Next / Skip / Flip bottom helpers */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`font-semibold flex items-center gap-1 ${currentIndex === 0 ? 'text-gray-300' : 'text-gray-600 hover:text-blue-600'}`}
          >
            ← Thẻ trước
          </button>

          <button
            onClick={handleFlip}
            className="font-semibold text-blue-600 hover:underline"
          >
            {isFlipped ? 'Xem mặt trước' : 'Xem nghĩa & ví dụ'}
          </button>

          <button
            onClick={handleNext}
            className="font-semibold text-gray-600 hover:text-blue-600 flex items-center gap-1"
          >
            Từ kế tiếp →
          </button>
        </div>
      </div>
    </div>
  );
};
