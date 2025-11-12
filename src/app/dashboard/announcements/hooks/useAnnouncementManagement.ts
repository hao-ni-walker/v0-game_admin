import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Announcement, AnnouncementFilters, PaginationInfo, AnnouncementFormData } from '../types';
import { DEFAULT_PAGINATION, MESSAGES } from '../constants';

/**
 * 公告管理逻辑 Hook
 * 负责公告数据的 CRUD 操作
 */
export function useAnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>(DEFAULT_PAGINATION);

  /**
   * 获取公告列表
   */
  const fetchAnnouncements = useCallback(async (filters: AnnouncementFilters) => {
    setLoading(true);
    try {
      // 构建请求体
      const requestBody: any = {
        page: filters.page || 1,
        page_size: filters.page_size || 20
      };

      // 添加筛选条件
      if (filters.keyword) requestBody.keyword = filters.keyword;
      if (filters.types && filters.types.length > 0) {
        requestBody.types = filters.types;
      }
      if (filters.status !== 'all' && filters.status !== undefined) {
        requestBody.status = filters.status;
      }
      if (filters.disabled !== undefined) requestBody.disabled = filters.disabled;
      if (filters.show_removed) requestBody.show_removed = filters.show_removed;
      if (filters.active_only) requestBody.active_only = filters.active_only;
      if (filters.start_from) requestBody.start_from = filters.start_from;
      if (filters.start_to) requestBody.start_to = filters.start_to;
      if (filters.end_from) requestBody.end_from = filters.end_from;
      if (filters.end_to) requestBody.end_to = filters.end_to;
      if (filters.created_from) requestBody.created_from = filters.created_from;
      if (filters.created_to) requestBody.created_to = filters.created_to;
      if (filters.updated_from) requestBody.updated_from = filters.updated_from;
      if (filters.updated_to) requestBody.updated_to = filters.updated_to;
      if (filters.sort_by) requestBody.sort_by = filters.sort_by;
      if (filters.sort_dir) requestBody.sort_dir = filters.sort_dir;

      const response = await fetch('/api/announcements/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('获取公告列表失败');
      }

      const data = await response.json();
      
      setAnnouncements(data.list || []);
      setPagination({
        page: data.page || 1,
        page_size: data.page_size || 20,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / (data.page_size || 20))
      });
    } catch (error) {
      console.error('获取公告列表失败:', error);
      toast.error(MESSAGES.ERROR.FETCH);
      setAnnouncements([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, []);

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
   * 创建公告
   */
  const createAnnouncement = useCallback(async (data: AnnouncementFormData): Promise<boolean> => {
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('创建公告失败');
      }

      toast.success(MESSAGES.SUCCESS.CREATE);
      return true;
    } catch (error) {
      console.error('创建公告失败:', error);
      toast.error(MESSAGES.ERROR.CREATE);
      return false;
    }
  }, []);

  /**
   * 更新公告
   */
  const updateAnnouncement = useCallback(
    async (id: number, version: number, data: Partial<AnnouncementFormData>): Promise<boolean> => {
      try {
        const response = await fetch(`/api/announcements/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ...data, version })
        });

        if (!response.ok) {
          const error = await response.json();
          if (error.code === 'VERSION_CONFLICT') {
            toast.error(MESSAGES.ERROR.VERSION_CONFLICT);
          } else {
            throw new Error('更新公告失败');
          }
          return false;
        }

        toast.success(MESSAGES.SUCCESS.UPDATE);
        return true;
      } catch (error) {
        console.error('更新公告失败:', error);
        toast.error(MESSAGES.ERROR.UPDATE);
        return false;
      }
    },
    []
  );

  /**
   * 删除公告
   */
  const deleteAnnouncement = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('删除公告失败');
      }

      toast.success(MESSAGES.SUCCESS.DELETE);
      return true;
    } catch (error) {
      console.error('删除公告失败:', error);
      toast.error(MESSAGES.ERROR.DELETE);
      return false;
    }
  }, []);

  /**
   * 切换公告状态
   */
  const toggleAnnouncementStatus = useCallback(
    async (announcement: Announcement): Promise<boolean> => {
      const newStatus = announcement.status === 1 ? 0 : 1;
      const success = await updateAnnouncement(announcement.id, announcement.version, { status: newStatus });
      if (success) {
        toast.success(newStatus === 1 ? MESSAGES.SUCCESS.PUBLISH : MESSAGES.SUCCESS.OFFLINE);
      }
      return success;
    },
    [updateAnnouncement]
  );

  /**
   * 切换禁用状态
   */
  const toggleAnnouncementDisabled = useCallback(
    async (announcement: Announcement): Promise<boolean> => {
      const newDisabled = !announcement.disabled;
      const success = await updateAnnouncement(announcement.id, announcement.version, { disabled: newDisabled });
      if (success) {
        toast.success(newDisabled ? MESSAGES.SUCCESS.DISABLE : MESSAGES.SUCCESS.ENABLE);
      }
      return success;
    },
    [updateAnnouncement]
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
