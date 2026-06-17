'use client';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CurrencyAPI, OddsAPI } from '@/service/request';
import { MESSAGES } from '../constants';
import type { Currency, OddsConfig, ResolvedPeriod, OddsUpsertData } from '../types';

export function useOddsManagement() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [activeCurrency, setActiveCurrency] = useState<Currency | null>(null);
  const [resolved, setResolved] = useState<ResolvedPeriod[]>([]);
  const [configs, setConfigs] = useState<OddsConfig[]>([]);
  const [loading, setLoading] = useState(false);

  const [baseEdit, setBaseEdit] = useState<{ open: boolean; period: string | null }>({ open: false, period: null });
  const [windowCompose, setWindowCompose] = useState<{ open: boolean }>({ open: false });

  // load currencies once (for tabs); default to first currency
  useEffect(() => {
    (async () => {
      try {
        const res = await CurrencyAPI.getList();
        if (res.success && res.data && res.data.items.length > 0) {
          setCurrencies(res.data.items);
          setActiveCurrency(res.data.items[0]);
        }
      } catch {
        toast.error(MESSAGES.ERROR.FETCH);
      }
    })();
  }, []);

  // load resolved + configs whenever the active currency changes
  useEffect(() => {
    if (!activeCurrency) return;
    (async () => {
      setLoading(true);
      try {
        const [resRes, cfgRes] = await Promise.all([
          OddsAPI.getResolved(activeCurrency.symbol),
          OddsAPI.getList({ currency_id: activeCurrency.id }),
        ]);
        if (resRes.success && resRes.data) setResolved(resRes.data.odds);
        if (cfgRes.success && cfgRes.data) setConfigs(cfgRes.data.items);
      } catch {
        toast.error(MESSAGES.ERROR.FETCH);
      } finally {
        setLoading(false);
      }
    })();
  }, [activeCurrency]);

  const refresh = useCallback(async () => {
    if (!activeCurrency) return;
    const [resRes, cfgRes] = await Promise.all([
      OddsAPI.getResolved(activeCurrency.symbol),
      OddsAPI.getList({ currency_id: activeCurrency.id }),
    ]);
    if (resRes.success && resRes.data) setResolved(resRes.data.odds);
    if (cfgRes.success && cfgRes.data) setConfigs(cfgRes.data.items);
  }, [activeCurrency]);

  const updateBase = useCallback(
    async (period: string, payout_percent: number): Promise<boolean> => {
      if (!activeCurrency) return false;
      const res = await OddsAPI.upsert({
        currency_id: activeCurrency.id,
        period,
        payout_percent,
        is_base: true,
      });
      if (res.success) {
        toast.success(MESSAGES.SUCCESS.BASE_UPDATE);
        await refresh();
        return true;
      }
      toast.error(res.message || MESSAGES.ERROR.BASE_UPDATE);
      return false;
    },
    [activeCurrency, refresh]
  );

  const createWindow = useCallback(
    async (data: Omit<OddsUpsertData, 'currency_id' | 'is_base'>): Promise<boolean> => {
      if (!activeCurrency) return false;
      const res = await OddsAPI.upsert({ ...data, currency_id: activeCurrency.id, is_base: false });
      if (res.success) {
        toast.success(MESSAGES.SUCCESS.WINDOW_CREATE);
        await refresh();
        return true;
      }
      toast.error(res.message || MESSAGES.ERROR.WINDOW_CREATE);
      return false;
    },
    [activeCurrency, refresh]
  );

  const deleteConfig = useCallback(
    async (id: number): Promise<boolean> => {
      const res = await OddsAPI.remove(id);
      if (res.success) {
        toast.success(MESSAGES.SUCCESS.WINDOW_DELETE);
        await refresh();
        return true;
      }
      toast.error(res.message || MESSAGES.ERROR.WINDOW_DELETE);
      return false;
    },
    [refresh]
  );

  const openBaseEdit = useCallback((period: string) => setBaseEdit({ open: true, period }), []);
  const closeBaseEdit = useCallback(() => setBaseEdit({ open: false, period: null }), []);
  const openWindowCompose = useCallback(() => setWindowCompose({ open: true }), []);
  const closeWindowCompose = useCallback(() => setWindowCompose({ open: false }), []);

  return {
    currencies,
    activeCurrency,
    setActiveCurrency,
    resolved,
    configs,
    loading,
    refresh,
    updateBase,
    createWindow,
    deleteConfig,
    baseEdit,
    openBaseEdit,
    closeBaseEdit,
    windowCompose,
    openWindowCompose,
    closeWindowCompose,
  };
}
