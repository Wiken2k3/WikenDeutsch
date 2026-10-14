// src/components/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useVocab } from '../context/VocabContext';
import { 
  Search, 
  Plus, 
  Volume2, 
  Flame, 
  Zap, 
  Heart, 
  X,
  Sparkles
} from 'lucide-react';
import { playGermanAudio } from '../utils/audio';

export const Header: React.FC = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    vocabulary, 
    userProfile, 
    setIsCreateSetModalOpen, 
    setIsAddWordModalOpen,
    setSelectedWordForDetail,
    refillHearts
  } = useVocab();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim() 
    ? vocabulary.filter(w => 
        w.german.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.vietnamese.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.displayGerman.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  const getArticleBadge = (article: string) => {
    switch (article) {
      case 'der': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'die': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'das': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-gray-200 px-3 sm:px-6 flex items-center justify-between transition-colors">
      {/* Search Bar with Instant Preview */}
      <div className="relative flex-1 max-w-sm sm:max-w-md mr-2 sm:mr-4" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Tra cứu 412 từ tiếng Đức..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            className="w-full pl-9 pr-8 py-2 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 transition-all outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}
              className="absolute right-2.5 p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            {searchResults.length > 0 ? (
              <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors"
                    onClick={() => {
                      setSelectedWordForDetail(item);
                      setIsSearchOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.article && (
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getArticleBadge(item.article)}`}>
                          {item.article}
                        </span>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
                          {item.german}
                          <span className="text-xs text-gray-400 font-normal">({item.type})</span>
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-xs">
                          {item.vietnamese}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playGermanAudio(item.german);
                      }}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Phát âm"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs sm:text-sm text-gray-500">
                Không tìm thấy từ vựng nào khớp với "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clean Light Stats & Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Streak Counter */}
        <div 
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-amber-700 font-bold text-xs sm:text-sm shadow-xs cursor-default"
          title={`Chuỗi ${userProfile.streak} ngày học liên tục!`}
        >
          <Flame className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-amber-500 text-amber-500" />
          <span>{userProfile.streak}</span>
          <span className="hidden md:inline text-xs font-medium text-amber-600/80">ngày</span>
        </div>

        {/* XP / Level */}
        <div 
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-blue-700 font-bold text-xs sm:text-sm shadow-xs"
          title={`Cấp độ ${userProfile.level} (${userProfile.xp} XP)`}
        >
          <Zap className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-blue-500 text-blue-500" />
          <span>{userProfile.xp}</span>
          <span className="hidden md:inline text-xs font-normal text-blue-600/70">XP</span>
        </div>

        {/* Hearts (Duolingo Style) */}
        <div 
          onClick={refillHearts}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 border border-rose-200 rounded-full text-rose-700 font-bold text-xs sm:text-sm shadow-xs cursor-pointer hover:bg-rose-100 transition-colors"
          title={`Còn ${userProfile.hearts} trái tim (Bấm để hồi phục)`}
        >
          <Heart className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-rose-500 text-rose-500" />
          <span>{userProfile.hearts}</span>
        </div>

        {/* Add Word Quick Action */}
        <button
          onClick={() => setIsAddWordModalOpen(true)}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all min-h-[36px]"
          title="Thêm từ vựng mới"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Thêm từ</span>
        </button>

        {/* User Profile Avatar */}
        <div 
          className="w-8 h-8 rounded-full bg-slate-100 border border-gray-200 flex items-center justify-center text-sm font-bold shadow-xs select-none ml-1"
          title={`${userProfile.name} (${userProfile.email})`}
        >
          {userProfile.avatar}
        </div>
      </div>
    </header>
  );
};
