# NAdmin

一个基于 Next.js 15 构建的现代化后台管理系统模板。

## 特性

- 🚀 基于 Next.js 15 App Router
- 💅 使用 Tailwind CSS 构建的现代化 UI
- 🔒 完整的身份认证系统
- 📱 响应式设计，支持多端适配
- 🌙 内置暗色模式支持
- 🔍 TypeScript 类型安全
- 🎯 使用 Drizzle ORM 进行数据库操作

## 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- pnpm 9.0 或更高版本
- MySQL 8.0 或更高版本

### 安装

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env.local

# 初始化数据库
pnpm db:migrate

# 启动开发服务器
pnpm dev
```
访问 http://localhost:3000 查看应用。

## 项目结构
```plaintext
n-admin/
├── src/
│   ├── app/           # 页面和 API 路由
│   ├── components/    # 可复用组件
│   ├── lib/          # 工具函数和配置
│   └── styles/       # 全局样式
├── public/           # 静态资源
└── drizzle/ 
```

## 开发命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm lint         # 运行代码检查
pnpm db:migrate   # 执行数据库迁移
```

## 部署
本项目可以轻松部署到 Vercel 平台：

## 技术栈
- Next.js 15
- React 19
- Tailwind CSS
- TypeScript
- Drizzle ORM
- MySQL
## 贡献指南
欢迎提交 Issue 和 Pull Request。在提交 PR 之前，请确保：

1. 代码通过 ESLint 检查
2. 所有测试通过
3. 提交信息符合规范
## 许可证
MIT License
