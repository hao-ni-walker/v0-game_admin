'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { PredictionMarketAPI } from '@/service/request';
import type { PredictionMarket, PredictionSyncStatus, PredictionMarketUpdateData } from '@/service/request';
import { mapWithConcurrency } from '@/lib/batch';
import { isMarketEnded } from './utils';

/** live=进行中（隐藏已结束未上架的行）；settled=已结算（已上架且已结束）。 */
export type MarketTab = 'live' | 'settled';

export interface BatchItemFailure {
  id: number;
  message: string;
}

export interface BatchOutcome {
  ok: number;
  failures: BatchItemFailure[];
}

/** 单条请求 → 统一失败描述（后端拒绝原因在 message，透传给操作者）。 */
function failureOf(id: number, res: { success: boolean; message?: string } | null): BatchItemFailure {
  return { id, message: res?.message || '请求失败，请重试' };
}

export interface PredictionFilters {
  q: string;
  tab: MarketTab;
  is_listed: 'all' | 'true' | 'false';
  page: number;
  pageSize: number;
}

const DEFAULT_FILTERS: PredictionFilters = {
  q: '',
  tab: 'live',
  is_listed: 'all',
  page: 1,
  pageSize: 20,
};

/**
 * 后端只支持 is_listed/closed 查询参数，且 closed 在线上恒为 false（Gamma
 * 同步不回写），「已结束」只能由 end_date 在客户端判定：
 * - live：服务端分页后滤掉已结束行（页内行数可能少于 pageSize，总量含隐藏行，可接受）；
 * - settled：已上架集合是运营人工挑选的（量级几十），一次拉满 100 条后
 *   过滤出已结束行，不走服务端分页。
 */
export function usePredictionMarkets() {
  const [filters, setFilters] = useState<PredictionFilters>(DEFAULT_FILTERS);
  // 已提交的筛选（搜索框回车/点查询才生效，避免每个字符打一次后端）
  const [applied, setApplied] = useState<PredictionFilters>(DEFAULT_FILTERS);
  const [markets, setMarkets] = useState<PredictionMarket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<PredictionSyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMarkets = useCallback(async (f: PredictionFilters) => {
    setLoading(true);
    try {
      const settled = f.tab === 'settled';
      const res = await PredictionMarketAPI.getList({
        q: f.q || undefined,
        is_listed: settled
          ? true
          : f.is_listed === 'all'
            ? undefined
            : f.is_listed === 'true',
        page: settled ? 1 : f.page,
        page_size: settled ? 100 : f.pageSize,
      });
      if (res.success && res.data) {
        const items = res.data.items || [];
        const visible = settled ? items.filter(isMarketEnded) : items.filter((m) => !isMarketEnded(m));
        setMarkets(visible);
        setTotal(settled ? visible.length : Number(res.data.total || 0));
      } else {
        toast.error(res.message || '获取预测市场列表失败');
      }
    } catch {
      toast.error('获取预测市场列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSyncStatus = useCallback(async () => {
    try {
      const res = await PredictionMarketAPI.getSyncStatus();
      if (res.success && res.data) {
        setSyncStatus(res.data);
      }
    } catch {
      // 状态条是辅助信息，失败不打扰用户
    }
  }, []);

  useEffect(() => {
    fetchMarkets(applied);
  }, [applied, fetchMarkets]);

  useEffect(() => {
    fetchSyncStatus();
  }, [fetchSyncStatus]);

  // 卸载时清理轮询
  useEffect(() => {
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  const search = useCallback((patch: Partial<PredictionFilters>) => {
    setFilters(patch.page || patch.pageSize ? { ...filters, ...patch } : { ...filters, ...patch, page: 1 });
    setApplied((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));
  }, [filters]);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setApplied(DEFAULT_FILTERS);
  }, []);

  const refresh = useCallback(() => {
    fetchMarkets(applied);
    fetchSyncStatus();
  }, [applied, fetchMarkets, fetchSyncStatus]);

  const triggerSync = useCallback(async (): Promise<boolean> => {
    setSyncing(true);
    try {
      const res = await PredictionMarketAPI.triggerSync();
      if (res.success) {
        toast.success('已触发同步，几秒后自动刷新');
        // 后台 pass 通常 5-15s（2000 市场分页拉取），延迟后轮询状态 + 刷新列表
        if (pollRef.current) clearTimeout(pollRef.current);
        pollRef.current = setTimeout(() => {
          fetchSyncStatus();
          fetchMarkets(applied);
          setSyncing(false);
        }, 8000);
        return true;
      }
      toast.error(res.message || '触发同步失败');
      setSyncing(false);
      return false;
    } catch {
      toast.error('触发同步失败');
      setSyncing(false);
      return false;
    }
  }, [applied, fetchMarkets, fetchSyncStatus]);

  const updateConfig = useCallback(
    async (id: number, body: PredictionMarketUpdateData): Promise<boolean> => {
      const res = await PredictionMarketAPI.update(id, body);
      if (res.success) {
        toast.success('上架配置已保存');
        fetchMarkets(applied);
        return true;
      }
      toast.error(res.message || '保存失败');
      return false;
    },
    [applied, fetchMarkets]
  );

  const toggleListed = useCallback(
    async (id: number, is_listed: boolean): Promise<boolean> => {
      const res = await PredictionMarketAPI.toggle(id, is_listed);
      if (res.success) {
        toast.success(is_listed ? '已上架' : '已下架');
        fetchMarkets(applied);
        return true;
      }
      // 后端把上架阻碍原因放在 message（如“暂不可上架：非二元市场…”），原样透出
      toast.error(res.message || '操作失败');
      return false;
    },
    [applied, fetchMarkets]
  );

  /**
   * 批量动作基座：对选中市场逐条调既有单条端点，5 并发（对齐赔率页批量
   * 的既有实践），逐条捕获失败不中断整批；结束后统一刷新列表。
   */
  const runBatch = useCallback(
    async (
      ids: number[],
      worker: (id: number) => Promise<{ success: boolean; message?: string }>
    ): Promise<BatchOutcome> => {
      const results = await mapWithConcurrency(ids, 5, worker);
      let ok = 0;
      const failures: BatchItemFailure[] = [];
      results.forEach((r, i) => {
        if (r.ok && r.value.success) ok += 1;
        else if (r.ok) failures.push(failureOf(ids[i], r.value));
        else failures.push(failureOf(ids[i], null));
      });
      fetchMarkets(applied);
      return { ok, failures };
    },
    [applied, fetchMarkets]
  );

  const batchToggle = useCallback(
    (ids: number[], is_listed: boolean) =>
      runBatch(ids, (id) => PredictionMarketAPI.toggle(id, is_listed)),
    [runBatch]
  );

  const batchUpdate = useCallback(
    (ids: number[], body: PredictionMarketUpdateData) =>
      runBatch(ids, (id) => PredictionMarketAPI.update(id, body)),
    [runBatch]
  );

  return {
    filters,
    applied,
    markets,
    total,
    loading,
    syncStatus,
    syncing,
    search,
    clearFilters,
    refresh,
    triggerSync,
    updateConfig,
    toggleListed,
    batchToggle,
    batchUpdate,
  };
}
