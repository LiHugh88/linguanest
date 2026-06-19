import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Flame, Trophy, Target, BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import { achievements } from '../data/achievements';
import { recommendCourses } from '../utils/recommend';
import AchievementBadge from '../components/AchievementBadge';
import CourseCard from '../components/CourseCard';

export default function Learning() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const learning = useLearningStore();
  const [tab, setTab] = useState<'overview' | 'achievements' | 'recommend'>('overview');

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 animate-slideUp">
        <div className="text-6xl mb-6">🔒</div>
        <h2 className="text-2xl font-bold mb-3 text-ink-100">登录后查看你的学习进度</h2>
        <p className="text-ink-400 mb-8">登录以追踪学习数据、解锁成就和获取个性化推荐。</p>
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
  const completedCourseIds = learning.records.map(r => r.courseId);
  const recommendations = recommendCourses({
    targetLanguage: user.targetLanguage,
    level: user.level,
    accuracy,
    completedCourseIds,
    recentlyWeak: accuracy < 0.6,
  });

  const tabBtn = (key: typeof tab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setTab(key)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
        tab === key
          ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40'
          : 'text-ink-300 hover:text-ink-100 hover:bg-ink-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="space-y-8 animate-slideUp">
      {/* 头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink-100 mb-2">
            你好，<span className="text-gradient-gold">{user.username}</span> {user.avatar}
          </h1>
          <p className="text-ink-400">让我们看看你的学习足迹 📈</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-ink-800/60 border border-ink-700">
          <Trophy className="w-5 h-5 text-gold-400" />
          <span className="text-ink-200 font-semibold">{user.exp}</span>
          <span className="text-ink-500 text-sm">经验值</span>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Flame className="w-6 h-6" />} iconColor="text-orange-400" label="连续天数" value={`${streak}`} suffix="天" />
        <StatCard icon={<BookOpen className="w-6 h-6" />} iconColor="text-emerald-400" label="已学条目" value={`${totalItems}`} suffix="条" />
        <StatCard icon={<Target className="w-6 h-6" />} iconColor="text-sky-400" label="正确率" value={`${Math.round(accuracy * 100)}`} suffix="%" />
        <StatCard icon={<BarChart3 className="w-6 h-6" />} iconColor="text-violet-400" label="学习语言" value={`${learnedLangs.length}`} suffix="种" />
      </div>

      {/* Tab 切换 */}
      <div className="flex flex-wrap gap-2">
        {tabBtn('overview', '学习概览', <Calendar className="w-4 h-4" />)}
        {tabBtn('achievements', '成就系统', <Trophy className="w-4 h-4" />)}
        {tabBtn('recommend', '个性化推荐', <Target className="w-4 h-4" />)}
      </div>

      {/* Tab 内容 */}
      {tab === 'overview' && (
        <div className="space-y-4 animate-fadeIn">
          {learning.stats.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-ink-800/40 border border-ink-700">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-ink-100 mb-2">还没有学习记录</h3>
              <p className="text-ink-400 mb-6">从课程中心开始你的第一次学习吧！</p>
              <button
                onClick={() => navigate('/courses')}
                className="px-6 py-3 rounded-2xl bg-gold-500 hover:bg-gold-400 text-ink-950 font-semibold transition"
              >
                去选课程
              </button>
            </div>
          ) : (
            <div className="rounded-3xl bg-ink-800/40 border border-ink-700 p-6">
              <h3 className="text-lg font-semibold text-ink-100 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold-400" /> 最近 14 天学习记录
              </h3>
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
            </div>
          )}

          {learning.records.length > 0 && (
            <div className="rounded-3xl bg-ink-800/40 border border-ink-700 p-6">
              <h3 className="text-lg font-semibold text-ink-100 mb-4">最近练习</h3>
              <div className="space-y-3">
                {learning.records.slice(0, 5).map((r) => {
                  const moduleName = { vocab: '单词记忆', grammar: '语法练习', speaking: '口语跟读', listening: '听力训练' }[r.moduleType];
                  return (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-2xl bg-ink-900/50 border border-ink-700/50">
                      <div>
                        <div className="font-medium text-ink-100">{moduleName}</div>
                        <div className="text-xs text-ink-500">{r.date} · {r.courseId}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gold-400">{r.correctCount}/{r.totalCount}</div>
                        <div className="text-xs text-ink-500">约 {Math.max(1, Math.round(r.durationSec / 60))} 分钟</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'achievements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
          {achievements.map((a) => (
            <AchievementBadge key={a.id} achievement={a} unlocked={user.unlockedAchievements.includes(a.id)} />
          ))}
        </div>
      )}

      {tab === 'recommend' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="rounded-3xl bg-gradient-to-br from-gold-500/10 to-violet-500/10 border border-gold-500/30 p-6">
            <h3 className="text-lg font-semibold text-ink-100 mb-2">✨ 为你量身定制</h3>
            <p className="text-ink-400 text-sm mb-4">
              根据你当前语言（{user.targetLanguage}）、级别（{user.level}）和学习习惯，以下是推荐课程：
            </p>
            {recommendations.length === 0 ? (
              <p className="text-ink-400">暂无推荐，去课程中心探索更多吧！</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.slice(0, 4).map((c) => (
                  <CourseCard key={c.id} course={c} onOpen={() => navigate(`/learn/vocab/${c.id}`)} />
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="w-full sm:w-auto inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-ink-800 hover:bg-ink-700 text-ink-100 border border-ink-700 transition"
          >
            浏览所有课程 <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, iconColor, label, value, suffix }: { icon: React.ReactNode; iconColor: string; label: string; value: string; suffix: string }) {
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
