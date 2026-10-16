'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { CurrencyAPI } from '@/service/request';
import { MESSAGES } from '../constants';
import type { Currency, CurrencyFormData, CurrencySyncStatus, CurrencyUpdateData } from '../types';

export function useCurrencyManagement() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<CurrencySyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [compose, setCompose] = useState<{ open: boolean; mode: 'create' | 'edit'; editing: Currency | null }>({
    open: false,
    mode: 'create',
    editing: null,
  });

  const fetchCurrencies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await CurrencyAPI.getList();
      if (res.success && res.data) {
        setCurrencies(res.data.items);
      } else {
        toast.error(MESSAGES.ERROR.FETCH);
      }
    } catch {
      toast.error(MESSAGES.ERROR.FETCH);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSyncStatus = useCallback(async () => {
    try {
      const res = await CurrencyAPI.getSyncStatus();
      if (res.success && res.data) {
        setSyncStatus(res.data);
      }
    } catch {
      // 状态条是辅助信息，失败不打扰用户
    }
  }, []);

  useEffect(() => {
    fetchSyncStatus();
  }, [fetchSyncStatus]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  // OKX 候选同步：后台 pass 通常 1-3s（单次目录拉取+入库），延迟后轮询状态+刷新列表
  const triggerSync = useCallback(async (): Promise<boolean> => {
    setSyncing(true);
    try {
      const res = await CurrencyAPI.triggerSync();
      if (res.success) {
        toast.success('已触发同步，几秒后自动刷新');
        if (pollRef.current) clearTimeout(pollRef.current);
        pollRef.current = setTimeout(() => {
          fetchSyncStatus();
          fetchCurrencies();
          setSyncing(false);
        }, 4000);
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
  }, [fetchCurrencies, fetchSyncStatus]);

  const createCurrency = useCallback(async (data: CurrencyFormData): Promise<boolean> => {
    const res = await CurrencyAPI.create(data);
    if (res.success) {
      toast.success(MESSAGES.SUCCESS.CREATE);
      return true;
    }
    toast.error(res.message || MESSAGES.ERROR.CREATE);
    return false;
  }, []);

  const updateCurrency = useCallback(async (id: number, data: CurrencyUpdateData): Promise<boolean> => {
    const res = await CurrencyAPI.update(id, data);
    if (res.success) {
      toast.success(MESSAGES.SUCCESS.UPDATE);
      return true;
    }
    toast.error(res.message || MESSAGES.ERROR.UPDATE);
    return false;
  }, []);

  const deleteCurrency = useCallback(async (id: number): Promise<boolean> => {
    const res = await CurrencyAPI.remove(id);
    if (res.success) {
      toast.success(MESSAGES.SUCCESS.DELETE);
      return true;
    }
    toast.error(res.message || MESSAGES.ERROR.DELETE);
    return false;
  }, []);

  const toggleCurrency = useCallback(async (id: number, is_tradeable: boolean): Promise<boolean> => {
    const res = await CurrencyAPI.toggle(id, is_tradeable);
    if (res.success) {
      toast.success(is_tradeable ? MESSAGES.SUCCESS.TOGGLE_ON : MESSAGES.SUCCESS.TOGGLE_OFF);
      return true;
    }
    toast.error(res.message || MESSAGES.ERROR.TOGGLE);
    return false;
  }, []);

  const openCreate = useCallback(() => setCompose({ open: true, mode: 'create', editing: null }), []);
  const openEdit = useCallback((c: Currency) => setCompose({ open: true, mode: 'edit', editing: c }), []);
  const closeCompose = useCallback(() => setCompose({ open: false, mode: 'create', editing: null }), []);

  return {
    currencies,
    loading,
    fetchCurrencies,
    syncStatus,
    syncing,
    triggerSync,
    fetchSyncStatus,
    createCurrency,
    updateCurrency,
    deleteCurrency,
    toggleCurrency,
    compose,
    openCreate,
    openEdit,
    closeCompose,
  };
}
