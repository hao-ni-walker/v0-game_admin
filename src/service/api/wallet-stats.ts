import { apiRequest } from './base';

// ========== 钱包余额统计(平台充值地址链上余额) ==========

export interface ScanStatus {
  running: boolean;
  /** Terminal job state from the backend; absent = idle (no scan ran). */
  status?: 'running' | 'completed' | 'failed';
  scanned?: number;
  total?: number;
  startedAt?: number;
}

export interface WalletChainAsset {
  symbol: string;
  balance: number;
  usdValue: number | null;
}

export interface WalletChainSummary {
  chainCode: string;
  assets: WalletChainAsset[];
  usdValue: number;
}

export interface WalletBalanceItem {
  address: string;
  chain: string;
  userId: number;
  balances: Record<string, number>;
  usdValue: number;
  usdIncomplete: boolean;
}

export interface WalletStatsSnapshot {
  scannedAt: number | null;
  addressCount: number;
  itemCount: number;
  errorCount: number;
  rates: Record<string, number | null>;
  chains: WalletChainSummary[];
  totalUsd: number;
  items: WalletBalanceItem[];
  pagination: { page: number; size: number; total: number };
  scanStatus: ScanStatus;
}

interface SnapshotRaw {
  scanned_at: number | null;
  address_count: number;
  item_count: number;
  error_count: number;
  rates: Record<string, number | null>;
  chains: { chain_code: string; usd_value: number; assets: { symbol: string; balance: number; usd_value: number | null }[] }[];
  total_usd: number;
  items: { address: string; chain: string; user_id: number; balances: Record<string, number>; usd_value: number; usd_incomplete: boolean }[];
  pagination: { page: number; size: number; total: number };
  scan_status?: RefreshRaw['scan_status'];
}

interface RefreshRaw {
  started: boolean;
  scan_status: {
    running: boolean;
    status?: string;
    scanned?: number;
    total?: number;
    started_at?: number;
  };
}

function mapScanStatus(s?: RefreshRaw['scan_status']): ScanStatus {
  return { running: s?.running ?? false, scanned: s?.scanned, total: s?.total, startedAt: s?.started_at };
}

function mapSnapshot(r: SnapshotRaw): WalletStatsSnapshot {
  return {
    scannedAt: r.scanned_at,
    addressCount: r.address_count,
    itemCount: r.item_count,
    errorCount: r.error_count,
    rates: r.rates ?? {},
    chains: (r.chains ?? []).map((c) => ({
      chainCode: c.chain_code,
      usdValue: c.usd_value,
      assets: (c.assets ?? []).map((a) => ({
        symbol: a.symbol,
        balance: a.balance,
        usdValue: a.usd_value,
      })),
    })),
    totalUsd: r.total_usd,
    items: (r.items ?? []).map((i) => ({
      address: i.address,
      chain: i.chain,
      userId: i.user_id,
      balances: i.balances ?? {},
      usdValue: i.usd_value,
      usdIncomplete: i.usd_incomplete,
    })),
    pagination: r.pagination,
    scanStatus: mapScanStatus(r.scan_status),
  };
}

