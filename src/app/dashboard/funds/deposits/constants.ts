// 储值订单页面常量

import type { DepositOrderStatus } from './types';

// 订单状态选项
export const ORDER_STATUS_OPTIONS: Array<{
  value: DepositOrderStatus;
  label: string;
}> = [
  { value: 'pending', label: '待支付' },
  { value: 'processing', label: '支付中' },
  { value: 'success', label: '成功' },
  { value: 'failed', label: '失败' },
  { value: 'timeout', label: '超时' }
];

// 订单状态颜色映射
export const ORDER_STATUS_COLORS: Record<DepositOrderStatus, string> = {
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  timeout: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

// 订单状态标签映射
export const ORDER_STATUS_LABELS: Record<DepositOrderStatus, string> = {
  pending: '待支付',
  processing: '支付中',
  success: '成功',
  failed: '失败',
  timeout: '超时'
};

// 是否有赠送选项
export const HAS_BONUS_OPTIONS = [
  { value: null, label: '全部' },
  { value: true, label: '有赠送' },
  { value: false, label: '无赠送' }
];

// 分页选项
export const PAGE_SIZE_OPTIONS = [20, 50, 100];

// 默认分页大小
export const DEFAULT_PAGE_SIZE = 20;

// 默认日期范围（最近7天）
export function getDefaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  return { from: start, to: end };
}
