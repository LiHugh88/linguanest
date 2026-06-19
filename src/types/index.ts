export type LanguageCode = 'en' | 'ja' | 'ko';

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  targetLanguage: LanguageCode;
  level: Level;
  exp: number;
  unlockedAchievements: string[];
  createdAt: string;
  learnedLanguages: LanguageCode[];
}

export interface Course {
  id: string;
  language: LanguageCode;
  level: Level;
  title: string;
  description: string;
  icon: string;
  totalLessons: number;
  tags: string[];
}

export interface VocabItem {
  id: string;
  courseId: string;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
  language: LanguageCode;
}

export interface GrammarQuestion {
  id: string;
  courseId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  language: LanguageCode;
}

export interface SpeakingItem {
  id: string;
  courseId: string;
  sentence: string;
  translation: string;
  phonetic: string;
  language: LanguageCode;
}

export interface ListeningItem {
  id: string;
  courseId: string;
  audioText: string;
  translation: string;
  hint: string;
  language: LanguageCode;
}

export interface LearningRecord {
  id: string;
  userId: string;
  courseId: string;
  moduleType: 'vocab' | 'grammar' | 'speaking' | 'listening';
  correctCount: number;
  totalCount: number;
  durationSec: number;
  date: string;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  language: LanguageCode | 'multi';
  likes: number;
  likedBy: string[];
  comments: Comment[];
  createdAt: string;
}

export interface Comment {
  id: string;
  username: string;
  avatar: string;
  content: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  expReward: number;
}

export interface DailyStats {
  date: string;
  minutes: number;
  itemsLearned: number;
  accuracy: number;
}
