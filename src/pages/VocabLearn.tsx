import { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Volume2, RotateCcw, Check } from 'lucide-react';
import { vocabItems, courses } from '../data';
import { useLearningStore } from '../store/learningStore';
import { useAuthStore } from '../store/authStore';
import { achievements } from '../data/achievements';
import AchievementToast from '../components/AchievementToast';
import { speak } from '../utils/speech';

const VocabLearn = () => {
  const { courseId = '' } = useParams();
  const navigate = useNavigate();
  const items = useMemo(() => vocabItems.filter((v) => v.courseId === courseId), [courseId]);
  const course = courses.find((c) => c.id === courseId);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const [newAchievement, setNewAchievement] = useState<typeof achievements[number] | null>(null);

  const addRecord = useLearningStore((s) => s.addRecord);
  const markVocabMastered = useLearningStore((s) => s.markVocabMastered);
  const unlockAchievement = useAuthStore((s) => s.unlockAchievement);
  const addExp = useAuthStore((s) => s.addExp);
  const unlockedAchievements = useAuthStore((s) => s.user?.unlockedAchievements || []);
  const user = useAuthStore((s) => s.user);

  // 每次索引变化时重置翻转状态
  useEffect(() => {
    setFlipped(false);
  }, [index]);

  if (!course) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-ink-300">课程不存在。</p>
        <Link to="/courses" className="inline-block mt-4 px-4 py-2 rounded-xl bg-ink-700 text-ink-200">
          返回课程中心
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">📚</div>
        <h2 className="text-xl text-white mb-2">该课程暂无单词</h2>
        <p className="text-ink-300 mb-6">我们正在努力添加更多学习内容。</p>
        <Link to="/courses" className="px-5 py-2.5 rounded-xl bg-gold-400 text-ink-900 font-semibold">
          返回课程中心
        </Link>
      </div>
    );
  }

  const current = items[index];
  const progressPct = ((index + 1) / items.length) * 100;

  const checkAchievements = (newKnownCount: number) => {
    // first-lesson
    if (!unlockedAchievements.includes('first-lesson')) {
      unlockAchievement('first-lesson');
      const a = achievements.find((x) => x.id === 'first-lesson');
      if (a) setNewAchievement(a);
    }
    if (newKnownCount >= 10 && !unlockedAchievements.includes('vocab-10')) {
      unlockAchievement('vocab-10');
      const a = achievements.find((x) => x.id === 'vocab-10');
      if (a) setNewAchievement(a);
    }
    if (newKnownCount >= 100 && !unlockedAchievements.includes('vocab-100')) {
      unlockAchievement('vocab-100');
      const a = achievements.find((x) => x.id === 'vocab-100');
      if (a) setNewAchievement(a);
    }
  };

  const handleKnow = () => {
    if (!knownIds.has(current.id)) {
      const next = new Set(knownIds);
      next.add(current.id);
      setKnownIds(next);
      markVocabMastered(current.id);
      addExp(2);
      checkAchievements(next.size);
    }
    goNext();
  };

  const handleSkip = () => {
    goNext();
  };

  const goNext = () => {
    if (index + 1 >= items.length) {
      // 完成
      if (knownIds.size === items.length) {
        // 全对
        const a = achievements.find((x) => x.id === 'perfect-score');
        if (a && !unlockedAchievements.includes('perfect-score')) {
          unlockAchievement('perfect-score');
          setNewAchievement(a);
        }
      }
      addRecord({
        courseId: course.id,
        moduleType: 'vocab',
        correctCount: knownIds.size,
        totalCount: items.length,
        durationSec: Math.max(30, items.length * 8),
      });
      if (user) {
        useAuthStore.getState().addLearnedLanguage(course.language);
      }
      navigate('/progress');
    } else {
      setIndex(index + 1);
    }
  };

  const handleSpeak = () => speak(current.word, current.language);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/courses" className="flex items-center gap-1.5 text-sm text-ink-300 hover:text-white transition">
          <ChevronLeft className="w-4 h-4" /> 返回课程
        </Link>
        <div className="text-sm text-gold-400">
          {course.icon} {course.title}
        </div>
      </div>

      {/* 进度条 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2 text-xs text-ink-300">
          <span>单词记忆进度</span>
          <span className="text-gold-400 font-semibold">
            {index + 1} / {items.length}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-ink-700/60 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 单词卡片 */}
      <div
        className="relative perspective-1000 h-[420px] cursor-pointer select-none"
        onClick={() => setFlipped(!flipped)}
      >
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-gpu ${
            flipped ? 'rotate-y-180' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* 正面 - 单词 */}
          <div
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-ink-800 to-ink-900 border border-ink-700/70 p-8 flex flex-col items-center justify-center shadow-xl"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="absolute top-6 left-6 text-xs text-ink-400">点击卡片查看释义</div>
            <div className="absolute top-6 right-6 text-[10px] px-2 py-1 rounded-full bg-ink-700 text-ink-200">
              {course.level}
            </div>
            <div className="text-5xl md:text-6xl font-display text-white text-center mb-4">
              {current.word}
            </div>
            <div className="text-sm text-ink-300 mb-6">{current.phonetic}</div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSpeak();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500/20 border border-gold-500/30 text-gold-400 hover:bg-gold-500/30 transition"
            >
              <Volume2 className="w-4 h-4" />
              <span className="text-sm">朗读发音</span>
            </button>
          </div>

          {/* 背面 - 释义 */}
          <div
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gold-500/10 via-ink-800 to-ink-900 border border-gold-500/30 p-8 flex flex-col items-center justify-center shadow-xl"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="absolute top-6 left-6 text-xs text-gold-400">释义与例句</div>
            <div className="text-3xl md:text-4xl text-white mb-4">{current.meaning}</div>
            <div className="w-16 h-px bg-gold-500/40 mb-5" />
            <div className="text-lg text-ink-100 text-center mb-2">{current.example}</div>
            <div className="text-sm text-ink-400 text-center">{current.exampleTranslation}</div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <button
          onClick={handleSkip}
          className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-ink-700/60 border border-ink-700 text-ink-200 hover:bg-ink-700 hover:text-white transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>跳过 / 再学</span>
        </button>
        <button
          onClick={handleKnow}
          className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-400 text-ink-900 font-semibold hover:shadow-lg hover:shadow-gold-500/30 transition"
        >
          <Check className="w-4 h-4" />
          <span>已掌握</span>
        </button>
      </div>

      <AchievementToast achievement={newAchievement} onClose={() => setNewAchievement(null)} />
    </div>
  );
};

export default VocabLearn;
