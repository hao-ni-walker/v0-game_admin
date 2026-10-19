import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  SystemConfig,
  SystemConfigFilters,
  PaginationInfo,
  SystemConfigUpdatePayload
} from '../types';
import { DEFAULT_PAGINATION, MESSAGES } from '../constants';
import {
  resolveKeysByBusinessKeyword,
  resolveKeysByCategory
} from '../field-catalog';
import { SystemConfigAPI } from '@/service/request';

/**
 * 系统配置管理逻辑 Hook
 * 负责配置数据的读取与更新（键由代码定义，无新建/删除）
 */
export function useSystemConfigManagement() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] =
    useState<PaginationInfo>(DEFAULT_PAGINATION);

  /**
   * 获取配置列表。
   * 业务语言感知：关键词/分类先在目录里解析成精确键集（config_keys），
   * 目录未命中时按原样走 keyword（覆盖未收录键）。
   */
  const fetchConfigs = useCallback(async (filters: SystemConfigFilters) => {
    setLoading(true);
    try {
      const configKeys = new Set<string>(resolveKeysByCategory(filters.category || 'all'));
      let keyword = filters.keyword?.trim() || '';
      if (keyword) {
        const hits = resolveKeysByBusinessKeyword(keyword);
        if (hits.length > 0) {
          hits.forEach((k) => configKeys.add(k));
          keyword = '';
        }
      }

      const res = await SystemConfigAPI.getList({
        page: filters.page || 1,
        page_size: filters.page_size || 20,
        keyword: keyword || undefined,
        config_keys: configKeys.size > 0 ? Array.from(configKeys) : undefined,
        config_types: filters.config_types,
        is_public: filters.is_public,
        disabled: filters.disabled ? true : undefined,
        show_removed: filters.show_removed,
        sort_by: filters.sort_by,
        sort_dir: filters.sort_dir
      });

      if (res.code === 0 && res.data) {
        // 远程API返回的数据结构: { items: [], total, page, page_size, total_pages }
        const data = res.data;
        setConfigs(data.items || []);
        setPagination({
          page: data.page || 1,
          page_size: data.page_size || 20,
          total: data.total || 0,
          totalPages: data.total_pages || 1
        });
      } else {
        toast.error(res.message || MESSAGES.ERROR.FETCH_CONFIGS);
        setConfigs([]);
        setPagination(DEFAULT_PAGINATION);
      }
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
   * 刷新列表
   */
  const refreshConfigs = useCallback(
    async (filters: SystemConfigFilters) => {
      await fetchConfigs(filters);
      toast.success('刷新成功');
    },
    [fetchConfigs]
  );

  /**
   * 更新配置（整值写入 + 版本乐观锁；失败消息含版本冲突提示）
   */
  const updateConfig = useCallback(
    async (id: number, data: SystemConfigUpdatePayload): Promise<boolean> => {
      try {
        const response = await SystemConfigAPI.update(id, data);

        if (!response.success) {
          toast.error(response.message || MESSAGES.ERROR.UPDATE);
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
   * 切换禁用状态（禁用后运行时回落环境变量/代码默认值）
   */
  const toggleDisabled = useCallback(
    async (config: SystemConfig): Promise<boolean> => {
      const newDisabled = !config.disabled;
      const success = await updateConfig(config.id, {
        disabled: newDisabled,
        version: config.version
      });
      if (success) {
        toast.success(
          newDisabled ? MESSAGES.SUCCESS.DISABLE : MESSAGES.SUCCESS.ENABLE
        );
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
    updateConfig,
    toggleDisabled
  };
}
