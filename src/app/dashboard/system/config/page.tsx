'use client';

import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';

import {
  SystemConfigPageHeader,
  SystemConfigFilters,
  SystemConfigTable,
  SystemConfigEditDialog
} from './components';
import { useSystemConfigFilters, useSystemConfigManagement } from './hooks';
import { PAGE_SIZE_OPTIONS } from './constants';
import { Pagination } from '@/components/table/pagination';
import { SystemConfigDialogState } from './types';

export default function SystemConfigPage() {
  // 使用自定义hooks
  const {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  } = useSystemConfigFilters();

  const {
    configs,
    loading,
    pagination,
    fetchConfigs,
    refreshConfigs,
    updateConfig,
    toggleDisabled
  } = useSystemConfigManagement();

  // 编辑对话框状态
  const [dialogState, setDialogState] = useState<SystemConfigDialogState>({
    type: null,
    config: null,
    open: false
  });

  // 初始化和筛选条件变化时获取数据
  useEffect(() => {
    fetchConfigs(filters);
  }, [filters, fetchConfigs]);

  /**
   * 打开编辑配置对话框
   */
  const handleOpenEditDialog = (config: SystemConfigDialogState['config']) => {
    setDialogState({
      type: 'edit',
      config,
      open: true
    });
  };

  /**
   * 关闭对话框
   */
  const handleCloseDialog = () => {
    setDialogState({
      type: null,
      config: null,
      open: false
    });
  };

  /**
   * 保存编辑
   */
  const handleUpdateConfig = async (
    id: number,
    payload: Parameters<typeof updateConfig>[1]
  ) => {
    const success = await updateConfig(id, payload);
    if (success) {
      fetchConfigs(filters);
    }
    return success;
  };

  /**
   * 切换禁用状态
   */
  const handleToggleDisabled = async (config: SystemConfigDialogState['config']) => {
    if (!config) return;
    const success = await toggleDisabled(config);
    if (success) {
      fetchConfigs(filters);
    }
  };

  /**
   * 刷新数据
   */
  const handleRefresh = () => {
    refreshConfigs(filters);
  };

  /**
   * 处理查询
   */
  const handleSearch = (newFilters: any) => {
    searchFilters(newFilters);
  };

  /**
   * 处理重置
   */
  const handleReset = () => {
    clearFilters();
  };

  /**
   * 处理分页变化
   */
  const handlePageChange = (page: number) => {
    updatePagination({ page });
  };

  /**
   * 处理页面大小变化
   */
  const handlePageSizeChange = (page_size: number) => {
    updatePagination({ page_size, page: 1 });
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-4'>
        {/* 页面头部 */}
        <SystemConfigPageHeader
          onRefresh={handleRefresh}
          loading={loading}
        />

        {/* 搜索和筛选 */}
        <SystemConfigFilters
          filters={filters}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loading}
        />

        {/* 数据表格和分页 */}
        <div className='flex min-h-0 flex-1 flex-col'>
          <div className='min-h-0'>
            <SystemConfigTable
              configs={configs}
              loading={loading}
              pagination={pagination}
              onEdit={handleOpenEditDialog}
              onToggleDisabled={handleToggleDisabled}
              emptyState={{
                icon: <Settings className='text-muted-foreground h-8 w-8' />,
                title: hasActiveFilters ? '未找到匹配的配置' : '还没有配置项',
                description: hasActiveFilters
                  ? '请尝试调整筛选条件以查看更多结果'
                  : '系统运行参数会在首次保存后出现在这里'
              }}
            />
          </div>

          {/* 分页控件 */}
          <div className='flex-shrink-0 pt-4'>
            <Pagination
              pagination={{
                ...pagination,
                limit: pagination.page_size
              }}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          </div>
        </div>

        {/* 逐字段编辑对话框（业务语言） */}
        <SystemConfigEditDialog
          open={dialogState.open}
          config={dialogState.config}
          onOpenChange={(open) => {
            if (!open) handleCloseDialog();
          }}
          onUpdate={handleUpdateConfig}
        />
      </div>
    </PageContainer>
  );
}
