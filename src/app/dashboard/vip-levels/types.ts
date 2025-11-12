/**
 * VIP等级数据类型
 */
export interface VipLevel {
  id: number;
  level: number; // 等级数值，唯一，严格递增
  name: string; // 等级名称，如 VIP0/VIP1 或 Bronze/Silver/Gold
  required_exp: number; // 所需经验值，严格递增
  upgrade_reward: number | null; // 升级奖励金额
  daily_reward: number | null; // 每日奖励金额
  withdraw_daily_limit: number | null; // 每日提现次数上限
  withdraw_amount_limit: number | null; // 每日提现金额上限
  commission_rate: number; // 佣金比例，如 0.0050 表示 0.50%
  benefits: Record<string, any> | null; // 权益数据 JSON
  version: number; // 乐观锁版本
  created_at: string;
  updated_at: string;
  removed: boolean;
  disabled: boolean;
}

/**
 * VIP等级筛选条件
 */
export interface VipLevelFilters {
  keyword?: string; // 匹配 name
  level_min?: number;
  level_max?: number;
  required_exp_min?: number;
  required_exp_max?: number;
  disabled?: boolean;
  show_removed?: boolean;
  created_from?: string;
  created_to?: string;
  updated_from?: string;
  updated_to?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

/**
 * 分页信息
 */
export interface PaginationInfo {
  page: number;
  page_size: number;
  total: number;
  totalPages: number;
}

/**
 * VIP等级表单数据
 */
export interface VipLevelFormData {
  level: number;
  name: string;
  required_exp: number;
  upgrade_reward: number | null;
  daily_reward: number | null;
  withdraw_daily_limit: number | null;
  withdraw_amount_limit: number | null;
  commission_rate: number;
  benefits: Record<string, any> | null;
  disabled: boolean;
}

/**
 * 对话框状态
 */
export type VipLevelDialogType = 'create' | 'edit' | 'view' | null;

export interface VipLevelDialogState {
  type: VipLevelDialogType;
  vipLevel: VipLevel | null;
  open: boolean;
}

/**
 * 下拉选项
 */
export interface Option {
  label: string;
  value: string | number;
}
