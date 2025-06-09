<div align="center">
  <img src="public/logo.png" alt="NAdmin Logo" width="120" height="120">
  
  # 🚀 N Admin
  
  **下一代企业级后台管理系统模板**
  
  *一个基于 Next.js 15 构建的现代化、高性能、可扩展的后台管理系统*
  
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
  
  [![Build Status](https://img.shields.io/github/workflow/status/guizimo/n-admin/CI?style=flat-square)](https://github.com/guizimo/n-admin/actions)
  [![Version](https://img.shields.io/github/package-json/v/guizimo/n-admin?style=flat-square)](https://github.com/guizimo/n-admin/releases)
  [![Stars](https://img.shields.io/github/stars/guizimo/n-admin?style=flat-square)](https://github.com/guizimo/n-admin/stargazers)
  [![Forks](https://img.shields.io/github/forks/guizimo/n-admin?style=flat-square)](https://github.com/guizimo/n-admin/network/members)
  
  [🎯 在线演示](https://n-admin-demo.vercel.app) •
  [📖 文档](https://n-admin-docs.vercel.app) •
  [🐛 报告 Bug](https://github.com/username/n-admin/issues) •
  [✨ 功能请求](https://github.com/username/n-admin/issues)
  
</div>

---

## 📸 项目预览

<div align="center">
  <img src="screenshot/screenshot-1.png" alt="Dashboard Preview" width="100%">
  
  *🎨 现代化的仪表板界面 - 简洁、优雅、功能强大*
</div>

<details>
<summary>🖼️ 查看更多截图</summary>

<div align="center">
  
  ### 🔐 登录页面
  <img src="screenshot/login.png" alt="Login Page" width="80%">
  
  ### 👥 用户管理
  <img src="screenshot/users.png" alt="User Management" width="80%">
  
  ### 📊 数据分析
  <img src="screenshot/analytics.png" alt="Analytics Dashboard" width="80%">
  
</div>

</details>

---

## ✨ 核心特性

<div align="center">

|   🚀 **现代化框架**   |      💅 **精美UI**       |   🔒 **安全可靠**   |
| :-------------------: | :----------------------: | :-----------------: |
| Next.js 15 + React 19 | Tailwind CSS + Shadcn UI | JWT 认证 + 权限控制 |
|    **🌙 主题切换**    |    **📱 响应式设计**     |   **🔍 类型安全**   |
|   明暗主题自由切换    |     完美适配多端设备     | TypeScript 全栈支持 |

</div>

### 🏗️ 架构特性

- **🎯 App Router** - Next.js 15 最新路由系统
- **⚡ 极速渲染** - SSR + 静态生成优化
- **🔧 模块化设计** - 高度可定制和扩展
- **📦 组件库** - 基于 Radix UI 的高质量组件
- **🗄️ 数据库** - Drizzle ORM + MySQL
- **🎨 UI 框架** - Tailwind CSS + Shadcn UI
- **🚀 部署就绪** - 支持 Vercel、Docker 等多种部署方式

### 🎯 功能模块

- **👤 用户管理** - 用户 CRUD、权限分配、状态管理
- **🛡️ 角色权限** - 细粒度权限控制、角色继承
- **📊 数据看板** - 实时数据展示、图表可视化
- **🔔 消息通知** - 实时通知、消息中心
- **⚙️ 系统设置** - 主题切换、语言设置、个性化配置
- **📱 响应式布局** - 完美适配桌面端、平板、手机

---

## 🚀 快速开始

### 🔧 环境要求

| 工具    | 版本要求 | 推荐版本 |
| ------- | -------- | -------- |
| Node.js | >= 18.0  | 20.x     |
| pnpm    | >= 9.0   | 最新版本 |
| MySQL   | >= 8.0   | 8.0+     |

### 📦 安装步骤

```bash
# 1️⃣ 克隆项目
git clone https://github.com/guizimo/n-admin.git
cd n-admin

# 2️⃣ 安装依赖
pnpm install

# 3️⃣ 环境配置
cp .env.example .env
# 编辑 .env 文件，配置数据库和其他环境变量

# 4️⃣ 数据库初始化
pnpm db:generate && pnpm db:push

# 5️⃣ 创建管理员账号
pnpm init:admin

# 6️⃣ 启动开发服务器
pnpm dev
```

### 🎉 立即体验

```bash
# 🌐 访问应用首页
open http://localhost:3000

# 🔐 管理员登录
open http://localhost:3000/login
```

**默认管理员账号：**

- 📧 邮箱：`admin@example.com`
- 🔑 密码：`Admin@123456`

---

## 🏗️ 项目架构

```
📦 n-admin/
├── 🎯 src/                     # 源代码目录
│   ├── 🌐 app/                 # Next.js App Router
│   │   ├── 🔌 api/            # API 路由
│   │   ├── 📊 dashboard/      # 管理后台
│   │   ├── 🔐 login/          # 用户认证
│   │   └── 🎨 globals.css     # 全局样式
│   ├── 🧩 components/         # 组件库
│   │   ├── 🎭 ui/             # 基础组件
│   │   ├── 📐 layout/         # 布局组件
│   │   └── 🔧 common/         # 通用组件
│   ├── ⚡ features/           # 功能模块
│   ├── 🪝 hooks/              # 自定义 Hooks
│   ├── 📚 lib/                # 工具函数
│   ├── 🏷️ types/              # 类型定义
│   ├── ⚙️ config/             # 配置文件
│   └── 🗄️ db/                 # 数据库层
├── 🔧 scripts/               # 脚本工具
├── 🌍 public/                # 静态资源
├── 📋 drizzle/               # 数据库迁移
└── 📄 docs/                  # 项目文档
```

---

## 🛠️ 开发指南

### 🔄 日常开发

```bash
# 🚀 开发相关命令
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm lint         # 代码检查
pnpm format       # 代码格式化
pnpm type-check   # 类型检查

# 🗄️ 数据库相关
pnpm db:generate  # 生成迁移文件
pnpm db:push      # 执行数据库迁移
pnpm db:studio    # 启动数据库管理界面
pnpm init:admin   # 初始化管理员账号

# 📝 提交和版本管理
pnpm commit       # 交互式提交（推荐）
pnpm release      # 自动发布版本
```

### 🔐 环境变量配置

```bash
# 📋 复制配置文件
cp .env.example .env
```

```bash
# 🗄️ 数据库配置
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=n_admin

# 🔑 安全配置
JWT_SECRET=your_super_secret_jwt_key_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# 👤 管理员配置
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123456
SALT_ROUNDS=12
```

---

## 🚀 部署指南

### ☁️ Vercel 部署 (推荐)

1. **Fork 项目** 到你的 GitHub 账号
2. **连接 Vercel** 到你的 GitHub 仓库
3. **配置环境变量** 在 Vercel 控制台
4. **自动部署** - 推送代码即可自动部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fusername%2Fn-admin)

### 🐳 Docker 部署

```bash
# 🏗️ 构建镜像
docker build -t n-admin .

# 🚀 运行容器
docker run -p 3000:3000 \
  -e DATABASE_URL="your_database_url" \
  -e JWT_SECRET="your_jwt_secret" \
  n-admin
```

### 📦 Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=mysql://user:password@db:3306/n_admin
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: n_admin
    ports:
      - '3306:3306'
```

---

## 🛠️ 技术栈

<div align="center">

### 🎨 前端技术

| 技术                                                                                                      | 版本 | 描述                  |
| --------------------------------------------------------------------------------------------------------- | ---- | --------------------- |
| ![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)                  | 15.x | React 全栈框架        |
| ![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)                         | 19.x | 用户界面库            |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)           | 5.x  | 类型安全的 JavaScript |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-38B2AC?style=flat-square&logo=tailwind-css) | 3.x  | 原子化 CSS 框架       |

### 🔧 后端技术

| 技术                                                                             | 版本 | 描述           |
| -------------------------------------------------------------------------------- | ---- | -------------- |
| ![Drizzle](https://img.shields.io/badge/Drizzle-ORM-green?style=flat-square)     | 最新 | 类型安全的 ORM |
| ![MySQL](https://img.shields.io/badge/MySQL-8-blue?style=flat-square&logo=mysql) | 8.0+ | 关系型数据库   |
| ![JWT](https://img.shields.io/badge/JWT-Auth-red?style=flat-square)              | -    | 身份认证       |

### 🔨 开发工具

| 工具               | 作用           |
| ------------------ | -------------- |
| ESLint + Prettier  | 代码质量保证   |
| Husky + Commitlint | Git 提交规范   |
| Standard Version   | 自动化版本管理 |
| pnpm               | 高效包管理     |

</div>

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！在贡献之前，请先阅读我们的 [贡献指南](docs/CONTRIBUTING.md)。

### 🚀 参与方式

1. **🍴 Fork** 这个项目
2. **🌿 创建** 你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. **📝 提交** 你的更改 (`pnpm commit`)
4. **🚀 推送** 到分支 (`git push origin feature/AmazingFeature`)
5. **🔀 开启** 一个 Pull Request

### 📝 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 🎯 使用交互式提交工具（推荐）
pnpm commit

# 📝 手动提交示例
git commit -m "feat(auth): 添加用户登录功能"
git commit -m "fix(dashboard): 修复数据加载错误"
```

---

## 🆘 常见问题

<details>
<summary><strong>🚪 访问 /dashboard 时跳转到首页？</strong></summary>

这是正常的认证行为：

1. 确保已运行 `pnpm init:admin` 初始化管理员
2. 访问 `/login` 页面登录
3. 使用默认账号：`admin@example.com` / `Admin@123456`

</details>

<details>
<summary><strong>🔌 数据库连接失败？</strong></summary>

检查以下配置：

1. MySQL 服务是否已启动
2. `.env` 文件中的数据库配置是否正确
3. 数据库是否已创建
4. 网络连接是否正常

</details>

<details>
<summary><strong>🎨 如何自定义主题？</strong></summary>

1. 修改 `src/styles/globals.css` 中的 CSS 变量
2. 使用 Tailwind CSS 的主题配置
3. 参考 [主题定制文档](docs/theming.md)

</details>

<details>
<summary><strong>📦 如何添加新功能模块？</strong></summary>

1. 在 `src/features/` 目录创建新模块
2. 按照项目结构组织代码
3. 添加路由和权限配置
4. 参考 [开发文档](docs/development.md)

</details>

---

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=guizimo/n-admin&type=Date)](https://star-history.com/#guizimo/n-admin&Date)

---

## 💖 支持项目

如果这个项目对你有帮助，请考虑：

- ⭐ 给项目一个 **Star**
- 🍴 **Fork** 项目并贡献代码
- 🐛 报告 **Bug** 或提出建议
- 📢 向朋友**推荐**这个项目

---

<div align="center">

**📧 联系我们** | **🌐 官方网站** | **📱 社交媒体**

[Email](mailto:admin@example.com) • [Website](https://n-admin.vercel.app) • [Twitter](https://twitter.com/nadmin) • [Discord](https://discord.gg/nadmin)

---

<sub>💡 使用 N Admin 构建下一个伟大的项目！</sub>

</div>
