export type Article = 'der' | 'die' | 'das' | 'der/die' | '';

export type WordType = 
  | 'Nomen' 
  | 'Verb' 
  | 'Verb Phr.' 
  | 'Adj.' 
  | 'Adv.' 
  | 'Konj.' 
  | 'Präp.' 
  | 'Indef.-Pron.' 
  | 'Pron.' 
  | 'Phr.' 
  | 'Interrog.' 
  | 'Modalverb'
  | 'akad. Titel'
  | 'Andere';

export interface VocabularyItem {
  id: string;
  german: string;          // e.g. "Biografie" or "erinnern (sich an)"
  displayGerman: string;   // e.g. "Biografie, die"
  article: Article;        // 'der' | 'die' | 'das' | 'der/die' | ''
  type: WordType;          // Nomen, Verb, etc.
  plural: string;          // e.g. "-n", "-e", "*-kein Pl.", etc.
  vietnamese: string;      // Meaning in Vietnamese
  example: string;         // Example sentence in German
  unitId: string;          // 'einheit-1' | 'einheit-2' | 'einheit-3' | 'station-1' | custom
  unitName: string;        // Friendly display name
  // SRS properties
  srsLevel: number;        // 0 to 5 (0: new, 1: learning, 2-3: review, 4-5: mastered)
  nextReviewDate: number;  // timestamp ms
  intervalDays: number;    // current interval
  easeFactor: number;      // default 2.5
  repetitionCount: number; // how many times reviewed
  lastReviewed?: number;   // timestamp ms
  isFavorite?: boolean;
}

export interface VocabularySet {
  id: string;
  title: string;
  germanTitle: string;
  description: string;
  icon: string;
  color: string;
  category: 'official' | 'custom';
  tags: string[];
  createdAt?: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  streak: number;
  lastStudyDate: string; // YYYY-MM-DD
  xp: number;
  level: number;
  gems: number;
  hearts: number;
  maxHearts: number;
  dailyGoal: number; // minutes or words
  todayReviewedCount: number;
  speechRate?: number;
  soundEnabled?: boolean;
  autoPronounce?: boolean;
}

export type StudyMode = 'flashcard' | 'quiz' | 'match' | 'type_spell' | 'list';

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice-meaning' | 'multiple-choice-article' | 'fill-blank';
  prompt: string;
  word: VocabularyItem;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface MatchPair {
  id: string;
  type: 'de' | 'vi';
  text: string;
  subtext?: string;
  matchedId: string;
  isMatched: boolean;
  isSelected: boolean;
  isError: boolean;
}
