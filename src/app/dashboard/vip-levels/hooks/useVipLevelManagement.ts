import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { VipLevel, VipLevelFilters, PaginationInfo } from '../types';
import { DEFAULT_PAGINATION, MESSAGES } from '../constants';

/**
 * VIP等级管理逻辑 Hook
 * 负责VIP等级数据的 CRUD 操作
 */
export function useVipLevelManagement() {
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>(DEFAULT_PAGINATION);

  /**
   * 获取VIP等级列表
   */
  const fetchVipLevels = useCallback(async (filters: VipLevelFilters) => {
    setLoading(true);
    try {
      // 构建请求体
      const requestBody: any = {
        page: filters.page || 1,
        page_size: filters.page_size || 20
      };

      // 添加筛选条件
      if (filters.keyword) requestBody.keyword = filters.keyword;
      if (filters.level_min !== undefined) requestBody.level_min = filters.level_min;
      if (filters.level_max !== undefined) requestBody.level_max = filters.level_max;
      if (filters.required_exp_min !== undefined)
        requestBody.required_exp_min = filters.required_exp_min;
      if (filters.required_exp_max !== undefined)
        requestBody.required_exp_max = filters.required_exp_max;
      if (filters.disabled !== undefined) requestBody.disabled = filters.disabled;
      if (filters.show_removed) requestBody.show_removed = filters.show_removed;
      if (filters.created_from) requestBody.created_from = filters.created_from;
      if (filters.created_to) requestBody.created_to = filters.created_to;
      if (filters.updated_from) requestBody.updated_from = filters.updated_from;
      if (filters.updated_to) requestBody.updated_to = filters.updated_to;
      if (filters.sort_by) requestBody.sort_by = filters.sort_by;
      if (filters.sort_dir) requestBody.sort_dir = filters.sort_dir;

      const response = await fetch('/api/vip-levels/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('获取VIP等级列表失败');
      }

      const data = await response.json();

      setVipLevels(data.list || []);
      setPagination({
        page: data.page || 1,
        page_size: data.page_size || 20,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / (data.page_size || 20))
      });
    } catch (error) {
      console.error('获取VIP等级列表失败:', error);
      toast.error(MESSAGES.ERROR.FETCH);
      setVipLevels([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 刷新数据
   */
  const refreshVipLevels = useCallback(
    async (filters: VipLevelFilters) => {
      await fetchVipLevels(filters);
    },
    [fetchVipLevels]
  );

  /**
   * 更新VIP等级
   */
  const updateVipLevel = useCallback(
    async (id: number, version: number, updates: Partial<VipLevel>): Promise<boolean> => {
      try {
        const response = await fetch(`/api/vip-levels/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ...updates, version })
        });

        if (!response.ok) {
          const error = await response.json();
          if (error.code === 'VERSION_CONFLICT') {
            toast.error(MESSAGES.ERROR.VERSION_CONFLICT);
          } else {
            throw new Error('更新VIP等级失败');
          }
          return false;
        }

        return true;
      } catch (error) {
        console.error('更新VIP等级失败:', error);
        toast.error(MESSAGES.ERROR.UPDATE);
        return false;
      }
    },
    []
  );

  /**
   * 删除VIP等级
   */
  const deleteVipLevel = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/vip-levels/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('删除VIP等级失败');
      }

      toast.success(MESSAGES.SUCCESS.DELETE);
      return true;
    } catch (error) {
      console.error('删除VIP等级失败:', error);
      toast.error(MESSAGES.ERROR.DELETE);
      return false;
    }
  }, []);

  /**
   * 切换禁用状态
   */
  const toggleVipLevelDisabled = useCallback(
    async (vipLevel: VipLevel): Promise<boolean> => {
      const newDisabled = !vipLevel.disabled;
      const success = await updateVipLevel(vipLevel.id, vipLevel.version, {
        disabled: newDisabled
      });
      if (success) {
        toast.success(newDisabled ? MESSAGES.SUCCESS.DISABLE : MESSAGES.SUCCESS.ENABLE);
      }
      return success;
    },
    [updateVipLevel]
  );

  return {
    vipLevels,
    loading,
    pagination,
    fetchVipLevels,
    refreshVipLevels,
    deleteVipLevel,
    toggleVipLevelDisabled
  };
}
