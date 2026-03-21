<div align="center">
  <img src="public/logo.png" alt="N-Admin Logo" width="120" height="120">
  
  # N Admin
  
  基于 Next.js 15 构建的现代化后台管理系统。
  
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
  
</div>

## 特性

- **现代框架**: Next.js 15 + React 19 + TypeScript
- **UI组件**: Tailwind CSS + Shadcn UI
- **权限系统**: 基于 RBAC 的完整权限控制
- **数据库**: Drizzle ORM + PostgreSQL/MySQL
- **认证**: JWT + 中间件保护
- **主题**: 明暗主题切换
- **响应式**: 完美适配桌面和移动端

## 功能模块

### 账户管理
- 👤 **用户管理** - 用户CRUD、角色分配
- 🎭 **角色管理** - 角色定义与权限绑定
- 🔐 **权限管理** - 细粒度权限控制

### 管理员模块
- 👨‍💼 **管理员管理** - 管理员账号CRUD、状态管理
- 👥 **玩家管理** - 玩家信息管理、钱包调整、VIP等级设置

### 数据分析
- 📈 **活动参与分析** - 活动参与数据统计
- 💰 **充值分布** - 充值金额分布分析
- 🎮 **游戏流水** - 游戏投注流水记录
- 📊 **运营报表** - 综合运营数据报表
- 🔄 **用户留存** - 用户留存率分析

### 营销推广
- 📢 **公告管理** - 系统公告发布与管理
- 📋 **公告模板** - 公告模板管理
- 🎁 **活动营销** - 营销活动创建与管理
- 🎀 **礼包管理** - 礼包配置与发放
- 🖼️ **首页横幅** - 首页Banner管理

### 订单管理
- 💳 **充值订单** - 充值订单查询与处理
- 💸 **提现订单** - 提现订单审核与管理

### 游戏中心
- 🎲 **游戏管理** - 游戏列表管理
- 🔗 **HGAPI365对接** - 第三方游戏平台对接

### 系统管理
- ⚙️ **系统配置** - 系统参数配置
- 📝 **操作日志** - 管理员操作记录追踪
- 💳 **支付渠道** - 支付渠道配置管理
- 🌐 **平台管理** - 多平台配置

### 其他
- 🎫 **工单系统** - 用户工单处理与跟踪
- 👑 **VIP等级** - VIP等级配置管理
- 💵 **收入统计** - 平台收入数据分析

## 快速开始

### 环境要求

- Node.js >= 18.0
- pnpm >= 9.0
- PostgreSQL/MySQL

### 安装

```bash
# 克隆项目
git clone https://github.com/guizimo/n-admin.git
cd n-admin

# 安装依赖
pnpm install

# 环境配置
cp .env.example .env.local
# 编辑 .env.local 配置数据库连接

# 数据库初始化
pnpm db:generate
pnpm db:push
pnpm init:admin

# 启动开发服务器
pnpm dev
```

访问 http://localhost:3001

**管理员账号:**

- 邮箱: `admin@example.com`
- 密码: `Admin@123456`

## 项目结构

```
src/
├── app/              # Next.js App Router
│   ├── api/         # API 路由
│   ├── dashboard/   # 管理后台页面
│   └── login/       # 登录页面
├── components/      # 组件库
│   ├── ui/         # 基础UI组件
│   └── layout/     # 布局组件
├── lib/            # 工具函数
├── hooks/          # 自定义Hooks
└── db/             # 数据库配置
```

## 开发命令

```bash
# 开发
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm lint         # 代码检查

# 数据库
pnpm db:generate  # 生成迁移文件
pnpm db:push      # 推送数据库结构
pnpm db:studio    # 数据库管理界面
pnpm init:admin   # 初始化管理员
```

## 技术栈

### 前端

- **框架**: Next.js 15 (App Router)
- **UI**: React 19 + TypeScript
- **样式**: Tailwind CSS + Shadcn UI
- **状态**: React Hooks + Context
- **图表**: Recharts

### 后端

- **API**: Next.js API Routes
- **数据库**: Drizzle ORM
- **认证**: JWT + 中间件
- **加密**: bcryptjs

### 开发工具

- **包管理**: pnpm
- **代码规范**: ESLint + Prettier
- **提交规范**: Commitizen
- **类型检查**: TypeScript

## 部署

### Vercel (推荐)

```bash
# 连接 GitHub 仓库到 Vercel
# 配置环境变量
# 自动部署
```

### Docker

```bash
docker build -t n-admin .
docker run -p 3000:3000 n-admin
```

### 传统服务器

```bash
pnpm build
pnpm start
```

## 环境变量

```bash
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/n_admin"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# 密码加密 (用于注册接口传输密码加密)
PASSWORD_JWT_SECRET="your-password-jwt-secret"

# 密码哈希盐值轮次
SALT_ROUNDS=12

# 应用
NEXT_PUBLIC_APP_NAME="N-Admin"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

## 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`pnpm commit`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情

## 支持

- 📖 [文档](./DEPLOYMENT.md)
- 🐛 [问题反馈](https://github.com/guizimo/n-admin/issues)
- 💬 [讨论](https://github.com/guizimo/n-admin/discussions)
