import { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Volume2, ArrowRight, RotateCcw } from 'lucide-react';
import { listeningItems, courses } from '../data';
import { useLearningStore } from '../store/learningStore';
import { useAuthStore } from '../store/authStore';
import { markCompletedListening } from '../store/learningStore';
import { achievements } from '../data/achievements';
import AchievementToast from '../components/AchievementToast';
import { speak } from '../utils/speech';

const ListeningLearn = () => {
  const { courseId = '' } = useParams();
  const navigate = useNavigate();
  const items = useMemo(() => listeningItems.filter((l) => l.courseId === courseId), [courseId]);
  const course = courses.find((c) => c.id === courseId);

  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [newAchievement, setNewAchievement] = useState<typeof achievements[number] | null>(null);

  const addRecord = useLearningStore((s) => s.addRecord);
  const addExp = useAuthStore((s) => s.addExp);
  const unlockAchievement = useAuthStore((s) => s.unlockAchievement);
  const unlockedIds = useAuthStore((s) => s.user?.unlockedAchievements || []);

  if (!course) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-ink-300">课程不存在。</p>
        <Link to="/courses" className="inline-block mt-4 px-4 py-2 rounded-xl bg-ink-700 text-ink-200">返回</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">👂</div>
        <h2 className="text-xl text-white mb-2">该课程暂无听力练习</h2>
        <Link to="/courses" className="mt-6 inline-block px-5 py-2.5 rounded-xl bg-gold-400 text-ink-900 font-semibold">
          返回课程中心
        </Link>
      </div>
    );
  }

  const current = items[index];

  const handlePlay = async () => {
    setPlayCount((c) => c + 1);
    await speak(current.audioText, current.language);
  };

  const checkAnswer = () => {
    if (showAnswer) return;
    setShowAnswer(true);
    // 简单判分：做一下字符串归一化对比
    const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
    const isCorrect = norm(input) === norm(current.audioText);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      addExp(3);
      if (!unlockedIds.includes('listening-first')) {
        unlockAchievement('listening-first');
        const a = achievements.find((x) => x.id === 'listening-first');
        if (a) setNewAchievement(a);
      }
    }
    if (!unlockedIds.includes('first-lesson')) {
      unlockAchievement('first-lesson');
      const a = achievements.find((x) => x.id === 'first-lesson');
      if (a) setNewAchievement(a);
    }
  };

  const handleNext = () => {
    if (index + 1 >= items.length) {
      markCompletedListening();
      addRecord({
        courseId,
        moduleType: 'listening',
        correctCount,
        totalCount: items.length,
        durationSec: items.length * 40,
      });
      navigate('/progress');
    } else {
      setIndex(index + 1);
      setInput('');
      setShowAnswer(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/courses" className="flex items-center gap-1.5 text-sm text-ink-300 hover:text-white transition">
          <ChevronLeft className="w-4 h-4" /> 返回课程
        </Link>
        <div className="text-sm text-gold-400">{course.icon} {course.title}</div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-2 text-xs text-ink-300">
          <span>听写练习</span>
          <span className="text-gold-400 font-semibold">第 {index + 1} / {items.length} 题</span>
        </div>
        <div className="w-full h-2 rounded-full bg-ink-700/60 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-500"
            style={{ width: `${((index + 1) / items.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 播放卡 */}
      <div className="rounded-3xl bg-gradient-to-br from-ink-800 to-ink-900 border border-ink-700/70 p-8 mb-6 text-center relative overflow-hidden">
        <div className="absolute -top-16 -left-10 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="text-xs text-gold-400 mb-4">仔细听，写下你听到的内容</div>
        <button
          onClick={handlePlay}
          className="relative mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center shadow-xl shadow-gold-500/30 hover:scale-105 transition"
        >
          <Volume2 className="w-12 h-12 text-ink-900" />
        </button>
        <div className="text-sm text-ink-300 mt-5">
          已播放 {playCount} 次 ·{' '}
          <button onClick={handlePlay} className="text-gold-400 hover:text-gold-300">
            再播一次
          </button>
        </div>
        <div className="mt-4 text-xs text-ink-400">提示：{current.hint}</div>
      </div>

      {/* 输入框 */}
      <div className="rounded-3xl bg-ink-800/70 border border-ink-700/70 p-6 mb-6">
        <label className="text-xs text-ink-400 mb-3 block">输入你听到的内容</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={showAnswer}
          rows={3}
          className="w-full bg-ink-900/80 border border-ink-700 rounded-xl p-4 text-white text-lg font-display focus:outline-none focus:border-gold-500/50 transition resize-none disabled:opacity-70"
          placeholder="仔细听，再逐字输入…"
        />
      </div>

      {showAnswer && (
        <div
          className={`mb-6 p-6 rounded-2xl border ${
            input.trim().toLowerCase().replace(/\s+/g, ' ') ===
            current.audioText.trim().toLowerCase().replace(/\s+/g, ' ')
              ? 'bg-emerald-500/5 border-emerald-500/40'
              : 'bg-rose-500/5 border-rose-500/40'
          }`}
        >
          <div className="text-xs text-gold-400 mb-2">正确答案</div>
          <div className="text-xl font-display text-white mb-3">{current.audioText}</div>
          <div className="text-sm text-ink-300">翻译：{current.translation}</div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            setInput('');
            setShowAnswer(false);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink-700/60 border border-ink-700 text-ink-200 hover:bg-ink-700 transition"
        >
          <RotateCcw className="w-4 h-4" /> 清空重来
        </button>
        {!showAnswer ? (
          <button
            onClick={checkAnswer}
            disabled={!input.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-400 text-ink-900 font-semibold hover:shadow-lg hover:shadow-gold-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            提交答案
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-400 text-ink-900 font-semibold hover:shadow-lg hover:shadow-gold-500/30 transition"
          >
            {index + 1 >= items.length ? '完成练习' : '下一题'}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <AchievementToast achievement={newAchievement} onClose={() => setNewAchievement(null)} />
    </div>
  );
};

export default ListeningLearn;
