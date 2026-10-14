// src/components/RightPanel.tsx
import React, { useState } from 'react';
import { useVocab } from '../context/VocabContext';
import { 
  CheckCircle2, 
  Volume2, 
  Flame, 
  Lightbulb, 
  Trophy, 
  Clock, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { playGermanAudio } from '../utils/audio';

const GRAMMAR_TIPS = [
  {
    title: 'Quy tắc giống "die" (Giống cái)',
    content: '90% danh từ có đuôi: -ung (Rechnung), -heit (Kindheit), -keit (Möglichkeit), -schaft (Wirtschaft), -tion (Funktion) luôn đi với mạo từ "die"!'
  },
  {
    title: 'Liên từ gửi động từ về cuối ("weil", "dass")',
    content: 'Khi dùng "weil" (bởi vì) hay "dass" (rằng), động từ chia luôn bị đẩy xuống vị trí cuối cùng của câu: "..., weil ich viel Obst esse."'
  },
  {
    title: 'Mẹo nhớ từ ghép (Komposita)',
    content: 'Trong tiếng Đức, danh từ ghép lấy mạo từ và đuôi số nhiều của từ đứng CUỐI CÙNG! Ví dụ: der Sommer + der Regen = der Sommerregen.'
  },
  {
    title: 'Quy tắc giống "das" (Giống trung)',
    content: 'Hầu hết các danh từ chỉ hành động biến thể từ động từ nguyên thể (das Essen, das Reisen) hoặc có đuôi -chen, -lein luôn mang mạo từ "das"!'
  }
];

export const RightPanel: React.FC = () => {
  const { vocabulary, userProfile, setActiveTab, setSelectedWordForDetail } = useVocab();
  const [tipIndex, setTipIndex] = useState(0);

  const dueWords = vocabulary
    .filter(w => w.srsLevel > 0 && w.nextReviewDate <= Date.now())
    .slice(0, 5);

  const urgentWords = dueWords.length > 0 
    ? dueWords 
    : vocabulary.filter(w => w.srsLevel === 0).slice(0, 5);

  const goalPercentage = Math.min(100, Math.round((userProfile.todayReviewedCount / userProfile.dailyGoal) * 100));

  const cycleTip = () => {
    setTipIndex((prev) => (prev + 1) % GRAMMAR_TIPS.length);
  };

  return (
    <aside className="w-80 bg-white border-l border-gray-200 p-5 space-y-5 hidden xl:block overflow-y-auto">
      {/* 1. Daily Learning Goal Card */}
      <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Mục tiêu hôm nay
          </h3>
          <span className="text-xs font-bold text-blue-600">
            {userProfile.todayReviewedCount}/{userProfile.dailyGoal} từ
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${goalPercentage}%` }}
          />
        </div>

        <p className="text-xs text-gray-500">
          {goalPercentage >= 100 ? (
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 inline" /> Hoàn thành chỉ tiêu hôm nay!
            </span>
          ) : (
            `Còn ${Math.max(0, userProfile.dailyGoal - userProfile.todayReviewedCount)} từ nữa để duy trì streak!`
          )}
        </p>
      </div>

      {/* 2. Urgent / Due Vocabulary SRS Queue */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            {dueWords.length > 0 ? 'Cần ôn tập gấp' : 'Từ vựng đề xuất'}
          </h3>
          <button
            onClick={() => setActiveTab('study')}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-0.5"
          >
            Ôn ngay
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1.5">
          {urgentWords.map((word) => (
            <div
              key={word.id}
              onClick={() => setSelectedWordForDetail(word)}
              className="p-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200/90 cursor-pointer flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                  word.article === 'der' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  word.article === 'die' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  word.article === 'das' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  'bg-gray-100 text-gray-700 border border-gray-200'
                }`}>
                  {word.article || word.type}
                </span>

                <div className="truncate">
                  <div className="font-semibold text-xs text-gray-900 truncate group-hover:text-blue-600">
                    {word.german}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">
                    {word.vietnamese}
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playGermanAudio(word.german);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Nghe phát âm"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. German Grammar Tip of the Day */}
      <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-2xl relative">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600 fill-amber-500/20" />
            Mẹo ngữ pháp tiếng Đức
          </div>
          <button 
            onClick={cycleTip} 
            className="text-[11px] font-semibold text-amber-700 hover:underline flex items-center gap-0.5"
            title="Đổi mẹo khác"
          >
            Đổi
            <Sparkles className="w-3 h-3" />
          </button>
        </div>

        <h4 className="text-xs font-bold text-gray-900 mb-1">
          {GRAMMAR_TIPS[tipIndex].title}
        </h4>
        <p className="text-xs text-gray-600 leading-relaxed">
          {GRAMMAR_TIPS[tipIndex].content}
        </p>
      </div>

      {/* 4. Mini Leaderboard */}
      <div className="bg-white border border-gray-200 p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            Bảng vàng Deutsch Meister
          </h3>
          <span className="text-[10px] uppercase font-bold text-gray-400">Tuần này</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-4 text-center font-bold text-amber-600">1</span>
              <span>🇩🇪</span>
              <span className="font-medium text-gray-800">Klaus Weber</span>
            </div>
            <span className="font-bold text-gray-600">820 XP</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-4 text-center font-bold text-gray-400">2</span>
              <span>👩‍🎓</span>
              <span className="font-medium text-gray-800">Thu Hà</span>
            </div>
            <span className="font-bold text-gray-600">650 XP</span>
          </div>

          <div className="flex items-center justify-between text-xs p-1.5 -mx-1.5 bg-blue-50/70 rounded-lg border border-blue-200/60">
            <div className="flex items-center gap-2">
              <span className="w-4 text-center font-bold text-blue-600">3</span>
              <span>{userProfile.avatar}</span>
              <span className="font-bold text-blue-900">{userProfile.name} (Bạn)</span>
            </div>
            <span className="font-bold text-blue-700">{userProfile.xp} XP</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
