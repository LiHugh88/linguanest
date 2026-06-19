import { useNavigate } from 'react-router-dom';
import { Trophy, Flame, Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import { achievements } from '../data/achievements';
import AchievementBadge from '../components/AchievementBadge';

const LEVEL_THRESHOLDS = [
  { level: 'A1', name: '语言新手', exp: 0 },
  { level: 'A2', name: '初学者', exp: 100 },
  { level: 'B1', name: '进阶学者', exp: 300 },
  { level: 'B2', name: '熟练者', exp: 600 },
  { level: 'C1', name: '高级用户', exp: 1000 },
  { level: 'C2', name: '语言大师', exp: 2000 },
];

export default function Achievements() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const learning = useLearningStore();

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 animate-slideUp">
        <div className="text-6xl mb-6">🔒</div>
        <h2 className="text-2xl font-bold mb-3 text-ink-100">登录后查看成就</h2>
        <p className="text-ink-400 mb-8">登录以解锁和查看你的成就徽章墙。</p>
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-3 rounded-2xl bg-gold-500 hover:bg-gold-400 text-ink-950 font-semibold transition shadow-lg"
        >
          立即登录
        </button>
      </div>
    );
  }

  const unlocked = user.unlockedAchievements;
  const streak = learning.getStreak();
  const totalExp = user.exp;

  // 当前等级
  const currentLevelIdx = [...LEVEL_THRESHOLDS].reverse().findIndex(t => totalExp >= t.exp);
  const current = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1 - currentLevelIdx] ?? LEVEL_THRESHOLDS[0];
  const next = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1 - currentLevelIdx - 1] ?? null;
  const progress = next
    ? Math.round(((totalExp - current.exp) / (next.exp - current.exp)) * 100)
    : 100;

  // 按类别分组
  const categorized = {
    初学: achievements.filter(a => ['first-lesson', 'speaking-first', 'listening-first'].includes(a.id)),
    坚持: achievements.filter(a => ['streak-3', 'streak-7', 'streak-30'].includes(a.id)),
    词汇: achievements.filter(a => ['vocab-10', 'vocab-100'].includes(a.id)),
    语法: achievements.filter(a => ['grammar-10', 'grammar-50'].includes(a.id)),
    挑战: achievements.filter(a => ['perfect-score'].includes(a.id)),
    探索: achievements.filter(a => ['polyglot', 'community-post'].includes(a.id)),
  };

  return (
    <div className="space-y-8 animate-slideUp">
      {/* 头部 */}
      <div>
        <h1 className="text-3xl font-bold text-ink-100 mb-2 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-gold-400" />
          成就激励
        </h1>
        <p className="text-ink-400">每一次坚持都会被看见 🌟</p>
      </div>

      {/* 等级进度 */}
      <div className="rounded-3xl bg-gradient-to-br from-gold-500/10 via-ink-800/60 to-violet-500/10 border border-gold-500/30 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500/30 to-gold-400/10 border border-gold-500/50 flex items-center justify-center text-3xl shadow-lg shadow-gold-500/10">
            🏆
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gold-300 font-semibold">{current.name}</span>
              <span className="text-xs text-ink-400">{totalExp} / {next ? next.exp : current.exp} EXP</span>
            </div>
            <div className="h-3 bg-ink-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-ink-500">
              <span>{current.exp} EXP</span>
              <span>{next ? `距 ${next.name} 还差 ${next.exp - totalExp} EXP` : '已满级'}</span>
            </div>
          </div>
        </div>

        {/* 等级徽章 */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {LEVEL_THRESHOLDS.map((t, i) => {
            const isActive = i === LEVEL_THRESHOLDS.length - 1 - currentLevelIdx;
            const isPast = totalExp > t.exp;
            return (
              <div
                key={t.level}
                className={`p-2 rounded-xl text-center border transition ${
                  isActive
                    ? 'bg-gold-500/20 border-gold-500/50'
                    : isPast
                    ? 'bg-ink-900/50 border-ink-700'
                    : 'bg-ink-900/30 border-ink-800 opacity-40'
                }`}
              >
                <div className={`text-xl mb-1 ${isPast || isActive ? '' : 'grayscale'}`}>🏅</div>
                <div className={`text-[10px] font-semibold ${isActive ? 'text-gold-300' : 'text-ink-400'}`}>{t.level}</div>
                <div className="text-[9px] text-ink-500">{t.exp}+</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 快速统计 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-ink-800/60 border border-ink-700 text-center">
          <Trophy className="w-6 h-6 text-gold-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-ink-100">{unlocked.length}</div>
          <div className="text-xs text-ink-400">已解锁</div>
        </div>
        <div className="p-4 rounded-2xl bg-ink-800/60 border border-ink-700 text-center">
          <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-ink-100">{streak}</div>
          <div className="text-xs text-ink-400">连续天数</div>
        </div>
        <div className="p-4 rounded-2xl bg-ink-800/60 border border-ink-700 text-center">
          <Zap className="w-6 h-6 text-sky-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-ink-100">{totalExp}</div>
          <div className="text-xs text-ink-400">经验值</div>
        </div>
      </div>

      {/* 成就分类 */}
      {Object.entries(categorized).map(([cat, items]) => (
        <div key={cat}>
          <h3 className="text-base font-semibold text-ink-100 mb-3 flex items-center gap-2">
            {cat === '初学' && '🎯'} {cat === '坚持' && '🔥'} {cat === '词汇' && '📖'}
            {cat === '语法' && '✏️'} {cat === '挑战' && '💯'} {cat === '探索' && '🌍'}
            {cat}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((a) => (
              <AchievementBadge key={a.id} achievement={a} unlocked={unlocked.includes(a.id)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
