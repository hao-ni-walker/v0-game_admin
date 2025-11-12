export type PaymentChannelType = 1 | 2; // 1=充值 2=提现
export type ChannelType = 'alipay' | 'wechat' | 'bank' | 'usdt' | 'other';

export interface PaymentChannel {
  id: number;
  name: string; // 运营展示名称
  code: string; // 全局唯一渠道代码
  type: PaymentChannelType; // 1=充值 2=提现
  channelType: ChannelType; // alipay/wechat/bank/usdt等
  config: Record<string, unknown>; // JSON配置
  minAmount: number; // 最小金额
  maxAmount: number; // 最大金额
  dailyLimit: number; // 每日限额
  feeRate: number; // 费率
  fixedFee: number; // 固定费用
  sortOrder: number; // 排序
  status: 0 | 1; // 1=启用 0=停用
  version: number; // 乐观锁版本
  createdAt: string; // ISO
  updatedAt: string; // ISO
  removed: boolean; // 逻辑删除
  disabled: boolean; // 紧急禁用开关
}

export interface PaymentChannelFilters {
  page: number;
  page_size: number;
  keyword?: string;
  types?: PaymentChannelType[];
  channel_types?: ChannelType[];
  status?: 0 | 1 | 'all';
  disabled?: boolean;
  show_removed?: boolean;
  min_amount_maxlte?: number;
  max_amount_mingte?: number;
  fee_rate_min?: number;
  fee_rate_max?: number;
  fixed_fee_min?: number;
  fixed_fee_max?: number;
  daily_limit_min?: number;
  daily_limit_max?: number;
  created_from?: string;
  created_to?: string;
  updated_from?: string;
  updated_to?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export interface PaymentChannelPagination {
  page: number;
  page_size: number;
  total: number;
}

export interface PaymentChannelDialogState {
  type: 'create' | 'edit' | 'view' | null;
  channel: PaymentChannel | null;
  open: boolean;
}

export interface PaymentChannelTableEmptyState {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}
