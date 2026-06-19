import { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { grammarQuestions, courses } from '../data';
import { useLearningStore } from '../store/learningStore';
import { useAuthStore } from '../store/authStore';
import { achievements } from '../data/achievements';
import { incrementGrammarCorrect } from '../store/learningStore';
import AchievementToast from '../components/AchievementToast';

const GrammarLearn = () => {
  const { courseId = '' } = useParams();
  const navigate = useNavigate();
  const questions = useMemo(() => grammarQuestions.filter((q) => q.courseId === courseId), [courseId]);
  const course = courses.find((c) => c.id === courseId);

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [newAchievement, setNewAchievement] = useState<typeof achievements[number] | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const addRecord = useLearningStore((s) => s.addRecord);
  const unlockAchievement = useAuthStore((s) => s.unlockAchievement);
  const addExp = useAuthStore((s) => s.addExp);
  const unlockedIds = useAuthStore((s) => s.user?.unlockedAchievements || []);
  const totalCorrectInStore = useLearningStore((s) => s.correctGrammarCount);

  if (!course) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-ink-300">课程不存在。</p>
        <Link to="/courses" className="inline-block mt-4 px-4 py-2 rounded-xl bg-ink-700 text-ink-200">返回</Link>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">✏️</div>
        <h2 className="text-xl text-white mb-2">该课程暂无语法题</h2>
        <Link to="/courses" className="mt-6 inline-block px-5 py-2.5 rounded-xl bg-gold-400 text-ink-900 font-semibold">
          返回课程中心
        </Link>
      </div>
    );
  }

  const q = questions[index];
  const progressPct = ((index + (picked !== null ? 1 : 0)) / questions.length) * 100;

  const checkAchievements = (total: number) => {
    if (!unlockedIds.includes('first-lesson')) {
      unlockAchievement('first-lesson');
      const a = achievements.find((x) => x.id === 'first-lesson');
      if (a) setNewAchievement(a);
    }
    if (total >= 10 && !unlockedIds.includes('grammar-10')) {
      unlockAchievement('grammar-10');
      const a = achievements.find((x) => x.id === 'grammar-10');
      if (a) setNewAchievement(a);
    }
    if (total >= 50 && !unlockedIds.includes('grammar-50')) {
      unlockAchievement('grammar-50');
      const a = achievements.find((x) => x.id === 'grammar-50');
      if (a) setNewAchievement(a);
    }
  };

  const handlePick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    setShowExplanation(true);
    if (i === q.correctIndex) {
      setCorrectCount((c) => c + 1);
      setSessionCorrect((c) => c + 1);
      incrementGrammarCorrect();
      addExp(2);
      checkAchievements(totalCorrectInStore + 1);
    }
  };

  const handleNext = () => {
    if (index + 1 >= questions.length) {
      // 完成本轮
      if (sessionCorrect === questions.length) {
        const a = achievements.find((x) => x.id === 'perfect-score');
        if (a && !unlockedIds.includes('perfect-score')) {
          unlockAchievement('perfect-score');
          setNewAchievement(a);
        }
      }
      addRecord({
        courseId,
        moduleType: 'grammar',
        correctCount: correctCount + (picked === q.correctIndex ? 0 : 0),
        totalCount: questions.length,
        durationSec: questions.length * 30,
      });
      navigate('/progress');
    } else {
      setIndex(index + 1);
      setPicked(null);
      setShowExplanation(false);
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
          <span>语法练习</span>
          <span className="text-gold-400 font-semibold">
            第 {index + 1} 题 / 共 {questions.length} 题
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-ink-700/60 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 题目 */}
      <div className="rounded-3xl bg-ink-800/70 border border-ink-700/70 p-8 mb-6">
        <div className="text-xs text-gold-400 mb-4">题目</div>
        <div className="text-xl md:text-2xl text-white leading-relaxed font-display">
          {q.question}
        </div>
      </div>

      {/* 选项 */}
      <div className="space-y-3 mb-8">
        {q.options.map((opt, i) => {
          const isPicked = picked === i;
          const isCorrect = i === q.correctIndex;
          const showState = picked !== null;
          let cls = 'bg-ink-800/60 border-ink-700 text-ink-100 hover:border-ink-500 hover:bg-ink-800';
          if (showState) {
            if (isCorrect) cls = 'bg-emerald-500/10 border-emerald-500/60 text-emerald-300';
            else if (isPicked) cls = 'bg-rose-500/10 border-rose-500/60 text-rose-300';
            else cls = 'bg-ink-800/30 border-ink-700/50 text-ink-400';
          }
          return (
            <button
              key={i}
              onClick={() => handlePick(i)}
              disabled={picked !== null}
              className={`w-full text-left p-5 rounded-2xl border transition flex items-center gap-4 ${cls}`}
            >
              <div className="w-8 h-8 rounded-xl bg-ink-900/60 border border-ink-700/60 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {String.fromCharCode(65 + i)}
              </div>
              <div className="flex-1 text-base">{opt}</div>
              {showState && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {showState && isPicked && !isCorrect && <XCircle className="w-5 h-5 text-rose-400" />}
            </button>
          );
        })}
      </div>

      {/* 解析 */}
      {showExplanation && (
        <div
          className={`mb-6 p-5 rounded-2xl border ${
            picked === q.correctIndex
              ? 'bg-emerald-500/5 border-emerald-500/30'
              : 'bg-rose-500/5 border-rose-500/30'
          }`}
        >
          <div className={`text-sm font-semibold mb-1 ${picked === q.correctIndex ? 'text-emerald-300' : 'text-rose-300'}`}>
            {picked === q.correctIndex ? '✓ 回答正确' : '✗ 再想想'}
          </div>
          <div className="text-sm text-ink-200 leading-relaxed">解析：{q.explanation}</div>
        </div>
      )}

      {/* 操作 */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={picked === null}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-400 text-ink-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold-500/30 transition"
        >
          {index + 1 >= questions.length ? '完成练习' : '下一题'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <AchievementToast achievement={newAchievement} onClose={() => setNewAchievement(null)} />
    </div>
  );
};

export default GrammarLearn;
