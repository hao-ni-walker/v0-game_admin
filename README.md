<div align="center">
  <img src="public/logo.png" alt="NAdmin Logo" width="80" height="80">
  <h1>N Admin</h1>
  <p>一个基于 Next.js 15 构建的现代化后台管理系统模板</p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black" alt="Next.js">
    <img src="https://img.shields.io/badge/React-19-blue" alt="React">
    <img src="https://img.shields.io/badge/TypeScript-5-blue" alt="TypeScript">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
  </p>
</div>

## 特性

- 🚀 基于 Next.js 15 App Router
- 💅 使用 Tailwind CSS + Shadcn UI 构建的现代化 UI
- 🔒 完整的身份认证和权限管理系统
- 👥 用户管理、角色管理、权限分配
- 📱 响应式设计，支持多端适配
- 🌙 内置暗色/亮色主题切换
- 🔍 TypeScript 类型安全
- 🎯 使用 Drizzle ORM 进行数据库操作
- 📊 内置图表和数据可视化组件
- 🎨 基于 Radix UI 的高质量组件库

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
cp .env.example .env

# 初始化数据库
pnpm db:generate
pnpm db:push

# 创建管理员账号
pnpm init:admin

# 启动开发服务器
pnpm dev
```
访问 http://localhost:3000 查看应用。

### 登录系统

默认管理员账号：
- **邮箱：** admin@example.com
- **密码：** Admin@123456（可在 .env 中修改）

访问 http://localhost:3000/login 进行登录，登录后会自动跳转到管理后台 http://localhost:3000/dashboard

## 项目结构
```plaintext
n-admin/
├── src/
│   ├── app/                    # 页面和 API 路由
│   │   ├── api/               # API 路由
│   │   ├── dashboard/         # 后台管理页面
│   │   ├── login/             # 登录页面
│   │   └── globals.css        # 全局样式
│   ├── components/            # 可复用组件
│   │   ├── ui/               # 基础 UI 组件
│   │   └── layout/           # 布局组件
│   ├── features/             # 功能模块
│   ├── hooks/                # 自定义 hooks
│   ├── lib/                  # 工具函数和配置
│   ├── types/                # TypeScript 类型定义
│   ├── constants/            # 常量定义
│   ├── config/               # 配置文件
│   └── db/                   # 数据库模型和连接
├── scripts/                   # 脚本文件
├── public/                   # 静态资源
├── drizzle/                  # 数据库迁移文件
└── .env                      # 环境变量配置
```

## 开发命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm lint         # 运行代码检查
pnpm db:generate  # 生成数据库迁移
pnpm db:push      # 执行数据库迁移
pnpm db:studio    # 启动数据库管理界面
pnpm init:admin   # 初始化管理员账号
```

## 环境变量配置

复制 `.env.example` 文件为 `.env` 并修改以下配置：

```bash
# 数据库配置
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=n_admin

# JWT 密钥
JWT_SECRET=your_secret_key

# 管理员默认密码
ADMIN_PASSWORD=Admin@123456
SALT_ROUNDS=12
```

## 部署

本项目可以轻松部署到各种平台：

### Vercel 部署
1. 连接你的 GitHub 仓库到 Vercel
2. 配置环境变量
3. 部署

### Docker 部署
```bash
# 构建镜像
docker build -t n-admin .

# 运行容器
docker run -p 3000:3000 n-admin
```

## 技术栈

### 前端
- **Next.js 15** - React 全栈框架
- **React 19** - 用户界面库
- **TypeScript 5** - 类型安全的 JavaScript
- **Tailwind CSS** - 原子化 CSS 框架
- **Shadcn UI** - 高质量 React 组件库
- **Radix UI** - 无样式、可访问的 UI 组件

### 后端
- **Drizzle ORM** - 类型安全的 ORM
- **MySQL** - 关系型数据库
- **NextAuth.js** - 身份认证
- **bcryptjs** - 密码加密

### 开发工具
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **pnpm** - 包管理器
## 常见问题

### 1. 访问 /dashboard 时跳转到首页？
这是正常的行为，因为你还没有登录。请先：
1. 运行 `pnpm init:admin` 初始化管理员账号
2. 访问 `/login` 页面进行登录
3. 使用默认账号：admin@example.com / Admin@123456

### 2. 数据库连接失败？
检查 `.env` 文件中的数据库配置是否正确，确保：
- MySQL 服务已启动
- 数据库连接信息正确
- 数据库已创建

### 3. 如何自定义主题？
项目使用 Tailwind CSS 和 CSS 变量来管理主题，你可以在 `src/app/globals.css` 中修改 CSS 变量来自定义主题颜色。

## 贡献指南

欢迎提交 Issue 和 Pull Request！在提交 PR 之前，请确保：

1. 代码通过 ESLint 检查：`pnpm lint`
2. 代码格式正确：`pnpm format`
3. 提交信息符合规范
4. 详细描述你的更改

## 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 联系作者

- 博客：https://blog.guizimo.com
- GitHub：https://github.com/guizimo
