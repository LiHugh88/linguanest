import { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import type { Post } from '../types';
import { useLearningStore } from '../store/learningStore';
import { useAuthStore } from '../store/authStore';
import { languageMeta } from '../data/courses';

interface Props {
  post: Post;
}

const PostCard = ({ post }: Props) => {
  const { user, isAuthenticated } = useAuthStore();
  const { toggleLike, addComment } = useLearningStore();
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');

  const langLabel =
    post.language === 'multi'
      ? '多语言'
      : languageMeta[post.language as keyof typeof languageMeta]
      ? `${languageMeta[post.language as keyof typeof languageMeta].flag} ${languageMeta[post.language as keyof typeof languageMeta].name}`
      : '动态';

  const handleLike = () => {
    if (!isAuthenticated || !user) return;
    toggleLike(post.id, user.id);
  };

  const submitComment = () => {
    if (!isAuthenticated || !user || !commentText.trim()) return;
    addComment(post.id, {
      username: user.username,
      avatar: user.avatar,
      content: commentText.trim(),
    });
    setCommentText('');
    setShowCommentInput(false);
  };

  const liked = user ? post.likedBy.includes(user.id) : false;

  return (
    <div className="bg-ink-800/60 border border-ink-700/70 rounded-2xl p-5 hover:border-ink-600 transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-ink-700 border border-ink-600 flex items-center justify-center text-xl">
            {post.avatar}
          </div>
          <div>
            <div className="text-sm text-white font-semibold">{post.username}</div>
            <div className="text-[10px] text-ink-400">{post.createdAt}</div>
          </div>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-ink-700/80 text-gold-400 border border-gold-500/30">
          {langLabel}
        </span>
      </div>

      <p className="text-sm text-ink-100 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>

      <div className="flex items-center gap-4 pt-3 border-t border-ink-700/50">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs transition ${
            liked ? 'text-rose-400' : 'text-ink-300 hover:text-rose-400'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-rose-400' : ''}`} />
          <span>{post.likes}</span>
        </button>
        <button
          onClick={() => setShowCommentInput(!showCommentInput)}
          className="flex items-center gap-1.5 text-xs text-ink-300 hover:text-gold-400 transition"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.comments.length} 评论</span>
        </button>
      </div>

      {post.comments.length > 0 && (
        <div className="mt-3 space-y-2 pl-3 border-l border-ink-700/60">
          {post.comments.map((c) => (
            <div key={c.id} className="text-xs">
              <span className="text-gold-400 mr-1">{c.avatar} {c.username}：</span>
              <span className="text-ink-200">{c.content}</span>
              <span className="text-ink-500 ml-2 text-[10px]">{c.createdAt}</span>
            </div>
          ))}
        </div>
      )}

      {showCommentInput && (
        <div className="mt-3 flex gap-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={isAuthenticated ? '写下你的评论…' : '请先登录'}
            disabled={!isAuthenticated}
            className="flex-1 bg-ink-900/80 border border-ink-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/50 disabled:opacity-50"
          />
          <button
            onClick={submitComment}
            className="px-3 py-2 rounded-lg text-xs bg-gold-400 text-ink-900 font-semibold hover:bg-gold-300 transition disabled:opacity-50"
            disabled={!isAuthenticated || !commentText.trim()}
          >
            发布
          </button>
        </div>
      )}
    </div>
  );
};

export default PostCard;
