# 部署指南

本项目是一个基于 Next.js 的管理后台系统，支持多种部署方式。

## 🚀 本地开发

### 环境要求

- Node.js 18.x 或更高版本
- pnpm 包管理器
- PostgreSQL 数据库

### 开发流程

```bash
# 1. 安装依赖
pnpm install

# 2. 环境配置
cp .env.example .env.local
# 编辑 .env.local，配置数据库连接等环境变量

# 3. 数据库设置
pnpm db:generate  # 生成数据库迁移文件
pnpm db:push      # 推送数据库结构
pnpm init:admin   # 初始化管理员账户

# 4. 启动开发服务器
pnpm dev
```

## 🛠️ 生产部署

### 1. Vercel 部署（推荐）

#### 自动部署

1. 连接你的 GitHub 仓库到 Vercel
2. 配置环境变量
3. 推送代码，自动部署

#### 手动部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录并部署
vercel
```

### 2. Docker 部署

```bash
# 构建镜像
docker build -t n-admin .

# 运行容器
docker run -p 3000:3000 -e DATABASE_URL="your_database_url" n-admin
```

### 3. 传统服务器部署

```bash
# 1. 构建应用
pnpm build

# 2. 启动生产服务器
pnpm start
```

## 📋 环境变量配置

创建 `.env.local` 文件并配置以下变量：

```bash
# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/n_admin"

# JWT 密钥
JWT_SECRET="your-jwt-secret-key"
JWT_REFRESH_SECRET="your-jwt-refresh-secret-key"

# 应用配置
NEXT_PUBLIC_APP_NAME="N-Admin"
NEXT_PUBLIC_APP_URL="http://localhost:3001"

# 邮件配置（可选）
EMAIL_FROM="noreply@yourdomain.com"
SMTP_HOST="smtp.yourdomain.com"
SMTP_PORT="587"
SMTP_USER="your-smtp-user"
SMTP_PASSWORD="your-smtp-password"
```

## 🗄️ 数据库设置

### PostgreSQL 设置

1. **安装 PostgreSQL**
2. **创建数据库**：

   ```sql
   CREATE DATABASE n_admin;
   CREATE USER n_admin_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE n_admin TO n_admin_user;
   ```

3. **运行迁移**：

   ```bash
   pnpm db:generate
   pnpm db:push
   ```

4. **初始化管理员**：
   ```bash
   pnpm init:admin
   ```

### 数据库命令

```bash
# 生成迁移文件
pnpm db:generate

# 推送数据库结构更改
pnpm db:push

# 重置数据库（谨慎使用）
pnpm db:reset

# 查看数据库状态
pnpm db:status

# 初始化管理员用户
pnpm init:admin
```

## 🔧 部署最佳实践

### 1. 性能优化

- 启用 gzip 压缩
- 配置 CDN
- 优化图片和静态资源
- 使用合适的缓存策略

### 2. 安全配置

- 使用强密码和复杂的 JWT 密钥
- 配置 HTTPS
- 设置适当的 CORS 策略
- 定期更新依赖

### 3. 监控和日志

- 配置错误监控（如 Sentry）
- 设置性能监控
- 配置日志收集

## 🚨 常见问题

### 1. 数据库连接失败

- 检查 `DATABASE_URL` 是否正确
- 确认数据库服务已启动
- 验证网络连接

### 2. JWT 认证问题

- 确认 `JWT_SECRET` 已设置
- 检查 token 是否过期
- 验证 token 格式

### 3. 构建失败

- 检查 Node.js 版本
- 清理依赖：`rm -rf node_modules && pnpm install`
- 检查环境变量

## 📞 技术支持

如果在部署过程中遇到问题，请：

1. 检查控制台错误信息
2. 查看应用日志
3. 确认环境变量配置
4. 联系技术支持团队
