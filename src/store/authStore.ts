import { create } from 'zustand';
import type { User, LanguageCode, Level } from '../types';
import { storage, randomId, todayStr } from '../utils/storage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  register: (username: string, email: string, password: string) => { ok: boolean; message: string };
  login: (email: string, password: string) => { ok: boolean; message: string };
  logout: () => void;
  updateProfile: (patch: Partial<Pick<User, 'username' | 'avatar' | 'targetLanguage' | 'level'>>) => void;
  addExp: (amount: number) => void;
  unlockAchievement: (id: string) => void;
  addLearnedLanguage: (lang: LanguageCode) => void;
}

interface CredentialsRecord {
  email: string;
  password: string;
  userId: string;
}

// 读取所有用户（模拟账户数据库）
const getAllCredentials = (): CredentialsRecord[] => storage.get<CredentialsRecord[]>('credentials', []);
const saveAllCredentials = (list: CredentialsRecord[]) => storage.set('credentials', list);

// 默认用户数据
const defaultUser = (username: string, email: string): User => ({
  id: randomId(),
  username,
  email,
  avatar: ['🦊', '🐼', '🐯', '🐨', '🦁', '🦉', '🐙', '🦄'][Math.floor(Math.random() * 8)],
  targetLanguage: 'en',
  level: 'A1',
  exp: 0,
  unlockedAchievements: [],
  createdAt: todayStr(),
  learnedLanguages: [],
});

export const useAuthStore = create<AuthState>((set, get) => ({
  user: storage.get<User | null>('currentUser', null),
  isAuthenticated: storage.get<User | null>('currentUser', null) !== null,

  register(username, email, password) {
    const credentials = getAllCredentials();
    if (credentials.find((c) => c.email === email)) {
      return { ok: false, message: '该邮箱已被注册' };
    }
    const user = defaultUser(username, email);
    credentials.push({ email, password, userId: user.id });
    saveAllCredentials(credentials);
    // 单独保存用户资料（便于按 id 查找）
    storage.set<User>('user_' + user.id, user);
    storage.set<User>('currentUser', user);
    set({ user, isAuthenticated: true });
    return { ok: true, message: '注册成功！' };
  },

  login(email, password) {
    const credentials = getAllCredentials();
    const record = credentials.find((c) => c.email === email && c.password === password);
    if (!record) {
      // 尝试从 currentUser 恢复（简化登录体验）
      const current = storage.get<User | null>('currentUser', null);
      if (current && current.email === email) {
        set({ user: current, isAuthenticated: true });
        return { ok: true, message: '登录成功！' };
      }
      return { ok: false, message: '邮箱或密码错误' };
    }
    const user = storage.get<User | null>('user_' + record.userId, null);
    if (!user) return { ok: false, message: '用户数据不存在，请重新注册' };
    storage.set<User>('currentUser', user);
    set({ user, isAuthenticated: true });
    return { ok: true, message: '登录成功！' };
  },

  logout() {
    storage.remove('currentUser');
    set({ user: null, isAuthenticated: false });
  },

  updateProfile(patch) {
    const { user } = get();
    if (!user) return;
    const updated: User = { ...user, ...patch };
    storage.set<User>('user_' + user.id, updated);
    storage.set<User>('currentUser', updated);
    set({ user: updated });
  },

  addExp(amount) {
    const { user } = get();
    if (!user) return;
    const updated: User = { ...user, exp: user.exp + amount };
    storage.set<User>('user_' + user.id, updated);
    storage.set<User>('currentUser', updated);
    set({ user: updated });
  },

  unlockAchievement(id) {
    const { user } = get();
    if (!user || user.unlockedAchievements.includes(id)) return;
    const updated: User = {
      ...user,
      unlockedAchievements: [...user.unlockedAchievements, id],
    };
    storage.set<User>('user_' + user.id, updated);
    storage.set<User>('currentUser', updated);
    set({ user: updated });
  },

  addLearnedLanguage(lang) {
    const { user } = get();
    if (!user) return;
    if (user.learnedLanguages.includes(lang)) return;
    const updated: User = {
      ...user,
      learnedLanguages: [...user.learnedLanguages, lang],
    };
    storage.set<User>('user_' + user.id, updated);
    storage.set<User>('currentUser', updated);
    set({ user: updated });
  },
}));
