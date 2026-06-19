import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const avatars = ['🦊', '🐼', '🐯', '🐨', '🦁', '🦉', '🐙', '🦄', '🐸', '🐵', '🐻', '🐺'];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [avatar, setAvatar] = useState(avatars[0]);
  const [message, setMessage] = useState<{ type: 'error' | 'ok'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setMessage({ type: 'error', text: '请填写所有字段' });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: '密码至少 6 位' });
      return;
    }
    const r = register(username, email, password);
    if (r.ok) {
      setMessage({ type: 'ok', text: r.message + '，正在进入平台…' });
      setTimeout(() => navigate('/'), 800);
    } else {
      setMessage({ type: 'error', text: r.message });
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="absolute top-10 right-1/4 w-[300px] h-[300px] bg-gold-500/10 rounded-full blur-[100px]" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center text-3xl shadow-lg shadow-gold-500/30">
            🌍
          </div>
          <h1 className="font-display text-3xl text-white font-bold mb-2">开启语言之旅</h1>
          <p className="text-sm text-ink-300">用几秒钟创建你的学习账号</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-3xl bg-ink-800/70 border border-ink-700/70 backdrop-blur-sm"
        >
          <div className="mb-5">
            <label className="block text-xs text-ink-300 mb-2">选择你的头像</label>
            <div className="grid grid-cols-6 gap-2">
              {avatars.map((a) => (
                <button
                  type="button"
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`aspect-square rounded-xl text-xl flex items-center justify-center transition ${
                    avatar === a
                      ? 'bg-gold-500/20 border-2 border-gold-500 scale-110 shadow-lg shadow-gold-500/30'
                      : 'bg-ink-900/80 border border-ink-700 hover:border-ink-500'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs text-ink-300 mb-2">昵称</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="给你自己起个名字"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ink-900/80 border border-ink-700 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-gold-500/50 transition"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs text-ink-300 mb-2">邮箱地址</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ink-900/80 border border-ink-700 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-gold-500/50 transition"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs text-ink-300 mb-2">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 位"
                className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-ink-900/80 border border-ink-700 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-gold-500/50 transition"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-white"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`mb-4 px-4 py-2.5 rounded-xl text-xs ${
                message.type === 'error'
                  ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 text-ink-900 font-semibold hover:shadow-lg hover:shadow-gold-500/30 transition flex items-center justify-center gap-2"
          >
            注册并开始学习 <ArrowRight className="w-4 h-4" />
          </button>

          <p className="mt-6 text-center text-xs text-ink-400">
            已有账号？{' '}
            <Link to="/login" className="text-gold-400 hover:text-gold-300 font-semibold">
              直接登录
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
