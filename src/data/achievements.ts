import type { Achievement } from '../types';

export const achievements: Achievement[] = [
  { id: 'first-lesson', name: '初心者', description: '完成第一次学习，踏上语言之旅。', icon: '🎯', condition: '完成 1 次练习', expReward: 10 },
  { id: 'streak-3', name: '三日坚持', description: '连续学习 3 天，养成好习惯。', icon: '🔥', condition: '连续学习 3 天', expReward: 30 },
  { id: 'streak-7', name: '七日学者', description: '连续学习 7 天，成为自律的学习者。', icon: '⭐', condition: '连续学习 7 天', expReward: 80 },
  { id: 'streak-30', name: '月度之星', description: '连续学习 30 天，真正的语言达人。', icon: '🌟', condition: '连续学习 30 天', expReward: 300 },
  { id: 'vocab-10', name: '词汇新手', description: '掌握 10 个新单词。', icon: '📖', condition: '掌握 10 个单词', expReward: 20 },
  { id: 'vocab-100', name: '词汇达人', description: '掌握 100 个单词，形成稳定词汇量。', icon: '📚', condition: '掌握 100 个单词', expReward: 150 },
  { id: 'grammar-10', name: '语法起步', description: '正确回答 10 道语法题。', icon: '✏️', condition: '语法答对 10 题', expReward: 20 },
  { id: 'grammar-50', name: '语法专家', description: '正确回答 50 道语法题。', icon: '🎓', condition: '语法答对 50 题', expReward: 120 },
  { id: 'perfect-score', name: '完美表现', description: '在任意练习中获得满分。', icon: '💯', condition: '单次练习全对', expReward: 50 },
  { id: 'polyglot', name: '多语者', description: '学习过 2 种及以上语言。', icon: '🌍', condition: '学习过 2 种语言', expReward: 200 },
  { id: 'community-post', name: '活跃分享者', description: '发布第一条社区动态。', icon: '💬', condition: '发布第一条动态', expReward: 20 },
  { id: 'speaking-first', name: '开口说', description: '完成第一次口语跟读练习。', icon: '🎤', condition: '完成口语练习', expReward: 30 },
  { id: 'listening-first', name: '耳听八方', description: '完成第一次听力练习。', icon: '👂', condition: '完成听力练习', expReward: 30 },
];
