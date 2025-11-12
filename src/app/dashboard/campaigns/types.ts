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
  scheduled: '待上线',
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

// 活动筛选条件类型
export interface ActivityFilters {
  keyword?: string;
  activityTypes?: string[];
  statuses?: string[];
  activeOnly?: boolean;
  availableForDisplay?: boolean;
  startFrom?: string;
  startTo?: string;
  endFrom?: string;
  endTo?: string;
  displayFrom?: string;
  displayTo?: string;
  participantsMin?: number;
  participantsMax?: number;
  rewardsMin?: number;
  rewardsMax?: number;
  updatedFrom?: string;
  updatedTo?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
