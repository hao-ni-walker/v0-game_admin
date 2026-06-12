// 提现订单页面常量

import type { WithdrawOrderStatus, AuditStatus, PayoutStatus } from './types';

// 订单状态选项
export const ORDER_STATUS_OPTIONS: Array<{
  value: WithdrawOrderStatus;
  label: string;
}> = [
  { value: 'pending_audit', label: '待审核' },
  { value: 'audit_passed', label: '审核通过待出款' },
  { value: 'payout_processing', label: '出款中' },
  { value: 'success', label: '成功' },
  { value: 'rejected', label: '拒绝' },
  { value: 'failed', label: '失败' }
];

// 订单状态颜色映射
export const ORDER_STATUS_COLORS: Record<WithdrawOrderStatus, string> = {
  pending_audit:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  audit_passed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  payout_processing:
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

// 订单状态标签映射
export const ORDER_STATUS_LABELS: Record<WithdrawOrderStatus, string> = {
  pending_audit: '待审核',
  audit_passed: '审核通过待出款',
  payout_processing: '出款中',
  success: '成功',
  rejected: '拒绝',
  failed: '失败'
};

// 审核状态选项
export const AUDIT_STATUS_OPTIONS: Array<{
  value: AuditStatus | 'all';
  label: string;
}> = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '未审核' },
  { value: 'approved', label: '已审核' },
  { value: 'rejected', label: '已拒绝' }
];

// 出款状态选项
export const PAYOUT_STATUS_OPTIONS: Array<{
  value: PayoutStatus | 'all';
  label: string;
}> = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '未出款' },
  { value: 'processing', label: '出款中' },
  { value: 'success', label: '出款成功' },
  { value: 'failed', label: '出款失败' }
];

// 状态快捷筛选 Tab 选项
export const STATUS_TAB_OPTIONS: Array<{
  value: WithdrawOrderStatus | 'all';
  label: string;
  count?: number;
}> = [
  { value: 'all', label: '全部' },
  { value: 'pending_audit', label: '待审核' },
  { value: 'payout_processing', label: '出款中' },
  { value: 'success', label: '成功' },
  { value: 'failed', label: '失败' }
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

// 状态流转时间轴步骤
export const STATUS_TIMELINE_STEPS = [
  { key: 'submitted', label: '已提交申请', status: 'completed' },
  { key: 'audited', label: '已审核', status: 'pending' },
  { key: 'payout_processing', label: '出款中', status: 'pending' },
  { key: 'completed', label: '出款完成', status: 'pending' }
] as const;
