import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Award, Target } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import { languageMeta } from '../data/courses';
import type { LanguageCode, Level } from '../types';

const AVATARS = ['🦊', '🐼', '🐯', '🐨', '🦁', '🦉', '🐙', '🦄', '🐶', '🐱', '🐻', '🐸'];
const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile } = useAuthStore();
  const learning = useLearningStore();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username ?? '');
  const [avatar, setAvatar] = useState(user?.avatar ?? '🦊');
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>(user?.targetLanguage ?? 'en');
  const [level, setLevel] = useState<Level>(user?.level ?? 'A1');
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 animate-slideUp">
        <div className="text-6xl mb-6">👤</div>
        <h2 className="text-2xl font-bold mb-3 text-ink-100">请先登录</h2>
        <p className="text-ink-400 mb-8">登录后管理你的个人资料和学习设置。</p>
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-3 rounded-2xl bg-gold-500 hover:bg-gold-400 text-ink-950 font-semibold transition shadow-lg"
        >
          立即登录
        </button>
      </div>
    );
  }

  const streak = learning.getStreak();
  const totalItems = learning.getTotalItems();
  const accuracy = learning.getAccuracy();

  const handleSave = () => {
    updateProfile({ username: username.trim() || user.username, avatar, targetLanguage, level });
    setEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleReset = () => {
    learning.resetAll();
    setConfirmReset(false);
  };

  return (
    <div className="space-y-6 animate-slideUp max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-ink-100 flex items-center gap-3">
          <User className="w-7 h-7 text-gold-400" />
          个人资料
        </h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-ink-800 hover:bg-ink-700 text-ink-100 border border-ink-700 transition"
          >
            <Settings className="w-4 h-4" />
            编辑资料
          </button>
        )}
      </div>

      {/* 主卡片 */}
      <div className="rounded-3xl bg-gradient-to-br from-gold-500/10 via-ink-800/60 to-violet-500/10 border border-ink-700 p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-3xl bg-ink-900 border border-gold-500/40 flex items-center justify-center text-5xl shadow-lg shadow-gold-500/10 animate-float">
            {user.avatar}
          </div>
          <div className="flex-1 w-full">
            {!editing ? (
              <>
                <h2 className="text-2xl font-bold text-ink-100 mb-2">{user.username}</h2>
                <div className="flex flex-wrap items-center gap-2 text-sm mb-4">
                  <span className="px-3 py-1 rounded-full bg-ink-900/80 text-gold-300 border border-gold-500/30">
                    {languageMeta[user.targetLanguage].flag} 正在学习 {languageMeta[user.targetLanguage].name}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-ink-900/80 text-sky-300 border border-sky-500/30">
                    级别 {user.level}
                  </span>
                </div>
                <p className="text-ink-400 text-sm">📧 {user.email} · 加入于 {user.createdAt}</p>
              </>
            ) : (
              <div className="space-y-4 w-full">
                <div>
                  <label className="block text-xs text-ink-400 mb-1.5">用户名</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-ink-400 mb-1.5">选择头像</label>
                  <div className="flex flex-wrap gap-2">
                    {AVATARS.map((a) => (
                      <button
                        key={a}
                        onClick={() => setAvatar(a)}
                        className={`w-10 h-10 rounded-xl text-2xl flex items-center justify-center transition ${
                          avatar === a
                            ? 'bg-gold-500/20 border-2 border-gold-500'
                            : 'bg-ink-900 border border-ink-700 hover:border-ink-600'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-ink-400 mb-1.5">目标语言</label>
                    <select
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value as LanguageCode)}
                      className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500/50"
                    >
                      {(Object.keys(languageMeta) as LanguageCode[]).map((l) => (
                        <option key={l} value={l}>
                          {languageMeta[l].flag} {languageMeta[l].name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-ink-400 mb-1.5">当前级别</label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as Level)}
                      className="w-full bg-ink-900 border border-ink-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-gold-500/50"
                    >
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-ink-950 font-semibold transition"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 px-5 py-2.5 rounded-xl bg-ink-800 hover:bg-ink-700 text-ink-100 border border-ink-700 transition"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-ink-800/60 border border-ink-700">
          <Award className="w-5 h-5 text-gold-400 mb-2" />
          <div className="text-sm text-ink-400">经验值</div>
          <div className="text-2xl font-bold text-ink-100 mt-1">{user.exp}</div>
        </div>
        <div className="p-5 rounded-3xl bg-ink-800/60 border border-ink-700">
          <Target className="w-5 h-5 text-orange-400 mb-2" />
          <div className="text-sm text-ink-400">连续天数</div>
          <div className="text-2xl font-bold text-ink-100 mt-1">{streak} 天</div>
        </div>
        <div className="p-5 rounded-3xl bg-ink-800/60 border border-ink-700">
          <div className="text-2xl mb-2">📚</div>
          <div className="text-sm text-ink-400">已学条目</div>
          <div className="text-2xl font-bold text-ink-100 mt-1">{totalItems}</div>
        </div>
        <div className="p-5 rounded-3xl bg-ink-800/60 border border-ink-700">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-sm text-ink-400">正确率</div>
          <div className="text-2xl font-bold text-ink-100 mt-1">{Math.round(accuracy * 100)}%</div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="rounded-3xl bg-ink-800/60 border border-ink-700 p-6 space-y-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-ink-900/60 hover:bg-ink-900 text-ink-100 border border-ink-700/70 transition"
        >
          <span className="flex items-center gap-3">
            <LogOut className="w-5 h-5 text-rose-400" />
            <span>退出登录</span>
          </span>
          <span className="text-ink-500">→</span>
        </button>

        {confirmReset ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
            <p className="text-sm text-rose-200 mb-3">⚠️ 确定要清除所有学习记录和社区数据吗？此操作不可撤销。</p>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-sm font-semibold transition"
              >
                确认清除
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 rounded-xl bg-ink-800 hover:bg-ink-700 text-ink-100 text-sm border border-ink-700 transition"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-ink-900/60 hover:bg-ink-900 text-ink-100 border border-ink-700/70 transition"
          >
            <span className="flex items-center gap-3">
              <span className="text-xl">🗑️</span>
              <span>清除学习记录</span>
            </span>
            <span className="text-ink-500">→</span>
          </button>
        )}
      </div>
    </div>
  );
}
