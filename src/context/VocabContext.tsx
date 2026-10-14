// src/context/VocabContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { VocabularyItem, VocabularySet, UserProfile, StudyMode } from '../types';
import { INITIAL_VOCABULARY } from '../data/initialVocabulary';
import { INITIAL_SETS } from '../data/initialSets';
import { calculateSRS, Rating } from '../utils/srs';
import confetti from 'canvas-confetti';
import { playChimeSound } from '../utils/audio';

interface VocabContextType {
  vocabulary: VocabularyItem[];
  sets: VocabularySet[];
  userProfile: UserProfile;
  darkMode: boolean;
  activeTab: 'dashboard' | 'sets' | 'study' | 'quiz' | 'match' | 'spell' | 'analytics' | 'settings';
  activeSetId: string | null;
  searchQuery: string;
  selectedWordForDetail: VocabularyItem | null;
  isCreateSetModalOpen: boolean;
  isAddWordModalOpen: boolean;
  editingWord: VocabularyItem | null;

  // Actions
  setDarkMode: (value: boolean | ((prev: boolean) => boolean)) => void;
  setActiveTab: (tab: 'dashboard' | 'sets' | 'study' | 'quiz' | 'match' | 'spell' | 'analytics' | 'settings') => void;
  setActiveSetId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedWordForDetail: (word: VocabularyItem | null) => void;
  setIsCreateSetModalOpen: (open: boolean) => void;
  setIsAddWordModalOpen: (open: boolean) => void;
  setEditingWord: (word: VocabularyItem | null) => void;

  rateWord: (wordId: string, rating: Rating) => void;
  toggleFavorite: (wordId: string) => void;
  addWord: (word: Omit<VocabularyItem, 'id' | 'srsLevel' | 'nextReviewDate' | 'intervalDays' | 'easeFactor' | 'repetitionCount'>) => void;
  updateWord: (word: VocabularyItem) => void;
  deleteWord: (wordId: string) => void;

  createSet: (set: Omit<VocabularySet, 'id'>) => void;
  updateSet: (set: VocabularySet) => void;
  deleteSet: (setId: string) => void;

  completeStudySession: (earnedXp: number, correctCount: number, wrongCount: number) => void;
  updateUserProfile: (partial: Partial<UserProfile>) => void;
  refillHearts: () => void;
  useHeart: () => boolean;
  resetAllProgress: () => void;
  resetSRSProgress: () => void;
  restoreDefaultData: () => void;
  exportDataAsJson: () => string;
  importDataFromJson: (jsonStr: string) => boolean;
}

const STORAGE_KEYS = {
  VOCAB: 'wunderdeutsch_vocab_v1',
  SETS: 'wunderdeutsch_sets_v1',
  USER: 'wunderdeutsch_user_v1',
  DARK: 'wunderdeutsch_dark_v1'
};

const getTodayString = () => new Date().toISOString().split('T')[0];

const defaultUserProfile: UserProfile = {
  name: 'Alex Nguyễn',
  email: 'alex.deutsch@example.com',
  avatar: '🇩🇪',
  streak: 7,
  lastStudyDate: getTodayString(),
  xp: 450,
  level: 4,
  gems: 180,
  hearts: 5,
  maxHearts: 5,
  dailyGoal: 20,
  todayReviewedCount: 16,
  speechRate: 0.9,
  soundEnabled: true,
  autoPronounce: true
};

const VocabContext = createContext<VocabContextType | undefined>(undefined);

