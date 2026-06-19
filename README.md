# LinguaNest 🌍

> 沉浸式多语言在线学习平台 —— 英语 / 日语 / 韩语

[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06b6d4?logo=tailwind-css)](https://tailwindcss.com/)

## ✨ 功能特色

| 模块 | 说明 |
|------|------|
| 🏠 **首页** | 语言选择入口、热门课程、成就与社区概览 |
| 👤 **用户系统** | 邮箱注册登录、个人资料、头像、目标语言配置 |
| 📚 **分级课程** | A1–C2 六个等级，英/日/韩三门语言 |
| 🃏 **单词记忆** | 卡片翻转式记忆，支持朗读发音 |
| ✏️ **语法练习** | 即时反馈的选择题形式 |
| 🎤 **口语跟读** | TTS 发音示范，逐句跟读 |
| 👂 **听力训练** | 听写模式，文本输入比对 |
| 📊 **学习进度** | 连续学习天数、正确率、14 天学习热力图 |
| 🎯 **个性化推荐** | 基于学习数据与目标等级推荐课程 |
| 🏆 **成就系统** | 13 项徽章成就，经验值等级体系 |
| 💬 **社区交流** | 动态发布、点赞、评论互动 |

## 🚀 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
# → http://localhost:5173

# 3. 构建生产版本
npm run build

# 4. 预览生产版本
npm run preview
```

## 📁 项目结构

```
linguanest/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── CourseCard.tsx
│   │   ├── AchievementBadge.tsx
│   │   └── PostCard.tsx
│   ├── pages/               # 页面组件
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Courses.tsx
│   │   ├── VocabLearn.tsx
│   │   ├── GrammarLearn.tsx
│   │   ├── SpeakingLearn.tsx
│   │   ├── ListeningLearn.tsx
│   │   ├── Learning.tsx
│   │   ├── Progress.tsx
│   │   ├── Recommend.tsx
│   │   ├── Achievements.tsx
│   │   ├── Community.tsx
│   │   └── Profile.tsx
│   ├── store/               # Zustand 状态管理
│   │   ├── authStore.ts     # 认证 / 用户信息
│   │   └── learningStore.ts # 学习数据 / 成就 / 社区
│   ├── data/                # 模拟数据（课程/单词/语法/口语/听力/成就）
│   ├── utils/               # 工具函数（storage / speech / recommend）
│   ├── types/               # TypeScript 类型定义
│   ├── App.tsx              # 路由配置入口
│   ├── main.tsx             # React DOM 挂载
│   └── index.css            # 全局样式 + Tailwind 配置
├── docs/
│   ├── PRD.md               # 产品需求文档
│   └── ARCHITECTURE.md      # 架构设计文档
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## 🛠 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite 5
- **样式方案**：Tailwind CSS 3（自定义深海蓝 + 暖金主题）
- **状态管理**：Zustand
- **路由方案**：React Router DOM v6
- **图标库**：Lucide React
- **语音合成**：浏览器原生 Web Speech API
- **数据持久化**：Browser LocalStorage（Demo 阶段）

## 📖 文档

- [产品需求文档 PRD](docs/PRD.md)
- [架构设计文档 ARCHITECTURE](docs/ARCHITECTURE.md)

## 🎨 设计风格

- **主色调**：深海蓝（`#0b0f1a`）作为暗色基调
- **强调色**：暖金（`#fbbf24`）突出交互元素与徽章
- **字体**：Inter + PingFang SC，支持多语言 CJK 字符
- **动画**：卡片上浮、渐显淡入、徽章发光、进度条渐变

## 📄 License

MIT © LinguaNest Team
