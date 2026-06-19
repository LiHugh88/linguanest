// 简单的 LocalStorage 包装工具
const PREFIX = 'linguanest:';

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch (e) {
      return defaultValue;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage set error:', e);
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch (e) {
      console.error('Storage remove error:', e);
    }
  },
};

export const todayStr = (): string => new Date().toISOString().slice(0, 10);

export const randomId = (): string =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);
