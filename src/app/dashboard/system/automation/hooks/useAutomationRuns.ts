'use client';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { AutomationAPI } from '@/service/request';
import { MESSAGES } from '../constants';
import type { AutomationTaskRun, RunsFilterState } from '../types';

const PAGE_SIZE = 10;

export function useAutomationRuns() {
  const [runs, setRuns] = useState<AutomationTaskRun[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<RunsFilterState>({ task_id: 'all', status: 'all' });
  const [loading, setLoading] = useState(false);

  const fetchRuns = useCallback(
    async (targetPage = page, targetFilters = filters) => {
      setLoading(true);
      try {
        const res = await AutomationAPI.getRuns({
          page: targetPage,
          page_size: PAGE_SIZE,
          ...(targetFilters.task_id !== 'all' ? { task_id: targetFilters.task_id } : {}),
          ...(targetFilters.status !== 'all' ? { status: targetFilters.status } : {}),
        });
        if (res.success && res.data) {
          setRuns(res.data.items);
          setTotal(res.data.total);
        } else {
          toast.error(MESSAGES.ERROR.RUNS);
        }
      } catch {
        toast.error(MESSAGES.ERROR.RUNS);
      } finally {
        setLoading(false);
      }
    },
    [page, filters]
  );

  const applyFilters = useCallback(
    (next: Partial<RunsFilterState>) => {
      const merged = { ...filters, ...next };
      setFilters(merged);
      setPage(1);
      fetchRuns(1, merged);
    },
    [filters, fetchRuns]
  );

  const changePage = useCallback(
    (p: number) => {
      setPage(p);
      fetchRuns(p, filters);
    },
    [filters, fetchRuns]
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return { runs, total, page, totalPages, filters, loading, fetchRuns, applyFilters, changePage };
}
