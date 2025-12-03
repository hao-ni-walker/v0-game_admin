import { Activity } from '@/repository/models';

export type ActivityWithStats = Activity;

// 活动状态标签和颜色映射
export const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  ended: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  disabled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

export const STATUS_LABELS: Record<string, string> = {
  draft: '草稿',
  scheduled: '已排期',
  active: '进行中',
  paused: '已暂停',
  ended: '已结束',
  disabled: '已禁用'
};

// 活动类型标签映射
export const TYPE_LABELS: Record<string, string> = {
  first_deposit: '首充活动',
  daily_signin: '每日签到',
  vip_reward: 'VIP奖励',
  limited_pack: '限时礼包',
  lottery: '抽奖活动',
  leaderboard: '排行榜',
  cashback: '返利活动',
  referral: '推荐奖励',
  other: '其他活动'
};

// 触发规则类型
export interface EventActivityTrigger {
  id: number;
  activity_id: number;
  event_type: string;
  match_criteria: Record<string, unknown>;
  trigger_mode: 'enqueue' | 'immediate' | 'suppress';
  reward_items: Record<string, unknown>;
  cooldown_seconds?: number | null;
  daily_limit_per_user?: number | null;
  total_limit?: number | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 触发模式标签
export const TRIGGER_MODE_LABELS: Record<string, string> = {
  enqueue: '入队',
  immediate: '立即',
  suppress: '抑制'
};

// 活动筛选条件类型（映射到后端 API 参数）
export interface ActivityFilters {
  // 基础信息筛选
  id?: number;
  activity_code?: string;
  name?: string;
  activity_type?: string;
  
  // 状态筛选（多选，转换为逗号分隔字符串）
  statuses?: string[];
  
  // 时间筛选
  start_time_start?: string;
  start_time_end?: string;
  end_time_start?: string;
  end_time_end?: string;
  display_time_active?: boolean;
  
  // 触发规则筛选
  has_active_trigger?: boolean;
  
  // 排序
  sort_by?: string; // id, start_time, end_time, created_at, priority, status
  sort_order?: 'asc' | 'desc';
  
  // 分页
  page?: number;
  page_size?: number;
}

// 活动详情中的触发规则摘要
export interface TriggerSummary {
  total_triggers: number;
  active_triggers: number;
  main_event_types: string[];
}
