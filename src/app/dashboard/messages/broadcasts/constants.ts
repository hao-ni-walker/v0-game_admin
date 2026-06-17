import type { BroadcastFilters } from './types';

export const DEFAULT_PAGINATION = { page: 1, page_size: 20 };
export const PAGE_SIZE_OPTIONS = [20, 50, 100];

export const DEFAULT_FILTERS: BroadcastFilters = {
  status: '',
  page: 1,
  page_size: 20,
};

export const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: '全部', value: '' },
  { label: '待审批', value: 'awaiting_approval' },
  { label: '已批准', value: 'approved' },
  { label: '发送中', value: 'processing' },
  { label: '已完成', value: 'completed' },
  { label: '失败', value: 'failed' },
  { label: '已取消', value: 'cancelled' },
];

export const STATUS_COLORS: Record<string, string> = {
  awaiting_approval: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-700',
};

export const STATUS_LABELS: Record<string, string> = {
  awaiting_approval: '待审批',
  approved: '已批准',
  processing: '发送中',
  completed: '已完成',
  failed: '失败',
  cancelled: '已取消',
};

export const TARGET_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: '全部用户', value: 'all' },
  { label: '按 VIP 等级', value: 'vip_level' },
  { label: '指定用户列表', value: 'user_list' },
  { label: '条件筛选', value: 'condition' },
];

export const CATEGORY_OPTIONS: { label: string; value: string }[] = [
  { label: '交易', value: 'trade' },
  { label: '资金', value: 'finance' },
  { label: '活动', value: 'activity' },
  { label: '系统', value: 'system' },
  { label: '风控', value: 'risk' },
];

export const PRIORITY_OPTIONS: { label: string; value: string }[] = [
  { label: '普通', value: 'normal' },
  { label: '低', value: 'low' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' },
];

export const MESSAGES = {
  SUCCESS: {
    CREATE: '群发已提交，等待审批',
    APPROVE: '已批准，开始发送',
    REJECT: '已驳回',
  },
  ERROR: {
    FETCH: '获取群发列表失败',
    CREATE: '创建群发失败',
    APPROVE: '审批失败',
    REJECT: '驳回失败',
  },
};
