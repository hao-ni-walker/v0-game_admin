'use client';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { FeeAPI } from '@/service/request';
import { MESSAGES } from '../constants';
import type { FeeConfig, FeeCreateData, FeeUpdateData, FeeType, FeeScope, FeePreviewResult } from '../types';

export function useFeeManagement() {
  const [fees, setFees] = useState<FeeConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [compose, setCompose] = useState<{ open: boolean; mode: 'create' | 'edit'; editing: FeeConfig | null }>({
    open: false, mode: 'create', editing: null,
  });
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchFees = useCallback(async (scope?: FeeScope) => {
    setLoading(true);
    try {
      const res = await FeeAPI.getList(scope ? { scope_type: scope } : {});
      if (res.success && res.data) setFees(res.data.items);
      else toast.error(MESSAGES.ERROR.FETCH);
    } catch {
      toast.error(MESSAGES.ERROR.FETCH);
    } finally {
      setLoading(false);
    }
  }, []);

  const createFee = useCallback(async (data: FeeCreateData): Promise<boolean> => {
    const res = await FeeAPI.create(data);
    if (res.success) { toast.success(MESSAGES.SUCCESS.CREATE); return true; }
    toast.error(res.message || MESSAGES.ERROR.CREATE); return false;
  }, []);

  const updateFee = useCallback(async (id: number, data: FeeUpdateData): Promise<boolean> => {
    const res = await FeeAPI.update(id, data);
    if (res.success) { toast.success(MESSAGES.SUCCESS.UPDATE); return true; }
    toast.error(res.message || MESSAGES.ERROR.UPDATE); return false;
  }, []);

  const deleteFee = useCallback(async (id: number): Promise<boolean> => {
    const res = await FeeAPI.remove(id);
    if (res.success) { toast.success(MESSAGES.SUCCESS.DELETE); return true; }
    toast.error(res.message || MESSAGES.ERROR.DELETE); return false;
  }, []);

  const preview = useCallback(async (params: { fee_type: FeeType; currency_id?: number; user_id?: number; amount: number }): Promise<FeePreviewResult | null> => {
    const res = await FeeAPI.preview(params);
    if (res.success && res.data) return res.data;
    toast.error(res.message || MESSAGES.ERROR.PREVIEW);
    return null;
  }, []);

  const openCreate = useCallback(() => setCompose({ open: true, mode: 'create', editing: null }), []);
  const openEdit = useCallback((f: FeeConfig) => setCompose({ open: true, mode: 'edit', editing: f }), []);
  const closeCompose = useCallback(() => setCompose({ open: false, mode: 'create', editing: null }), []);
  const openPreview = useCallback(() => setPreviewOpen(true), []);
  const closePreview = useCallback(() => setPreviewOpen(false), []);

  return {
    fees, loading, fetchFees,
    createFee, updateFee, deleteFee, preview,
    compose, openCreate, openEdit, closeCompose,
    previewOpen, openPreview, closePreview,
  };
}
