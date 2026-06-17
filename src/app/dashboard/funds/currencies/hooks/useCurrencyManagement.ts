'use client';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { CurrencyAPI } from '@/service/request';
import { MESSAGES } from '../constants';
import type { Currency, CurrencyFormData, CurrencyUpdateData } from '../types';

export function useCurrencyManagement() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(false);
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
