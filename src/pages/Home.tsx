import { Link } from 'react-router-dom';
import { BookOpen, Target, Mic, Headphones, Trophy, Users, ArrowRight, Sparkles } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { courses, languageMeta } from '../data/courses';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import { achievements } from '../data/achievements';

const Home = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { getStreak, getTotalItems, getAccuracy, posts } = useLearningStore();

  const featuredCourses = courses.slice(0, 6);
  const latestPosts = posts.slice(0, 3);

  const features = [
    { icon: <Target className="w-6 h-6" />, title: '分级课程', desc: '从 A1 入门到 C2 精通，科学分级稳步提升' },
    { icon: <BookOpen className="w-6 h-6" />, title: '单词记忆', desc: '卡片式记忆，智能重复，让单词深植脑海' },
    { icon: <Sparkles className="w-6 h-6" />, title: '语法练习', desc: '即时反馈的选择题，夯实语法基础' },
    { icon: <Mic className="w-6 h-6" />, title: '口语跟读', desc: 'TTS 发音示范，大胆开口说外语' },
    { icon: <Headphones className="w-6 h-6" />, title: '听力训练', desc: '真实场景的听写训练，提升听力水平' },
    { icon: <Trophy className="w-6 h-6" />, title: '成就激励', desc: '解锁徽章、累计经验，让学习变成游戏' },
  ];

  return (
    <div>
      {/* Hero 区域 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900 via-ink-800/50 to-ink-900" />
        {/* 装饰光晕 */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-gold-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-ink-500/20 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-700/50 border border-ink-600 mb-6">
                <span className="text-gold-400">✨</span>
                <span className="text-xs text-ink-200">全球 3 种主流语言 · 从零基础到精通</span>
              </div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                让语言学习
                <br />
                <span className="bg-gradient-to-r from-gold-400 via-gold-300 to-gold-500 bg-clip-text text-transparent">
                  成为每天的期待
                </span>
              </h1>

              <p className="text-lg text-ink-200 leading-relaxed mb-8 max-w-xl">
                LinguaNest 以沉浸式学习体验、科学的分级课程和有趣的成就激励，
                陪你征服英语、日语、韩语，让第二语言真正融入你的生活。
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/courses"
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 text-ink-900 font-semibold hover:shadow-lg hover:shadow-gold-500/30 transition flex items-center gap-2"
                    >
                      继续学习 <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/recommend"
                      className="px-6 py-3 rounded-xl bg-ink-700/60 border border-ink-600 text-white hover:bg-ink-700 transition flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" /> 个性化推荐
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 text-ink-900 font-semibold hover:shadow-lg hover:shadow-gold-500/30 transition flex items-center gap-2"
                    >
                      免费注册 <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/courses"
                      className="px-6 py-3 rounded-xl bg-ink-700/60 border border-ink-600 text-white hover:bg-ink-700 transition"
                    >
                      浏览课程
                    </Link>
                  </>
                )}
              </div>

              {/* 数据展示 */}
              {isAuthenticated && user ? (
                <div className="grid grid-cols-3 gap-4 max-w-md">
                  <div className="p-4 rounded-xl bg-ink-800/60 border border-ink-700/70">
                    <div className="text-2xl font-display text-gold-400 font-bold">{getStreak()}</div>
                    <div className="text-xs text-ink-300 mt-1">连续学习 天</div>
                  </div>
                  <div className="p-4 rounded-xl bg-ink-800/60 border border-ink-700/70">
                    <div className="text-2xl font-display text-gold-400 font-bold">{getTotalItems()}</div>
                    <div className="text-xs text-ink-300 mt-1">已练习题数</div>
                  </div>
                  <div className="p-4 rounded-xl bg-ink-800/60 border border-ink-700/70">
                    <div className="text-2xl font-display text-gold-400 font-bold">
                      {Math.round(getAccuracy() * 100)}%
                    </div>
                    <div className="text-xs text-ink-300 mt-1">正确率</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {['🦊', '🐼', '🐯', '🐨'].map((a) => (
                      <div
                        key={a}
                        className="w-9 h-9 rounded-full bg-ink-700 border-2 border-ink-800 flex items-center justify-center text-lg"
                      >
                        {a}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-ink-300">已有 12,000+ 学习者加入</span>
                </div>
              )}
            </div>

            {/* 右侧装饰 */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/20 via-transparent to-ink-500/20 rounded-[3rem] rotate-6" />
                <div className="absolute inset-2 bg-ink-800/80 border border-ink-700 rounded-[2.5rem] p-8 backdrop-blur-sm">
                  <div className="h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">今日学习</span>
                      <span className="text-xs text-gold-400">● 已坚持 {isAuthenticated ? getStreak() : 0} 天</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 my-6">
                      {Object.values(languageMeta).map((l) => (
                        <div
                          key={l.name}
                          className="aspect-square bg-ink-900/80 border border-ink-700/60 rounded-2xl flex flex-col items-center justify-center hover:border-gold-500/50 transition"
                        >
                          <span className="text-3xl mb-1">{l.flag}</span>
                          <span className="text-[10px] text-ink-300">{l.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      {features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-3 bg-ink-900/60 rounded-xl p-3 border border-ink-700/50">
                          <div className="w-8 h-8 rounded-lg bg-gold-500/20 flex items-center justify-center text-gold-400">
                            {f.icon}
                          </div>
                          <div className="text-xs text-ink-200 flex-1">{f.title}</div>
                          <span className="text-[10px] text-gold-400">{isAuthenticated ? Math.floor(Math.random() * 90 + 10) : '--'}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 特色功能 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-block text-xs tracking-widest uppercase text-gold-400 mb-3">6 大核心能力</div>
          <h2 className="font-display text-3xl md:text-4xl text-white font-bold mb-4">沉浸式学习体验</h2>
          <p className="text-ink-300 max-w-2xl mx-auto">
            融合科学学习方法与游戏化元素，让每一次练习都有明确进步
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl bg-ink-800/50 border border-ink-700/70 hover:border-gold-500/40 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-400/5 border border-gold-500/30 flex items-center justify-center text-gold-400 mb-4 group-hover:scale-110 transition">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-ink-300 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 精选课程 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-xs tracking-widest uppercase text-gold-400 mb-2">热门课程</div>
            <h2 className="font-display text-3xl md:text-4xl text-white font-bold">精选分级课程</h2>
          </div>
          <Link
            to="/courses"
            className="hidden md:inline-flex items-center gap-1.5 text-sm text-ink-200 hover:text-gold-400 transition"
          >
            查看全部 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredCourses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </section>

      {/* 成就系统 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-800 to-ink-900 border border-gold-500/20 p-10 md:p-14">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-gold-500/10 rounded-full blur-[100px]" />

          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <Trophy className="w-10 h-10 text-gold-400 mb-4" />
              <h2 className="font-display text-3xl md:text-4xl text-white font-bold mb-4">
                每一次坚持
                <br />
                都会被看见
              </h2>
              <p className="text-ink-300 leading-relaxed mb-6 max-w-md">
                {achievements.length}+ 个成就徽章等你解锁，连续学习、掌握词汇、首次口语——
                你的每一步成长都值得被庆祝。
              </p>
              <Link
                to="/achievements"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 text-ink-900 font-semibold hover:shadow-lg hover:shadow-gold-500/30 transition"
              >
                查看成就墙 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {achievements.slice(0, 6).map((a, i) => (
                <div
                  key={a.id}
                  className="aspect-square rounded-2xl bg-ink-900/60 border border-ink-700/60 flex flex-col items-center justify-center p-3"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <span className="text-3xl mb-1">{a.icon}</span>
                  <span className="text-[10px] text-gold-300 text-center">{a.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 社区 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2">
              <Users className="w-4 h-4 text-gold-400" />
              <span className="text-xs tracking-widest uppercase text-gold-400">社区交流</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-white font-bold mt-2">
              和全球学习者同行
            </h2>
          </div>
          <Link
            to="/community"
            className="hidden md:inline-flex items-center gap-1.5 text-sm text-ink-200 hover:text-gold-400 transition"
          >
            进入社区 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {latestPosts.length > 0 ? (
            latestPosts.map((post) => (
              <div
                key={post.id}
                className="p-5 rounded-2xl bg-ink-800/60 border border-ink-700/70 hover:border-ink-600 transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-ink-700 flex items-center justify-center text-lg">
                    {post.avatar}
                  </div>
                  <div>
                    <div className="text-sm text-white font-semibold">{post.username}</div>
                    <div className="text-[10px] text-ink-400">{post.createdAt}</div>
                  </div>
                </div>
                <p className="text-sm text-ink-200 leading-relaxed line-clamp-3">{post.content}</p>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-ink-700/50 text-xs text-ink-400">
                  <span>❤ {post.likes}</span>
                  <span>💬 {post.comments.length}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-ink-400 text-sm">
              暂无动态，快来成为第一个分享的人吧！
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
