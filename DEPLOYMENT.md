# GitHub Pages 部署指南

本项目支持部署到 GitHub Pages 作为静态预览版本，使用 Mock 数据展示功能。

## 🚀 自动部署

### 1. 启用 GitHub Pages

1. 进入你的 GitHub 仓库
2. 点击 `Settings` 选项卡
3. 在左侧菜单中找到 `Pages`
4. 在 `Source` 部分选择 `GitHub Actions`

### 2. 推送代码

当你推送代码到 `main` 分支时，GitHub Actions 会自动：

- 安装依赖
- 构建静态版本（使用 Mock 数据）
- 部署到 GitHub Pages

部署完成后，你可以通过以下 URL 访问：

```
https://[你的用户名].github.io/n-admin/
```

## 🛠️ 本地测试

### 开发模式（完整功能）

```bash
# 安装依赖
pnpm install

# 启动开发服务器（包含 API 功能）
pnpm dev
```

### 静态预览模式

```bash
# 构建静态版本（GitHub Pages 预览）
pnpm build:static

# 构建完成后，静态文件会在 out/ 目录中
# 可以使用任何静态服务器预览，例如：
npx serve out
```

## 📋 功能说明

### 🔄 双模式支持

项目现在支持两种模式：

#### 1. 完整功能模式（开发/生产）

- ✅ 真实数据库连接
- ✅ 完整的 API 功能
- ✅ 用户认证
- ✅ 数据持久化
- 使用命令：`pnpm dev` 或 `pnpm build`

#### 2. 静态预览模式（GitHub Pages）

- ✅ 完整的 UI 界面展示
- ✅ Mock 数据驱动的功能演示
- ✅ 响应式设计
- ✅ 所有页面和组件可正常访问
- ✅ 搜索、筛选、分页等功能正常工作
- ✅ 表单提交和数据操作（仅限前端，不会持久化）
- ❌ 无真实数据库连接
- ❌ 无服务端 API
- ❌ 数据不会持久化（刷新页面后重置）
- 使用命令：`pnpm build:static`

### 演示账号

在静态版本中，你可以使用以下账号登录：

- **邮箱**: admin@example.com
- **密码**: Admin@123456

## 🔧 技术实现

### 智能环境检测

项目使用智能 API 客户端，会根据环境自动切换：

```typescript
// 自动检测环境
const isStaticDeployment =
  (typeof window !== 'undefined' &&
    window.location.hostname.includes('github.io')) ||
  process.env.STATIC_EXPORT === 'true';

// 根据环境选择数据源
if (isStaticDeployment) {
  return MockAPI.getUsers(params); // 使用 Mock 数据
} else {
  return apiRequest('/users'); // 使用真实 API
}
```

### Next.js 配置

```typescript
// next.config.ts
const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig: NextConfig = {
  ...(isStaticExport && {
    output: 'export', // 仅在静态构建时启用
    trailingSlash: true,
    images: { unoptimized: true },
    basePath: '/n-admin',
    assetPrefix: '/n-admin/'
  })
};
```

## 📁 项目结构

```
src/
├── lib/
│   ├── mock-data.ts      # Mock 数据定义
│   ├── mock-api.ts       # Mock API 服务
│   └── api-client.ts     # 智能 API 客户端
├── app/
│   ├── api/             # 真实 API 路由（开发模式）
│   ├── dashboard/       # 仪表板页面
│   └── login/          # 登录页面
└── components/
    └── custom-table/    # 自定义表格组件
```

## 🎯 使用场景

### 静态部署版本适用于：

- 📱 产品演示和展示
- 🎨 UI/UX 设计评审
- 👥 团队协作和反馈收集
- 📊 功能原型验证
- 🔍 代码审查和测试

### 完整功能版本适用于：

- 🚀 生产环境部署
- 💾 需要数据持久化的场景
- 👤 真实用户管理
- 🔐 完整的权限控制

## 🚨 注意事项

1. **不影响原有功能**: 静态构建不会修改或删除任何原有代码
2. **仓库名称**: 确保你的仓库名为 `n-admin`，或修改 `next.config.ts` 中的 `basePath`
3. **分支**: 默认从 `main` 分支部署
4. **手动触发**: 可以在 GitHub Actions 页面手动触发部署
5. **构建时间**: 首次部署可能需要几分钟时间

## 🔄 更新部署

- **自动**: 每次推送到 main 分支都会触发自动重新部署
- **手动**: 在 GitHub Actions 页面点击 "Run workflow" 按钮

## 💡 开发建议

1. **日常开发**: 使用 `pnpm dev` 进行开发，享受完整功能
2. **预览测试**: 使用 `pnpm build:static` 测试静态版本
3. **生产部署**: 使用 `pnpm build` 构建生产版本
4. **演示展示**: 使用 GitHub Pages 静态版本进行演示