export const WalletStatsAPI = {
  getOverview: async (
    page = 1,
    size = 20,
    minUsd?: number
  ): Promise<{ success: boolean; data?: WalletStatsSnapshot; message?: string }> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (minUsd && minUsd > 0) params.set('min_usd', String(minUsd));
    const res = await apiRequest<SnapshotRaw>(`/admin/wallet-stats?${params.toString()}`);
    if (!res.success || !res.data) {
      return { success: false, message: res.message || '获取钱包余额数据失败' };
    }
    return { success: true, data: mapSnapshot(res.data) };
  },

  // 触发后台扫描,立即返回;进度通过轮询 getOverview 获取
  refresh: async (): Promise<{ success: boolean; data?: { started: boolean; scanStatus: ScanStatus }; message?: string }> => {
    const res = await apiRequest<RefreshRaw>('/admin/wallet-stats', { method: 'POST' });
    if (!res.success || !res.data) {
      return { success: false, message: res.message || '启动扫描失败' };
    }
    return { success: true, data: { started: res.data.started, scanStatus: mapScanStatus(res.data.scan_status) } };
  },

  // 手动归集:实时估算成本(点击「归集」时调用,展示确认弹窗)
  estimateSweep: async (
    targets: { chain: string; address: string }[]
  ): Promise<{ success: boolean; data?: SweepEstimateData; message?: string }> => {
    const res = await apiRequest<SweepEstimateRaw>('/admin/wallet-stats/sweep/estimate', {
      method: 'POST',
      body: JSON.stringify({ targets }),
    });
    if (!res.success || !res.data) {
      return { success: false, message: res.message || '估算归集成本失败' };
    }
    return {
      success: true,
      data: {
        rates: res.data.rates ?? {},
        estimates: (res.data.estimates ?? []).map(mapEstimate),
      },
    };
  },

  // 启动手动归集后台任务(需要 fund:write;后端审计 reason)
  executeSweep: async (
    targets: { chain: string; address: string }[],
    reason: string
  ): Promise<{ success: boolean; data?: { started: boolean; job: SweepJobData }; message?: string }> => {
    const res = await apiRequest<{ started: boolean; job: SweepJobRaw }>('/admin/wallet-stats/sweep', {
      method: 'POST',
      body: JSON.stringify({ targets, reason }),
    });
    if (!res.success || !res.data) {
      return { success: false, message: res.message || '启动归集失败' };
    }
    return { success: true, data: { started: res.data.started, job: mapJob(res.data.job) } };
  },

  // 手动归集任务进度(轮询)
  sweepStatus: async (): Promise<{ success: boolean; data?: SweepJobData; message?: string }> => {
    const res = await apiRequest<SweepJobRaw>('/admin/wallet-stats/sweep/status');
    if (!res.success || !res.data) {
      return { success: false, message: res.message || '获取归集进度失败' };
    }
    return { success: true, data: mapJob(res.data) };
  },

  // 归集配置(deposit_config 透传)
  getDepositConfig: async (): Promise<{ success: boolean; data?: DepositSweepConfig; message?: string }> => {
    const res = await apiRequest<DepositConfigRaw>('/admin/deposit-config');
    if (!res.success || !res.data) {
      return { success: false, message: res.message || '获取归集配置失败' };
    }
    return {
      success: true,
      data: {
        sweepEnabled: res.data.sweep_enabled ?? {},
        sweepMinGainUsd: res.data.sweep_min_gain_usd ?? {},
      },
    };
  },

  updateDepositConfig: async (
    payload: { sweep_enabled?: Record<string, boolean>; sweep_min_gain_usd?: Record<string, number> },
    reason: string
  ): Promise<{ success: boolean; data?: DepositSweepConfig; message?: string }> => {
    const res = await apiRequest<DepositConfigRaw>('/admin/deposit-config', {
      method: 'PUT',
      body: JSON.stringify({ ...payload, reason }),
    });
    if (!res.success || !res.data) {
      return { success: false, message: res.message || '保存归集配置失败' };
    }
    return {
      success: true,
      data: {
        sweepEnabled: res.data.sweep_enabled ?? {},
        sweepMinGainUsd: res.data.sweep_min_gain_usd ?? {},
      },
    };
  },
};

// ── 手动归集相关类型 ──

export interface SweepEstimateItem {
  chain: string;
  address: string;
  userId: number | null;
  balances: Record<string, number>;
  valueUsd: number;
  txCount: number;
  needTopupNative: number | null;
  topupSymbol: string;
  costNative: number;
  costSymbol: string;
  costUsd: number;
  warnings: string[];
  error?: string;
}

export interface SweepEstimateData {
  rates: Record<string, number | null>;
  estimates: SweepEstimateItem[];
}

export interface SweepJobResult {
  chain: string;
  address: string;
  userId?: number;
  status: string;
  detail?: string;
}

export interface SweepJobData {
  status: 'idle' | 'running' | 'completed' | 'failed';
  scanned: number;
  total: number;
  startedAt?: number;
  admin?: string;
  results: SweepJobResult[];
}

export interface DepositSweepConfig {
  sweepEnabled: Record<string, boolean>;
  sweepMinGainUsd: Record<string, number>;
}

interface SweepEstimateRaw {
  rates: Record<string, number | null>;
  estimates: {
    chain: string;
    address: string;
    user_id: number | null;
    balances: Record<string, number>;
    value_usd: number;
    tx_count: number;
    need_topup_native: number | null;
    topup_symbol: string;
    cost_native: number;
    cost_symbol: string;
    cost_usd: number;
    warnings: string[];
    error?: string;
  }[];
}

interface SweepJobRaw {
  status: string;
  scanned: number;
  total: number;
  started_at?: number;
  admin?: string;
  results?: { chain: string; address: string; user_id?: number; status: string; detail?: string }[];
}

interface DepositConfigRaw {
  sweep_enabled?: Record<string, boolean>;
  sweep_min_gain_usd?: Record<string, number>;
}

function mapEstimate(e: SweepEstimateRaw['estimates'][number]): SweepEstimateItem {
  return {
    chain: e.chain,
    address: e.address,
    userId: e.user_id,
    balances: e.balances ?? {},
    valueUsd: e.value_usd,
    txCount: e.tx_count,
    needTopupNative: e.need_topup_native,
    topupSymbol: e.topup_symbol,
    costNative: e.cost_native,
    costSymbol: e.cost_symbol,
    costUsd: e.cost_usd,
    warnings: e.warnings ?? [],
    error: e.error,
  };
}

function mapJob(j: SweepJobRaw): SweepJobData {
  return {
    status: (j.status as SweepJobData['status']) ?? 'idle',
    scanned: j.scanned ?? 0,
    total: j.total ?? 0,
    startedAt: j.started_at,
    admin: j.admin,
    results: (j.results ?? []).map((r) => ({
      chain: r.chain,
      address: r.address,
      userId: r.user_id,
      status: r.status,
      detail: r.detail,
    })),
  };
}
