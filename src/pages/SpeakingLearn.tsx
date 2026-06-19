import { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Mic, Volume2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { speakingItems, courses } from '../data';
import { useLearningStore } from '../store/learningStore';
import { useAuthStore } from '../store/authStore';
import { markCompletedSpeaking } from '../store/learningStore';
import { achievements } from '../data/achievements';
import AchievementToast from '../components/AchievementToast';
import { speak } from '../utils/speech';

const SpeakingLearn = () => {
  const { courseId = '' } = useParams();
  const navigate = useNavigate();
  const items = useMemo(() => speakingItems.filter((s) => s.courseId === courseId), [courseId]);
  const course = courses.find((c) => c.id === courseId);

  const [index, setIndex] = useState(0);
  const [practiced, setPracticed] = useState<Set<string>>(new Set());
  const [playing, setPlaying] = useState(false);
  const [newAchievement, setNewAchievement] = useState<typeof achievements[number] | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordComplete, setRecordComplete] = useState(false);

  const addRecord = useLearningStore((s) => s.addRecord);
  const addExp = useAuthStore((s) => s.addExp);
  const unlockAchievement = useAuthStore((s) => s.unlockAchievement);
  const unlockedIds = useAuthStore((s) => s.user?.unlockedAchievements || []);

  useEffect(() => {
    if (items.length === 0) return;
    setRecordComplete(false);
  }, [index, items.length]);

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
        <div className="text-5xl mb-4">🎤</div>
        <h2 className="text-xl text-white mb-2">该课程暂无口语练习</h2>
        <Link to="/courses" className="mt-6 inline-block px-5 py-2.5 rounded-xl bg-gold-400 text-ink-900 font-semibold">
          返回课程中心
        </Link>
      </div>
    );
  }

  const current = items[index];

  const handlePlay = async () => {
    if (playing) return;
    setPlaying(true);
    await speak(current.sentence, current.language);
    setTimeout(() => setPlaying(false), 500);
  };

  const handleRecord = () => {
    if (recording) return;
    setRecording(true);
    // Demo：模拟录音过程 3 秒后完成
    setTimeout(() => {
      setRecording(false);
      setRecordComplete(true);
      if (!practiced.has(current.id)) {
        const n = new Set(practiced);
        n.add(current.id);
        setPracticed(n);
        addExp(3);
        // speaking-first 成就
        if (!unlockedIds.includes('speaking-first')) {
          unlockAchievement('speaking-first');
          const a = achievements.find((x) => x.id === 'speaking-first');
          if (a) setNewAchievement(a);
        }
        // first-lesson
        if (!unlockedIds.includes('first-lesson')) {
          unlockAchievement('first-lesson');
          const a = achievements.find((x) => x.id === 'first-lesson');
          if (a) setNewAchievement(a);
        }
      }
    }, 3200);
  };

  const handleNext = () => {
    if (index + 1 >= items.length) {
      markCompletedSpeaking();
      addRecord({
        courseId,
        moduleType: 'speaking',
        correctCount: practiced.size,
        totalCount: items.length,
        durationSec: items.length * 25,
      });
      navigate('/progress');
    } else {
      setIndex(index + 1);
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
          <span>口语跟读</span>
          <span className="text-gold-400 font-semibold">第 {index + 1} / {items.length} 句</span>
        </div>
        <div className="w-full h-2 rounded-full bg-ink-700/60 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-500"
            style={{ width: `${((index + 1) / items.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 示范句子卡片 */}
      <div className="relative mb-6 rounded-3xl bg-gradient-to-br from-ink-800 to-ink-900 border border-ink-700/70 p-8 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="text-xs text-gold-400 mb-3">跟读示范</div>
        <div className="text-2xl md:text-3xl font-display text-white leading-relaxed mb-4">
          {current.sentence}
        </div>
        <div className="text-sm text-ink-400 mb-6">{current.phonetic}</div>
        <div className="w-16 h-px bg-gold-500/40 mb-5" />
        <div className="text-base text-ink-200 mb-4">中文翻译：{current.translation}</div>

        <button
          onClick={handlePlay}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500/20 border border-gold-500/30 text-gold-400 hover:bg-gold-500/30 transition"
        >
          <Volume2 className={`w-4 h-4 ${playing ? 'animate-pulse' : ''}`} />
          <span className="text-sm">{playing ? '正在朗读…' : '听示范朗读'}</span>
        </button>
      </div>

      {/* 录音按钮 */}
      <div className="rounded-3xl bg-ink-800/70 border border-ink-700/70 p-8 mb-6 text-center">
        <div className="text-xs text-ink-400 mb-4">轮到你了 · 点击下方麦克风跟读</div>
        <button
          onClick={handleRecord}
          disabled={recording}
          className={`relative w-24 h-24 rounded-full border-4 transition-all ${
            recording
              ? 'bg-rose-500/20 border-rose-500/60 text-rose-300'
              : recordComplete
              ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
              : 'bg-gold-500/20 border-gold-500/60 text-gold-400 hover:shadow-lg hover:shadow-gold-500/30'
          }`}
        >
          {recording && (
            <span className="absolute inset-0 rounded-full animate-ping bg-rose-500/30" />
          )}
          <Mic className={`w-8 h-8 mx-auto relative ${recording ? 'animate-pulse' : ''}`} />
        </button>
        <div className="text-sm mt-4 text-ink-200 min-h-[24px]">
          {recording ? '正在录音…大声跟读吧！' : recordComplete ? '已完成录音' : '点击麦克风开始'}
        </div>

        {recordComplete && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
            <CheckCircle2 className="w-4 h-4" /> 录音完成，干得漂亮！
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-400 text-ink-900 font-semibold hover:shadow-lg hover:shadow-gold-500/30 transition"
        >
          {index + 1 >= items.length ? '完成练习' : '下一句'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <AchievementToast achievement={newAchievement} onClose={() => setNewAchievement(null)} />
    </div>
  );
};

export default SpeakingLearn;
