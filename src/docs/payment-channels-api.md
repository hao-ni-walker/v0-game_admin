# 支付渠道管理 API 文档

## 概述

支付渠道管理模块提供充值和提现渠道的完整管理功能,包括渠道配置、费率设置、限额控制和可用性管理。

## 数据模型

### PaymentChannel (支付渠道)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 主键,自增 |
| name | string | 渠道名称(运营展示) |
| code | string | 渠道代码(全局唯一) |
| type | 1\|2 | 渠道类型: 1=充值, 2=提现 |
| channelType | string | 渠道分类: alipay/wechat/bank/usdt/other |
| config | object | JSON配置:商户号、密钥、回调URL等 |
| minAmount | number | 最小金额 |
| maxAmount | number | 最大金额 |
| dailyLimit | number | 每日限额 |
| feeRate | number | 费率(如0.0065表示0.65%) |
| fixedFee | number | 固定费用 |
| sortOrder | number | 排序权重 |
| status | 0\|1 | 状态: 1=启用, 0=停用 |
| version | number | 乐观锁版本号 |
| createdAt | string | 创建时间(ISO) |
| updatedAt | string | 更新时间(ISO) |
| removed | boolean | 逻辑删除标记 |
| disabled | boolean | 紧急禁用开关 |

## API 接口

### 1. 获取支付渠道列表

**接口地址**: `POST /api/payment-channels/list`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码,默认1 |
| page_size | number | 否 | 每页条数,默认20,最大100 |
| keyword | string | 否 | 关键词搜索(匹配name、code) |
| types | number[] | 否 | 支付类型数组[1,2] |
| channel_types | string[] | 否 | 渠道类型数组 |
| status | 0\|1\|'all' | 否 | 状态筛选 |
| disabled | boolean | 否 | 是否禁用 |
| show_removed | boolean | 否 | 显示已删除,默认false |
| min_amount_maxlte | number | 否 | 筛选min_amount≤此值 |
| max_amount_mingte | number | 否 | 筛选max_amount≥此值 |
| fee_rate_min | number | 否 | 费率下限 |
| fee_rate_max | number | 否 | 费率上限 |
| fixed_fee_min | number | 否 | 固定费用下限 |
| fixed_fee_max | number | 否 | 固定费用上限 |
| daily_limit_min | number | 否 | 每日限额下限 |
| daily_limit_max | number | 否 | 每日限额上限 |
| created_from | string | 否 | 创建时间起始(ISO) |
| created_to | string | 否 | 创建时间结束(ISO) |
| updated_from | string | 否 | 更新时间起始(ISO) |
| updated_to | string | 否 | 更新时间结束(ISO) |
| sort_by | string | 否 | 排序字段 |
| sort_dir | 'asc'\|'desc' | 否 | 排序方向 |

**请求示例**:

```bash
curl --location --request POST 'https://api.xreddeercasino.com/api/payment-channels/list' \
--header 'Content-Type: application/json' \
--data-raw '{
  "page": 1,
  "page_size": 20,
  "keyword": "USDT",
  "types": [1,2],
  "channel_types": ["usdt","alipay"],
  "status": 1,
  "disabled": false,
  "fee_rate_max": 0.01,
  "max_amount_mingte": 1000.00,
  "daily_limit_min": 5000.00,
  "sort_by": "sort_order",
  "sort_dir": "desc"
}'
```

**响应结构**:

```json
{
  "total": 14,
  "page": 1,
  "page_size": 20,
  "list": [
    {
      "id": 3,
      "name": "USDT-TRC20 快充",
      "code": "USDT_TRON_QR",
      "type": 1,
      "channelType": "usdt",
      "config": {
        "network": "TRON",
        "displayName": "USDT 快充",
        "currency": "USDT",
        "minConfirmations": 12
      },
      "minAmount": 10.00,
      "maxAmount": 3000.00,
      "dailyLimit": 20000.00,
      "feeRate": 0.0030,
      "fixedFee": 0.00,
      "sortOrder": 900,
      "status": 1,
      "version": 5,
      "createdAt": "2025-10-20T08:20:00Z",
      "updatedAt": "2025-11-11T12:45:00Z",
      "removed": false,
      "disabled": false
    }
  ]
}
```

