import { create } from 'zustand';
import type { LearningRecord, DailyStats, LanguageCode, Post } from '../types';
import { storage, todayStr, randomId } from '../utils/storage';

interface LearningState {
  records: LearningRecord[];
  stats: DailyStats[];
  posts: Post[];
  masteredVocabIds: string[];
  correctGrammarCount: number;
  completedSpeaking: boolean;
  completedListening: boolean;
  perfectScoreDone: boolean;

  addRecord: (rec: Omit<LearningRecord, 'id' | 'date' | 'userId'>) => void;
  getStreak: () => number;
  getTotalItems: () => number;
  getAccuracy: () => number;
  getLearnedLanguages: () => LanguageCode[];
  markVocabMastered: (id: string) => void;

  // 社区
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'likedBy' | 'comments'>) => void;
  toggleLike: (postId: string, userId: string) => void;
  addComment: (postId: string, comment: Omit<Post['comments'][number], 'id' | 'createdAt'>) => void;

  resetAll: () => void;
}

const initRecords = (): LearningRecord[] => storage.get<LearningRecord[]>('records', []);
const initStats = (): DailyStats[] => storage.get<DailyStats[]>('stats', []);
const initPosts = (): Post[] => storage.get<Post[]>('posts', []);
const initMastered = (): string[] => storage.get<string[]>('masteredVocab', []);

// 默认社区动态示例数据
const DEFAULT_POSTS: Post[] = [
  {
    id: 'seed-post-1',
    userId: 'seed-user-1',
    username: '学习达人 Alex',
    avatar: '🦊',
    content: '今天完成了日语 A1 的第一课，五十音图真有趣！加油！🎌',
    language: 'ja',
    likes: 12,
    likedBy: [],
    comments: [
      { id: 'c1', username: '小林', avatar: '🐼', content: '加油！一起学！', createdAt: '2026-06-15' },
    ],
    createdAt: '2026-06-15',
  },
  {
    id: 'seed-post-2',
    userId: 'seed-user-2',
    username: '韩语爱好者',
    avatar: '🐯',
    content: '终于掌握了韩语的 은/는、이/가 区别，感觉自己进步了很多！💪',
    language: 'ko',
    likes: 8,
    likedBy: [],
    comments: [],
    createdAt: '2026-06-16',
  },
  {
    id: 'seed-post-3',
    userId: 'seed-user-3',
    username: 'English Learner',
    avatar: '🦉',
    content: '连续学习 7 天啦！坚持就是胜利！🔥',
    language: 'en',
    likes: 23,
    likedBy: [],
    comments: [
      { id: 'c2', username: '路人甲', avatar: '🐨', content: '太棒了！向你学习！', createdAt: '2026-06-16' },
    ],
    createdAt: '2026-06-16',
  },
];

// 懒初始化社区帖子
if (initPosts().length === 0) {
  storage.set<Post[]>('posts', DEFAULT_POSTS);
}

