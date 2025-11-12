# VIP 等级管理接口文档

## 接口概述

VIP 等级管理接口用于管理用户 VIP 等级配置、升级奖励、每日奖励及权益设置。

## 接口列表

### 1. 获取 VIP 等级列表

**接口地址**: `POST /api/vip-levels/list`

**请求参数**:

```json
{
  "page": 1,
  "page_size": 20,
  "keyword": "VIP",
  "level_min": 0,
  "level_max": 10,
  "required_exp_min": 0,
  "required_exp_max": 100000,
  "disabled": false,
  "show_removed": false,
  "created_from": "2025-01-01T00:00:00Z",
  "created_to": "2025-12-31T23:59:59Z",
  "updated_from": "2025-01-01T00:00:00Z",
  "updated_to": "2025-12-31T23:59:59Z",
  "sort_by": "level",
  "sort_dir": "asc"
}
```

**参数说明**:

- `page`: 页码，默认 1
- `page_size`: 每页数量，默认 20，最大 100
- `keyword`: 关键词搜索（匹配等级名称）
- `level_min`: 最小等级
- `level_max`: 最大等级
- `required_exp_min`: 最小所需经验
- `required_exp_max`: 最大所需经验
- `disabled`: 是否显示禁用的等级
- `show_removed`: 是否显示已删除的等级
- `created_from`: 创建时间起始
- `created_to`: 创建时间结束
- `updated_from`: 更新时间起始
- `updated_to`: 更新时间结束
- `sort_by`: 排序字段（level/required_exp/upgrade_reward/daily_reward/commission_rate/updated_at/created_at/id）
- `sort_dir`: 排序方向（asc/desc）

**响应示例**:

```json
{
  "total": 8,
  "page": 1,
  "page_size": 20,
  "list": [
    {
      "id": 4,
      "level": 3,
      "name": "VIP3",
      "required_exp": 5000,
      "upgrade_reward": 18.00,
      "daily_reward": 2.00,
      "withdraw_daily_limit": 5,
      "withdraw_amount_limit": 5000.00,
      "commission_rate": 0.0050,
      "benefits": {
        "priority_support": true,
        "badge": "vip3",
        "lottery_extra_times": 1
      },
      "version": 4,
      "created_at": "2025-08-18T10:00:00Z",
      "updated_at": "2025-11-10T12:00:00Z",
      "removed": false,
      "disabled": false
    }
  ]
}
```

**字段说明**:

- `id`: VIP 等级 ID
- `level`: 等级数值（唯一，严格递增）
- `name`: 等级名称
- `required_exp`: 所需累计经验值（严格递增）
- `upgrade_reward`: 升级奖励金额（null 表示无奖励）
- `daily_reward`: 每日可领取奖励金额（null 表示无奖励）
- `withdraw_daily_limit`: 每日提现次数上限（null 使用系统默认）
- `withdraw_amount_limit`: 每日提现金额上限（null 使用系统默认）
- `commission_rate`: 佣金比例（0.0050 表示 0.50%）
- `benefits`: 权益数据 JSON（存放非金额类权益）
- `version`: 乐观锁版本号
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `removed`: 是否已删除
- `disabled`: 是否已禁用

### 2. 获取单个 VIP 等级详情

**接口地址**: `GET /api/vip-levels/{id}`

**路径参数**:

- `id`: VIP 等级 ID

**响应示例**: 同上

### 3. 创建 VIP 等级

**接口地址**: `POST /api/vip-levels`

**请求参数**:

```json
{
  "level": 6,
  "name": "VIP6",
  "required_exp": 50000,
  "upgrade_reward": 100.00,
  "daily_reward": 10.00,
  "withdraw_daily_limit": 15,
  "withdraw_amount_limit": 50000.00,
  "commission_rate": 0.0150,
  "benefits": {
    "priority_support": true,
    "badge": "vip6",
    "lottery_extra_times": 5,
    "task_multiplier": 3.0,
    "exclusive_games": true,
    "vip_manager": true
  },
  "disabled": false
}
```

**响应**:

```json
{
  "success": true,
  "id": 7
}
```

### 4. 更新 VIP 等级

**接口地址**: `PUT /api/vip-levels/{id}`

**路径参数**:

- `id`: VIP 等级 ID

**请求参数**:

```json
{
  "version": 4,
  "name": "VIP3 Plus",
  "upgrade_reward": 20.00,
  "daily_reward": 2.50,
  "benefits": {
    "priority_support": true,
    "badge": "vip3_plus",
    "lottery_extra_times": 2
  }
}
```

**注意**: 必须包含 `version` 字段用于乐观锁校验

**响应**:

```json
{
  "success": true
}
```

### 5. 删除 VIP 等级

**接口地址**: `DELETE /api/vip-levels/{id}`

**路径参数**:

- `id`: VIP 等级 ID

**响应**:

```json
{
  "success": true
}
```

