// 提现订单相关类型定义

export type WithdrawOrderStatus =
  | 'pending_audit' // 待审核
  | 'audit_passed' // 审核通过待出款
  | 'payout_processing' // 出款中
  | 'success' // 成功
  | 'rejected' // 拒绝
  | 'failed'; // 失败

export type AuditStatus = 'pending' | 'approved' | 'rejected';
export type PayoutStatus = 'pending' | 'processing' | 'success' | 'failed';
export type PayoutMethod = 'auto' | 'manual'; // 自动代付 / 手工打款

export interface WithdrawOrder {
  id: number;
  orderNo: string; // 平台订单号
  channelOrderNo?: string | null; // 渠道订单号（代付/三方出款单号）
  userId: number;
  username?: string; // 用户名
  nickname?: string; // 昵称
  phone?: string; // 手机号
  email?: string; // 邮箱
  paymentChannelId: number;
  paymentChannelName?: string; // 提现渠道名称
  paymentChannelCode?: string; // 提现渠道代码
  channelType?: 'bank' | 'usdt' | 'alipay' | 'wechat' | 'other'; // 渠道类型
  amount: number; // 提现金额
  fee: number; // 手续费
  actualAmount: number | null; // 实际出款金额（待审核/待出款时为 null）
  status: WithdrawOrderStatus;
  currency: string; // 币种
  // 提现账户信息
  accountName?: string; // 账户名
  accountNumber?: string; // 账户号（银行卡号/钱包地址等）
  bankName?: string; // 银行名称
  // 审核信息
  auditStatus?: AuditStatus; // 审核状态
  auditorId?: number | null; // 审核人ID
  auditorName?: string | null; // 审核人姓名
  auditAt?: string | null; // 审核时间
  auditRemark?: string | null; // 审核备注/拒绝原因
  // 出款信息
  payoutStatus?: PayoutStatus; // 出款状态
  payoutMethod?: PayoutMethod; // 出款方式
  payoutAt?: string | null; // 出款完成时间
  payoutFailureReason?: string | null; // 出款失败原因
  // 其他
  ipAddress?: string | null; // IP 地址
  remark?: string | null; // 备注
  createdAt: string; // 申请时间
  completedAt?: string | null; // 完成时间
  updatedAt?: string; // 更新时间（可能缺失，使用 createdAt 作为默认值）
}

// 用户钱包信息（复用储值订单的类型）
export interface UserWallet {
  id: number;
  userId: number;
  balance: number; // 余额
  frozenBalance: number; // 冻结金额
  bonusBalance: number; // 赠送余额
  withdrawable: number; // 可提现金额
  totalDeposit: number; // 累计充值
  totalWithdraw: number; // 累计提现
  currency: string; // 币种
  status: 'active' | 'removed' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

// 资金流水
export interface WalletTransaction {
  id: number;
  userId: number;
  orderId?: number | null; // 关联订单ID
  orderNo?: string | null; // 关联订单号
  transactionType:
    | 'withdraw'
    | 'withdraw_freeze'
    | 'withdraw_unfreeze'
    | 'withdraw_success'
    | 'withdraw_failed';
  walletType: 'balance' | 'bonus'; // 钱包类型：余额/赠送
  amount: number; // 金额（正数表示增加，负数表示减少）
  balanceBefore: number; // 变更前余额
  balanceAfter: number; // 变更后余额
  status: 'success' | 'failed' | 'pending';
  remark?: string | null;
  createdAt: string;
}

// 支付渠道
export interface PaymentChannel {
  id: number;
  name: string;
  code: string;
  type: 1 | 2; // 1=充值 2=提现
  channelType: 'alipay' | 'wechat' | 'bank' | 'usdt' | 'other';
  status: 0 | 1; // 1=启用 0=停用
}

// 风控信息
export interface RiskInfo {
  withdrawCountLast7Days?: number; // 过去7天提现次数
  withdrawAmountLast7Days?: number; // 过去7天提现金额
  withdrawCountLast30Days?: number; // 过去30天提现次数
  withdrawAmountLast30Days?: number; // 过去30天提现金额
  riskTags?: string[]; // 风险标签
}

// 统计概览
export interface WithdrawOrderStats {
  totalAmount: number; // 提现总金额
  totalFee: number; // 手续费总额
  totalActualAmount: number; // 实际出款金额
  successCount: number; // 成功笔数
  failedCount: number; // 失败笔数
}

// 筛选参数
export interface WithdrawOrderFilters {
  // 基础筛选
  orderNo?: string; // 平台订单号
  channelOrderNo?: string; // 渠道订单号
  userKeyword?: string; // 用户关键词（ID/用户名/手机号）
  paymentChannelId?: number; // 提现渠道ID
  statuses?: WithdrawOrderStatus[]; // 订单状态（多选）
  createdFrom?: string; // 申请时间开始
  createdTo?: string; // 申请时间结束

  // 高级筛选
  minAmount?: number; // 最小金额
  maxAmount?: number; // 最大金额
  auditStatus?: AuditStatus; // 审核状态
  payoutStatus?: PayoutStatus; // 出款状态
  auditorKeyword?: string; // 审核人（姓名或ID）
  auditFrom?: string; // 审核时间开始
  auditTo?: string; // 审核时间结束
  completedFrom?: string; // 完成时间开始
  completedTo?: string; // 完成时间结束
  ipAddress?: string; // IP 地址（支持前缀匹配）

  // 分页和排序
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'amount' | 'status' | 'completedAt';
  sortDir?: 'asc' | 'desc';
}

// 审核操作参数
export interface AuditOrderParams {
  orderId: number;
  action: 'approve' | 'reject';
  remark: string; // 审核备注或拒绝原因
}

// 标记出款结果参数
export interface MarkPayoutParams {
  orderId: number;
  action: 'success' | 'failed';
  channelOrderNo?: string; // 渠道订单号（成功时）
  failureReason?: string; // 失败原因（失败时）
}
