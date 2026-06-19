import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, BookOpen, Target, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import { recommendCourses } from '../utils/recommend';
import CourseCard from '../components/CourseCard';
import { languageMeta } from '../data/courses';

export default function Recommend() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const learning = useLearningStore();

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 animate-slideUp">
        <div className="text-6xl mb-6">🔒</div>
        <h2 className="text-2xl font-bold mb-3 text-ink-100">登录后获取个性化推荐</h2>
        <p className="text-ink-400 mb-8">登录后根据你的学习数据，获取专属课程推荐。</p>
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-3 rounded-2xl bg-gold-500 hover:bg-gold-400 text-ink-950 font-semibold transition shadow-lg"
        >
          立即登录
        </button>
      </div>
    );
  }

  const accuracy = learning.getAccuracy();
  const completedCourseIds = learning.records.map(r => r.courseId);
  const recommendations = recommendCourses({
    targetLanguage: user.targetLanguage,
    level: user.level,
    accuracy,
    completedCourseIds,
    recentlyWeak: accuracy < 0.6,
  });

  const reasons = [
    { icon: <Target className="w-5 h-5" />, text: `当前级别：${user.level}，推荐适配等级课程` },
    { icon: <BookOpen className="w-5 h-5" />, text: `目标语言：${languageMeta[user.targetLanguage]?.name ?? user.targetLanguage}` },
    { icon: <TrendingUp className="w-5 h-5" />, text: `正确率 ${Math.round(accuracy * 100)}%${accuracy < 0.6 ? '，建议从基础课程重新巩固' : '，学习状态良好，继续进阶！'}` },
  ];

  return (
    <div className="space-y-8 animate-slideUp">
      {/* 头部 */}
      <div>
        <h1 className="text-3xl font-bold text-ink-100 mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-gold-400" />
          个性化推荐
        </h1>
        <p className="text-ink-400">基于你的学习数据，为你量身定制课程 ✨</p>
      </div>

      {/* 推荐依据 */}
      <div className="rounded-3xl bg-gradient-to-br from-gold-500/10 via-ink-800/60 to-sky-500/10 border border-gold-500/30 p-6">
        <h3 className="text-base font-semibold text-gold-300 mb-4">📊 推荐依据</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {reasons.map((r, i) => (
            <div key={i} className="p-4 rounded-2xl bg-ink-900/60 border border-ink-700 flex items-start gap-3">
              <div className="text-gold-400 flex-shrink-0 mt-0.5">{r.icon}</div>
              <div className="text-sm text-ink-200 leading-relaxed">{r.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 推荐算法说明 */}
      <div className="rounded-3xl bg-ink-800/60 border border-ink-700 p-6">
        <h3 className="text-base font-semibold text-ink-100 mb-3">🧠 推荐算法说明</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-gold-400 flex-shrink-0">1.</span>
            <span className="text-ink-300">优先推荐与当前级别匹配的课程，减少难度断层</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gold-400 flex-shrink-0">2.</span>
            <span className="text-ink-300">自动过滤已完成的课程，专注未探索内容</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gold-400 flex-shrink-0">3.</span>
            <span className="text-ink-300">正确率 &lt; 60% 时，自动推荐基础级别巩固知识</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gold-400 flex-shrink-0">4.</span>
            <span className="text-ink-300">结合目标语言和已学语种，综合评估推荐</span>
          </div>
        </div>
      </div>

      {/* 推荐课程列表 */}
      <div>
        <h3 className="text-lg font-semibold text-ink-100 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold-400" />
          为你推荐的课程
          <span className="text-sm font-normal text-ink-400">（共 {recommendations.length} 门）</span>
        </h3>

        {recommendations.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-ink-800/40 border border-ink-700">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-ink-100 mb-2">暂无推荐</h3>
            <p className="text-ink-400 mb-6">先去完成一些练习，或尝试不同的学习路径吧！</p>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-3 rounded-2xl bg-gold-500 hover:bg-gold-400 text-ink-950 font-semibold transition"
            >
              浏览所有课程
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendations.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                onOpen={() => navigate(`/learn/vocab/${c.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 底部链接 */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate('/courses')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-ink-800 hover:bg-ink-700 text-ink-100 border border-ink-700 transition"
        >
          <BookOpen className="w-4 h-4" /> 浏览所有课程
        </button>
        <button
          onClick={() => navigate('/achievements')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-ink-800 hover:bg-ink-700 text-ink-100 border border-ink-700 transition"
        >
          查看成就墙 <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
