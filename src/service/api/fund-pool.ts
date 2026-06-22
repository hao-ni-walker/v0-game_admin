import { apiRequest, buildSearchParams } from './base';

// ========== PRD §6.1 资金池 ==========
export interface FundPoolStatus {
  balance: number; // 资金池余额
  level: 'healthy' | 'warning' | 'danger' | 'stop'; // PRD §6.2 安全线级别
  totalDeposits: number; // 用户充值总额
  totalWithdrawals: number; // 用户提现总额
  totalPayouts: number; // 平台已赔付总额
  totalIncome: number; // 平台累计收入
  maxPayoutPressure: number; // 最大赔付压力
  safetyRatio: number; // 安全系数 = maxPayoutPressure / balance
  frozenBalance: number; // 冻结余额
  availableBalance: number; // 可用余额
  updatedAt: number; // 数据更新时间（unix seconds）
}

interface PoolOverviewRaw {
  total_balance: number;
  frozen_balance: number;
  available_balance: number;
  pool_level: 'healthy' | 'warning' | 'danger' | 'stop';
  max_payout_pressure: number;
  safety_ratio: number;
  composition: {
    user_deposits_total: number;
    user_withdrawals_total: number;
    total_payouts: number;
    total_income: number;
  };
  updated_at: number;
}

// ========== PRD §6.2 安全线配置 ==========
export interface SafetyLineConfig {
  healthyThreshold: number; // 默认 $50,000
  warningThreshold: number; // 默认 $20,000
  dangerThreshold: number; // 默认 $10,000
  safetyFactor: number; // 默认 80%
}

// ========== PRD §6.4 资金流水 ==========
export interface FundFlowRecord {
  id: string;
  type: 'deposit' | 'withdrawal' | 'payout' | 'income';
  amount: number;
  userId?: string;
  description: string;
  timestamp: string;
}

export interface FundFlowSummary {
  period: string;
  deposits: number;
  withdrawals: number;
  payouts: number;
  income: number;
  netFlow: number;
}

// ========== 资金池 API ==========
export const FundPoolAPI = {
  // 资金池状态（从后端 /pool/overview 拉取并映射字段）
  getStatus: async (): Promise<{
    success: boolean;
    data?: FundPoolStatus;
    message?: string;
    code?: number;
  }> => {
    const res = await apiRequest<PoolOverviewRaw>('/admin/pool/overview');
    if (!res.success || !res.data) {
      return { success: false, message: res.message || '获取资金池数据失败', code: res.code };
    }
    const r = res.data;
    return {
      success: true,
      data: {
        balance: r.total_balance,
        frozenBalance: r.frozen_balance,
        availableBalance: r.available_balance,
        level: r.pool_level,
        maxPayoutPressure: r.max_payout_pressure,
        safetyRatio: r.safety_ratio,
        totalDeposits: r.composition?.user_deposits_total ?? 0,
        totalWithdrawals: r.composition?.user_withdrawals_total ?? 0,
        totalPayouts: r.composition?.total_payouts ?? 0,
        totalIncome: r.composition?.total_income ?? 0,
        updatedAt: r.updated_at,
      },
    };
  },

  // 安全线配置
  getSafetyConfig: () =>
    apiRequest<SafetyLineConfig>('/admin/fund-pool/safety-config'),

  updateSafetyConfig: (config: Partial<SafetyLineConfig>) =>
    apiRequest<void>('/admin/fund-pool/safety-config', {
      method: 'PUT',
      body: JSON.stringify(config)
    }),

  // 资金流水
  getFlows: (params: { page?: number; limit?: number; type?: string; startDate?: string; endDate?: string }) =>
    apiRequest<{ list: FundFlowRecord[] }>('/admin/fund-pool/flows?' + buildSearchParams(params)),

  getFlowSummary: (params: { period: 'day' | 'week' | 'month'; startDate?: string; endDate?: string }) =>
    apiRequest<FundFlowSummary[]>('/admin/fund-pool/flows/summary?' + buildSearchParams(params)),

  // 大额标记
  getLargeTransactions: (params: { page?: number; limit?: number; threshold?: number }) =>
    apiRequest<{ list: FundFlowRecord[] }>('/admin/fund-pool/large-transactions?' + buildSearchParams(params))
};
