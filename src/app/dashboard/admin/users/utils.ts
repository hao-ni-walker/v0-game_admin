import { formatDate } from '@/lib/format';

/**
 * 格式化金额（千分位）
 */
export function formatCurrency(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
}

/**
 * 格式化日期时间
 */
export function formatDateTime(dateStr: string | undefined): string {
  if (!dateStr) return '从未登录';
  return formatDate(dateStr, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * 邮箱脱敏
 */
export function maskEmail(email: string): string {
  if (!email) return '';
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;
  if (localPart.length <= 3) {
    return `${localPart[0]}***@${domain}`;
  }
  return `${localPart.slice(0, 3)}***@${domain}`;
}

/**
 * 获取用户状态标签颜色
 */
export function getUserStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-600';
    case 'disabled':
      return 'bg-red-600';
    case 'locked':
      return 'bg-orange-600';
    default:
      return 'bg-gray-600';
  }
}

/**
 * 获取用户状态文本
 */
export function getUserStatusText(status: string): string {
  switch (status) {
    case 'active':
      return '启用';
    case 'disabled':
      return '禁用';
    case 'locked':
      return '已锁定';
    default:
      return status;
  }
}

/**
 * 获取 VIP 等级颜色
 */
export function getVipLevelColor(level: number): string {
  if (level >= 10) return 'bg-purple-600';
  if (level >= 7) return 'bg-blue-600';
  if (level >= 4) return 'bg-green-600';
  if (level >= 1) return 'bg-yellow-600';
  return 'bg-gray-600';
}

/**
 * 获取注册方式文本
 */
export function getRegistrationMethodText(method: string): string {
  const labels: Record<string, string> = {
    email: '邮箱',
    google: 'Google',
    apple: 'Apple',
    phone: '手机',
    facebook: 'Facebook',
    other: '其他'
  };
  return labels[method] || method;
}

/**
 * 获取身份类别文本
 */
export function getIdentityCategoryText(category: string): string {
  const labels: Record<string, string> = {
    user: '普通用户',
    agent: '代理',
    internal: '内部账号',
    test: '测试账号'
  };
  return labels[category] || category;
}

/**
 * 获取周期类型文本
 */
export function getPeriodTypeText(type: string): string {
  const labels: Record<string, string> = {
    daily: '每日',
    weekly: '每周',
    monthly: '每月',
    custom: '自定义'
  };
  return labels[type] || type;
}

