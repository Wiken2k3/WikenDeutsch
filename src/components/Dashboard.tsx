// src/components/Dashboard.tsx
import React from 'react';
import { useVocab } from '../context/VocabContext';
import { 
  Flame, 
  Layers, 
  HelpCircle, 
  Gamepad2, 
  BookOpen, 
  Volume2, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Trophy,
  Plus,
  Sparkles
} from 'lucide-react';
import { playGermanAudio } from '../utils/audio';

export const Dashboard: React.FC = () => {
  const { 
    vocabulary, 
    sets, 
    userProfile, 
    setActiveTab, 
    setActiveSetId, 
    setSelectedWordForDetail,
    setIsAddWordModalOpen
  } = useVocab();

  // Stats calculation
  const totalWords = vocabulary.length;
  const masteredWords = vocabulary.filter(w => w.srsLevel >= 4).length;
  const dueWords = vocabulary.filter(w => w.srsLevel > 0 && w.nextReviewDate <= Date.now()).length;

  const handleStartSet = (setId: string, tab: 'study' | 'quiz' = 'study') => {
    setActiveSetId(setId);
    setActiveTab(tab);
  };

  const getArticleBadge = (article: string) => {
    switch (article) {
      case 'der': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'die': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'das': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-mobile-nav">
      {/* 1. Eye-friendly Clean Hero Card (Notion/Minimalist Style) */}
      <div className="notion-card p-5 sm:p-7 md:p-8 bg-white border border-gray-200 relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-xs font-bold text-amber-800 mb-3">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            Chuỗi {userProfile.streak} ngày liên tục • Trình độ Goethe A2-B1
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            Guten Tag, {userProfile.name}! 👋
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-6 leading-relaxed">
            Hôm nay bạn có <span className="font-bold text-blue-600">{dueWords > 0 ? dueWords : 15} từ vựng</span> cần ôn tập lại theo chu kỳ ghi nhớ ngắt quãng (Spaced Repetition).
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => {
                setActiveSetId(null);
                setActiveTab('study');
              }}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Layers className="w-4 h-4" />
              Ôn tập Spaced Repetition ngay
            </button>

            <button
              onClick={() => {
                setActiveSetId(null);
                setActiveTab('match');
              }}
              className="px-5 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 text-gray-700 font-semibold text-xs sm:text-sm border border-gray-200 transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Gamepad2 className="w-4 h-4" />
              Game Nối từ
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="notion-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-gray-900">{totalWords}</div>
            <div className="text-[11px] sm:text-xs text-gray-500 font-medium">Tổng từ vựng</div>
          </div>
        </div>

        <div className="notion-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-700">{masteredWords}</div>
            <div className="text-[11px] sm:text-xs text-gray-500 font-medium">Đã thuộc (Hộp 4-5)</div>
          </div>
        </div>

        <div className="notion-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-amber-700">{dueWords}</div>
            <div className="text-[11px] sm:text-xs text-gray-500 font-medium">Đến hạn ôn hôm nay</div>
          </div>
        </div>

        <div className="notion-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-purple-700">{userProfile.streak} ngày</div>
            <div className="text-[11px] sm:text-xs text-gray-500 font-medium">Chuỗi Streak</div>
          </div>
        </div>
      </div>

      {/* 3. Official Sets & Units (from tài liệu.pdf) */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900">
              Các bộ từ theo giáo trình (tài liệu.pdf)
            </h2>
            <p className="text-xs text-gray-500">
              Trích xuất 412 từ vựng đầy đủ mạo từ, số nhiều, nghĩa tiếng Việt và ví dụ
            </p>
          </div>

          <button
            onClick={() => setActiveTab('sets')}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            Tất cả
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {sets.map((set) => {
            const setWords = vocabulary.filter(w => w.unitId === set.id);
            const count = setWords.length;
            const masteredInSet = setWords.filter(w => w.srsLevel >= 4).length;
            const pct = count > 0 ? Math.round((masteredInSet / count) * 100) : 0;

            return (
              <div
                key={set.id}
                className="notion-card p-4 sm:p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-lg">
                        {set.id === 'einheit-1' ? '📘' : set.id === 'einheit-2' ? '👨‍👩‍👧‍👦' : set.id === 'einheit-3' ? '🚗' : '💼'}
                      </div>

                      <div>
                        <h3 className="font-bold text-sm text-gray-900 line-clamp-1">
                          {set.title}
                        </h3>
                        <div className="text-xs text-gray-500">
                          {count} từ • {set.germanTitle}
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {pct}% thuộc
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {set.description}
                  </p>

                  {/* Micro Progress bar */}
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-3.5">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Touch-friendly Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleStartSet(set.id, 'study')}
                    className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-all flex items-center justify-center gap-1.5 min-h-[40px]"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Học thẻ 3D
                  </button>

                  <button
                    onClick={() => handleStartSet(set.id, 'quiz')}
                    className="py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-1 min-h-[40px]"
                    title="Làm bài kiểm tra Quiz cho bộ này"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Quiz
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Recent Vocabulary List */}
      <div className="notion-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900">
              Từ vựng nổi bật gần đây
            </h2>
            <p className="text-xs text-gray-500">
              Bấm vào từ để xem ngữ pháp chi tiết hoặc bấm biểu tượng loa để nghe
            </p>
          </div>

          <button
            onClick={() => setIsAddWordModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors min-h-[36px]"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm từ mới
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {vocabulary.slice(0, 8).map((word) => (
            <div
              key={word.id}
              onClick={() => setSelectedWordForDetail(word)}
              className="py-2.5 px-2 hover:bg-gray-50 rounded-xl cursor-pointer flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {word.article ? (
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border shrink-0 ${getArticleBadge(word.article)}`}>
                    {word.article}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 shrink-0">
                    {word.type}
                  </span>
                )}

                <div className="min-w-0 truncate">
                  <div className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-blue-600 flex items-center gap-1.5 truncate">
                    <span>{word.german}</span>
                    {word.plural && word.plural !== '*' && (
                      <span className="text-[11px] font-normal text-purple-600 truncate">
                        ({word.plural})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {word.vietnamese}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playGermanAudio(word.german);
                  }}
                  className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Nghe phát âm de-DE"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
