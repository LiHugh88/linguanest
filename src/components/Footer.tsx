const Footer = () => {
  return (
    <footer className="mt-16 border-t border-ink-700/60 bg-ink-900/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-300 flex items-center justify-center">
                <span>🌍</span>
              </div>
              <span className="font-display text-white text-xl font-semibold">LinguaNest</span>
            </div>
            <p className="text-sm text-ink-300 max-w-md leading-relaxed">
              沉浸式多语种在线学习平台，用科学的分级课程、互动式练习和有趣的成就激励，
              让语言学习成为你每天期待的快乐时光。
            </p>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">语言</h4>
            <ul className="space-y-2 text-sm text-ink-300">
              <li className="flex items-center gap-2">🇬🇧 英语 English</li>
              <li className="flex items-center gap-2">🇯🇵 日语 日本語</li>
              <li className="flex items-center gap-2">🇰🇷 韩语 한국어</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">功能</h4>
            <ul className="space-y-2 text-sm text-ink-300">
              <li>📚 分级课程</li>
              <li>🎯 单词记忆</li>
              <li>✏️ 语法练习</li>
              <li>🎤 口语跟读</li>
              <li>👂 听力训练</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-ink-700/60 text-center text-xs text-ink-400">
          © 2026 LinguaNest. 用爱点亮你的语言之路。
        </div>
      </div>
    </footer>
  );
};

export default Footer;
