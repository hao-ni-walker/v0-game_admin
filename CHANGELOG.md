# 更新日志 / Changelog

本项目的所有重要更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，项目遵循 [语义化版本控制](https://semver.org/lang/zh-CN/)。

### [0.0.4](https://github.com/guizimo/n-admin/compare/v0.0.3...v0.0.4) (2025-06-10)


### ✨ 新增功能

* **代码优化:** 更新 ESLint 配置和多个页面的依赖项 ([9a54fed](https://github.com/guizimo/n-admin/commit/9a54fed3dce291036b74bca7ee36fff1f38e8c3a))
* **权限与角色管理:** 更新权限结构和角色管理功能 ([26d8a22](https://github.com/guizimo/n-admin/commit/26d8a2270ba3eb87d689886ece5dc3920ec085df))
* **权限与角色管理:** 增强API的分页和筛选功能 ([ebcc9fb](https://github.com/guizimo/n-admin/commit/ebcc9fbfb4d7304894080c41ce945502ff744ffd))
* **权限与角色:** 删除角色和用户管理页面的列定义文件，更新相关页面的样式和布局，优化操作按钮的对齐方式。 ([8bc1d93](https://github.com/guizimo/n-admin/commit/8bc1d937ab2f9b29bb0748177c78d84d334dff85))

### [0.0.3](https://github.com/guizimo/n-admin/compare/v0.0.2...v0.0.3) (2025-06-09)


### 🐛 Bug 修复

* **用户表单:** 修复角色ID处理和选择框的必填项 ([1e4096f](https://github.com/guizimo/n-admin/commit/1e4096f52458ec5a41936829ac24b8c2cddbf815))


### ✨ 新增功能

* **权限与角色管理:** 增强API和前端筛选功能 ([d11f03a](https://github.com/guizimo/n-admin/commit/d11f03ae527f415c70ff60def373f8108f08a945))
* **用户管理:** 更新用户管理页面，添加角色选择功能和数据表工具栏 ([008b666](https://github.com/guizimo/n-admin/commit/008b66620c538668dd45e51c7eefc87a9469ec93))

### [0.0.2](https://github.com/guizimo/n-admin/compare/v0.0.1...v0.0.2) (2025-06-09)


### ✨ 新增功能

* **项目配置:** 更新 package.json，添加新的依赖项和脚本配置 ([c92520c](https://github.com/guizimo/n-admin/commit/c92520c59d6a900bf5a7e9940c853b29601fb833))

### 0.0.1 (2025-06-06)


### 📦 构建系统

* 添加Prettier配置文件及忽略文件 ([ffc6d0d](https://github.com/guizimo/n-admin/commit/ffc6d0d6d4580620a3d1c7bf01b7085d74d39b4a))


### 📚 文档更新

* 更新 README.md 以详细描述项目特性和使用指南 ([41de5a9](https://github.com/guizimo/n-admin/commit/41de5a994d21497c54e734d8176b905a1634bd2e))
* 更新 README.md 以增强可读性和视觉吸引力 ([76ed1b4](https://github.com/guizimo/n-admin/commit/76ed1b4a3d940635da36be15c6b1d380cb4d441b))
* 更新 README.md 中的环境配置和数据库操作说明 ([736fdba](https://github.com/guizimo/n-admin/commit/736fdba24d3546c276f63ee88a100659851ec9a1))


### ♻️ 代码重构

* **表格组件:** 将DataTable和DataTableSkeleton移动到table目录并优化加载逻辑 ([8f66bd9](https://github.com/guizimo/n-admin/commit/8f66bd9180bbf3bcaea595e8dab2ef8ccb274e58))
* **侧边栏:** 使用 siteConfig 替换硬编码的公司信息 ([a9e9918](https://github.com/guizimo/n-admin/commit/a9e991880e3cd1c2f272edce02881304cea7285b))
* **数据表格:** 优化表格样式和分页显示 ([ca01c72](https://github.com/guizimo/n-admin/commit/ca01c72edfba55f8e98abca68b8bf026aeffa0d5))
* **auth:** 将用户角色字段从`role`改为`roleId`，并添加超级管理员相关逻辑 ([d36c969](https://github.com/guizimo/n-admin/commit/d36c969af236dcce170e606469e96fb2943b9cc1))
* **drizzle:** 重构数据库结构并优化初始化脚本 ([a77bf61](https://github.com/guizimo/n-admin/commit/a77bf61705d629aa1543cb0942c89376be20e707))
* **layout:** 移除冗余代码并重构用户导航组件 ([a6410e6](https://github.com/guizimo/n-admin/commit/a6410e66fefe31a8e9cec28a24d4a706391aa975))
* **login:** 将登录表单组件移动到features目录 ([22e8b6b](https://github.com/guizimo/n-admin/commit/22e8b6b65a709160cb8c64be33a725e919985973))
* **not-found:** 使用 Card 组件重构 404 页面 ([0f9f903](https://github.com/guizimo/n-admin/commit/0f9f90375314eb2c62d7259e0c950ea86c86b8cb))


### ✨ 新增功能

* 初始化Next.js项目并添加基础组件和配置 ([3a94d92](https://github.com/guizimo/n-admin/commit/3a94d923e810fd2f32c61d65982342a21a9d5cf8))
* **代码质量:** 添加 lint-staged 配置以自动格式化和修复代码 ([b79525b](https://github.com/guizimo/n-admin/commit/b79525b6207e91665a7b749f32acec3c3372a3f2))
* **角色管理:** 新增角色管理功能，包括角色表单、API及权限校验 ([4363999](https://github.com/guizimo/n-admin/commit/4363999f5f4a5ec964f8594fff29deaf3a39a8a1))
* **权限管理:** 添加权限管理功能及相关API ([90ce647](https://github.com/guizimo/n-admin/commit/90ce64774ebeb8c234bc8d45df07c80eab60443c))
* **认证:** 添加用户退出登录功能 ([7197467](https://github.com/guizimo/n-admin/commit/7197467e141ef60f196d3ccf4a3d996ba4bab3f0))
* **首页布局:** 优化首页组件结构与样式 ([0a38a0f](https://github.com/guizimo/n-admin/commit/0a38a0fe4c96acef160d77f8f46b9edcf63dce31))
* 添加 GitHub 统计数据并更新主页布局 ([6e1b83d](https://github.com/guizimo/n-admin/commit/6e1b83db09c54cf2550b4a9ad87508449dd61cc3))
* 添加用户管理相关组件和功能 ([8e04b48](https://github.com/guizimo/n-admin/commit/8e04b4878937fd3fdcd895ca044a1d69798e1c6b))
* 添加用户和角色管理功能，优化导航和面包屑组件 ([754312d](https://github.com/guizimo/n-admin/commit/754312d00f84ed7d2904bcbc5255712284916642))
* 添加用户认证功能并更新数据库结构 ([1d5ef33](https://github.com/guizimo/n-admin/commit/1d5ef335dedb48224a920d7ae73b19fba8b73bbb))
* **项目配置:** 更新 package.json 和 pnpm-lock.yaml，添加提交和版本管理工具 ([be4772a](https://github.com/guizimo/n-admin/commit/be4772ad907bcf71637da3c06a72f6364deb4a79))
* **项目配置:** 更新 package.json 和 README.md，添加作者和许可证信息 ([3d88c17](https://github.com/guizimo/n-admin/commit/3d88c175b65e0b3d1e33b1659db9072e560aba60))
* 新增认证模块及仪表盘页面 ([923b147](https://github.com/guizimo/n-admin/commit/923b147de9256dade3a12f88ccdebf78a280e682))
* 新增UI组件和功能，优化代码结构 ([f3f66fb](https://github.com/guizimo/n-admin/commit/f3f66fb9650aa25bc8914b86cec17a73d11df55f))
* **依赖管理:** 更新依赖项并优化重定向逻辑 ([927097a](https://github.com/guizimo/n-admin/commit/927097a39681bdbfd018959840b33901284851ae))
* **仪表盘:** 添加仪表盘概览页面及图表组件 ([ce0e479](https://github.com/guizimo/n-admin/commit/ce0e47980452fa5ab94fc1d2244f122065406fa1))
* **用户管理:** 添加用户管理功能，支持增删改查操作 ([9068c24](https://github.com/guizimo/n-admin/commit/9068c248781aea3ceda5d9952810f9232763d263))
* **用户管理:** 添加用户删除功能并引入AlertDialog组件 ([8a56c43](https://github.com/guizimo/n-admin/commit/8a56c433f5007121b161acc2a1884d705f24a09f))
* **用户管理:** 优化用户列表显示及角色管理功能 ([401bda2](https://github.com/guizimo/n-admin/commit/401bda2d0167e50c280371198f5d51bd2a926398))
* **用户界面:** 添加用户头像首字母生成功能并优化导航栏 ([2c6c88d](https://github.com/guizimo/n-admin/commit/2c6c88dc25a7480ec0f68c31f435046860c7f693))
* **用户系统:** 添加用户名和头像字段，优化用户信息展示 ([5032bac](https://github.com/guizimo/n-admin/commit/5032bac1775122391cfd41b501a02f307d0f8dd5))
* **db:** 添加Drizzle ORM配置和用户表 ([00958c6](https://github.com/guizimo/n-admin/commit/00958c69af6d6aba97a2516f7055ed657f159a49))


### 💄 代码格式

* 更新项目图标和品牌名称 ([8f242c4](https://github.com/guizimo/n-admin/commit/8f242c48763fb5a01566c0b0f967e44b297793ee))
* lint code ([8ff33c2](https://github.com/guizimo/n-admin/commit/8ff33c2a9f89088541abf5df11acb8fa4ba14f46))


### 🐛 Bug 修复

* **api:** 修复用户和角色API中的参数解析问题 ([e08f477](https://github.com/guizimo/n-admin/commit/e08f477711eb187e357eef1772253fa6e1e5f947))
* **package.json:** 将版本号从 "0.0.1" 修改为 null，修正版本管理配置 ([959bc0f](https://github.com/guizimo/n-admin/commit/959bc0f165b00d6231bf8cf82696e7b7ada7cf5f))
* **package.json:** 移除 lint-staged 中的 eslint --fix 配置，保留仅使用 prettier 进行格式化 ([b90c2d2](https://github.com/guizimo/n-admin/commit/b90c2d218761bb986bb22a513f7dc3a08ff73202))


### 🔨 其他修改

* **版本管理:** 移除不必要的脚本配置，简化版本管理文件 ([675b102](https://github.com/guizimo/n-admin/commit/675b102ecbcb2100a3ec63a3eacf8e54fed05eef))
* 更新依赖并优化Drizzle配置 ([f586129](https://github.com/guizimo/n-admin/commit/f586129aec29a847985436945742b414a0ed098e))
