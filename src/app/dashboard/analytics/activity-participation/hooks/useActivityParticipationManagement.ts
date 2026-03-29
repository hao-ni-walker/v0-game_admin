'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  UserActivityRecordsAPI,
  UserActivityRecordResponse,
  UserActivityRecord,
  UserActivityRecordFilters
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
        // 转换日期范围，创建正确类型的 API 过滤器
        const apiFilters: UserActivityRecordFilters = {
          user_id: filters.user_id,
          username: filters.username,
          email: filters.email,
          activity_id: filters.activity_id,
          activity_name: filters.activity_name,
          status: filters.status,
          participation_count_min: filters.participation_count_min,
          participation_count_max: filters.participation_count_max,
          start_time: filters.dateRange?.from?.toISOString(),
          end_time: filters.dateRange?.to?.toISOString(),
          page: filters.page,
          page_size: filters.page_size,
          sort_by: filters.sort_by,
          sort_order: filters.sort_order
        };

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
