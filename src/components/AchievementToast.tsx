import { useEffect, useState } from 'react';
import type { Achievement } from '../types';

interface Props {
  achievement: Achievement | null;
  onClose: () => void;
}

const AchievementToast = ({ achievement, onClose }: Props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const t = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 3200);
      return () => clearTimeout(t);
    }
  }, [achievement, onClose]);

  if (!achievement || !visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-start justify-center pt-24 animate-[fadeIn_0.3s_ease-out]">
      <div
        className={`pointer-events-auto bg-gradient-to-br from-ink-800 to-ink-900 border border-gold-500/50 rounded-2xl
          px-6 py-5 shadow-2xl shadow-gold-500/30 transform transition-all duration-500 translate-y-0 opacity-100`}
      >
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center text-3xl shadow-lg shadow-gold-500/40">
            <span className="animate-pulse">{achievement.icon}</span>
          </div>
          <div>
            <div className="text-[10px] tracking-widest uppercase text-gold-400 font-semibold">新成就解锁</div>
            <div className="text-lg font-display font-semibold text-white mt-0.5">{achievement.name}</div>
            <div className="text-xs text-ink-300 mt-1">{achievement.description}</div>
            <div className="text-[11px] text-gold-400 mt-1">+{achievement.expReward} EXP</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementToast;
