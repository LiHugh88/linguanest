import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Home, TrendingUp, Users, Trophy, User, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: '/', label: '首页', icon: <Home className="w-4 h-4" /> },
    { to: '/courses', label: '课程中心', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/progress', label: '学习进度', icon: <TrendingUp className="w-4 h-4" /> },
    { to: '/recommend', label: '个性化推荐', icon: <Sparkles className="w-4 h-4" /> },
    { to: '/community', label: '社区交流', icon: <Users className="w-4 h-4" /> },
    { to: '/achievements', label: '成就激励', icon: <Trophy className="w-4 h-4" /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-ink-900/80 backdrop-blur-md border-b border-ink-700/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-500 to-gold-300 flex items-center justify-center shadow-lg shadow-gold-500/20 group-hover:scale-105 transition">
              <span className="text-lg">🌍</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display text-lg text-white font-semibold">LinguaNest</span>
              <span className="text-[10px] text-ink-300 tracking-widest uppercase">沉浸式多语学习</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 transition
                    ${active ? 'bg-ink-700/70 text-gold-400' : 'text-ink-300 hover:text-white hover:bg-ink-700/40'}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-ink-700/60 transition"
                >
                  <span className="text-xl">{user?.avatar}</span>
                  <div className="flex flex-col leading-tight text-left">
                    <span className="text-sm text-white">{user?.username}</span>
                    <span className="text-[10px] text-gold-400">{user?.exp} EXP</span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-ink-300 hover:text-white hover:bg-ink-700/60 transition"
                  title="退出登录"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-1.5 rounded-lg text-sm text-ink-200 hover:text-white hover:bg-ink-700/60 transition"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-lg text-sm bg-gradient-to-r from-gold-500 to-gold-400 text-ink-900 font-semibold hover:shadow-lg hover:shadow-gold-500/30 transition"
                >
                  注册
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-ink-200 hover:bg-ink-700/60 transition"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-ink-700/60 pt-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                  ${location.pathname === item.to ? 'bg-ink-700/70 text-gold-400' : 'text-ink-200 hover:bg-ink-700/40'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="pt-3 border-t border-ink-700/60 flex items-center justify-between">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-ink-200 text-sm"
                  >
                    <User className="w-4 h-4" />
                    <span>{user?.username}</span>
                  </Link>
                  <button onClick={handleLogout} className="text-sm text-ink-300">
                    退出
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm text-ink-200">
                    登录
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="text-sm px-3 py-1 rounded-md bg-gold-400 text-ink-900 font-semibold"
                  >
                    注册
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
