import { apiRequest, buildSearchParams } from './base';

// ── Types ──

export interface CopyTradeLeaderItem {
  leader_id: string;
  user_id: number;
  display_name: string;
  status: 'pending' | 'active' | 'suspended' | 'terminated' | 'rejected';
  tier: LeaderTier;
  commission_rate: number;
  followers_count: number;
  total_lead_orders: number;
  win_rate_30d: number;
  total_commission_earned: number;
  total_commission_withdrawn: number;
  joined_at: number | null;
}

export interface CopyTradeLeaderListResult {
  list: CopyTradeLeaderItem[];
  pagination: { page: number; size: number; total: number; pages: number };
}

export interface CopyTradeApplicantStats {
  registered_days: number;
  total_deposit: number;
  total_orders: number;
  win_rate: number;
  risk_flags: string[];
}

export interface CopyTradeApplicationItem {
  application_id: string;
  user_id: number;
  tg_username: string | null;
  display_name: string;
  bio: string | null;
  status: 'pending' | 'approved' | 'rejected';
  user_stats: CopyTradeApplicantStats;
  created_at: number;
}

export interface CopyTradeApplicationListResult {
  list: CopyTradeApplicationItem[];
  pagination: { page: number; size: number; total: number; pages: number };
}

export interface CopyTradeCommissionItem {
  commission_id: string;
  leader_id: string;
  leader_name: string | null;
  follower_id: number;
  follower_order_id: number;
  order_amount: number;
  order_result: string;
  commission_rate: number;
  commission_amount: number;
  status: 'frozen' | 'available' | 'withdrawn';
  created_at: number;
  available_at: number | null;
}

export interface CopyTradeCommissionListResult {
  list: CopyTradeCommissionItem[];
  pagination: { page: number; size: number; total: number; pages: number };
}

export interface CopyTradeOverview {
  today: {
    copy_orders_count: number;
    copy_orders_volume: number;
    copy_volume_ratio: number;
    active_leaders: number;
    active_followers: number;
    total_commission: number;
  };
  total: {
    leaders_count: number;
    followers_count: number;
    copy_orders_count: number;
    total_commission_paid: number;
  };
}

export interface CopyTradeConfig {
  leader_apply_conditions?: Record<string, number>;
  follow_limits?: Record<string, number>;
  commission?: Record<string, number>;
  risk?: Record<string, unknown>;
  [key: string]: unknown;
}

// ── API ──

const BASE = '/admin/copy-trade';

export const CopyTradeAPI = {
  // Leaders
  getLeaders: (params: { status?: string; keyword?: string; sort_by?: string; page?: number; size?: number } = {}) =>
    apiRequest<CopyTradeLeaderListResult>(`${BASE}/leaders?${buildSearchParams(params)}`),

  updateLeaderStatus: (leaderId: string, data: { action: 'suspend' | 'activate' | 'terminate'; reason?: string; notify_followers?: boolean }) =>
    apiRequest<{ leader_id: string; status: string }>(`${BASE}/leaders/${leaderId}/status`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateLeaderCommission: (leaderId: string, data: { commission_rate: number; reason?: string; effective_at?: string }) =>
    apiRequest<{ leader_id: string; commission_rate: number }>(`${BASE}/leaders/${leaderId}/commission`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Applications
  getApplications: (params: { status?: string; page?: number; size?: number } = {}) =>
    apiRequest<CopyTradeApplicationListResult>(`${BASE}/applications?${buildSearchParams(params)}`),

  getApplication: (applicationId: string) =>
    apiRequest<CopyTradeApplicationItem>(`${BASE}/applications/${applicationId}`),

  reviewApplication: (applicationId: string, data: { decision: 'approved' | 'rejected'; commission_rate?: number; max_followers?: number; reason?: string }) =>
    apiRequest<{ application_id: string; status: string; leader_id: string | null }>(
      `${BASE}/applications/${applicationId}/review`,
      { method: 'POST', body: JSON.stringify(data) },
    ),

  // Commissions
  getCommissions: (params: { leader_id?: string; status?: string; page?: number; size?: number } = {}) =>
    apiRequest<CopyTradeCommissionListResult>(`${BASE}/commissions?${buildSearchParams(params)}`),

  // Overview
  getOverview: () => apiRequest<CopyTradeOverview>(`${BASE}/overview`),

  // Config
  getConfig: () => apiRequest<CopyTradeConfig>(`${BASE}/config`),
  updateConfig: (data: CopyTradeConfig) =>
    apiRequest<CopyTradeConfig>(`${BASE}/config`, { method: 'PUT', body: JSON.stringify(data) }),

  // ── Tier management ──
  adjustLeaderTier: (leaderId: string, data: { new_tier: string; reason?: string; override_conditions?: boolean; notify_leader?: boolean }) =>
    apiRequest<{ leader_id: string; tier: string; commission_rate: number; max_followers: number; history_id: number }>(
      `${BASE}/leaders/${leaderId}/tier`,
      { method: 'POST', body: JSON.stringify(data) },
    ),

  getLeaderTierHistory: (leaderId: string, params: { page?: number; size?: number } = {}) =>
    apiRequest<{ list: CopyTradeTierHistoryItem[]; pagination: { page: number; size: number; total: number; pages: number } }>(
      `${BASE}/leaders/${leaderId}/tier/history?${buildSearchParams(params)}`,
    ),

  freezeTierEvaluation: (data: { freeze_hours: number; reason?: string; scope?: string }) =>
    apiRequest<{ freeze_until: number; reason: string | null; set_at: number }>(
      `${BASE}/tier/freeze-evaluation`,
      { method: 'POST', body: JSON.stringify(data) },
    ),
};

export type LeaderTier = 'tier_bronze' | 'tier_silver' | 'tier_gold' | 'tier_diamond' | 'tier_legend';

export interface CopyTradeTierHistoryItem {
  id: number;
  leader_id: string;
  from_tier: string;
  to_tier: string;
  change_type: 'upgrade' | 'downgrade' | 'manual';
  reason: string | null;
  operator_id: string | null;
  snapshot: Record<string, number> | null;
  created_at: number;
}

export const TIER_META: Record<LeaderTier, { label: string; badge: string; color: string }> = {
  tier_bronze: { label: '青铜', badge: '🥉', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
  tier_silver: { label: '白银', badge: '🥈', color: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
  tier_gold: { label: '黄金', badge: '🥇', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
  tier_diamond: { label: '钻石', badge: '💎', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  tier_legend: { label: '传奇', badge: '👑', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
};

export const TIER_OPTIONS: { value: LeaderTier; label: string }[] = [
  { value: 'tier_bronze', label: '🥉 青铜' },
  { value: 'tier_silver', label: '🥈 白银' },
  { value: 'tier_gold', label: '🥇 黄金' },
  { value: 'tier_diamond', label: '💎 钻石' },
  { value: 'tier_legend', label: '👑 传奇' },
];
