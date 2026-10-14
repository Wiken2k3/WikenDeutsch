// src/components/BottomNavBar.tsx
import React from 'react';
import { useVocab } from '../context/VocabContext';
import { 
  Home, 
  BookOpen, 
  Layers, 
  HelpCircle, 
  Menu
} from 'lucide-react';

interface BottomNavBarProps {
  onOpenMobileMenu: () => void;
}

interface TabItem {
  id: 'dashboard' | 'sets' | 'study' | 'quiz';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ onOpenMobileMenu }) => {
  const { activeTab, setActiveTab, vocabulary } = useVocab();

  const dueCount = vocabulary.filter(w => w.srsLevel > 0 && w.nextReviewDate <= Date.now()).length;

  const tabs: TabItem[] = [
    { id: 'dashboard', label: 'Trang chủ', icon: Home },
    { id: 'sets', label: 'Kho từ', icon: BookOpen },
    { id: 'study', label: 'Lật thẻ', icon: Layers, badge: dueCount > 0 ? dueCount : undefined },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150 min-h-[48px] min-w-[56px]
                ${isActive ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900 font-medium'}
              `}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 stroke-[2.5]' : 'text-gray-400 stroke-2'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}

        {/* More / Menu Button */}
        <button
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-gray-500 hover:text-gray-900 font-medium transition-all min-h-[48px] min-w-[56px]"
        >
          <Menu className="w-5 h-5 text-gray-400 stroke-2" />
          <span className="text-[11px] mt-0.5">Khác</span>
        </button>
      </div>
    </nav>
  );
};
