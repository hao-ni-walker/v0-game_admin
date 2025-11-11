# 轮播图管理 API 规范

## 概述

轮播图管理接口遵循与游戏管理接口一致的规范，便于同一后台体系内复用。

## API 端点

### 1. 获取轮播图列表

**端点**: `POST /api/banners/list`

**请求参数** (JSON Body):

```json
{
  "page": 1,
  "page_size": 20,
  "keyword": "string, 可选",
  "positions": ["array, 可选"],
  "status": "0|1|'all', 可选",
  "disabled": "boolean, 可选, 默认 false",
  "show_removed": "boolean, 可选, 默认 false",
  "active_only": "boolean, 可选, 默认 false",
  "desired_from": "ISO时间, 可选, 有效期开始范围",
  "desired_to": "ISO时间, 可选, 有效期结束范围",
  "start_from": "ISO时间, 可选, 明确筛选start_time范围",
  "start_to": "ISO时间, 可选",
  "end_from": "ISO时间, 可选, 明确筛选end_time范围",
  "end_to": "ISO时间, 可选",
  "sort_by": "string, 默认 'sort_order'",
  "sort_dir": "asc|desc, 默认 'desc'"
}
```

**请求示例**:

```bash
curl --location --request POST 'https://api.xreddeercasino.com/api/banners/list?page=1&page_size=20' \
--header 'Content-Type: application/json' \
--data-raw '{
  "keyword": "welcome",
  "positions": ["home","promo"],
  "status": 1,
  "disabled": false,
  "active_only": true,
  "desired_from": "2025-11-01T00:00:00Z",
  "desired_to": "2025-11-30T23:59:59Z",
  "sort_by": "sort_order",
  "sort_dir": "desc",
  "page": 1,
  "page_size": 20
}'
```

**响应示例** (200 OK):

```json
{
  "total": 48,
  "page": 1,
  "page_size": 20,
  "list": [
    {
      "id": 1001,
      "title": "欢迎周礼包",
      "image_url": "https://cdn.example.com/banner_welcome.jpg",
      "link_url": "/promo/welcome",
      "target": "_self",
      "position": "home",
      "sort_order": 500,
      "start_time": "2025-11-01T00:00:00Z",
      "end_time": "2025-11-30T23:59:59Z",
      "status": 1,
      "version": 3,
      "created_at": "2025-10-28T09:15:00Z",
      "updated_at": "2025-11-10T12:00:00Z",
      "removed": false,
      "disabled": false
    },
    {
      "id": 1002,
      "title": "限时彩票活动",
      "image_url": "https://cdn.example.com/banner_lottery.jpg",
      "link_url": "/promo/lottery",
      "target": "_blank",
      "position": "promo",
      "sort_order": 480,
      "start_time": "2025-11-05T00:00:00Z",
      "end_time": "2025-11-15T23:59:59Z",
      "status": 1,
      "version": 1,
      "created_at": "2025-11-04T10:20:30Z",
      "updated_at": "2025-11-10T14:30:22Z",
      "removed": false,
      "disabled": false
    }
  ]
}
```

### 2. 创建轮播图

**端点**: `POST /api/banners`

**请求体**:

```json
{
  "title": "string, 可选",
  "image_url": "string, 必需",
  "link_url": "string, 可选",
  "target": "_self|_blank, 默认 '_self'",
  "position": "string, 必需",
  "sort_order": "integer, 默认 0",
  "start_time": "ISO时间, 可选",
  "end_time": "ISO时间, 可选",
  "status": "0|1, 默认 1",
  "disabled": "boolean, 默认 false"
}
```

**请求示例**:

```bash
curl --location --request POST 'https://api.xreddeercasino.com/api/banners' \
--header 'Content-Type: application/json' \
--data-raw '{
  "title": "新年活动",
  "image_url": "https://cdn.example.com/banner_newyear.jpg",
  "link_url": "/promo/newyear",
  "target": "_self",
  "position": "home",
  "sort_order": 100,
  "start_time": "2025-12-01T00:00:00Z",
  "end_time": "2025-12-31T23:59:59Z",
  "status": 1,
  "disabled": false
}'
```

**响应示例** (201 Created):

```json
{
  "message": "轮播图创建成功",
  "data": {
    "id": 1010,
    "title": "新年活动",
    "image_url": "https://cdn.example.com/banner_newyear.jpg",
    "link_url": "/promo/newyear",
    "target": "_self",
    "position": "home",
    "sort_order": 100,
    "start_time": "2025-12-01T00:00:00Z",
    "end_time": "2025-12-31T23:59:59Z",
    "status": 1,
    "version": 1,
    "created_at": "2025-11-11T15:30:00Z",
    "updated_at": "2025-11-11T15:30:00Z",
    "removed": false,
    "disabled": false
  }
}
```

### 3. 获取轮播图详情

**端点**: `GET /api/banners/[id]`

**请求示例**:

```bash
curl --location --request GET 'https://api.xreddeercasino.com/api/banners/1001' \
--header 'Content-Type: application/json'
```

**响应示例** (200 OK):

```json
{
  "message": "轮播图详情",
  "data": {
    "id": 1001,
    "title": "欢迎周礼包",
    "image_url": "https://cdn.example.com/banner_welcome.jpg",
    "link_url": "/promo/welcome",
    "target": "_self",
    "position": "home",
    "sort_order": 500,
    "start_time": "2025-11-01T00:00:00Z",
    "end_time": "2025-11-30T23:59:59Z",
    "status": 1,
    "version": 3,
    "created_at": "2025-10-28T09:15:00Z",
    "updated_at": "2025-11-10T12:00:00Z",
    "removed": false,
    "disabled": false
  }
}
```

### 4. 更新轮播图

**端点**: `PUT /api/banners/[id]`

