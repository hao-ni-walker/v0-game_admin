# 游戏管理列表页面

## 📁 文件结构

```
src/app/dashboard/games/hgapi365/
├── components/
│   ├── GamePageHeader.tsx    # 页面头部组件
│   ├── GameFilters.tsx        # 筛选组件
│   ├── GameTable.tsx          # 表格组件
│   └── index.ts               # 组件导出
├── hooks/
│   ├── useGameFilters.ts      # 筛选逻辑 Hook
│   ├── useGameManagement.ts   # 游戏管理 Hook
│   └── index.ts               # Hook 导出
├── types.ts                   # TypeScript 类型定义
├── constants.ts               # 常量配置
└── page.tsx                   # 主页面

src/app/api/games/
├── list/
│   └── route.ts               # 游戏列表 API (POST)
├── [id]/
│   └── route.ts               # 游戏详情 API (GET/PUT/DELETE)
└── route.ts                   # 游戏创建 API (POST)
```

## ✨ 功能特性

### 1. 列字段展示

- **基础信息**: ID、游戏标识、名称、分类、供应商
- **下注信息**: 最小/最大下注、RTP（返还率）
- **媒体资源**: 图标、缩略图、背景图
- **特性标识**: 移动端支持、试玩、累积奖池、奖励游戏、新品
- **状态信息**: 启用/停用、推荐
- **统计数据**: 游玩次数、热度分
- **时间信息**: 创建时间、更新时间、最后游玩时间

### 2. 搜索与筛选

#### 基础筛选

- **关键词搜索**: 对游戏名称和游戏标识进行模糊匹配
- **分类筛选**: 老虎机、桌面游戏、真人娱乐、体育博彩等
- **供应商筛选**: PG、PP、EVO、MG、NE、PNG等
- **语言筛选**: 英文、中文、泰语、越南语等
- **状态筛选**: 启用/停用

#### 高级筛选

- **新品筛选**: 是/否
- **推荐筛选**: 是/否
- **移动端支持**: 是/否
- **试玩可用**: 是/否
- **累积奖池**: 是/否

#### 排序支持

- 默认排序（sort_order）
- 游玩次数
- 热度分
- 返还率（RTP）
- 创建时间
- 更新时间
- 最后游玩时间

### 3. 操作功能

#### 单个游戏操作

- ✏️ **编辑**: 修改游戏信息
- 👁️ **查看详情**: 查看完整游戏信息
- 📋 **复制游戏ID**: 快速复制游戏标识
- 🔌 **启用/停用**: 切换游戏状态
- ⭐ **推荐/取消推荐**: 设置游戏为推荐游戏
- 🗑️ **删除**: 删除游戏（带确认）

#### 批量操作（预留）

- 批量启用/停用
- 批量设置推荐
- 批量分类调整
- 批量排序权重调整

### 4. 分页

- 页码切换
- 每页显示数量: 20、50、100
- 总数统计

## 🔌 API 接口

### POST /api/games/list

获取游戏列表（带筛选和分页）

**请求体示例**:

```json
{
  "page": 1,
  "page_size": 20,
  "keyword": "dragon",
  "provider_codes": ["PG", "PP"],
  "categories": ["slot", "table"],
  "lang": "zh-CN",
  "status": true,
  "is_featured": true,
  "is_mobile_supported": true,
  "has_jackpot": false,
  "rtp_min": 95.0,
  "rtp_max": 99.9,
  "sort_by": "sort_order",
  "sort_dir": "desc"
}
```

**响应体示例**:

```json
{
  "total": 264,
  "page": 1,
  "page_size": 20,
  "list": [
    {
      "id": 123,
      "game_id": "PG_DRAGON_HERO",
      "name": "龙之英雄",
      "category": "slot",
      "provider_code": "PG",
      "status": true,
      "is_featured": true,
      "play_count": 9821,
      ...
    }
  ]
}
```

### POST /api/games

创建新游戏

### PUT /api/games/[id]

更新游戏信息

### DELETE /api/games/[id]

删除游戏

## 🎨 UI 特性

### 徽章和图标

- 分类徽章（不同颜色）
- 供应商徽章
- 状态徽章（启用/停用）
- 特性图标（移动端、试玩、奖池、奖励）
- 新品标识

### 数据格式化

- 下注金额：保留两位小数
- RTP：百分比显示（如 96.50%）
- 时间：格式化为本地时间
- 统计数据：千位分隔

### 空状态

- 无数据时显示友好提示
- 筛选无结果时提供重置建议

## 🔧 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **UI 组件**: Shadcn UI
- **样式**: Tailwind CSS
- **状态管理**: React Hooks
- **图标**: Lucide React
- **提示**: Sonner (Toast)

## 📝 使用说明

1. **访问页面**: `/dashboard/games/hgapi365`

2. **搜索游戏**:

   - 在搜索框输入游戏名称或游戏标识
   - 按 Enter 或点击"搜索"按钮

3. **筛选游戏**:

   - 选择分类、供应商、语言等筛选条件
   - 可组合多个筛选条件
   - 点击"重置"清空所有筛选

4. **排序**:

   - 使用"排序方式"下拉菜单选择排序字段

5. **操作游戏**:
   - 点击表格每行的"操作"按钮
   - 选择相应的操作（编辑、查看、删除等）

## 🚀 待完成功能

- [ ] 游戏创建/编辑对话框（GameDialogs 组件）
- [ ] 批量操作功能
- [ ] 高级筛选（下注区间、RTP 区间、时间范围）
- [ ] 游戏详情弹窗
- [ ] 图片上传和预览
- [ ] 导出功能（Excel/CSV）
- [ ] 游戏数据统计图表

## 📌 注意事项

1. **模拟数据**: 当前使用模拟数据，实际项目需要连接真实数据库
2. **权限控制**: 需要添加权限验证
3. **图片处理**: 图片 URL 需要配置合适的 CDN
4. **错误处理**: 完善错误边界和错误提示
5. **性能优化**: 大数据量时考虑虚拟滚动

## 🐛 已知问题

- 暂无

## 📄 License

MIT
