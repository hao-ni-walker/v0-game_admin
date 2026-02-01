export type PaymentChannelType = 'collection' | 'disbursement'; // collection=充值 disbursement=提现
export type ChannelType =
  | 'CRYPTO'
  | 'BANK'
  | 'APP'
  | 'ALIPAY'
  | 'WECHAT'
  | 'OTHER';

// 支付渠道（属于某个平台）
export interface PaymentChannel {
  id: number;
  name: string; // 渠道名称
  code: string; // 渠道代码
  type: PaymentChannelType; // collection=充值 disbursement=提现
  platform_id: number; // 所属平台ID
  channel_type: ChannelType; // CRYPTO/BANK/APP等
  config: Record<string, unknown> | null; // JSON配置
  min_amount: string; // 最小金额
  max_amount: string; // 最大金额
  daily_limit: string | null; // 每日限额
  fee_rate: string; // 费率
  fixed_fee: string; // 固定费用
  sort_order: number; // 排序
  version: number; // 乐观锁版本
  created_at: string; // ISO
  updated_at: string; // ISO
  removed: boolean; // 逻辑删除
  disabled: boolean; // 禁用开关
}

// 支付平台
export interface PaymentPlatform {
  id: number;
  name: string; // 平台名称
  enabled: boolean; // 是否启用
  url: string; // 平台URL
  platform_config: Record<string, unknown>; // 平台配置
  channels: PaymentChannel[]; // 平台下的渠道列表
}

// 兼容旧类型（用于表格展示）
export interface PaymentChannelDisplay {
  id: number;
  name: string;
  code: string;
  type: PaymentChannelType;
  channelType: ChannelType;
  config: Record<string, unknown> | null;
  minAmount: number;
  maxAmount: number;
  dailyLimit: number | null;
  feeRate: number;
  fixedFee: number;
  sortOrder: number;
  status: 0 | 1;
  version: number;
  createdAt: string;
  updatedAt: string;
  removed: boolean;
  disabled: boolean;
}

export interface PaymentPlatformFilters {
  page: number;
  page_size: number;
  keyword?: string;
  enabled?: boolean | 'all';
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
  total_pages?: number;
}

export interface PaymentPlatformDialogState {
  type: 'create' | 'edit' | 'view' | null;
  platform: PaymentPlatform | null;
  open: boolean;
}

export interface PaymentChannelDialogState {
  type: 'create' | 'edit' | 'view' | null;
  channel: PaymentChannel | null;
  platformId?: number;
  open: boolean;
}

export interface PaymentChannelTableEmptyState {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}
