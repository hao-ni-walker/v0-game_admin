'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SettlementAPI, type SettlementRecord } from '@/service/request';

export function useSettlementRecords() {
  const [records, setRecords] = useState<SettlementRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [period, setPeriod] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const pageSize = 20;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SettlementAPI.getRecords({
        page,
        size: pageSize,
        period: period || undefined,
        result: result || undefined,
      });
      if (res.success && res.data) {
        setRecords(res.data.items);
        setTotal(res.data.pagination.total);
      } else {
        toast.error(res.message || '获取开奖记录失败');
      }
    } catch {
      toast.error('获取开奖记录失败');
    } finally {
      setLoading(false);
    }
  }, [page, period, result]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    records,
    loading,
    page,
    pageSize,
    total,
    period,
    setPeriod: (v: string) => { setPeriod(v); setPage(1); },
    result,
    setResult: (v: string) => { setResult(v); setPage(1); },
    setPage,
    refresh,
  };
}
