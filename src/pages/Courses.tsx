import { useState, useMemo } from 'react';
import { courses, languageMeta } from '../data/courses';
import CourseCard from '../components/CourseCard';
import type { Level, LanguageCode } from '../types';
import { Sparkles } from 'lucide-react';

const levels: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const languages: { code: LanguageCode | 'all'; name: string; flag: string }[] = [
  { code: 'all', name: '全部', flag: '🌐' },
  { code: 'en', name: '英语', flag: '🇬🇧' },
  { code: 'ja', name: '日语', flag: '🇯🇵' },
  { code: 'ko', name: '韩语', flag: '🇰🇷' },
];

const Courses = () => {
  const [language, setLanguage] = useState<LanguageCode | 'all'>('all');
  const [level, setLevel] = useState<Level | 'all'>('all');

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const langOk = language === 'all' || c.language === language;
      const levelOk = level === 'all' || c.level === level;
      return langOk && levelOk;
    });
  }, [language, level]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 顶部标题 */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-gold-400 mb-3">
          <Sparkles className="w-4 h-4" /> 课程中心
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-white font-bold mb-3">
          所有语言课程
        </h1>
        <p className="text-ink-300 max-w-2xl">
          英语、日语、韩语，从零基础到高级水平，自由选择符合你目标的课程。
        </p>
      </div>

      {/* 筛选器 */}
      <div className="p-5 rounded-2xl bg-ink-800/60 border border-ink-700/70 mb-10">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex-1">
            <div className="text-xs text-ink-400 mb-2">选择语言</div>
            <div className="flex flex-wrap gap-2">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-4 py-2 rounded-xl text-sm transition ${
                    language === l.code
                      ? 'bg-gold-500 text-ink-900 font-semibold'
                      : 'bg-ink-700/60 text-ink-200 hover:bg-ink-700'
                  }`}
                >
                  <span className="mr-1">{l.flag}</span>
                  {l.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <div className="text-xs text-ink-400 mb-2">选择等级</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLevel('all')}
                className={`px-3 py-2 rounded-xl text-sm transition ${
                  level === 'all'
                    ? 'bg-gold-500 text-ink-900 font-semibold'
                    : 'bg-ink-700/60 text-ink-200 hover:bg-ink-700'
                }`}
              >
                全部
              </button>
              {levels.map((lv) => (
                <button
                  key={lv}
                  onClick={() => setLevel(lv)}
                  className={`px-3 py-2 rounded-xl text-sm transition ${
                    level === lv
                      ? 'bg-gold-500 text-ink-900 font-semibold'
                      : 'bg-ink-700/60 text-ink-200 hover:bg-ink-700'
                  }`}
                >
                  {lv}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 结果 */}
      <div className="mb-4 flex items-center justify-between text-sm text-ink-300">
        <span>共 {filtered.length} 门课程</span>
        {language !== 'all' && (
          <span className="text-xs text-gold-400">
            {languageMeta[language].flag} {languageMeta[language].name}
          </span>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl bg-ink-800/40 border border-dashed border-ink-700 text-ink-300">
          <div className="text-5xl mb-3">🫧</div>
          <p className="text-sm">当前筛选条件下没有课程，试试其他组合？</p>
        </div>
      )}
    </div>
  );
};

export default Courses;
