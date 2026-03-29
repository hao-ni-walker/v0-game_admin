'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  OperationReportItem,
  OperationReportFilters,
  OperationReportResponse
} from '../types';
import { MESSAGES } from '../constants';
import { apiRequest } from '@/service/api/base';

/**
 * 运营报表管理业务逻辑 Hook
 * 负责运营报表数据的查询
 */
export function useOperationReportManagement() {
  const [reports, setReports] = useState<OperationReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  /**
   * 获取运营报表列表
   */
  const fetchReports = useCallback(async (filters: OperationReportFilters) => {
    try {
      setLoading(true);

      // 构建查询参数
      const params: Record<string, any> = {};

      // 处理日期范围
      if (filters.dateRange?.from && filters.dateRange?.to) {
        const startDate = filters.dateRange.from.toISOString().split('T')[0];
        const endDate = filters.dateRange.to.toISOString().split('T')[0];
        params.start_date = startDate;
        params.end_date = endDate;
      } else if (filters.start_date || filters.end_date) {
        // 如果提供了单独的日期参数
        if (filters.start_date) {
          params.start_date = filters.start_date;
        }
        if (filters.end_date) {
          params.end_date = filters.end_date;
        }
      } else {
        // 如果没有提供日期，默认使用最近30天
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        params.start_date = startDate.toISOString().split('T')[0];
        params.end_date = endDate.toISOString().split('T')[0];
      }

      // 构建查询字符串
      const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

      const url = queryString
        ? `/admin/operation-report?${queryString}`
        : '/admin/operation-report';

      // 调用 API
      const res = await apiRequest<OperationReportResponse>(url);

      if (res.success && res.data) {
        setReports(res.data.items || []);
        setTotal(res.data.total || 0);
        toast.success(MESSAGES.SUCCESS.FETCH_REPORTS);
      } else {
        toast.error(res.message || MESSAGES.ERROR.FETCH_REPORTS);
        setReports([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('获取运营报表失败:', error);
      toast.error(MESSAGES.ERROR.FETCH_REPORTS);
      setReports([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 刷新报表数据
   */
  const refreshReports = useCallback(
    (filters: OperationReportFilters) => {
      fetchReports(filters);
    },
    [fetchReports]
  );

  return {
    reports,
    loading,
    total,
    fetchReports,
    refreshReports
  };
}
