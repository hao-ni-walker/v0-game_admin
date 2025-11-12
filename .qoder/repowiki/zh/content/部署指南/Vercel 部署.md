# Vercel 部署

<cite>
**Referenced Files in This Document**   
- [DEPLOYMENT.md](file://DEPLOYMENT.md)
- [next.config.ts](file://next.config.ts)
- [package.json](file://package.json)
- [.env.example](file://.env.example)
- [README.md](file://README.md)
</cite>

## 目录
1. [简介](#简介)
2. [自动部署流程](#自动部署流程)
3. [手动部署方案](#手动部署方案)
4. [环境变量配置](#环境变量配置)
5. [构建行为与输出](#构建行为与输出)
6. [生产环境最佳实践](#生产环境最佳实践)
7. [常见问题排查](#常见问题排查)

## 简介
本指南详细说明了如何将 v0-game_admin 项目部署到 Vercel 平台。v0-game_admin 是一个基于 Next.js 15 构建的现代化后台管理系统，支持多种部署方式，其中 Vercel 部署为推荐方案。Vercel 提供了与 GitHub 的无缝集成，支持自动构建和部署，能够简化部署流程并提高开发效率。

**Section sources**
- [DEPLOYMENT.md](file://DEPLOYMENT.md#L1-L10)
- [README.md](file://README.md#L1-L15)

## 自动部署流程
通过 GitHub 集成实现 Vercel 的自动部署是一种高效且可靠的部署方式。该流程利用 Vercel 的持续集成/持续部署（CI/CD）能力，当代码推送到 GitHub 仓库时，Vercel 会自动触发构建和部署过程。

### GitHub 仓库连接
1. 登录 Vercel 控制台并创建新项目
2. 选择 "Import Git Repository" 选项
3. 授权 Vercel 访问您的 GitHub 账户
4. 从仓库列表中选择 v0-game_admin 仓库
5. 确认项目设置并完成导入

### 自动构建与部署机制
Vercel 的自动构建与部署机制基于以下工作流程：
- **代码推送触发**：当代码推送到指定分支（通常是 main 或 master）时，Vercel 会自动检测到变更
- **环境准备**：Vercel 在构建环境中安装项目依赖（使用 pnpm）
- **构建执行**：运行 `pnpm build` 命令，根据 `next.config.ts` 配置生成优化的生产版本
- **部署发布**：构建成功后，Vercel 会自动将应用部署到指定的域名

此自动化流程确保了代码变更能够快速、可靠地反映在生产环境中，同时减少了人为操作带来的错误风险。

**Section sources**
- [DEPLOYMENT.md](file://DEPLOYMENT.md#L34-L41)
- [README.md](file://README.md#L128-L135)

## 手动部署方案
除了自动部署，Vercel 还提供了手动部署方案，适用于需要更多控制权或在特定环境下进行部署的场景。

### Vercel CLI 部署
手动部署主要通过 Vercel CLI（命令行界面）完成，具体步骤如下：

```bash
# 1. 全局安装 Vercel CLI
npm i -g vercel

# 2. 登录 Vercel 账户
vercel login

# 3. 执行部署命令
vercel
```

执行 `vercel` 命令后，CLI 会引导用户完成部署配置，包括选择项目、配置环境变量和确认部署设置。部署完成后，CLI 会提供部署的 URL。

### 部署选项
Vercel CLI 提供了多种部署选项：
- `vercel --prod`：直接部署到生产环境
- `vercel --preview`：创建预览部署（默认行为）
- `vercel --build-env`：指定构建时环境变量
- `vercel --regions`：指定部署的地理区域

手动部署方案特别适用于测试环境部署、紧急修复或需要特定部署配置的场景。

**Section sources**
- [DEPLOYMENT.md](file://DEPLOYMENT.md#L42-L50)

## 环境变量配置
环境变量是连接应用与外部服务的关键配置，正确配置环境变量对于应用的正常运行至关重要。

### 必需环境变量
根据项目配置，以下环境变量必须在 Vercel 项目设置中配置：

```bash
# 数据库连接
DATABASE_URL="postgresql://username:password@host:port/database_name"

# JWT 认证密钥
JWT_SECRET="your_very_long_random_secret_key"
JWT_REFRESH_SECRET="your_very_long_random_refresh_secret_key"

# 应用配置
NEXT_PUBLIC_APP_NAME="Game Admin"
NEXT_PUBLIC_APP_URL="https://your-deployed-url.vercel.app"
```

这些变量可以在 Vercel 控制台的 "Environment Variables" 部分进行配置，确保在构建和运行时都能正确读取。

### 配置方法
在 Vercel 控制台中配置环境变量的步骤：
1. 进入项目设置
2. 导航到 "Environment Variables" 部分
3. 为每个变量添加键值对
4. 指定变量的作用域（Build, Development, Preview, Production）
5. 保存配置

特别注意，`JWT_SECRET` 和 `JWT_REFRESH_SECRET` 应设置为 "Encrypted" 以增强安全性。

**Section sources**
- [DEPLOYMENT.md](file://DEPLOYMENT.md#L72-L94)
- [.env.example](file://.env.example#L1-L13)

## 构建行为与输出
了解 Next.js 应用在 Vercel 上的构建行为对于优化部署和排查问题至关重要。

### 构建命令
项目使用 `pnpm build` 作为构建命令，该命令会执行以下操作：
- 编译 TypeScript 代码
- 优化和压缩 JavaScript 和 CSS 资源
- 生成静态 HTML 文件（对于静态生成的页面）
- 创建 API 路由的服务器端函数

构建过程由 `package.json` 中的 `scripts.build` 字段定义，并受到 `next.config.ts` 中配置的影响。

### 输出目录
构建完成后，Next.js 会生成一个 `.next` 目录，其中包含：
- `server/`：服务器端代码和 API 路由
- `static/`：静态资源文件
- `build-manifest.json`：构建清单文件
- `prerender-manifest.json`：预渲染页面清单

Vercel 会自动识别这些输出并正确配置路由和函数，无需额外配置。

**Section sources**
- [package.json](file://package.json#L7-L8)
- [next.config.ts](file://next.config.ts#L1-L32)

## 生产环境最佳实践
为了确保应用在生产环境中的稳定性、安全性和性能，应遵循以下最佳实践。

### 环境隔离
实施严格的环境隔离策略：
- 为开发、预览和生产环境使用不同的数据库
- 为不同环境配置独立的 JWT 密钥
- 使用不同的域名和 SSL 证书
- 在 Vercel 中为不同分支配置不同的环境变量

### 密钥安全管理
密钥是应用安全的核心，必须妥善管理：
- 使用 Vercel 的加密环境变量功能存储敏感信息
- 定期轮换 JWT 密钥
- 避免在代码或版本控制中硬编码密钥
- 使用足够长度和复杂度的随机密钥

### 性能优化
利用 Vercel 的特性优化应用性能：
- 启用边缘函数（Edge Functions）以减少延迟
- 配置适当的缓存策略
- 使用 Vercel 的 CDN 加速静态资源
- 启用 Gzip 压缩

**Section sources**
- [DEPLOYMENT.md](file://DEPLOYMENT.md#L140-L161)

## 常见问题排查
在部署过程中可能会遇到各种问题，以下是常见问题及其解决方案。

### 构建失败
构建失败的常见原因及解决方案：
- **Node.js 版本不匹配**：确保 Vercel 使用的 Node.js 版本与项目要求一致（18.x 或更高）
- **依赖安装失败**：检查 `package.json` 和 `pnpm-lock.yaml` 是否完整，必要时清除构建缓存
- **环境变量缺失**：确认所有必需的环境变量都已正确配置
- **类型检查错误**：解决 TypeScript 编译错误

### 环境变量未生效
环境变量未生效的排查步骤：
1. 确认变量名称拼写正确，包括大小写
2. 检查变量是否配置在正确的环境（Build, Development, Preview, Production）
3. 验证变量值是否包含特殊字符需要转义
4. 重新部署以确保变量被正确加载

### 数据库连接问题
数据库连接失败的常见原因：
- `DATABASE_URL` 格式错误或包含特殊字符
- 数据库服务器防火墙阻止了 Vercel 的 IP 地址
- 数据库用户权限不足
- 网络延迟或超时

通过系统性的排查和日志分析，大多数部署问题都能得到有效解决。

**Section sources**
- [DEPLOYMENT.md](file://DEPLOYMENT.md#L162-L181)
- [README.md](file://README.md#L180-L182)