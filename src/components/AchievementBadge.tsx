import type { Achievement } from '../types';

interface Props {
  achievement: Achievement;
  unlocked: boolean;
}

const AchievementBadge = ({ achievement, unlocked }: Props) => {
  return (
    <div
      className={`relative p-5 rounded-2xl border transition overflow-hidden
        ${unlocked
          ? 'bg-gradient-to-br from-ink-800 to-ink-900 border-gold-500/40 shadow-lg shadow-gold-500/10'
          : 'bg-ink-900/40 border-ink-700/60 opacity-60'}`}
    >
      {unlocked && (
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-gold-500/20 to-transparent blur-xl" />
      )}

      <div className="relative flex flex-col items-center text-center">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-3
            ${unlocked
              ? 'bg-gradient-to-br from-gold-500/30 to-gold-400/10 border border-gold-500/50 shadow-inner shadow-gold-500/20'
              : 'bg-ink-800 border border-ink-700 grayscale'}`}
        >
          {achievement.icon}
        </div>
        <h4 className={`text-sm font-semibold mb-1 ${unlocked ? 'text-gold-300' : 'text-ink-300'}`}>
          {achievement.name}
        </h4>
        <p className="text-xs text-ink-400 mb-2 leading-relaxed">{achievement.description}</p>
        <span className="text-[10px] text-gold-400/80">+{achievement.expReward} EXP</span>
      </div>

      {unlocked && (
        <div className="absolute top-2 right-2 text-[10px] text-gold-400 font-semibold tracking-wide">
          ✓ 已解锁
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;