**请求体** (支持部分更新):

```json
{
  "title": "string, 可选",
  "image_url": "string, 可选",
  "link_url": "string, 可选",
  "target": "_self|_blank, 可选",
  "position": "string, 可选",
  "sort_order": "integer, 可选",
  "start_time": "ISO时间, 可选",
  "end_time": "ISO时间, 可选",
  "status": "0|1, 可选",
  "disabled": "boolean, 可选",
  "version": "integer, 必需（乐观锁）"
}
```

**请求示例**:

```bash
curl --location --request PUT 'https://api.xreddeercasino.com/api/banners/1001' \
--header 'Content-Type: application/json' \
--data-raw '{
  "status": 0,
  "version": 3
}'
```

**响应示例** (200 OK):

```json
{
  "message": "轮播图更新成功",
  "data": {
    "id": 1001,
    "title": "欢迎周礼包",
    "image_url": "https://cdn.example.com/banner_welcome.jpg",
    "link_url": "/promo/welcome",
    "target": "_self",
    "position": "home",
    "sort_order": 500,
    "start_time": "2025-11-01T00:00:00Z",
    "end_time": "2025-11-30T23:59:59Z",
    "status": 0,
    "version": 4,
    "created_at": "2025-10-28T09:15:00Z",
    "updated_at": "2025-11-11T16:00:00Z",
    "removed": false,
    "disabled": false
  }
}
```

**版本冲突响应** (409 Conflict):

```json
{
  "error": "版本冲突，请刷新后重试"
}
```

### 5. 删除轮播图

**端点**: `DELETE /api/banners/[id]`

**请求示例**:

```bash
curl --location --request DELETE 'https://api.xreddeercasino.com/api/banners/1001' \
--header 'Content-Type: application/json'
```

**响应示例** (200 OK):

```json
{
  "message": "轮播图删除成功"
}
```

## 筛选条件详解

### keyword（关键词）
- 对 `title` 和 `link_url` 进行模糊匹配
- 不区分大小写

### positions（位置）
- 支持多选，传入数组
- 支持的值: `home`, `promo`, `games_top`, `games_bottom`, `footer`, `sidebar`, `popup`
- 为空表示不按位置筛选

### status（状态）
- `0` = 下线
- `1` = 上线
- `'all'` 或不传 = 显示全部

### disabled（禁用）
- `true` = 仅显示禁用的轮播图
- `false` = 显示未禁用的轮播图（默认）

### show_removed（显示已删除）
- `true` = 显示已删除的轮播图
- `false` = 不显示已删除的轮播图（默认）

### active_only（仅生效中）
- `true` = 仅显示生效中的轮播图（status=1 且 disabled=false 且在时间范围内）
- `false` = 显示全部（默认）

### 有效期筛选

#### desired_from / desired_to（期望的有效期范围）
用于查询与指定时间范围有交集的轮播图。条件为：
```
(end_time >= desired_from 或 end_time 为空) 
AND 
(start_time <= desired_to 或 start_time 为空)
```

#### start_from / start_to（明确筛选 start_time）
查询 `start_time` 在指定范围内的轮播图

#### end_from / end_to（明确筛选 end_time）
查询 `end_time` 在指定范围内的轮播图

### sort_by（排序字段）
支持值: `sort_order`, `start_time`, `end_time`, `updated_at`, `created_at`

### sort_dir（排序方向）
- `asc` = 升序
- `desc` = 降序（默认）

## 列字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键，自增 |
| title | string | 轮播图标题，可为空 |
| image_url | string | 图片URL，必需 |
| link_url | string | 跳转链接，可为空表示无跳转 |
| target | string | 打开方式，'_self' 或 '_blank' |
| position | string | 显示位置（home, promo 等） |
| sort_order | integer | 排序权重，越大越靠前（需与产品约定） |
| start_time | datetime | 开始时间，为空表示立即生效 |
| end_time | datetime | 结束时间，为空表示长期有效 |
| status | integer | 状态：0=下线，1=上线 |
| version | integer | 版本号，用于乐观锁 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |
| removed | boolean | 逻辑删除标记 |
| disabled | boolean | 禁用标记（紧急止投） |

## 业务规则

### 投放有效性
前台实际投放应满足以下条件：
```
status = 1 
AND disabled = false 
AND (start_time <= now 或 start_time 为空)
AND (end_time >= now 或 end_time 为空)
```

### 乐观锁
- 更新时必须传入 `version` 字段
- 后端在 WHERE 条件中包含 `version`
- 更新成功后 `version` 自动递增
- 版本冲突时返回 409 Conflict 状态码

### 软删除
- 默认过滤 `removed = true` 的数据
- 提供 `show_removed = true` 选项便于恢复或审计

### 紧急止投
- 设置 `disabled = true` 立即下线轮播图
- 无需改动 `status` 或时间字段

## 错误响应

### 400 Bad Request
```json
{
  "error": "请求参数错误"
}
```

### 409 Conflict（版本冲突）
```json
{
  "error": "版本冲突，请刷新后重试"
}
```

### 500 Internal Server Error
```json
{
  "error": "服务器内部错误"
}
```

## 分页说明

- **page**: 页码，从 1 开始，默认值 1
- **page_size**: 每页条数，默认 20，最大 100
- **total**: 总数
- **totalPages**: 总页数（客户端可计算或后端返回）

## 性能优化建议

### 索引
- (position, sort_order desc) - 优化前台投放查询
- (updated_at desc) - 优化最近修改排序
- (start_time, end_time) - 优化有效期查询

### 缓存
- 前台投放数据可缓存 5-10 分钟
- 后台管理列表不建议缓存，保证实时性

### 定时任务
- 周期性清理 end_time 早于当前且长期未用的记录
