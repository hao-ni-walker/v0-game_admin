import type { FeeType, FeeScope } from './types';

export const FEE_TYPE_OPTIONS: { label: string; value: FeeType }[] = [
  { label: '提现', value: 'withdraw' },
  { label: '充值', value: 'deposit' },
  { label: '交易', value: 'trade' },
];

export const SCOPE_OPTIONS: { label: string; value: FeeScope }[] = [
  { label: '平台', value: 'platform' },
  { label: '币种', value: 'currency' },
  { label: '用户', value: 'user' },
];

export const FEE_TYPE_LABELS: Record<FeeType, string> = { withdraw: '提现', deposit: '充值', trade: '交易' };
export const SCOPE_LABELS: Record<FeeScope, string> = { platform: '平台', currency: '币种', user: '用户' };

export const MESSAGES = {
  SUCCESS: {
    CREATE: '费率配置已创建',
    UPDATE: '费率配置已更新',
    DELETE: '费率配置已删除',
  },
  ERROR: {
    FETCH: '获取费率配置失败',
    CREATE: '创建费率配置失败',
    UPDATE: '更新费率配置失败',
    DELETE: '删除费率配置失败',
    PREVIEW: '费率预览失败',
  },
  EMPTY: '暂无费率配置，点击右上角「新增费率」',
};

export const TABLE_COLUMNS = [
  { key: 'fee_type', title: '类型' },
  { key: 'scope_type', title: '作用域' },
  { key: 'target', title: '目标' },
  { key: 'fee_rate', title: '费率' },
  { key: 'min_fee', title: '最低' },
  { key: 'gas', title: '矿工费' },
  { key: 'priority', title: '优先级' },
  { key: 'window', title: '生效区间' },
  { key: 'is_active', title: '状态' },
  { key: 'actions', title: '操作' },
];