### 2. 获取前台可用渠道

**接口地址**: `GET /api/payment-channels/available?type=1`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | 1\|2 | 是 | 渠道类型: 1=充值, 2=提现 |

**响应结构**:

```json
{
  "code": 200,
  "message": "成功",
  "data": [
    {
      "id": 3,
      "name": "USDT-TRC20 快充",
      "code": "USDT_TRON_QR",
      "type": 1,
      "channelType": "usdt",
      "displayName": "USDT 快充",
      "minAmount": 10.00,
      "maxAmount": 3000.00,
      "feeRate": 0.0030,
      "fixedFee": 0.00,
      "sortOrder": 900
    }
  ]
}
```

**说明**: 此接口仅返回 `status=1 && disabled=false && removed=false` 的渠道,且敏感配置(商户密钥等)不会下发。

### 3. 获取渠道详情

**接口地址**: `GET /api/payment-channels/{id}`

**响应结构**:

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": 3,
    "name": "USDT-TRC20 快充",
    "code": "USDT_TRON_QR",
    ...
  }
}
```

### 4. 创建支付渠道

**接口地址**: `POST /api/payment-channels`

**请求体**:

```json
{
  "name": "新渠道名称",
  "code": "NEW_CHANNEL_CODE",
  "type": 1,
  "channelType": "alipay",
  "config": {
    "merchantId": "xxx",
    "displayName": "新渠道"
  },
  "minAmount": 10.00,
  "maxAmount": 5000.00,
  "dailyLimit": 50000.00,
  "feeRate": 0.0065,
  "fixedFee": 0.00,
  "sortOrder": 1000,
  "status": 1,
  "disabled": false
}
```

**响应结构**:

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 11,
    ...
  }
}
```

### 5. 更新支付渠道

**接口地址**: `PUT /api/payment-channels/{id}`

**请求体** (仅需传递要更新的字段):

```json
{
  "status": 0,
  "version": 5
}
```

**说明**: 
- 必须传递 `version` 字段进行乐观锁校验
- 如果版本不匹配,返回 409 错误

**响应结构**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 3,
    "version": 6,
    ...
  }
}
```

### 6. 删除支付渠道

**接口地址**: `DELETE /api/payment-channels/{id}`

**说明**: 逻辑删除,设置 `removed=true`

**响应结构**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

## 可用性判定规则

前台渠道可用条件:

```
status = 1 
AND disabled = false 
AND removed = false 
AND minAmount <= 用户金额 <= maxAmount
```

对于提现渠道,还需额外校验:
- 用户余额充足
- 未超过每日提现次数限制
- 风控白名单检查(如需)

## 费用计算公式

```
手续费 = 交易金额 × feeRate + fixedFee
```

示例:
- 交易金额: 1000元
- feeRate: 0.0065 (0.65%)
- fixedFee: 2元
- 手续费 = 1000 × 0.0065 + 2 = 8.5元

## 排序规则

默认排序逻辑:
1. `type` 升序 (充值在前)
2. `sortOrder` 降序
3. `updatedAt` 降序
4. `id` 降序

## 索引建议

建议索引:
- `code` (唯一索引)
- `type`
- `channelType`
- `status`
- `disabled`
- `sortOrder`
- `updatedAt`

## 安全说明

1. **敏感配置保护**: `config` 中的商户密钥、回调签名盐等敏感字段仅后端使用,不在列表接口返回
2. **操作审计**: 重要变更(费率、金额区间、状态、禁用)需写入操作日志
3. **乐观锁**: 更新操作需携带 `version` 字段防止并发覆盖

## 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 404 | 渠道不存在 |
| 409 | 版本冲突(数据已被修改) |
| 500 | 服务器内部错误 |
