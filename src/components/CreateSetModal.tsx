// src/components/CreateSetModal.tsx
import React, { useState } from 'react';
import { useVocab } from '../context/VocabContext';
import { X, FolderPlus } from 'lucide-react';

const COLORS = [
  '#2563EB', // Blue
  '#059669', // Emerald
  '#D97706', // Amber
  '#DB2777', // Pink
  '#7C3AED', // Purple
  '#DC2626', // Red
  '#0891B2', // Cyan
  '#4B5563'  // Slate
];

export const CreateSetModal: React.FC = () => {
  const { isCreateSetModalOpen, setIsCreateSetModalOpen, createSet } = useVocab();

  const [title, setTitle] = useState('');
  const [germanTitle, setGermanTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  if (!isCreateSetModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createSet({
      title: title.trim(),
      germanTitle: germanTitle.trim() || title.trim(),
      description: description.trim() || 'Bộ từ vựng cá nhân',
      icon: 'BookOpen',
      color: selectedColor,
      category: 'custom',
      tags: ['Cá nhân', 'Tự tạo']
    });

    setIsCreateSetModalOpen(false);
    setTitle('');
    setGermanTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-2xl border border-gray-200 shadow-xl overflow-hidden"
      >
        <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-blue-600" />
            Tạo bộ từ vựng mới
          </h3>
          <button
            onClick={() => setIsCreateSetModalOpen(false)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Tên bộ từ (Tiếng Việt) *
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Từ vựng ẩm thực, nhà hàng..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:bg-white rounded-xl text-xs sm:text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Tiêu đề phụ / Tiếng Đức
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Essen & Trinken"
              value={germanTitle}
              onChange={(e) => setGermanTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:bg-white rounded-xl text-xs sm:text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Mô tả ngắn
            </label>
            <textarea
              rows={2}
              placeholder="Mô tả nội dung hoặc mục đích của bộ từ..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:bg-white rounded-xl text-xs sm:text-sm outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Màu sắc chủ đề
            </label>
            <div className="flex items-center gap-2">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${selectedColor === c ? 'scale-125 ring-2 ring-offset-2 ring-blue-500' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsCreateSetModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              Tạo bộ từ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
