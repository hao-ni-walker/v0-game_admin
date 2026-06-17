'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { BroadcastAPI } from '@/service/request';
import type { BroadcastFormData } from '@/service/request';
import { DEFAULT_PAGINATION, MESSAGES } from '../constants';
import type {
  Broadcast,
  BroadcastFilters,
  BroadcastListResult,
} from '../types';

export function useBroadcastManagement() {
  const [items, setItems] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: DEFAULT_PAGINATION.page,
    size: DEFAULT_PAGINATION.page_size,
    total: 0,
    has_more: false,
  });
  const [composeOpen, setComposeOpen] = useState(false);

  const fetchList = useCallback(
    async (filters: BroadcastFilters) => {
      setLoading(true);
      try {
        const res = await BroadcastAPI.getList({
          page: filters.page,
          page_size: filters.page_size,
          status: filters.status || undefined,
        });
        if (res.success && res.data) {
          const data = res.data as BroadcastListResult;
          setItems(data.list);
          setPagination(data.pagination);
        } else {
          toast.error(MESSAGES.ERROR.FETCH);
        }
      } catch {
        toast.error(MESSAGES.ERROR.FETCH);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const create = useCallback(
    async (data: BroadcastFormData): Promise<boolean> => {
      const res = await BroadcastAPI.create(data);
      if (res.success && res.data) {
        const estimated = (res.data as { estimated_target_count?: number })
          .estimated_target_count;
        toast.success(
          `${MESSAGES.SUCCESS.CREATE}${
            typeof estimated === 'number' ? `（预估 ${estimated} 人）` : ''
          }`
        );
        return true;
      }
      toast.error(res.message || MESSAGES.ERROR.CREATE);
      return false;
    },
    []
  );

  const approve = useCallback(
    async (id: string): Promise<boolean> => {
      const res = await BroadcastAPI.approve(id);
      if (res.success) {
        toast.success(MESSAGES.SUCCESS.APPROVE);
        return true;
      }
      toast.error(res.message || MESSAGES.ERROR.APPROVE);
      return false;
    },
    []
  );

  const reject = useCallback(
    async (id: string): Promise<boolean> => {
      const res = await BroadcastAPI.reject(id);
      if (res.success) {
        toast.success(MESSAGES.SUCCESS.REJECT);
        return true;
      }
      toast.error(res.message || MESSAGES.ERROR.REJECT);
      return false;
    },
    []
  );

  const openCompose = useCallback(() => setComposeOpen(true), []);
  const closeCompose = useCallback(() => setComposeOpen(false), []);

  return {
    items,
    loading,
    pagination,
    composeOpen,
    openCompose,
    closeCompose,
    fetchList,
    create,
    approve,
    reject,
  };
}
