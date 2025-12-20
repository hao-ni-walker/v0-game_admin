'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  UserOperationLog,
  UserOperationLogFilters,
  PaginationInfo
} from '../types';
import { DEFAULT_PAGINATION, MESSAGES } from '../constants';
import { OperationLogAPI } from '@/service/request';

/**
 * 用户操作日志管理业务逻辑 Hook
 * 负责操作日志数据的查询
 */
export function useOperationLogManagement() {
  const [logs, setLogs] = useState<UserOperationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] =
    useState<PaginationInfo>(DEFAULT_PAGINATION);
  const [dialogState, setDialogState] = useState<{
    type: 'detail' | null;
    log: UserOperationLog | null;
    open: boolean;
  }>({
    type: null,
    log: null,
    open: false
  });

  /**
   * 获取操作日志列表
   */
  const fetchLogs = useCallback(async (filters: UserOperationLogFilters) => {
    try {
      setLoading(true);

      // 构建查询参数
      const params: Record<string, any> = {
        page: filters.page || 1,
        pageSize: filters.pageSize || 20,
        sortBy: filters.sortBy || 'operationAt',
        sortDir: filters.sortDir || 'desc'
      };

      // 添加筛选条件
      if (filters.keyword) params.keyword = filters.keyword;
      if (filters.operations && filters.operations.length > 0) {
        params.operations = filters.operations.join(',');
      }
      if (filters.tables && filters.tables.length > 0) {
        params.tables = filters.tables.join(',');
      }
      if (filters.usernames && filters.usernames.length > 0) {
        params.usernames = filters.usernames.join(',');
      }
      if (filters.userIds && filters.userIds.length > 0) {
        params.userIds = filters.userIds.join(',');
      }
      if (filters.objectId) params.objectId = filters.objectId;
      if (filters.ipAddress) params.ipAddress = filters.ipAddress;
      if (filters.hasDiff !== undefined) params.hasDiff = filters.hasDiff;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const res = await OperationLogAPI.getList(params);

      if (res.code === 0 || res.code === 200) {
        // 处理新的响应格式：data.items 和 data.total, data.page, data.page_size, data.total_pages
        const responseData = res.data;
        const items = responseData?.items || responseData || [];

        // 将 snake_case 转换为 camelCase
        const transformedLogs = items.map((item: any) => ({
          id: item.id,
          userId: item.user_id || item.userId,
          username: item.username,
          operation: item.operation,
          tableName: item.table_name || item.tableName,
          objectId: item.object_id || item.objectId,
          oldData: item.old_data || item.oldData,
          newData: item.new_data || item.newData,
          description: item.description,
          ipAddress: item.ip_address || item.ipAddress,
          source: item.source,
          userAgent: item.user_agent || item.userAgent,
          operationAt: item.operation_at || item.operationAt,
          createdAt: item.created_at || item.createdAt
        }));

        setLogs(transformedLogs);

        // 处理分页信息（支持 snake_case 和 camelCase）
        const paginationData = responseData || {};
        setPagination({
          page: paginationData.page || res.pager?.page || 1,
          limit:
            paginationData.page_size ||
            paginationData.pageSize ||
            res.pager?.limit ||
            20,
          total: paginationData.total || res.pager?.total || 0,
          totalPages:
            paginationData.total_pages ||
            paginationData.totalPages ||
            res.pager?.totalPages ||
            0
        });
      } else {
        toast.error(res.message || res.msg || MESSAGES.ERROR.FETCH_LOGS);
        setLogs([]);
      }
    } catch (error) {
      console.error('获取操作日志列表失败:', error);
      toast.error(MESSAGES.ERROR.FETCH_LOGS);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 刷新数据
   */
  const refreshLogs = useCallback(
    async (filters: UserOperationLogFilters) => {
      await fetchLogs(filters);
      toast.success(MESSAGES.SUCCESS.REFRESH);
    },
    [fetchLogs]
  );

  /**
   * 导出日志
   */
  const exportLogs = useCallback(async (filters: UserOperationLogFilters) => {
    try {
      const res = await OperationLogAPI.export(filters);
      if (res.code === 0) {
        toast.success(MESSAGES.SUCCESS.EXPORT);
      } else {
        toast.error(res.message || MESSAGES.ERROR.EXPORT);
      }
    } catch (error) {
      console.error('导出日志失败:', error);
      toast.error(MESSAGES.ERROR.EXPORT);
    }
  }, []);

  /**
   * 打开日志详情对话框
   */
  const openDetailDialog = useCallback((log: UserOperationLog) => {
    setDialogState({
      type: 'detail',
      log,
      open: true
    });
  }, []);

  /**
   * 关闭对话框
   */
  const closeDialog = useCallback(() => {
    setDialogState({
      type: null,
      log: null,
      open: false
    });
  }, []);

  return {
    // 状态
    logs,
    loading,
    pagination,
    dialogState,

    // 方法
    fetchLogs,
    refreshLogs,
    exportLogs,
    openDetailDialog,
    closeDialog
  };
}
