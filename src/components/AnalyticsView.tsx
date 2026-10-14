// src/components/AnalyticsView.tsx
import React from 'react';
import { useVocab } from '../context/VocabContext';
import { 
  BarChart3, 
  Flame, 
  Zap, 
  CheckCircle2, 
  Clock, 
  Brain
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { vocabulary, userProfile } = useVocab();

  const total = vocabulary.length;
  const mastered = vocabulary.filter(w => w.srsLevel >= 4).length;
  const learning = vocabulary.filter(w => w.srsLevel > 0 && w.srsLevel < 4).length;
  const due = vocabulary.filter(w => w.srsLevel > 0 && w.nextReviewDate <= Date.now()).length;
  const unstudied = vocabulary.filter(w => w.srsLevel === 0).length;

  const masteredPct = total > 0 ? Math.round((mastered / total) * 100) : 0;
  const learningPct = total > 0 ? Math.round((learning / total) * 100) : 0;
  const unstudiedPct = total > 0 ? Math.round((unstudied / total) * 100) : 0;

  const nouns = vocabulary.filter(w => w.type === 'Nomen').length;
  const verbs = vocabulary.filter(w => w.type === 'Verb' || w.type === 'Verb Phr.').length;
  const adjs = vocabulary.filter(w => w.type === 'Adj.').length;
  const others = total - (nouns + verbs + adjs);

  const derNouns = vocabulary.filter(w => w.article === 'der').length;
  const dieNouns = vocabulary.filter(w => w.article === 'die').length;
  const dasNouns = vocabulary.filter(w => w.article === 'das').length;

  return (
    <div className="space-y-6 pb-mobile-nav max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Thống kê tiến độ ghi nhớ (SRS Analytics)
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Thuật toán Spaced Repetition (SRS) tự động xếp lịch ôn luyện khoa học giúp từ vựng đi vào trí nhớ dài hạn.
        </p>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="notion-card p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Chuỗi ngày</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{userProfile.streak} ngày</div>
          <p className="text-[11px] text-amber-700 font-semibold mt-0.5">Duy trì liên tục</p>
        </div>

        <div className="notion-card p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cấp độ & XP</span>
            <Zap className="w-4 h-4 text-blue-500 fill-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">Cấp {userProfile.level}</div>
          <p className="text-[11px] text-blue-600 font-semibold mt-0.5">{userProfile.xp} XP tích lũy</p>
        </div>

        <div className="notion-card p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Đã thành thạo</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">{mastered}</div>
          <p className="text-[11px] text-gray-500 mt-0.5">{masteredPct}% toàn bộ kho từ</p>
        </div>

        <div className="notion-card p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cần ôn hôm nay</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{due}</div>
          <p className="text-[11px] text-gray-500 mt-0.5">Đến hạn ôn</p>
        </div>
      </div>

      {/* SRS Distribution Bar */}
      <div className="notion-card p-5">
        <h2 className="text-sm sm:text-base font-extrabold text-gray-900 mb-1 flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-600" />
          Phân bố Spaced Repetition (Hộp ghi nhớ 0-5)
        </h2>
        <p className="text-xs text-gray-500 mb-5">
          Từ vựng chuyển lên hộp cao hơn khi bạn bấm "Đã nhớ" hoặc "Rất dễ".
        </p>

        {/* Stacked Progress Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-100 mb-5">
          <div 
            title={`Đã thành thạo: ${mastered} từ`}
            className="bg-emerald-500 h-full"
            style={{ width: `${(mastered / total) * 100}%` }}
          />
          <div 
            title={`Đang ghi nhớ: ${learning} từ`}
            className="bg-amber-400 h-full"
            style={{ width: `${(learning / total) * 100}%` }}
          />
          <div 
            title={`Từ mới chưa học: ${unstudied} từ`}
            className="bg-gray-300 h-full"
            style={{ width: `${(unstudied / total) * 100}%` }}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-emerald-800">Đã thành thạo (Hộp 4-5)</span>
            </div>
            <div className="text-xl font-bold text-emerald-900">{mastered} từ</div>
            <div className="text-[11px] text-emerald-700/80">{masteredPct}% hoàn thành</div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-xs font-bold text-amber-800">Đang củng cố (Hộp 1-3)</span>
            </div>
            <div className="text-xl font-bold text-amber-900">{learning} từ</div>
            <div className="text-[11px] text-amber-700/80">{learningPct}% đang học</div>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
              <span className="text-xs font-bold text-gray-700">Từ mới chưa học</span>
            </div>
            <div className="text-xl font-bold text-gray-900">{unstudied} từ</div>
            <div className="text-[11px] text-gray-500">{unstudiedPct}% sẵn sàng học</div>
          </div>
        </div>
      </div>

      {/* Grammar Breakdown (Nouns, Verbs, Articles) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="notion-card p-5">
          <h3 className="font-bold text-sm text-gray-900 mb-1">
            Phân bố Mạo từ (der / die / das)
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Tổng cộng {nouns} danh từ trong chương trình
          </p>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-blue-600">der (Giống đực)</span>
                <span>{derNouns} ({nouns > 0 ? Math.round((derNouns / nouns) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(derNouns / nouns) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-rose-600">die (Giống cái)</span>
                <span>{dieNouns} ({nouns > 0 ? Math.round((dieNouns / nouns) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(dieNouns / nouns) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-emerald-600">das (Giống trung)</span>
                <span>{dasNouns} ({nouns > 0 ? Math.round((dasNouns / nouns) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(dasNouns / nouns) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="notion-card p-5">
          <h3 className="font-bold text-sm text-gray-900 mb-1">
            Phân loại Từ loại
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Đầy đủ các loại từ ngữ pháp A2-B1
          </p>

          <div className="grid grid-cols-2 gap-2.5 text-center">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-lg font-bold text-gray-900">{nouns}</div>
              <div className="text-xs text-gray-500 font-medium">Danh từ (Nomen)</div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-lg font-bold text-gray-900">{verbs}</div>
              <div className="text-xs text-gray-500 font-medium">Động từ (Verb)</div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-lg font-bold text-gray-900">{adjs}</div>
              <div className="text-xs text-gray-500 font-medium">Tính từ (Adj.)</div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-lg font-bold text-gray-900">{others}</div>
              <div className="text-xs text-gray-500 font-medium">Khác (Konj, Adv...)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