export const useLearningStore = create<LearningState>((set, get) => ({
  records: initRecords(),
  stats: initStats(),
  posts: storage.get<Post[]>('posts', []),
  masteredVocabIds: initMastered(),
  correctGrammarCount: storage.get<number>('correctGrammarCount', 0),
  completedSpeaking: storage.get<boolean>('completedSpeaking', false),
  completedListening: storage.get<boolean>('completedListening', false),
  perfectScoreDone: storage.get<boolean>('perfectScoreDone', false),

  addRecord(rec) {
    const userId = storage.get<import('../types').User | null>('currentUser', null)?.id ?? '';
    const record: LearningRecord = {
      ...rec,
      id: randomId(),
      userId,
      date: todayStr(),
    };
    const records = [record, ...get().records];
    // 更新 stats
    const stats = get().stats.slice();
    const existing = stats.findIndex((s) => s.date === record.date);
    if (existing >= 0) {
      const s = stats[existing];
      const totalItems = s.itemsLearned + rec.totalCount;
      const totalCorrect = Math.round(s.accuracy * s.itemsLearned) + rec.correctCount;
      stats[existing] = {
        date: s.date,
        minutes: s.minutes + Math.max(1, Math.round(rec.durationSec / 60)),
        itemsLearned: totalItems,
        accuracy: totalItems > 0 ? totalCorrect / totalItems : 0,
      };
    } else {
      stats.unshift({
        date: record.date,
        minutes: Math.max(1, Math.round(rec.durationSec / 60)),
        itemsLearned: rec.totalCount,
        accuracy: rec.totalCount > 0 ? rec.correctCount / rec.totalCount : 0,
      });
    }
    // 保存
    storage.set<LearningRecord[]>('records', records);
    storage.set<DailyStats[]>('stats', stats);
    set({ records, stats });
  },

  getStreak() {
    const stats = get().stats;
    if (stats.length === 0) return 0;
    const dates = new Set(stats.map((s) => s.date));
    let streak = 0;
    const cursor = new Date();
    // 如果今天没学习，从昨天开始算
    if (!dates.has(todayStr())) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (dates.has(cursor.toISOString().slice(0, 10))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  },

  getTotalItems() {
    return get().records.reduce((sum, r) => sum + r.totalCount, 0);
  },

  getAccuracy() {
    const { records } = get();
    const totalItems = records.reduce((sum, r) => sum + r.totalCount, 0);
    const totalCorrect = records.reduce((sum, r) => sum + r.correctCount, 0);
    return totalItems > 0 ? totalCorrect / totalItems : 0;
  },

  getLearnedLanguages() {
    const set = new Set<LanguageCode>();
    get().records.forEach((r) => {
      const lang = r.courseId.split('-')[0] as LanguageCode;
      if (['en', 'ja', 'ko'].includes(lang)) set.add(lang);
    });
    return Array.from(set);
  },

  markVocabMastered(id) {
    const ids = get().masteredVocabIds;
    if (ids.includes(id)) return;
    const next = [...ids, id];
    storage.set<string[]>('masteredVocab', next);
    set({ masteredVocabIds: next });
  },

  addPost(post) {
    const newPost: Post = {
      ...post,
      id: randomId(),
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: todayStr(),
    };
    const next = [newPost, ...get().posts];
    storage.set<Post[]>('posts', next);
    set({ posts: next });
  },

  toggleLike(postId, userId) {
    const next = get().posts.map((p) => {
      if (p.id !== postId) return p;
      const liked = p.likedBy.includes(userId);
      return {
        ...p,
        likes: liked ? p.likes - 1 : p.likes + 1,
        likedBy: liked ? p.likedBy.filter((u) => u !== userId) : [...p.likedBy, userId],
      };
    });
    storage.set<Post[]>('posts', next);
    set({ posts: next });
  },

  addComment(postId, comment) {
    const next = get().posts.map((p) => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: [
          ...p.comments,
          { ...comment, id: randomId(), createdAt: todayStr() },
        ],
      };
    });
    storage.set<Post[]>('posts', next);
    set({ posts: next });
  },

  resetAll() {
    storage.remove('records');
    storage.remove('stats');
    storage.remove('posts');
    storage.remove('masteredVocab');
    storage.remove('correctGrammarCount');
    storage.remove('completedSpeaking');
    storage.remove('completedListening');
    storage.remove('perfectScoreDone');
    // 重新植入默认帖子
    storage.set<Post[]>('posts', DEFAULT_POSTS);
    set({
      records: [],
      stats: [],
      posts: DEFAULT_POSTS,
      masteredVocabIds: [],
      correctGrammarCount: 0,
      completedSpeaking: false,
      completedListening: false,
      perfectScoreDone: false,
    });
  },
}));

// 语法正确计数单独方法（因为不能通过 store 内方法直接持久化自定义数据）
export const incrementGrammarCorrect = (): void => {
  const n = storage.get<number>('correctGrammarCount', 0) + 1;
  storage.set<number>('correctGrammarCount', n);
  useLearningStore.setState({ correctGrammarCount: n });
};

export const markCompletedSpeaking = (): void => {
  storage.set<boolean>('completedSpeaking', true);
  useLearningStore.setState({ completedSpeaking: true });
};

export const markCompletedListening = (): void => {
  storage.set<boolean>('completedListening', true);
  useLearningStore.setState({ completedListening: true });
};

export const markPerfectScore = (): void => {
  storage.set<boolean>('perfectScoreDone', true);
  useLearningStore.setState({ perfectScoreDone: true });
};
