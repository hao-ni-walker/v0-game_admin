'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { PredictionMarketAPI } from '@/service/request';
import type { PredictionMarket, PredictionSyncStatus, PredictionMarketUpdateData } from '@/service/request';

export interface PredictionFilters {
  q: string;
  is_listed: 'all' | 'true' | 'false';
  closed: 'all' | 'true' | 'false';
  page: number;
  pageSize: number;
}

const DEFAULT_FILTERS: PredictionFilters = {
  q: '',
  is_listed: 'all',
  closed: 'all',
  page: 1,
  pageSize: 20,
};

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
      const res = await PredictionMarketAPI.getList({
        q: f.q || undefined,
        is_listed: f.is_listed === 'all' ? undefined : f.is_listed === 'true',
        closed: f.closed === 'all' ? undefined : f.closed === 'true',
        page: f.page,
        page_size: f.pageSize,
      });
      if (res.success && res.data) {
        setMarkets(res.data.items || []);
        setTotal(Number(res.data.total || 0));
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
  };
}
