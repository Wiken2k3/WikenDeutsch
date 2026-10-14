// src/components/SetsLibrary.tsx
import React, { useState, useMemo } from 'react';
import { useVocab } from '../context/VocabContext';
import { 
  Layers, 
  HelpCircle, 
  Volume2, 
  Plus, 
  Trash2, 
  Edit3, 
  Search
} from 'lucide-react';
import { playGermanAudio } from '../utils/audio';

export const SetsLibrary: React.FC = () => {
  const { 
    vocabulary, 
    sets, 
    setActiveSetId, 
    setActiveTab, 
    deleteWord, 
    deleteSet,
    setIsCreateSetModalOpen, 
    setIsAddWordModalOpen,
    setSelectedWordForDetail,
    setEditingWord
  } = useVocab();

  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState<string>('');

  const filteredWords = useMemo(() => {
    return vocabulary.filter((item) => {
      const matchUnit = selectedUnitFilter === 'all' || item.unitId === selectedUnitFilter;
      const matchType = selectedTypeFilter === 'all' || item.type === selectedTypeFilter;
      const matchSearch = !localSearch.trim() || 
        item.german.toLowerCase().includes(localSearch.toLowerCase()) ||
        item.vietnamese.toLowerCase().includes(localSearch.toLowerCase()) ||
        item.displayGerman.toLowerCase().includes(localSearch.toLowerCase());

      return matchUnit && matchType && matchSearch;
    });
  }, [vocabulary, selectedUnitFilter, selectedTypeFilter, localSearch]);

  const handleLearnSet = (setId: string, mode: 'study' | 'quiz') => {
    setActiveSetId(setId);
    setActiveTab(mode);
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
    <div className="space-y-6 pb-mobile-nav">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            Kho từ vựng & Quản lý bộ từ
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Tổng hợp {vocabulary.length} từ vựng từ file tài liệu.pdf và các bộ từ cá nhân của bạn.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsCreateSetModalOpen(true)}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-gray-200 min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5" />
            Tạo bộ từ
          </button>

          <button
            onClick={() => setIsAddWordModalOpen(true)}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm từ mới
          </button>
        </div>
      </div>

      {/* Sets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sets.map((set) => {
          const setVocab = vocabulary.filter(w => w.unitId === set.id);
          const count = setVocab.length;
          const mastered = setVocab.filter(w => w.srsLevel >= 4).length;
          const pct = count > 0 ? Math.round((mastered / count) * 100) : 0;
          const isSelected = selectedUnitFilter === set.id;

          return (
            <div
              key={set.id}
              onClick={() => setSelectedUnitFilter(isSelected ? 'all' : set.id)}
              className={`
                p-4 rounded-2xl border cursor-pointer transition-all duration-150 flex flex-col justify-between
                ${isSelected 
                  ? 'bg-blue-50/60 border-blue-500 ring-1 ring-blue-500/20' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-base">
                    {set.id === 'einheit-1' ? '📘' : set.id === 'einheit-2' ? '👨‍👩‍👧‍👦' : set.id === 'einheit-3' ? '🚗' : '💼'}
                  </div>

                  {set.category === 'custom' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Bạn có chắc muốn xóa bộ từ "${set.title}"?`)) {
                          deleteSet(set.id);
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Xóa bộ từ này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <h3 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-1 mb-0.5">
                  {set.title}
                </h3>
                <div className="text-[11px] text-gray-500 mb-2.5">
                  {count} từ • {pct}% thuộc
                </div>

                <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLearnSet(set.id, 'study');
                  }}
                  className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 min-h-[36px]"
                >
                  <Layers className="w-3 h-3" />
                  Học
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLearnSet(set.id, 'quiz');
                  }}
                  className="py-1.5 px-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200 transition-colors min-h-[36px]"
                  title="Kiểm tra trắc nghiệm"
                >
                  Quiz
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-gray-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo từ tiếng Đức, tiếng Việt hoặc câu ví dụ..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 hover:bg-gray-100/70 focus:bg-white rounded-xl text-xs sm:text-sm outline-none border border-gray-200 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedUnitFilter}
            onChange={(e) => setSelectedUnitFilter(e.target.value)}
            className="flex-1 md:flex-none px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none min-h-[38px]"
          >
            <option value="all">Tất cả bài học (412 từ)</option>
            {sets.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>

          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="flex-1 md:flex-none px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none min-h-[38px]"
          >
            <option value="all">Tất cả từ loại</option>
            <option value="Nomen">Danh từ (Nomen)</option>
            <option value="Verb">Động từ (Verb)</option>
            <option value="Adj.">Tính từ (Adj.)</option>
            <option value="Adv.">Phó từ (Adv.)</option>
            <option value="Konj.">Liên từ (Konj.)</option>
            <option value="Phr.">Cụm từ (Phr.)</option>
          </select>
        </div>
      </div>

      {/* Vocabulary Table (Mobile-Safe Overflow Wrapper) */}
      <div className="notion-card overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs sm:text-sm min-w-[600px] md:min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3.5">Từ vựng tiếng Đức</th>
                <th className="py-3 px-2.5">Từ loại / Số nhiều</th>
                <th className="py-3 px-3.5">Nghĩa tiếng Việt</th>
                <th className="py-3 px-3.5 hidden lg:table-cell">Câu ví dụ (Beispielsatz)</th>
                <th className="py-3 px-2.5 text-center">Trạng thái SRS</th>
                <th className="py-3 px-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredWords.map((item) => (
                <tr 
                  key={item.id}
                  onClick={() => setSelectedWordForDetail(item)}
                  className="hover:bg-gray-50/80 cursor-pointer transition-colors group"
                >
                  {/* German word + Article */}
                  <td className="py-3 px-3.5 font-bold text-gray-900">
                    <div className="flex items-center gap-1.5">
                      {item.article && (
                        <span className={`px-2 py-0.5 rounded text-xs font-extrabold border ${getArticleBadge(item.article)}`}>
                          {item.article}
                        </span>
                      )}
                      <span className="text-xs sm:text-sm group-hover:text-blue-600 transition-colors">
                        {item.german}
                      </span>
                    </div>
                  </td>

                  {/* Type / Plural */}
                  <td className="py-3 px-2.5 text-gray-500">
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs text-gray-700">{item.type}</span>
                      {item.plural && item.plural !== '*' && (
                        <span className="text-[10px] text-purple-600">
                          {item.plural}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Vietnamese Meaning */}
                  <td className="py-3 px-3.5 font-medium text-gray-800">
                    {item.vietnamese}
                  </td>

                  {/* Beispielsatz */}
                  <td className="py-3 px-3.5 hidden lg:table-cell text-xs text-gray-500 italic max-w-xs xl:max-w-md truncate">
                    "{item.example}"
                  </td>

                  {/* SRS Level */}
                  <td className="py-3 px-2.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.srsLevel >= 4 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      item.srsLevel > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      {item.srsLevel >= 4 ? 'Đã thuộc' : item.srsLevel > 0 ? `Hộp ${item.srsLevel}` : 'Từ mới'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3.5 text-right">
                    <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => playGermanAudio(item.german)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setEditingWord(item)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Xóa từ "${item.german}" khỏi danh sách?`)) {
                            deleteWord(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Xóa từ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredWords.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-xs">
            Không tìm thấy từ vựng nào khớp với bộ lọc hiện tại.
          </div>
        )}
      </div>
    </div>
  );
};
