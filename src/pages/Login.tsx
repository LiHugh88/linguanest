import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'ok'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ type: 'error', text: '请输入邮箱和密码' });
      return;
    }
    const r = login(email, password);
    if (r.ok) {
      setMessage({ type: 'ok', text: r.message || '登录成功，正在跳转…' });
      setTimeout(() => navigate('/'), 600);
    } else {
      // Demo 友好提示：允许直接使用 register 页注册；或者给一个 demo 快捷登录
      setMessage({ type: 'error', text: r.message + '（或点击下方"快速体验"直接进入）' });
    }
  };

  const demoLogin = () => {
    // Demo：直接以邮箱 demo@linguanest.com 注册并登录
    const { register } = useAuthStore.getState();
    let r = login('demo@linguanest.com', 'demo1234');
    if (!r.ok) {
      r = register('Demo Learner', 'demo@linguanest.com', 'demo1234');
    }
    setMessage({ type: 'ok', text: r.message || '登录成功！' });
    setTimeout(() => navigate('/'), 600);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="absolute top-10 left-1/4 w-[300px] h-[300px] bg-gold-500/10 rounded-full blur-[100px]" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center text-3xl shadow-lg shadow-gold-500/30">
            🌍
          </div>
          <h1 className="font-display text-3xl text-white font-bold mb-2">欢迎回来</h1>
          <p className="text-sm text-ink-300">继续你的语言学习之旅</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-3xl bg-ink-800/70 border border-ink-700/70 backdrop-blur-sm"
        >
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
            登录 <ArrowRight className="w-4 h-4" />
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-ink-800 text-[10px] uppercase tracking-widest text-ink-400">或</span>
            </div>
          </div>

          <button
            type="button"
            onClick={demoLogin}
            className="w-full py-3 rounded-xl bg-ink-700/60 border border-ink-600 text-sm text-white hover:bg-ink-700 transition"
          >
            🎯 快速体验（免注册直接进入）
          </button>

          <p className="mt-6 text-center text-xs text-ink-400">
            还没有账号？{' '}
            <Link to="/register" className="text-gold-400 hover:text-gold-300 font-semibold">
              立即注册
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
