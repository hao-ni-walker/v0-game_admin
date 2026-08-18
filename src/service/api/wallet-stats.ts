import { apiRequest } from './base';

// ========== 钱包余额统计(平台充值地址链上余额) ==========

export interface ScanStatus {
  running: boolean;
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
  scan_status: { running: boolean; scanned?: number; total?: number; started_at?: number };
}

interface RefreshRaw {
  started: boolean;
  scan_status: { running: boolean; scanned?: number; total?: number; started_at?: number };
}

function mapScanStatus(s: RefreshRaw['scan_status']): ScanStatus {
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
  getOverview: async (page = 1, size = 20): Promise<{ success: boolean; data?: WalletStatsSnapshot; message?: string }> => {
    const res = await apiRequest<SnapshotRaw>(`/admin/wallet-stats?page=${page}&size=${size}`);
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
};
