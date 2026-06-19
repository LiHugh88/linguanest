import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PenSquare, MessageCircle, Languages } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useLearningStore } from '../store/learningStore';
import PostCard from '../components/PostCard';
import { languageMeta } from '../data/courses';
import type { LanguageCode } from '../types';

export default function Community() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { posts, addPost } = useLearningStore();

  const [filter, setFilter] = useState<'all' | LanguageCode>('all');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostLang, setNewPostLang] = useState<LanguageCode | 'multi'>(user?.targetLanguage ?? 'en');
  const [showComposer, setShowComposer] = useState(false);

  const filteredPosts = filter === 'all' ? posts : posts.filter((p) => p.language === filter);

  const handleSubmit = () => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    if (!newPostContent.trim()) return;
    addPost({
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      content: newPostContent.trim(),
      language: newPostLang,
    });
    setNewPostContent('');
    setShowComposer(false);
  };

  return (
    <div className="space-y-6 animate-slideUp">
      {/* 头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink-100 mb-2 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-gold-400" />
            语言社区
          </h1>
          <p className="text-ink-400">与世界各地的学习者分享你的进步与心得 🌍</p>
        </div>
        <button
          onClick={() => {
            if (!isAuthenticated) navigate('/login');
            else setShowComposer(!showComposer);
          }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gold-500 hover:bg-gold-400 text-ink-950 font-semibold shadow-lg shadow-gold-500/20 transition"
        >
          <PenSquare className="w-4 h-4" />
          发布动态
        </button>
      </div>

      {/* 发布器 */}
      {showComposer && isAuthenticated && user && (
        <div className="rounded-3xl bg-ink-800/60 border border-ink-700 p-5 animate-fadeIn">
          <div className="flex gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-ink-700 border border-ink-600 flex items-center justify-center text-xl flex-shrink-0">
              {user.avatar}
            </div>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="分享你今天的学习心得、遇到的难题或者一句激励的话…"
              className="flex-1 bg-ink-900/80 border border-ink-700 rounded-2xl p-3 text-sm text-white resize-none h-24 focus:outline-none focus:border-gold-500/50"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-ink-400" />
              <select
                value={newPostLang}
                onChange={(e) => setNewPostLang(e.target.value as LanguageCode | 'multi')}
                className="bg-ink-900 border border-ink-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-500/50"
              >
                <option value="en">🇬🇧 英语</option>
                <option value="ja">🇯🇵 日语</option>
                <option value="ko">🇰🇷 韩语</option>
                <option value="multi">🌍 多语言</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-500">{newPostContent.length}/280</span>
              <button
                onClick={handleSubmit}
                disabled={!newPostContent.trim() || newPostContent.length > 280}
                className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-ink-950 font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                发布
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 筛选 */}
      <div className="flex flex-wrap gap-2">
        <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')} label="全部" />
        {(Object.keys(languageMeta) as LanguageCode[]).map((lang) => (
          <FilterBtn
            key={lang}
            active={filter === lang}
            onClick={() => setFilter(lang)}
            label={`${languageMeta[lang].flag} ${languageMeta[lang].name}`}
          />
        ))}
      </div>

      {/* 帖子列表 */}
      <div className="grid gap-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-ink-800/40 border border-ink-700">
            <div className="text-5xl mb-4">💭</div>
            <h3 className="text-lg font-semibold text-ink-100 mb-2">还没有动态</h3>
            <p className="text-ink-400">成为第一个分享者吧！</p>
          </div>
        ) : (
          filteredPosts.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </div>
    </div>
  );
}

function FilterBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
        active
          ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40'
          : 'text-ink-300 hover:text-ink-100 hover:bg-ink-800 border border-transparent'
      }`}
    >
      {label}
    </button>
  );
}
