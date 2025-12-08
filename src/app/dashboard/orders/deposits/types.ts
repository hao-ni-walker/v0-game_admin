// 储值订单相关类型定义

export type DepositOrderStatus =
  | 'pending' // 待支付
  | 'processing' // 支付中
  | 'success' // 成功
  | 'failed' // 失败
  | 'timeout'; // 超时

export interface DepositOrder {
  id: number;
  orderNo: string; // 平台订单号
  channelOrderNo?: string | null; // 渠道订单号
  userId: number;
  username?: string; // 用户名
  nickname?: string; // 昵称
  phone?: string; // 手机号
  email?: string; // 邮箱
  paymentChannelId: number;
  paymentChannelName?: string; // 支付渠道名称
  paymentChannelCode?: string; // 支付渠道代码
  amount: number; // 充值金额
  fee: number; // 手续费
  bonusAmount: number; // 赠送金额
  actualAmount: number; // 实收金额
  status: DepositOrderStatus;
  currency: string; // 币种
  ipAddress?: string | null; // IP 地址
  remark?: string | null; // 备注
  createdAt: string; // 创建时间
  completedAt?: string | null; // 完成时间
  updatedAt?: string; // 更新时间
}

// 用户钱包信息
export interface UserWallet {
  id: number;
  userId: number;
  balance: number; // 余额
  frozenBalance: number; // 冻结金额
  bonusBalance: number; // 赠送余额
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
  transactionType: 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus' | 'adjust';
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

// 统计概览
export interface DepositOrderStats {
  orderCount: number; // 订单数
  totalAmount: number; // 充值总额
  totalActualAmount: number; // 实收金额
  totalBonusAmount: number; // 赠送金额
}

// 筛选参数
export interface DepositOrderFilters {
  // 基础筛选
  orderNo?: string; // 订单号（支持平台订单号/渠道订单号）
  userKeyword?: string; // 用户关键词（ID/用户名/手机号）
  paymentChannelId?: number; // 支付渠道ID
  statuses?: DepositOrderStatus[]; // 订单状态（多选）
  createdFrom?: string; // 创建时间开始
  createdTo?: string; // 创建时间结束

  // 高级筛选
  minAmount?: number; // 最小金额
  maxAmount?: number; // 最大金额
  hasBonus?: boolean | null; // 是否有赠送（null=全部，true=有赠送，false=无赠送）
  currency?: string; // 币种
  ipAddress?: string; // IP 地址（支持前缀匹配）

  // 分页和排序
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'amount' | 'status';
  sortDir?: 'asc' | 'desc';
}