export const VocabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial data
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.VOCAB);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading vocabulary from localStorage', e);
    }
    return INITIAL_VOCABULARY;
  });

  const [sets, setSets] = useState<VocabularySet[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading sets from localStorage', e);
    }
    return INITIAL_SETS;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading user profile from localStorage', e);
    }
    return defaultUserProfile;
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DARK);
      if (stored !== null) return JSON.parse(stored);
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return true;
      }
    } catch {
      // fallback
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'sets' | 'study' | 'quiz' | 'match' | 'spell' | 'analytics' | 'settings'>('dashboard');
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWordForDetail, setSelectedWordForDetail] = useState<VocabularyItem | null>(null);
  const [isCreateSetModalOpen, setIsCreateSetModalOpen] = useState<boolean>(false);
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState<boolean>(false);
  const [editingWord, setEditingWord] = useState<VocabularyItem | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VOCAB, JSON.stringify(vocabulary));
    } catch (e) {
      console.error('Error saving vocabulary', e);
    }
  }, [vocabulary]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETS, JSON.stringify(sets));
    } catch (e) {
      console.error('Error saving sets', e);
    }
  }, [sets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userProfile));
    } catch (e) {
      console.error('Error saving user profile', e);
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DARK, JSON.stringify(darkMode));
    } catch {}
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Streak verification on mount
  useEffect(() => {
    const today = getTodayString();
    if (userProfile.lastStudyDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (userProfile.lastStudyDate === yesterdayStr) {
        // Last studied yesterday: keep streak, reset daily reviewed
        setUserProfile(prev => ({
          ...prev,
          todayReviewedCount: 0
        }));
      } else {
        // Missed more than a day
        setUserProfile(prev => ({
          ...prev,
          todayReviewedCount: 0
        }));
      }
    }
  }, []);

  const rateWord = (wordId: string, rating: Rating) => {
    setVocabulary(prev =>
      prev.map(item => {
        if (item.id === wordId) {
          const srsUpdate = calculateSRS(item, rating);
          return { ...item, ...srsUpdate };
        }
        return item;
      })
    );

    // Update daily review count & XP
    const gainedXp = rating === 'again' ? 2 : rating === 'hard' ? 5 : rating === 'good' ? 10 : 15;
    setUserProfile(prev => {
      const newXp = prev.xp + gainedXp;
      const newLevel = Math.floor(newXp / 100) + 1;
      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        todayReviewedCount: prev.todayReviewedCount + 1,
        lastStudyDate: getTodayString()
      };
    });
  };

  const toggleFavorite = (wordId: string) => {
    setVocabulary(prev =>
      prev.map(w => (w.id === wordId ? { ...w, isFavorite: !w.isFavorite } : w))
    );
  };

  const addWord = (newWordData: Omit<VocabularyItem, 'id' | 'srsLevel' | 'nextReviewDate' | 'intervalDays' | 'easeFactor' | 'repetitionCount'>) => {
    const newItem: VocabularyItem = {
      ...newWordData,
      id: `custom-word-${Date.now()}`,
      srsLevel: 0,
      nextReviewDate: Date.now(),
      intervalDays: 0,
      easeFactor: 2.5,
      repetitionCount: 0,
      isFavorite: false
    };
    setVocabulary(prev => [newItem, ...prev]);
  };

  const updateWord = (updatedWord: VocabularyItem) => {
    setVocabulary(prev => prev.map(w => (w.id === updatedWord.id ? updatedWord : w)));
  };

  const deleteWord = (wordId: string) => {
    setVocabulary(prev => prev.filter(w => w.id !== wordId));
  };

  const createSet = (newSetData: Omit<VocabularySet, 'id'>) => {
    const newSet: VocabularySet = {
      ...newSetData,
      id: `custom-set-${Date.now()}`,
      createdAt: Date.now()
    };
    setSets(prev => [...prev, newSet]);
  };

  const updateSet = (updatedSet: VocabularySet) => {
    setSets(prev => prev.map(s => (s.id === updatedSet.id ? updatedSet : s)));
  };

  const deleteSet = (setId: string) => {
    setSets(prev => prev.filter(s => s.id !== setId));
    // Re-assign or remove set words if needed
    if (activeSetId === setId) {
      setActiveSetId(null);
    }
  };

  const completeStudySession = (earnedXp: number, correctCount: number, wrongCount: number) => {
    playChimeSound('complete');
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setUserProfile(prev => {
      const newXp = prev.xp + earnedXp;
      const newLevel = Math.floor(newXp / 100) + 1;
      const today = getTodayString();
      const isNewDay = prev.lastStudyDate !== today;
      const newStreak = isNewDay ? prev.streak + 1 : prev.streak;

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        gems: prev.gems + Math.floor(earnedXp / 10),
        streak: newStreak,
        lastStudyDate: today,
        todayReviewedCount: prev.todayReviewedCount + correctCount + wrongCount
      };
    });
  };

  const useHeart = (): boolean => {
    if (userProfile.hearts <= 0) return false;
    setUserProfile(prev => ({
      ...prev,
      hearts: Math.max(0, prev.hearts - 1)
    }));
    return true;
  };

  const refillHearts = () => {
    if (userProfile.gems >= 20) {
      setUserProfile(prev => ({
        ...prev,
        gems: prev.gems - 20,
        hearts: prev.maxHearts
      }));
      playChimeSound('level-up');
    }
  };

  const updateUserProfile = (partial: Partial<UserProfile>) => {
    setUserProfile(prev => ({
      ...prev,
      ...partial
    }));
  };

  const resetSRSProgress = () => {
    setVocabulary(prev =>
      prev.map(w => ({
        ...w,
        srsLevel: 0,
        nextReviewDate: Date.now(),
        intervalDays: 0,
        repetitionCount: 0
      }))
    );
    setUserProfile(prev => ({
      ...prev,
      todayReviewedCount: 0
    }));
  };

  const resetAllProgress = () => {
    resetSRSProgress();
    setUserProfile(prev => ({
      ...prev,
      xp: 0,
      level: 1,
      todayReviewedCount: 0,
      hearts: prev.maxHearts
    }));
  };

  const restoreDefaultData = () => {
    setVocabulary(INITIAL_VOCABULARY);
    setSets(INITIAL_SETS);
    setUserProfile(defaultUserProfile);
  };

  const exportDataAsJson = (): string => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      userProfile,
      sets,
      vocabulary
    };
    return JSON.stringify(backupData, null, 2);
  };

  const importDataFromJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') return false;

      if (Array.isArray(parsed.vocabulary) && parsed.vocabulary.length > 0) {
        setVocabulary(parsed.vocabulary);
      }
      if (Array.isArray(parsed.sets) && parsed.sets.length > 0) {
        setSets(parsed.sets);
      }
      if (parsed.userProfile && typeof parsed.userProfile === 'object') {
        setUserProfile(prev => ({ ...prev, ...parsed.userProfile }));
      }
      playChimeSound('level-up');
      return true;
    } catch (e) {
      console.error('Failed to import JSON data', e);
      return false;
    }
  };

  return (
    <VocabContext.Provider
      value={{
        vocabulary,
        sets,
        userProfile,
        darkMode,
        activeTab,
        activeSetId,
        searchQuery,
        selectedWordForDetail,
        isCreateSetModalOpen,
        isAddWordModalOpen,
        editingWord,
        setDarkMode,
        setActiveTab,
        setActiveSetId,
        setSearchQuery,
        setSelectedWordForDetail,
        setIsCreateSetModalOpen,
        setIsAddWordModalOpen,
        setEditingWord,
        rateWord,
        toggleFavorite,
        addWord,
        updateWord,
        deleteWord,
        createSet,
        updateSet,
        deleteSet,
        completeStudySession,
        updateUserProfile,
        refillHearts,
        useHeart,
        resetAllProgress,
        resetSRSProgress,
        restoreDefaultData,
        exportDataAsJson,
        importDataFromJson
      }}
    >
      {children}
    </VocabContext.Provider>
  );
};

export const useVocab = () => {
  const context = useContext(VocabContext);
  if (!context) {
    throw new Error('useVocab must be used within a VocabProvider');
  }
  return context;
};
