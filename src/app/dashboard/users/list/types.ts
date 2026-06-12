// 玩家管理相关类型定义

// 用户状态枚举
export type PlayerStatus = 'active' | 'disabled' | 'locked' | boolean;

// 注册方式枚举
export type RegistrationMethod =
  | 'email'
  | 'google'
  | 'apple'
  | 'phone'
  | 'facebook'
  | 'other';

// 身份类别枚举
export type IdentityCategory = 'user' | 'agent' | 'internal' | 'test';

// 钱包字段类型
export type WalletField = 'balance' | 'frozen_balance' | 'bonus';

// 调整类型
export type AdjustType = 'add' | 'subtract';

// 周期类型
export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'custom';

// 玩家钱包信息
export interface PlayerWallet {
  balance: number;
  frozen_balance: number;
  bonus: number;
  credit: number;
  withdrawable: number;
  total_deposit: number;
  total_withdraw: number;
  total_bet: number;
  total_win: number;
  currency: string;
  status: 'active' | 'removed' | 'disabled';
  version: number;
}

// VIP 信息
export interface VipInfo {
  level: number;
  experience: number;
  last_daily_reward_date?: string;
  status: 'active' | 'removed' | 'disabled';
  created_at: string;
  updated_at: string;
}

// 转盘配额
export interface SpinQuota {
  activity_id: number;
  period_type: PeriodType;
  period_start: string;
  period_end: string;
  total_allowed: number;
  total_used: number;
  period_allowed: number;
  period_used: number;
  period_remaining: number;
}

// 代理关系
export interface AgencyInfo {
  direct_superior_id?: number;
  superior_username?: string;
  agent?: string;
  subordinate_count: number;
  subordinates?: Array<{
    id: number;
    username: string;
    vip_level: number;
    created_at: string;
  }>;
}

// 玩家基本信息
export interface Player {
  id: number;
  idname?: string;
  username: string;
  email: string;
  status: PlayerStatus;
  vip_level: number;
  registration_method: RegistrationMethod;
  registration_source?: string;
  identity_category: IdentityCategory;
  agent?: string;
  direct_superior_id?: number;
  created_at: string;
  updated_at: string;
  last_login?: string;
  login_failure_count?: number;
  locked_at?: string;
  // 关联数据
  wallet?: PlayerWallet;
  vip_info?: VipInfo;
  agency?: AgencyInfo;
}

// 玩家详情（包含完整关联数据）
export interface PlayerDetail extends Player {
  wallet: PlayerWallet;
  vip_info: VipInfo;
  spin_quotas: SpinQuota[];
  agency: AgencyInfo;
}

// 筛选条件
export interface PlayerFilters {
  // 用户基本信息
  id?: number;
  id_min?: number;
  id_max?: number;
  username?: string;
  email?: string;
  idname?: string;
  keyword?: string;
  // 账户状态
  status?: PlayerStatus | '';
  vip_level?: number;
  vip_level_min?: number;
  vip_level_max?: number;
  is_locked?: boolean | '';
  // 代理关系
  agent?: string;
  direct_superior_id?: number;
  // 注册信息
  registration_method?: RegistrationMethod | '';
  registration_source?: string;
  identity_category?: IdentityCategory | '';
  // 钱包信息范围
  balance_min?: number;
  balance_max?: number;
  total_deposit_min?: number;
  total_deposit_max?: number;
  total_withdraw_min?: number;
  total_withdraw_max?: number;
  // 时间范围
  created_at_start?: string;
  created_at_end?: string;
  last_login_start?: string;
  last_login_end?: string;
}

// 分页信息
export interface PaginationInfo {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// 排序信息
export interface SortInfo {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// 玩家列表响应
export interface PlayerListResponse {
  items: Player[];
  total: number;
  page: number;
  page_size: number;
}

// 统计信息
export interface PlayerStatistics {
  total_players: number;
  active_players: number;
  disabled_players: number;
  total_balance: number;
  today_new_players: number;
}

// 编辑玩家表单数据
export interface PlayerEditFormData {
  status?: PlayerStatus;
  vip_level?: number;
  agent?: string;
  direct_superior_id?: number;
  lock?: {
    action: 'lock' | 'unlock';
    lock_time?: string;
  };
}

// 钱包调整表单数据
export interface WalletAdjustFormData {
  field: WalletField;
  type: AdjustType;
  amount: number;
  reason: string;
  version: number;
}

// 通知表单数据
export interface NotificationFormData {
  channel: string;
  title: string;
  content: string;
}

