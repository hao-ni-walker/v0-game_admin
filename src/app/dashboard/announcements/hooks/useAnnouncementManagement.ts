import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Announcement,
  AnnouncementFilters,
  PaginationInfo,
  AnnouncementFormData
} from '../types';
import { DEFAULT_PAGINATION, MESSAGES } from '../constants';

/**
 * 公告管理逻辑 Hook
 * 负责公告数据的 CRUD 操作
 */
export function useAnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] =
    useState<PaginationInfo>(DEFAULT_PAGINATION);

  /**
   * 获取通知列表
   */
  const fetchAnnouncements = useCallback(
    async (filters: AnnouncementFilters) => {
      setLoading(true);
      try {
        // 构建查询参数
        const params = new URLSearchParams();

        // 分页参数
        params.append('page', String(filters.page || 1));
        params.append('page_size', String(filters.page_size || 10));

        // 添加筛选条件
        if (filters.keyword) params.append('keyword', filters.keyword);
        if (filters.notification_type)
          params.append('notification_type', filters.notification_type);
        if (filters.status && filters.status !== 'all') {
          params.append('status', filters.status);
        }
        if (filters.is_read !== undefined) {
          params.append('is_read', String(filters.is_read));
        }
        if (filters.user_id) params.append('user_id', String(filters.user_id));
        if (filters.created_from)
          params.append('created_from', filters.created_from);
        if (filters.created_to) params.append('created_to', filters.created_to);
        if (filters.sent_from) params.append('sent_from', filters.sent_from);
        if (filters.sent_to) params.append('sent_to', filters.sent_to);
        if (filters.read_from) params.append('read_from', filters.read_from);
        if (filters.read_to) params.append('read_to', filters.read_to);
        if (filters.sort_by) params.append('sort_by', filters.sort_by);
        if (filters.sort_dir) params.append('sort_dir', filters.sort_dir);

        const response = await fetch(
          `/api/admin/notifications?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('获取通知列表失败');
        }

        const result = await response.json();

        // 处理响应数据
        const data = result.data || result;

        setAnnouncements(data.items || []);
        setPagination({
          page: data.page || 1,
          page_size: data.page_size || 10,
          total: data.total || 0,
          totalPages:
            data.total_pages ||
            Math.ceil((data.total || 0) / (data.page_size || 10))
        });
      } catch (error) {
        console.error('获取通知列表失败:', error);
        toast.error(MESSAGES.ERROR.FETCH);
        setAnnouncements([]);
        setPagination(DEFAULT_PAGINATION);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * 刷新公告列表
   */
  const refreshAnnouncements = useCallback(
    async (filters: AnnouncementFilters) => {
      await fetchAnnouncements(filters);
    },
    [fetchAnnouncements]
  );

  /**
   * 创建通知
   */
  const createAnnouncement = useCallback(
    async (data: AnnouncementFormData): Promise<boolean> => {
      try {
        // TODO: 实现创建通知接口
        // 可能需要调用 /api/admin/users/{user_id}/notify 接口
        console.log('创建通知:', data);
        toast.success(MESSAGES.SUCCESS.CREATE);
        return true;
      } catch (error) {
        console.error('创建通知失败:', error);
        toast.error(MESSAGES.ERROR.CREATE);
        return false;
      }
    },
    []
  );

  /**
   * 更新通知
   */
  const updateAnnouncement = useCallback(
    async (
      id: number,
      data: Partial<AnnouncementFormData>
    ): Promise<boolean> => {
      try {
        // TODO: 实现更新通知接口
        console.log('更新通知:', id, data);
        toast.success(MESSAGES.SUCCESS.UPDATE);
        return true;
      } catch (error) {
        console.error('更新通知失败:', error);
        toast.error(MESSAGES.ERROR.UPDATE);
        return false;
      }
    },
    []
  );

  /**
   * 删除通知
   */
  const deleteAnnouncement = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        // TODO: 实现删除通知接口
        console.log('删除通知:', id);
        toast.success(MESSAGES.SUCCESS.DELETE);
        return true;
      } catch (error) {
        console.error('删除通知失败:', error);
        toast.error(MESSAGES.ERROR.DELETE);
        return false;
      }
    },
    []
  );

  /**
   * 切换通知状态（标记为已读/未读）
   */
  const toggleAnnouncementStatus = useCallback(
    async (announcement: Announcement): Promise<boolean> => {
      // TODO: 实现标记已读/未读接口
      console.log('切换通知状态:', announcement);
      return true;
    },
    []
  );

  /**
   * 切换禁用状态（通知不支持禁用，保留接口以兼容）
   */
  const toggleAnnouncementDisabled = useCallback(
    async (announcement: Announcement): Promise<boolean> => {
      // 通知不支持禁用功能
      console.log('通知不支持禁用功能');
      return false;
    },
    []
  );

  return {
    announcements,
    loading,
    pagination,
    fetchAnnouncements,
    refreshAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleAnnouncementStatus,
    toggleAnnouncementDisabled
  };
}
