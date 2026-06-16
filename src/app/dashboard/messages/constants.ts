import type { MessageCategory, MessageFilters, MessagePriority } from './types';

export const DEFAULT_PAGINATION = { page: 1, page_size: 20 };
export const PAGE_SIZE_OPTIONS = [20, 50, 100];

export const DEFAULT_FILTERS: MessageFilters = {
  user_id: '',
  category: '',
  page: 1,
  page_size: 20,
};

export const CATEGORY_OPTIONS: { label: string; value: MessageCategory | '' }[] = [
  { label: '全部', value: '' },
  { label: '交易', value: 'trade' },
  { label: '资金', value: 'finance' },
  { label: '活动', value: 'activity' },
  { label: '系统', value: 'system' },
  { label: '风控', value: 'risk' },
];

export const PRIORITY_OPTIONS: { label: string; value: MessagePriority }[] = [
  { label: '普通', value: 'normal' },
  { label: '低', value: 'low' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' },
];

export const CATEGORY_COLORS: Record<string, string> = {
  trade: 'bg-blue-100 text-blue-700',
  finance: 'bg-green-100 text-green-700',
  activity: 'bg-purple-100 text-purple-700',
  system: 'bg-gray-100 text-gray-700',
  risk: 'bg-orange-100 text-orange-700',
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export const STATUS_COLORS: Record<string, string> = {
  unread: 'bg-blue-100 text-blue-700',
  read: 'bg-gray-100 text-gray-700',
  deleted: 'bg-red-100 text-red-700',
};

export const MESSAGES = {
  SUCCESS: { SEND: '消息发送成功', RECALL: '消息已撤回' },
  ERROR: { FETCH: '获取消息列表失败', SEND: '消息发送失败', RECALL: '撤回失败' },
};
