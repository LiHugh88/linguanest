import { Link } from 'react-router-dom';
import type { Course } from '../types';
import { BookOpen } from 'lucide-react';

interface Props {
  course: Course;
  showActions?: boolean;
  compact?: boolean;
  onOpen?: () => void;
}

const levelColors: Record<string, string> = {
  A1: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  A2: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  B1: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  B2: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
  C1: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  C2: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
};

const CourseCard = ({ course, showActions = true, compact = false, onOpen }: Props) => {
  return (
    <div
      onClick={onOpen}
      className={`group relative bg-ink-800/60 border border-ink-700/70 rounded-2xl p-5
      hover:border-gold-500/50 hover:shadow-xl hover:shadow-gold-500/10 hover:-translate-y-1
      transition-all duration-300 overflow-hidden ${onOpen ? 'cursor-pointer' : ''}`}>
      {/* 顶部光晕 */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-gold-500/10 to-transparent blur-2xl group-hover:from-gold-500/20 transition" />

      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-xl bg-ink-700/60 border border-ink-600 flex items-center justify-center text-2xl">
          {course.icon}
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${levelColors[course.level] || ''}`}>
          {course.level}
        </span>
      </div>

      <h3 className="text-base font-semibold text-white mb-1.5 group-hover:text-gold-400 transition">
        {course.title}
      </h3>
      <p className={`text-sm text-ink-300 mb-3 leading-relaxed ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}>
        {course.description}
      </p>

      {!compact && course.tags && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {course.tags.map((t) => (
            <span
              key={t}
              className="text-[10px] px-2 py-0.5 rounded-full bg-ink-700/80 text-ink-200 border border-ink-600/60"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {showActions && (
        <div className="flex gap-2 mt-2">
          <Link
            to={`/learn/vocab/${course.id}`}
            className="flex-1 text-center text-xs py-2 rounded-lg bg-ink-700/70 text-ink-200 hover:bg-ink-600/70 hover:text-white transition"
          >
            单词
          </Link>
          <Link
            to={`/learn/grammar/${course.id}`}
            className="flex-1 text-center text-xs py-2 rounded-lg bg-ink-700/70 text-ink-200 hover:bg-ink-600/70 hover:text-white transition"
          >
            语法
          </Link>
          <Link
            to={`/learn/speaking/${course.id}`}
            className="flex-1 text-center text-xs py-2 rounded-lg bg-ink-700/70 text-ink-200 hover:bg-ink-600/70 hover:text-white transition"
          >
            口语
          </Link>
          <Link
            to={`/learn/listening/${course.id}`}
            className="flex-1 text-center text-xs py-2 rounded-lg bg-gradient-to-r from-gold-500/90 to-gold-400 text-ink-900 font-semibold hover:shadow-lg hover:shadow-gold-500/30 transition"
          >
            <span className="inline-flex items-center justify-center gap-1">
              <BookOpen className="w-3 h-3" />
              听力
            </span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CourseCard;