## 默认排序规则

当 `sort_by` 为 `default` 时，按以下优先级排序：

1. `level` 升序（保障阶梯顺序）
2. `updated_at` 降序（最近修改优先）
3. `id` 降序（最新创建优先）

## 升级与发放策略

### 升级判定

- 当用户累计经验 ≥ 某等级 `required_exp` 且大于上一等级阈值时升级
- 一次性补发多个等级时建议逐级发放奖励并记录事件流水

### 发放规则

- `upgrade_reward`: 首次达到该等级时发放一次
- `daily_reward`: 每自然日可领一次，需结合用户等级变更进行上限控制与"已领"标记重置

### 提现限额覆盖

- 当用户 VIP 等级发生变化时，刷新其当日可提现次数与金额上限
- 取"VIP 配置值优先，否则用系统默认"

### 佣金联动

- `commission_rate` 可与邀请/代理体系联动
- 如存在多维费率，建议将明细放入 `benefits` 并在计算层解析

## 权益数据 (benefits) 结构示例

```json
{
  "priority_support": true,           // 客服优先级
  "badge": "vip5",                     // 专属徽章
  "lottery_extra_times": 3,            // 抽奖次数加成
  "task_multiplier": 2.0,              // 任务奖励倍数
  "exclusive_games": true,             // 专属游戏访问权限
  "vip_manager": true,                 // 专属VIP经理
  "monthly_gift": true,                // 月度礼包
  "birthday_bonus": 50.00              // 生日奖金
}
```

## 审计要点

### 重大变更需记录

- `required_exp` 变更（影响升级判定）
- `upgrade_reward` 变更（影响奖励发放）
- `daily_reward` 变更（影响每日奖励）
- `withdraw_daily_limit` / `withdraw_amount_limit` 变更（影响提现限制）
- `commission_rate` 变更（影响佣金计算）

### 操作日志

所有 VIP 等级的创建、更新、删除操作都应记录到用户操作日志表，包含：

- 操作人
- 操作时间
- 操作类型
- 变更内容
- 变更原因

## 阶梯校验规则

### 创建/更新时校验

1. `level` 必须唯一，不允许重复
2. `required_exp` 必须严格递增（不允许降低或相等）
3. 禁止修改已有用户使用中的等级的 `level` 和 `required_exp`

### 降低阈值的策略

如需降低 `required_exp` 阈值，需评估"补发升级奖励"的策略：

- 提供"是否补发"选项
- 记录补发流水
- 通知受影响用户

## 与活动/奖励/任务联动

### 每日奖励

- 可由定时任务生成"可领取奖励"或用户访问时惰性创建 `user_pending_rewards`
- 领取成功后写奖励流水并更新领取标记

### 经验获取

- 与充值、投注、活跃任务联动累积经验
- 经验计算权重可放系统配置或活动规则中按期调整

### 前台展示

- Next.js 前端在"我的等级"与"权益说明"模块拉取该表
- 按 `level` 升序渲染阶梯与差额升级提示

## CURL 示例

### 获取 VIP 等级列表

```bash
curl --location --request POST 'https://api.xreddeercasino.com/api/vip-levels/list' \
--header 'Content-Type: application/json' \
--data-raw '{
  "keyword": "VIP",
  "level_min": 0,
  "required_exp_min": 0,
  "disabled": false,
  "sort_by": "level",
  "sort_dir": "asc",
  "page": 1,
  "page_size": 20
}'
```

### 创建 VIP 等级

```bash
curl --location --request POST 'https://api.xreddeercasino.com/api/vip-levels' \
--header 'Content-Type: application/json' \
--data-raw '{
  "level": 6,
  "name": "VIP6",
  "required_exp": 50000,
  "upgrade_reward": 100.00,
  "daily_reward": 10.00,
  "withdraw_daily_limit": 15,
  "withdraw_amount_limit": 50000.00,
  "commission_rate": 0.0150,
  "benefits": {
    "priority_support": true,
    "badge": "vip6"
  },
  "disabled": false
}'
```

### 更新 VIP 等级

```bash
curl --location --request PUT 'https://api.xreddeercasino.com/api/vip-levels/4' \
--header 'Content-Type: application/json' \
--data-raw '{
  "version": 4,
  "upgrade_reward": 20.00,
  "daily_reward": 2.50
}'
```

### 删除 VIP 等级

```bash
curl --location --request DELETE 'https://api.xreddeercasino.com/api/vip-levels/4'
```

## 索引建议

### 已有索引

- `level` (partial where removed=false)

### 建议补充索引

- `updated_at` 索引：便于运营最近修改排序
- `required_exp` 索引：便于经验值范围查询
- `disabled` 索引：便于筛选可用等级

## 数据精度与序列化

- 金额类字段使用 Decimal/Numeric 类型
- 响应统一保留两位小数
- 比例类保留 4 位或按业务定义一致化
