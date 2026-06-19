import { useNavigate } from 'react-router-dom';
import { BarChart3, Flame, BookOpen, Target, Calendar } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';

export default function Progress() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const learning = useLearningStore();

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 animate-slideUp">
        <div className="text-6xl mb-6">🔒</div>
        <h2 className="text-2xl font-bold mb-3 text-ink-100">登录后查看学习进度</h2>
        <p className="text-ink-400 mb-8">登录以追踪学习数据、查看连续天数和正确率。</p>
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-3 rounded-2xl bg-gold-500 hover:bg-gold-400 text-ink-950 font-semibold transition shadow-lg"
        >
          立即登录
        </button>
      </div>
    );
  }

  const streak = learning.getStreak();
  const totalItems = learning.getTotalItems();
  const accuracy = learning.getAccuracy();
  const learnedLangs = learning.getLearnedLanguages();

  const moduleStats = [
    { label: '单词记忆', key: 'vocab' as const, icon: '📖', count: learning.records.filter(r => r.moduleType === 'vocab').length },
    { label: '语法练习', key: 'grammar' as const, icon: '✏️', count: learning.records.filter(r => r.moduleType === 'grammar').length },
    { label: '口语跟读', key: 'speaking' as const, icon: '🎤', count: learning.records.filter(r => r.moduleType === 'speaking').length },
    { label: '听力训练', key: 'listening' as const, icon: '👂', count: learning.records.filter(r => r.moduleType === 'listening').length },
  ];

  const totalCorrect = learning.records.reduce((sum, r) => sum + r.correctCount, 0);
  const totalAttempts = learning.records.reduce((sum, r) => sum + r.totalCount, 0);
  const totalMinutes = learning.records.reduce((sum, r) => sum + Math.max(1, Math.round(r.durationSec / 60)), 0);

  return (
    <div className="space-y-8 animate-slideUp">
      {/* 头部 */}
      <div>
        <h1 className="text-3xl font-bold text-ink-100 mb-2 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-gold-400" />
          学习进度
        </h1>
        <p className="text-ink-400">追踪你的学习足迹，见证每一步成长 📊</p>
      </div>

      {/* 核心统计 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Flame className="w-6 h-6" />} iconColor="text-orange-400" label="连续学习" value={streak} suffix="天" />
        <StatCard icon={<BookOpen className="w-6 h-6" />} iconColor="text-emerald-400" label="已学条目" value={totalItems} suffix="条" />
        <StatCard icon={<Target className="w-6 h-6" />} iconColor="text-sky-400" label="总正确数" value={totalCorrect} suffix="题" />
        <StatCard icon={<Calendar className="w-6 h-6" />} iconColor="text-violet-400" label="总学习时长" value={totalMinutes} suffix="分钟" />
      </div>

      {/* 正确率总览 */}
      <div className="rounded-3xl bg-ink-800/60 border border-ink-700 p-6">
        <h3 className="text-lg font-semibold text-ink-100 mb-4">综合正确率</h3>
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#1f2937" strokeWidth="10" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="#E4B44A" strokeWidth="10"
                strokeDasharray={`${(accuracy * 100 * 2.64).toFixed(0)} 264`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gold-400">{Math.round(accuracy * 100)}</span>
              <span className="text-xs text-ink-400">%</span>
            </div>
          </div>
          <div className="space-y-3 w-full">
            <div className="flex justify-between text-sm">
              <span className="text-ink-300">正确数</span>
              <span className="text-emerald-400 font-semibold">{totalCorrect} 题</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-300">总题数</span>
              <span className="text-ink-100 font-semibold">{totalAttempts} 题</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-300">学习语言</span>
              <span className="text-ink-100 font-semibold">{learnedLangs.length} 种</span>
            </div>
            <div className="mt-2">
              <div className="h-2 bg-ink-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full transition-all"
                  style={{ width: `${Math.round(accuracy * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 各模块统计 */}
      <div className="rounded-3xl bg-ink-800/60 border border-ink-700 p-6">
        <h3 className="text-lg font-semibold text-ink-100 mb-4">各模块练习次数</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {moduleStats.map((m) => (
            <div key={m.key} className="p-4 rounded-2xl bg-ink-900/50 border border-ink-700 text-center">
              <div className="text-2xl mb-2">{m.icon}</div>
              <div className="text-sm text-ink-100 font-medium mb-1">{m.label}</div>
              <div className="text-xl font-bold text-gold-400">{m.count}</div>
              <div className="text-[10px] text-ink-500">次练习</div>
            </div>
          ))}
        </div>
      </div>

      {/* 14天热力图 */}
      <div className="rounded-3xl bg-ink-800/60 border border-ink-700 p-6">
        <h3 className="text-lg font-semibold text-ink-100 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gold-400" /> 最近 14 天学习记录
        </h3>
        {learning.stats.length === 0 ? (
          <div className="text-center py-10 text-ink-400 text-sm">
            还没有学习记录，从课程中心开始你的第一次学习吧！
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {learning.stats.slice(0, 14).map((s) => {
              const intensity = Math.min(1, s.minutes / 30);
              return (
                <div
                  key={s.date}
                  className="p-3 rounded-2xl border border-ink-700 text-center"
                  style={{ background: `rgba(250,204,21,${0.08 + intensity * 0.25})` }}
                >
                  <div className="text-xs text-ink-400 mb-1">{s.date.slice(5)}</div>
                  <div className="text-lg font-bold text-gold-300">{s.minutes}分</div>
                  <div className="text-xs text-ink-500">{s.itemsLearned}条</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 最近练习记录 */}
      {learning.records.length > 0 && (
        <div className="rounded-3xl bg-ink-800/60 border border-ink-700 p-6">
          <h3 className="text-lg font-semibold text-ink-100 mb-4">最近练习记录</h3>
          <div className="space-y-3">
            {learning.records.slice(0, 8).map((r) => {
              const moduleName: Record<string, string> = {
                vocab: '单词记忆', grammar: '语法练习',
                speaking: '口语跟读', listening: '听力训练',
              };
              const rate = r.totalCount > 0 ? Math.round((r.correctCount / r.totalCount) * 100) : 0;
              return (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-2xl bg-ink-900/50 border border-ink-700/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                      rate >= 80 ? 'bg-emerald-500/20' : rate >= 50 ? 'bg-gold-500/20' : 'bg-rose-500/20'
                    }`}>
                      {rate >= 80 ? '🌟' : rate >= 50 ? '📚' : '💪'}
                    </div>
                    <div>
                      <div className="font-medium text-ink-100">{moduleName[r.moduleType]}</div>
                      <div className="text-xs text-ink-500">{r.date} · 约 {Math.max(1, Math.round(r.durationSec / 60))} 分钟</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gold-400">{r.correctCount}/{r.totalCount}</div>
                    <div className="text-xs text-ink-500">{rate}% 正确</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, iconColor, label, value, suffix }: {
  icon: React.ReactNode; iconColor: string; label: string; value: number; suffix: string
}) {
  return (
    <div className="p-5 rounded-3xl bg-ink-800/60 border border-ink-700 hover:border-ink-600 transition">
      <div className={`mb-2 ${iconColor}`}>{icon}</div>
      <div className="text-sm text-ink-400">{label}</div>
      <div className="mt-1">
        <span className="text-2xl font-bold text-ink-100">{value}</span>
        <span className="text-ink-500 text-sm ml-1">{suffix}</span>
      </div>
    </div>
  );
}
