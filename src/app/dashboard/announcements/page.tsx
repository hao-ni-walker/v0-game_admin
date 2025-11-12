'use client';

import { useEffect } from 'react';
import { Megaphone, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/table/pagination';
import PageContainer from '@/components/layout/page-container';

import {
  AnnouncementPageHeader,
  AnnouncementFilters,
  AnnouncementTable
} from './components';
import { useAnnouncementFilters, useAnnouncementManagement } from './hooks';
import { PAGE_SIZE_OPTIONS } from './constants';
import { Announcement } from './types';

export default function AnnouncementListPage() {
  // 使用自定义hooks
  const {
    filters,
    searchFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  } = useAnnouncementFilters();

  const {
    announcements,
    loading,
    pagination,
    fetchAnnouncements,
    refreshAnnouncements,
    deleteAnnouncement,
    toggleAnnouncementStatus,
    toggleAnnouncementDisabled
  } = useAnnouncementManagement();

  // 初始化和筛选条件变化时获取数据
  useEffect(() => {
    fetchAnnouncements(filters);
  }, [filters, fetchAnnouncements]);

  /**
   * 打开创建公告对话框
   */
  const handleOpenCreateDialog = () => {
    // TODO: 实现创建对话框
    console.log('创建公告');
  };

  /**
   * 打开编辑公告对话框
   */
  const handleOpenEditDialog = (announcement: Announcement) => {
    // TODO: 实现编辑对话框
    console.log('编辑公告:', announcement);
  };

  /**
   * 打开查看公告详情对话框
   */
  const handleOpenViewDialog = (announcement: Announcement) => {
    // TODO: 实现查看详情对话框
    console.log('查看公告:', announcement);
  };

  /**
   * 前台预览
   */
  const handlePreview = (announcement: Announcement) => {
    // TODO: 实现前台预览
    console.log('预览公告:', announcement);
  };

  /**
   * 删除公告
   */
  const handleDeleteAnnouncement = async (announcement: Announcement) => {
    const success = await deleteAnnouncement(announcement.id);
    if (success) {
      fetchAnnouncements(filters);
    }
  };

  /**
   * 切换公告状态
   */
  const handleToggleStatus = async (announcement: Announcement) => {
    const success = await toggleAnnouncementStatus(announcement);
    if (success) {
      fetchAnnouncements(filters);
    }
  };

  /**
   * 切换禁用状态
   */
  const handleToggleDisabled = async (announcement: Announcement) => {
    const success = await toggleAnnouncementDisabled(announcement);
    if (success) {
      fetchAnnouncements(filters);
    }
  };

  /**
   * 刷新数据
   */
  const handleRefresh = () => {
    refreshAnnouncements(filters);
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
        <AnnouncementPageHeader
          onCreateAnnouncement={handleOpenCreateDialog}
          onRefresh={handleRefresh}
          loading={loading}
        />

        {/* 搜索和筛选 */}
        <AnnouncementFilters
          filters={filters}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loading}
        />

        {/* 数据表格和分页 */}
        <div className='flex min-h-0 flex-1 flex-col'>
          <div className='min-h-0'>
            <AnnouncementTable
              announcements={announcements}
              loading={loading}
              pagination={pagination}
              onEdit={handleOpenEditDialog}
              onView={handleOpenViewDialog}
              onPreview={handlePreview}
              onDelete={handleDeleteAnnouncement}
              onToggleStatus={handleToggleStatus}
              onToggleDisabled={handleToggleDisabled}
              emptyState={{
                icon: <Megaphone className='h-8 w-8 text-muted-foreground' />,
                title: hasActiveFilters ? '未找到匹配的公告' : '还没有公告',
                description: hasActiveFilters
                  ? '请尝试调整筛选条件以查看更多结果'
                  : '开始创建公告来管理系统通知',
                action: !hasActiveFilters ? (
                  <Button onClick={handleOpenCreateDialog} size='sm' className='mt-2'>
                    <Plus className='mr-2 h-4 w-4' />
                    创建公告
                  </Button>
                ) : undefined
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

        {/* TODO: 公告对话框（创建/编辑/查看/预览） */}
      </div>
    </PageContainer>
  );
}
