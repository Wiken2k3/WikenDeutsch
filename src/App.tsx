// src/App.tsx
import React, { useState } from 'react';
import { VocabProvider, useVocab } from './context/VocabContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { RightPanel } from './components/RightPanel';
import { BottomNavBar } from './components/BottomNavBar';
import { Dashboard } from './components/Dashboard';
import { SetsLibrary } from './components/SetsLibrary';
import { Flashcard } from './components/Flashcard';
import { QuizView } from './components/QuizView';
import { MatchGame } from './components/MatchGame';
import { TypeSpellGame } from './components/TypeSpellGame';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { AIAssistantModal } from './components/AIAssistantModal';
import { CreateWordModal } from './components/CreateWordModal';
import { CreateSetModal } from './components/CreateSetModal';

const MainLayout: React.FC = () => {
  const { activeTab } = useVocab();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'sets':
        return <SetsLibrary />;
      case 'study':
        return <Flashcard />;
      case 'quiz':
        return <QuizView />;
      case 'match':
        return <MatchGame />;
      case 'spell':
        return <TypeSpellGame />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F9FAFB] text-gray-900 transition-colors">
      {/* 1. Left Sidebar (Fixed on Desktop, Slide-over on Mobile) */}
      <Sidebar 
        isMobileOpen={isMobileMenuOpen} 
        onCloseMobile={() => setIsMobileMenuOpen(false)} 
      />

      {/* 2. Middle Main Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header */}
        <Header />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 overflow-y-auto max-w-5xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* 3. Right Drawer / Panel (Shown on Desktop XL) */}
      <RightPanel />

      {/* 4. Mobile Bottom Navigation Bar (Visible on Mobile < 768px) */}
      <BottomNavBar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

      {/* Global Modals */}
      <AIAssistantModal />
      <CreateWordModal />
      <CreateSetModal />
    </div>
  );
};

export default function App() {
  return (
    <VocabProvider>
      <MainLayout />
    </VocabProvider>
  );
}
