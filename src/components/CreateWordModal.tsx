// src/components/CreateWordModal.tsx
import React, { useState, useEffect } from 'react';
import { useVocab } from '../context/VocabContext';
import { Article, WordType } from '../types';
import { X, Plus, Edit3 } from 'lucide-react';

export const CreateWordModal: React.FC = () => {
  const { 
    isAddWordModalOpen, 
    setIsAddWordModalOpen, 
    editingWord, 
    setEditingWord, 
    addWord, 
    updateWord, 
    sets 
  } = useVocab();

  const [german, setGerman] = useState('');
  const [article, setArticle] = useState<Article>('');
  const [type, setType] = useState<WordType>('Nomen');
  const [plural, setPlural] = useState('');
  const [vietnamese, setVietnamese] = useState('');
  const [example, setExample] = useState('');
  const [unitId, setUnitId] = useState(sets[0]?.id || 'einheit-1');

  useEffect(() => {
    if (editingWord) {
      setGerman(editingWord.german);
      setArticle(editingWord.article);
      setType(editingWord.type);
      setPlural(editingWord.plural);
      setVietnamese(editingWord.vietnamese);
      setExample(editingWord.example);
      setUnitId(editingWord.unitId);
    } else {
      setGerman('');
      setArticle('');
      setType('Nomen');
      setPlural('');
      setVietnamese('');
      setExample('');
      setUnitId(sets[0]?.id || 'einheit-1');
    }
  }, [editingWord, isAddWordModalOpen, sets]);

  const isOpen = isAddWordModalOpen || !!editingWord;

  if (!isOpen) return null;

  const handleClose = () => {
    setIsAddWordModalOpen(false);
    setEditingWord(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!german.trim() || !vietnamese.trim()) return;

    const unitObj = sets.find(s => s.id === unitId);
    const unitName = unitObj ? unitObj.title : 'Bộ từ tùy chỉnh';
    const displayGerman = article ? `${german.trim()}, ${article}` : german.trim();

    if (editingWord) {
      updateWord({
        ...editingWord,
        german: german.trim(),
        displayGerman,
        article,
        type,
        plural: plural.trim(),
        vietnamese: vietnamese.trim(),
        example: example.trim(),
        unitId,
        unitName
      });
    } else {
      addWord({
        german: german.trim(),
        displayGerman,
        article,
        type,
        plural: plural.trim(),
        vietnamese: vietnamese.trim(),
        example: example.trim(),
        unitId,
        unitName
      });
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-2xl border border-gray-200 shadow-xl overflow-hidden"
      >
        <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            {editingWord ? <Edit3 className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-blue-600" />}
            {editingWord ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng mới'}
          </h3>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Từ tiếng Đức *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Wörterbuch"
                value={german}
                onChange={(e) => setGerman(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:bg-white rounded-xl text-xs sm:text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Mạo từ
              </label>
              <select
                value={article}
                onChange={(e) => setArticle(e.target.value as Article)}
                className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 focus:bg-white rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-blue-500"
              >
                <option value="">Không</option>
                <option value="der">der</option>
                <option value="die">die</option>
                <option value="das">das</option>
                <option value="der/die">der/die</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Từ loại
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as WordType)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:bg-white rounded-xl text-xs sm:text-sm outline-none focus:border-blue-500"
              >
                <option value="Nomen">Danh từ (Nomen)</option>
                <option value="Verb">Động từ (Verb)</option>
                <option value="Verb Phr.">Cụm động từ (Verb Phr.)</option>
                <option value="Adj.">Tính từ (Adj.)</option>
                <option value="Adv.">Phó từ (Adv.)</option>
                <option value="Konj.">Liên từ (Konj.)</option>
                <option value="Phr.">Cụm từ (Phr.)</option>
                <option value="Andere">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Dạng số nhiều
              </label>
              <input
                type="text"
                placeholder="Ví dụ: -n, -e..."
                value={plural}
                onChange={(e) => setPlural(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:bg-white rounded-xl text-xs sm:text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nghĩa tiếng Việt *
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: từ điển"
              value={vietnamese}
              onChange={(e) => setVietnamese(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:bg-white rounded-xl text-xs sm:text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Ví dụ minh họa (Beispielsatz)
            </label>
            <textarea
              rows={2}
              placeholder="Ví dụ: Ich brauche ein Wörterbuch."
              value={example}
              onChange={(e) => setExample(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:bg-white rounded-xl text-xs sm:text-sm outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Bộ từ / Bài học
            </label>
            <select
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:bg-white rounded-xl text-xs sm:text-sm outline-none focus:border-blue-500"
            >
              {sets.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              {editingWord ? 'Lưu thay đổi' : 'Thêm vào kho'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
