import { formatDate } from '@/lib/format';
import { AdminStatus } from './types';

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
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * 获取管理员状态标签颜色
 */
export function getAdminStatusColor(status: AdminStatus): string {
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
 * 获取管理员状态文本
 */
export function getAdminStatusText(status: AdminStatus): string {
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
 * 验证邮箱格式
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证密码复杂度
 */
export function validatePassword(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return { valid: false, message: '密码长度至少8位' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: '密码必须包含至少一个大写字母' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: '密码必须包含至少一个小写字母' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: '密码必须包含至少一个数字' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: '密码必须包含至少一个特殊字符' };
  }
  return { valid: true };
}

