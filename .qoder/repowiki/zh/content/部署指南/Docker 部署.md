# Docker 部署

<cite>
**本文档引用的文件**  
- [DEPLOYMENT.md](file://DEPLOYMENT.md)
</cite>

## 目录
1. [简介](#简介)
2. [Docker 镜像构建](#docker-镜像构建)
3. [Dockerfile 指令详解](#dockerfile-指令详解)
4. [运行容器](#运行容器)
5. [环境变量配置](#环境变量配置)
6. [端口映射与持久化存储](#端口映射与持久化存储)
7. [连接外部数据库](#连接外部数据库)
8. [多阶段构建优化建议](#多阶段构建优化建议)
9. [生产环境最佳实践](#生产环境最佳实践)
10. [常见问题排查](#常见问题排查)

## 简介

本指南旨在为 `v0-game_admin` 项目提供完整的 Docker 容器化部署说明。基于项目中的 `DEPLOYMENT.md` 文件，本文详细阐述如何通过 Docker 构建和运行应用镜像，涵盖从构建到生产部署的全流程。该应用是一个基于 Next.js 的管理后台系统，支持多种部署方式，其中 Docker 部署提供了良好的环境隔离性和可移植性。

**Section sources**
- [DEPLOYMENT.md](file://DEPLOYMENT.md#L1-L190)

## Docker 镜像构建

根据 `DEPLOYMENT.md` 中的指引，构建 Docker 镜像的命令如下：

```bash
docker build -t n-admin .
```

此命令将使用当前目录下的 Dockerfile 构建一个名为 `n-admin` 的镜像。尽管项目根目录中未直接提供 Dockerfile，但根据部署文档和项目结构（包含 `package.json` 和 Next.js 配置），可以推断出标准的构建流程适用于基于 Node.js 的 Next.js 应用。

**Section sources**
- [DEPLOYMENT.md](file://DEPLOYMENT.md#L55-L57)

## Dockerfile 指令详解

虽然项目中未显式提供 Dockerfile，但结合 `DEPLOYMENT.md` 和 `package.json` 可以合理推断其内容应包含以下关键指令：

- **基础镜像选择**：通常选用官方 Node.js 镜像，如 `node:18-alpine` 或 `node:20`，以确保与项目要求的 Node.js 18.x 或更高版本兼容。
- **依赖安装**：使用 `pnpm` 包管理器安装依赖，对应 `package.json` 中定义的依赖项。典型指令为 `RUN pnpm install`。
- **环境变量设置**：可通过 `ENV` 指令设置默认环境变量，但更推荐在运行时通过 `-e` 参数传递，以增强灵活性和安全性。
- **构建命令**：执行 `pnpm build` 命令生成生产环境的静态资源和服务器代码。
- **启动命令**：使用 `CMD ["pnpm", "start"]` 启动生产服务器，监听指定端口（默认为 3001）。

这些指令共同构成了一个标准的 Next.js 应用 Docker 构建流程。

**Section sources**
- [DEPLOYMENT.md](file://DEPLOYMENT.md#L65-L70)
- [package.json](file://package.json#L5-L9)

## 运行容器

构建完成后，可使用以下命令运行容器：

```bash
docker run -p 3000:3000 -e DATABASE_URL="your_database_url" n-admin
```

该命令将容器内的 3000 端口映射到主机的 3000 端口，并通过 `-e` 参数传递 `DATABASE_URL` 环境变量。这是连接外部数据库的关键步骤。若应用实际监听 3001 端口（由 `package.json` 中的 `start` 脚本指定），则应调整端口映射为 `-p 3000:3001`。

**Section sources**
- [DEPLOYMENT.md](file://DEPLOYMENT.md#L58-L60)
- [package.json](file://package.json#L8)

## 环境变量配置

环境变量对于应用的正常运行至关重要。根据 `DEPLOYMENT.md`，必须配置以下关键环境变量：

- `DATABASE_URL`: PostgreSQL 数据库的连接字符串，格式为 `postgresql://username:password@host:port/database`。
- `JWT_SECRET`: 用于 JWT 令牌签名的密钥，应使用强随机字符串。
- `JWT_REFRESH_SECRET`: 用于刷新令牌的密钥。

这些变量应在运行容器时通过 `-e` 参数传递，避免硬编码在镜像中，从而提升安全性。

**Section sources**
- [DEPLOYMENT.md](file://DEPLOYMENT.md#L77-L82)

## 端口映射与持久化存储

- **端口映射**：使用 `-p` 参数将容器端口映射到主机端口。例如，`-p 3000:3001` 将主机的 3000 端口映射到容器的 3001 端口。
- **持久化存储**：本项目为无状态应用，其数据存储在外部 PostgreSQL 数据库中。因此，容器本身无需持久化存储。若需持久化日志或上传文件，可使用 Docker 卷（Volume）挂载相应目录。

**Section sources**
- [DEPLOYMENT.md](file://DEPLOYMENT.md#L59)
- [package.json](file://package.json#L8)

## 连接外部数据库

应用通过 `DATABASE_URL` 环境变量连接到外部 PostgreSQL 数据库。数据库需独立部署并确保网络可达。部署文档中提供了创建数据库和用户的 SQL 命令，确保数据库服务已启动并正确配置了访问权限。

**Section sources**
- [DEPLOYMENT.md](file://DEPLOYMENT.md#L78)
- [DEPLOYMENT.md](file://DEPLOYMENT.md#L103-L107)

## 多阶段构建优化建议

为了优化镜像大小和安全性，建议采用多阶段构建（Multi-stage Build）：

1. **构建阶段**：使用包含完整构建工具链的 Node.js 镜像（如 `node:20`）执行 `pnpm install` 和 `pnpm build`。
2. **运行阶段**：使用轻量级基础镜像（如 `node:20-alpine`），仅复制构建阶段生成的 `dist` 目录和必要的 `package.json`、`package-lock.json` 文件。
3. **最终镜像**：仅包含运行应用所需的最小依赖，显著减小镜像体积，加快部署速度并降低安全风险。

**Section sources**
- [DEPLOYMENT.md](file://DEPLOYMENT.md#L66)
- [package.json](file://package.json#L7)

## 生产环境最佳实践

- **使用非 root 用户**：在 Dockerfile 中创建专用用户并以该用户身份运行应用，避免以 root 权限运行容器，增强安全性。
- **日志收集**：将应用日志输出到 stdout/stderr，以便 Docker 守护进程收集，并集成到集中式日志系统（如 ELK Stack 或 Fluentd）。
- **健康检查**：在 Dockerfile 或 docker-compose.yml 中添加 `HEALTHCHECK` 指令，定期检查应用健康状态。
- **资源限制**：通过 `--memory` 和 `--cpus` 等参数限制容器资源使用，防止资源耗尽。
- **安全配置**：定期更新基础镜像和依赖，使用 `.dockerignore` 文件排除不必要的文件，减少攻击面。

**Section sources**
- [DEPLOYMENT.md](file://DEPLOYMENT.md#L141-L161)

## 常见问题排查

- **数据库连接失败**：检查 `DATABASE_URL` 是否正确，确认数据库服务已启动且网络可达。
- **JWT 认证问题**：确保 `JWT_SECRET` 已正确设置，且密钥在重启后保持一致。
- **构建失败**：检查 Node.js 版本是否符合要求，清理依赖后重试（`rm -rf node_modules && pnpm install`），并确认环境变量配置无误。

**Section sources**
- [DEPLOYMENT.md](file://DEPLOYMENT.md#L164-L181)