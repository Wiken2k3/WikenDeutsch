// src/components/Sidebar.tsx
import React from 'react';
import { useVocab } from '../context/VocabContext';
import { 
  Home, 
  BookOpen, 
  Layers, 
  HelpCircle, 
  Gamepad2, 
  Keyboard, 
  BarChart3, 
  Settings, 
  Flame, 
  Award,
  Sparkles,
  X
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: 'dashboard' | 'sets' | 'study' | 'quiz' | 'match' | 'spell' | 'analytics' | 'settings';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, userProfile, vocabulary } = useVocab();

  // Calculate SRS stats for badges
  const dueCount = vocabulary.filter(w => w.srsLevel > 0 && w.nextReviewDate <= Date.now()).length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Trang chủ', icon: Home },
    { id: 'sets', label: 'Kho bộ từ (412)', icon: BookOpen, badge: `${vocabulary.length}` },
    { id: 'study', label: 'Lật thẻ 3D (SRS)', icon: Layers, badge: dueCount > 0 ? `${dueCount} cần ôn` : undefined, badgeColor: 'bg-amber-100 text-amber-800 border border-amber-200' },
    { id: 'quiz', label: 'Luyện tập Quiz', icon: HelpCircle },
    { id: 'match', label: 'Game Nối từ', icon: Gamepad2 },
    { id: 'spell', label: 'Game Nghe & Gõ', icon: Keyboard },
    { id: 'analytics', label: 'Thống kê ghi nhớ', icon: BarChart3 },
    { id: 'settings', label: 'Cài đặt & Dữ liệu', icon: Settings },
  ];

  const handleNavClick = (tab: NavItem['id']) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop for slide-over drawer */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-gray-900/40 z-50 md:hidden backdrop-blur-xs transition-opacity duration-200"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 md:static w-64 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-250 ease-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-lg text-white shadow-xs">
                🇩🇪
              </div>
              <div>
                <div className="font-extrabold text-sm tracking-tight text-gray-900 flex items-center gap-1.5">
                  WunderDeutsch
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    A2-B1
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 font-medium">
                  Duolingo × Anki SRS
                </div>
              </div>
            </div>

            {/* Mobile close button */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group min-h-[44px]
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 font-bold' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-105 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${item.badgeColor || (isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600')}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Motivation Card / Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Cấp {userProfile.level} • {userProfile.name}
              </span>
              <span className="text-[11px] font-semibold text-blue-600">
                {userProfile.xp % 100}/100 XP
              </span>
            </div>

            {/* Level Progress Bar */}
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mb-2.5">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(userProfile.xp % 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <div className="flex items-center gap-1 text-amber-700 font-semibold">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{userProfile.streak} ngày</span>
              </div>
              <span>{userProfile.todayReviewedCount}/{userProfile.dailyGoal} từ hôm nay</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
