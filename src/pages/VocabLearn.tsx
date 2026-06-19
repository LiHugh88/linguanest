import { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Volume2, RotateCcw, Check, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';
import { vocabItems, courses } from '../data';
import { useLearningStore } from '../store/learningStore';
import { useAuthStore } from '../store/authStore';
import { achievements } from '../data/achievements';
import AchievementToast from '../components/AchievementToast';
import { speak, probeVoice, isSpeechSupported } from '../utils/speech';
import type { LanguageCode } from '../types';

const VocabLearn = () => {
  const { courseId = '' } = useParams();
  const navigate = useNavigate();
  const items = useMemo(() => vocabItems.filter((v) => v.courseId === courseId), [courseId]);
  const course = courses.find((c) => c.id === courseId);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const [newAchievement, setNewAchievement] = useState<typeof achievements[number] | null>(null);
  const [showDiag, setShowDiag] = useState(false);
  const [diagResult, setDiagResult] = useState<{
    apiOk: boolean;
    voices: string[];
    probe: { lang: string; ok: boolean; voice: string | null }[];
    testOk: boolean;
  } | null>(null);
  const [testing, setTesting] = useState(false);

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

  /** 诊断语音合成状态（供技术支持使用） */
  const runDiagnostic = useCallback(async () => {
    setTesting(true);
    setDiagResult(null);

    const apiOk = isSpeechSupported();
    let allVoices: string[] = [];
    try {
      const synth = (window as unknown as { speechSynthesis?: SpeechSynthesis }).speechSynthesis;
      if (synth) {
        // 等待 voices 就绪
        await new Promise<void>((r) => {
          const v = synth.getVoices();
          if (v.length > 0) { allVoices = Array.from(v).map((x) => `${x.name} [${x.lang}]`); r(); return; }
          const fn = () => { allVoices = Array.from(synth.getVoices()).map((x) => `${x.name} [${x.lang}]`); r(); };
          synth.addEventListener('voiceschanged', fn, { once: true });
          setTimeout(r, 2000);
        });
      }
    } catch { /* ignore */ }

    const langs: LanguageCode[] = ['en', 'ja', 'ko'];
    const probe = await Promise.all(
      langs.map(async (lang) => {
        const r = await probeVoice(lang);
        return { lang, ok: r.supported, voice: r.bestVoice };
      })
    );

    // 实际测试朗读
    let testOk = false;
    try {
      await new Promise<void>((res) => {
        const synth = (window as unknown as { speechSynthesis?: SpeechSynthesis }).speechSynthesis;
        if (!synth) { res(); return; }
        const u = new SpeechSynthesisUtterance('Hello');
        u.onend = () => res();
        u.onerror = () => res();
        setTimeout(res, 3000);
        synth.speak(u);
      });
      testOk = true;
    } catch { /* ignore */ }

    setDiagResult({ apiOk, voices: allVoices, probe, testOk });
    setTesting(false);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 诊断面板切换按钮 */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => { setShowDiag(!showDiag); if (!showDiag && !diagResult) runDiagnostic(); }}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-ink-800 border border-ink-600 text-ink-400 hover:text-ink-200 hover:border-ink-500 transition"
        >
          <Info className="w-3 h-3" />
          语音诊断 {showDiag ? '▲' : '▼'}
        </button>
      </div>

      {/* 诊断面板 */}
      {showDiag && (
        <div className="mb-6 p-4 rounded-2xl bg-ink-800 border border-ink-600 text-xs">
          <div className="font-semibold text-ink-200 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-gold-400" />
            语音合成诊断报告
          </div>

          {testing ? (
            <div className="text-ink-400 animate-pulse">🔄 正在诊断，请稍候...</div>
          ) : diagResult ? (
            <div className="space-y-3">
              {/* API 支持状态 */}
              <div className="flex items-center gap-2">
                {diagResult.apiOk
                  ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  : <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                <span className="text-ink-200">
                  Web Speech API：{diagResult.apiOk ? '✅ 支持' : '❌ 不支持'}
                </span>
              </div>

              {/* 测试朗读结果 */}
              <div className="flex items-center gap-2">
                {diagResult.testOk
                  ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  : <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                <span className="text-ink-200">
                  朗读测试：{diagResult.testOk ? '✅ 可正常朗读' : '❌ 朗读失败'}
                </span>
              </div>

              {/* 各语言语音检测 */}
              <div>
                <div className="text-ink-400 mb-1.5">各语言语音检测：</div>
                {diagResult.probe.map((p) => (
                  <div key={p.lang} className="flex items-start gap-2 ml-2 mb-1">
                    {p.ok && p.voice
                      ? <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                      : <XCircle className="w-3 h-3 text-rose-400 flex-shrink-0 mt-0.5" />}
                    <span className="text-ink-300">
                      {p.lang.toUpperCase()}：{p.voice ? p.voice : '❌ 未找到语音'}
                    </span>
                  </div>
                ))}
              </div>

              {/* 已安装的所有语音 */}
              <div>
                <div className="text-ink-400 mb-1.5">本机已安装语音（共 {diagResult.voices.length} 个）：</div>
                {diagResult.voices.length === 0 ? (
                  <div className="text-rose-400 ml-2">⚠️ 未检测到任何语音，可能是语音包未下载</div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 ml-2">
                    {diagResult.voices.map((v, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-ink-700 text-ink-300 text-[10px]">{v}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-1 text-ink-500 border-t border-ink-700 leading-relaxed">
                💡 提示：若无语音，请连接 WiFi 后在手机「设置 → 语言与输入 → 语音」中下载对应语言的语音包。Android Chrome 使用系统级语音合成引擎。
              </div>
            </div>
          ) : (
            <div className="text-ink-400">点击上方按钮开始诊断</div>
          )}
        </div>
      )}

      {/* 导航栏 */}
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
