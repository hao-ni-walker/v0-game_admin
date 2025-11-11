import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Banner, BannerFilters, PaginationInfo, BannerFormData } from '../types';
import { DEFAULT_PAGINATION, MESSAGES } from '../constants';

/**
 * 轮播图管理逻辑 Hook
 * 负责轮播图数据的 CRUD 操作
 */
export function useBannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>(DEFAULT_PAGINATION);

  /**
   * 获取轮播图列表
   */
  const fetchBanners = useCallback(async (filters: BannerFilters) => {
    setLoading(true);
    try {
      // 构建请求体
      const requestBody: any = {
        page: filters.page || 1,
        page_size: filters.page_size || 20
      };

      // 添加筛选条件
      if (filters.keyword) requestBody.keyword = filters.keyword;
      if (filters.positions && filters.positions.length > 0) {
        requestBody.positions = filters.positions;
      }
      if (filters.status !== 'all' && filters.status !== undefined) {
        requestBody.status = filters.status;
      }
      if (filters.disabled !== undefined) requestBody.disabled = filters.disabled;
      if (filters.show_removed !== undefined) requestBody.show_removed = filters.show_removed;
      if (filters.active_only !== undefined) requestBody.active_only = filters.active_only;
      if (filters.sort_by) requestBody.sort_by = filters.sort_by;
      if (filters.sort_dir) requestBody.sort_dir = filters.sort_dir;

      const response = await fetch('/api/banners/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('获取轮播图列表失败');
      }

      const data = await response.json();
      
      setBanners(data.list || []);
      setPagination({
        page: data.page || 1,
        page_size: data.page_size || 20,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / (data.page_size || 20))
      });
    } catch (error) {
      console.error('获取轮播图列表失败:', error);
      toast.error(MESSAGES.ERROR.FETCH_BANNERS);
      setBanners([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 刷新轮播图列表
   */
  const refreshBanners = useCallback(
    async (filters: BannerFilters) => {
      await fetchBanners(filters);
    },
    [fetchBanners]
  );

  /**
   * 创建轮播图
   */
  const createBanner = useCallback(async (data: BannerFormData): Promise<boolean> => {
    try {
      const response = await fetch('/api/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('创建轮播图失败');
      }

      toast.success(MESSAGES.SUCCESS.CREATE);
      return true;
    } catch (error) {
      console.error('创建轮播图失败:', error);
      toast.error(MESSAGES.ERROR.CREATE);
      return false;
    }
  }, []);

  /**
   * 更新轮播图
   */
  const updateBanner = useCallback(
    async (id: number, data: Partial<BannerFormData> & { version: number }): Promise<boolean> => {
      try {
        const response = await fetch(`/api/banners/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 409) {
            toast.error(MESSAGES.ERROR.VERSION_CONFLICT);
          } else {
            throw new Error('更新轮播图失败');
          }
          return false;
        }

        toast.success(MESSAGES.SUCCESS.UPDATE);
        return true;
      } catch (error) {
        console.error('更新轮播图失败:', error);
        toast.error(MESSAGES.ERROR.UPDATE);
        return false;
      }
    },
    []
  );

  /**
   * 删除轮播图
   */
  const deleteBanner = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/banners/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('删除轮播图失败');
      }

      toast.success(MESSAGES.SUCCESS.DELETE);
      return true;
    } catch (error) {
      console.error('删除轮播图失败:', error);
      toast.error(MESSAGES.ERROR.DELETE);
      return false;
    }
  }, []);

  /**
   * 切换轮播图状态
   */
  const toggleBannerStatus = useCallback(
    async (banner: Banner): Promise<boolean> => {
      const newStatus: 0 | 1 = banner.status === 1 ? 0 : 1;
      const success = await updateBanner(banner.id, { 
        status: newStatus,
        version: banner.version
      });
      if (success) {
        toast.success(newStatus === 1 ? MESSAGES.SUCCESS.ENABLE : MESSAGES.SUCCESS.DISABLE);
      }
      return success;
    },
    [updateBanner]
  );

  /**
   * 禁用轮播图
   */
  const disableBanner = useCallback(
    async (banner: Banner): Promise<boolean> => {
      const success = await updateBanner(banner.id, { 
        disabled: true,
        version: banner.version
      });
      if (success) {
        toast.success('轮播图已禁用');
      }
      return success;
    },
    [updateBanner]
  );

  /**
   * 恢复轮播图
   */
  const restoreBanner = useCallback(
    async (banner: Banner): Promise<boolean> => {
      const success = await updateBanner(banner.id, { 
        disabled: false,
        version: banner.version
      });
      if (success) {
        toast.success(MESSAGES.SUCCESS.RESTORE);
      }
      return success;
    },
    [updateBanner]
  );

  return {
    banners,
    loading,
    pagination,
    fetchBanners,
    refreshBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    disableBanner,
    restoreBanner
  };
}
