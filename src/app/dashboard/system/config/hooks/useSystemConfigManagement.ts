import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { SystemConfig, SystemConfigFilters, PaginationInfo, SystemConfigFormData } from '../types';
import { DEFAULT_PAGINATION, MESSAGES } from '../constants';

/**
 * 系统配置管理逻辑 Hook
 * 负责配置数据的 CRUD 操作
 */
export function useSystemConfigManagement() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>(DEFAULT_PAGINATION);

  /**
   * 获取配置列表
   */
  const fetchConfigs = useCallback(async (filters: SystemConfigFilters) => {
    setLoading(true);
    try {
      // 构建请求体
      const requestBody: any = {
        page: filters.page || 1,
        page_size: filters.page_size || 20
      };

      // 添加筛选条件
      if (filters.keyword) requestBody.keyword = filters.keyword;
      if (filters.config_types && filters.config_types.length > 0) {
        requestBody.config_types = filters.config_types;
      }
      if (filters.is_public !== undefined) requestBody.is_public = filters.is_public;
      if (filters.disabled !== undefined) requestBody.disabled = filters.disabled;
      if (filters.show_removed !== undefined) requestBody.show_removed = filters.show_removed;
      if (filters.sort_by) requestBody.sort_by = filters.sort_by;
      if (filters.sort_dir) requestBody.sort_dir = filters.sort_dir;

      const response = await fetch('/api/system-configs/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('获取配置列表失败');
      }

      const data = await response.json();
      
      setConfigs(data.list || []);
      setPagination({
        page: data.page || 1,
        page_size: data.page_size || 20,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / (data.page_size || 20))
      });
    } catch (error) {
      console.error('获取配置列表失败:', error);
      toast.error(MESSAGES.ERROR.FETCH_CONFIGS);
      setConfigs([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 刷新配置列表
   */
  const refreshConfigs = useCallback(
    async (filters: SystemConfigFilters) => {
      await fetchConfigs(filters);
    },
    [fetchConfigs]
  );

  /**
   * 创建配置
   */
  const createConfig = useCallback(async (data: SystemConfigFormData): Promise<boolean> => {
    try {
      const response = await fetch('/api/system-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 400) {
          toast.error(error.error || MESSAGES.ERROR.INVALID_VALUE);
        } else if (response.status === 409) {
          toast.error(MESSAGES.ERROR.DUPLICATE_KEY);
        } else {
          throw new Error('创建配置失败');
        }
        return false;
      }

      toast.success(MESSAGES.SUCCESS.CREATE);
      return true;
    } catch (error) {
      console.error('创建配置失败:', error);
      toast.error(MESSAGES.ERROR.CREATE);
      return false;
    }
  }, []);

  /**
   * 更新配置
   */
  const updateConfig = useCallback(
    async (id: number, data: Partial<SystemConfigFormData> & { version: number }): Promise<boolean> => {
      try {
        const response = await fetch(`/api/system-configs/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const error = await response.json();
          if (response.status === 409) {
            toast.error(MESSAGES.ERROR.VERSION_CONFLICT);
          } else if (response.status === 400) {
            toast.error(error.error || MESSAGES.ERROR.INVALID_VALUE);
          } else {
            throw new Error('更新配置失败');
          }
          return false;
        }

        toast.success(MESSAGES.SUCCESS.UPDATE);
        return true;
      } catch (error) {
        console.error('更新配置失败:', error);
        toast.error(MESSAGES.ERROR.UPDATE);
        return false;
      }
    },
    []
  );

  /**
   * 删除配置
   */
  const deleteConfig = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/system-configs/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('删除配置失败');
      }

      toast.success(MESSAGES.SUCCESS.DELETE);
      return true;
    } catch (error) {
      console.error('删除配置失败:', error);
      toast.error(MESSAGES.ERROR.DELETE);
      return false;
    }
  }, []);

  /**
   * 切换禁用状态
   */
  const toggleDisabled = useCallback(
    async (config: SystemConfig): Promise<boolean> => {
      const newDisabled = !config.disabled;
      const success = await updateConfig(config.id, { 
        disabled: newDisabled,
        version: config.version
      });
      if (success) {
        toast.success(newDisabled ? MESSAGES.SUCCESS.DISABLE : MESSAGES.SUCCESS.ENABLE);
      }
      return success;
    },
    [updateConfig]
  );

  return {
    configs,
    loading,
    pagination,
    fetchConfigs,
    refreshConfigs,
    createConfig,
    updateConfig,
    deleteConfig,
    toggleDisabled
  };
}
