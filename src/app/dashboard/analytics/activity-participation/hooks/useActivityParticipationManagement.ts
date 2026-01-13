'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  UserActivityRecordsAPI,
  UserActivityRecordResponse,
  UserActivityRecord
} from '@/service/api/user-activity-records';
import { ActivityParticipationFilters } from '../types';

export function useActivityParticipationManagement() {
  const [data, setData] = useState<UserActivityRecordResponse>({
    list: [],
    total: 0,
    page: 1,
    page_size: 20
  });
  const [loading, setLoading] = useState(false);

  const fetchRecords = useCallback(
    async (filters: ActivityParticipationFilters) => {
      setLoading(true);
      try {
        // 转换日期范围
        const apiFilters = { ...filters };
        if (filters.dateRange?.from) {
          apiFilters.start_time = filters.dateRange.from.toISOString();
        }
        if (filters.dateRange?.to) {
          apiFilters.end_time = filters.dateRange.to.toISOString();
        }
        delete apiFilters.dateRange;

        const res = await UserActivityRecordsAPI.getRecords(apiFilters);
        if (res.code === 0 || res.code === 200) {
          setData(res.data || { list: [], total: 0, page: 1, page_size: 20 });
        } else {
          toast.error(res.message || '获取记录失败');
          setData({ list: [], total: 0, page: 1, page_size: 20 });
        }
      } catch (error) {
        console.error('获取记录失败:', error);
        toast.error('获取记录失败');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    data,
    loading,
    fetchRecords
  };
}
