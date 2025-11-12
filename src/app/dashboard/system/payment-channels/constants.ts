import { ChannelType, PaymentChannelType } from './types';

// 分页大小选项
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// 默认每页大小
export const DEFAULT_PAGE_SIZE = 20;

// 支付渠道类型选项
export const PAYMENT_TYPE_OPTIONS = [
  { label: '充值', value: 1 as PaymentChannelType },
  { label: '提现', value: 2 as PaymentChannelType }
];

// 渠道类型选项
export const CHANNEL_TYPE_OPTIONS: { label: string; value: ChannelType }[] = [
  { label: '支付宝', value: 'alipay' },
  { label: '微信', value: 'wechat' },
  { label: '银行卡', value: 'bank' },
  { label: 'USDT', value: 'usdt' },
  { label: '其他', value: 'other' }
];

// 状态选项
export const STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '启用', value: 1 },
  { label: '停用', value: 0 }
];

// 渠道类型标签映射
export const CHANNEL_TYPE_LABELS: Record<ChannelType, string> = {
  alipay: '支付宝',
  wechat: '微信',
  bank: '银行卡',
  usdt: 'USDT',
  other: '其他'
};

// 渠道类型颜色映射
export const CHANNEL_TYPE_COLORS: Record<ChannelType, string> = {
  alipay: 'text-blue-600 bg-blue-50',
  wechat: 'text-green-600 bg-green-50',
  bank: 'text-purple-600 bg-purple-50',
  usdt: 'text-orange-600 bg-orange-50',
  other: 'text-gray-600 bg-gray-50'
};

// 支付类型标签映射
export const PAYMENT_TYPE_LABELS: Record<PaymentChannelType, string> = {
  1: '充值',
  2: '提现'
};

// 支付类型颜色映射
export const PAYMENT_TYPE_COLORS: Record<PaymentChannelType, string> = {
  1: 'text-green-700 bg-green-100',
  2: 'text-blue-700 bg-blue-100'
};
