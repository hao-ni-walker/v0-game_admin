import { ChannelType, PaymentChannelType } from './types';

// 分页大小选项
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// 默认每页大小
export const DEFAULT_PAGE_SIZE = 20;

// 支付渠道类型选项
export const PAYMENT_TYPE_OPTIONS = [
  { label: '充值', value: 'collection' as PaymentChannelType },
  { label: '提现', value: 'disbursement' as PaymentChannelType }
];

// 渠道类型选项
export const CHANNEL_TYPE_OPTIONS: { label: string; value: ChannelType }[] = [
  { label: '加密货币', value: 'CRYPTO' },
  { label: '银行卡', value: 'BANK' },
  { label: 'APP支付', value: 'APP' },
  { label: '支付宝', value: 'ALIPAY' },
  { label: '微信', value: 'WECHAT' },
  { label: '其他', value: 'OTHER' }
];

// 状态选项
export const STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '启用', value: true },
  { label: '停用', value: false }
];

// 渠道类型标签映射
export const CHANNEL_TYPE_LABELS: Record<ChannelType, string> = {
  CRYPTO: '加密货币',
  BANK: '银行卡',
  APP: 'APP支付',
  ALIPAY: '支付宝',
  WECHAT: '微信',
  OTHER: '其他'
};

// 渠道类型颜色映射
export const CHANNEL_TYPE_COLORS: Record<ChannelType, string> = {
  CRYPTO: 'text-orange-600 bg-orange-50',
  BANK: 'text-purple-600 bg-purple-50',
  APP: 'text-blue-600 bg-blue-50',
  ALIPAY: 'text-blue-600 bg-blue-50',
  WECHAT: 'text-green-600 bg-green-50',
  OTHER: 'text-gray-600 bg-gray-50'
};

// 支付类型标签映射
export const PAYMENT_TYPE_LABELS: Record<PaymentChannelType, string> = {
  collection: '充值',
  disbursement: '提现'
};

// 支付类型颜色映射
export const PAYMENT_TYPE_COLORS: Record<PaymentChannelType, string> = {
  collection: 'text-green-700 bg-green-100',
  disbursement: 'text-blue-700 bg-blue-100'
};
