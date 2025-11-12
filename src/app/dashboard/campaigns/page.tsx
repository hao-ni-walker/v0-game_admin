'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { ActivityTable, ActivityFilters, ActivityPageHeader } from './components';
import { useActivityFilters, useActivityManagement } from './hooks';
import { Activity } from '@/repository/models';
import { Plus, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CampaignsPage() {
  const router = useRouter();

  // 使用自定义hooks
  const {
    filters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  } = useActivityFilters();

  const {
    activities,
    loading,
    pagination,
    fetchActivities,
    refreshActivities,
    deleteActivity,
    changeActivityStatus
  } = useActivityManagement();

  // 初始化和筛选条件变化时获取数据
  useEffect(() => {
    fetchActivities(filters);
  }, [filters]);

  /**
   * 打开创建活动对话框
   */
  const handleCreateActivity = () => {
    router.push('/dashboard/campaigns/create');
  };

  /**
   * 查看活动详情
   */
  const handleViewActivity = (activity: Activity) => {
    router.push(`/dashboard/campaigns/${activity.id}`);
  };

  /**
   * 删除活动
   */
  const handleDeleteActivity = async (activity: Activity) => {
    const success = await deleteActivity(activity.id);
    if (success) {
      fetchActivities(filters);
    }
  };

  /**
   * 更改状态
   */
  const handleChangeStatus = async (activityId: number, status: string) => {
    const success = await changeActivityStatus(activityId, status);
    if (success) {
      fetchActivities(filters);
    }
  };

  /**
   * 刷新数据
   */
  const handleRefresh = () => {
    refreshActivities(filters);
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
  const handlePageSizeChange = (pageSize: number) => {
    updatePagination({ pageSize, page: 1 });
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-4'>
        {/* 页面头部 */}
        <ActivityPageHeader
          onCreateActivity={handleCreateActivity}
          onRefresh={handleRefresh}
          loading={loading}
        />

        {/* 搜索和筛选 */}
        <ActivityFilters
          filters={filters}
          onSearch={fetchActivities}
          onReset={handleReset}
          loading={loading}
        />

        {/* 数据表格和分页 */}
        <div className='flex min-h-0 flex-1 flex-col'>
          <div className='min-h-0 flex-1'>
            <ActivityTable
              activities={activities}
              loading={loading}
              pagination={pagination}
              onView={handleViewActivity}
              onDelete={handleDeleteActivity}
              onChangeStatus={handleChangeStatus}
              emptyState={{
                icon: <Gift className='text-muted-foreground h-8 w-8' />,
                title: hasActiveFilters ? '未找到匹配的活动' : '还没有活动',
                description: hasActiveFilters
                  ? '请尝试调整筛选条件以查看更多结果'
                  : '开始创建活动来管理平台营销',
                action: !hasActiveFilters ? (
                  <Button
                    onClick={handleCreateActivity}
                    size='sm'
                    className='mt-2'
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    创建活动
                  </Button>
                ) : undefined
              }}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
