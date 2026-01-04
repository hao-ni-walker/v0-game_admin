'use client';

import { useEffect, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/table/pagination';
import PageContainer from '@/components/layout/page-container';
import { TemplatePageHeader, TemplateTable } from './components';
import { useTemplateManagement } from './hooks';
import { PAGE_SIZE_OPTIONS, DEFAULT_FILTERS } from './constants';
import { NotificationTemplate, TemplateFilters } from './types';

export default function NotificationTemplatesPage() {
  const [filters, setFilters] = useState<TemplateFilters>(DEFAULT_FILTERS);

  const { templates, loading, pagination, fetchTemplates, refreshTemplates } =
    useTemplateManagement();

  // 初始化和筛选条件变化时获取数据
  useEffect(() => {
    fetchTemplates(filters);
  }, [filters, fetchTemplates]);

  /**
   * 刷新数据
   */
  const handleRefresh = () => {
    refreshTemplates(filters);
  };

  /**
   * 打开查看模板详情对话框
   */
  const handleOpenViewDialog = (template: NotificationTemplate) => {
    // TODO: 实现查看详情对话框
    console.log('查看模板:', template);
  };

  /**
   * 分页变化处理
   */
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  /**
   * 每页条数变化处理
   */
  const handlePageSizeChange = (page_size: number) => {
    setFilters((prev) => ({ ...prev, page_size, page: 1 }));
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-4'>
        {/* 页面头部 */}
        <TemplatePageHeader onRefresh={handleRefresh} loading={loading} />

        {/* 数据表格和分页 */}
        <div className='flex min-h-0 flex-1 flex-col'>
          <div className='min-h-0'>
            <TemplateTable
              templates={templates}
              loading={loading}
              pagination={pagination}
              onView={handleOpenViewDialog}
              emptyState={{
                icon: <ScrollText className='text-muted-foreground h-8 w-8' />,
                title: '还没有模板',
                description: '通知模板数据将显示在这里'
              }}
            />
          </div>

          {/* 分页控件 */}
          <div className='flex-shrink-0 pt-4'>
            <Pagination
              current={pagination.page}
              pageSize={pagination.page_size}
              total={pagination.total}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `共 ${total} 条`}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
