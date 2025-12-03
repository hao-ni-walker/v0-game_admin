'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import {
  ActivityTable,
  ActivityFilters,
  ActivityPageHeader,
  ActivityDetailDrawer,
  ActivityEditModal,
  TriggerEditDrawer
} from './components';
import { useActivityFilters, useActivityManagement } from './hooks';
import { Activity } from '@/repository/models';
import { Plus, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';

export default function CampaignsPage() {
  // 使用自定义hooks
  const { filters, updatePagination, clearFilters, hasActiveFilters } =
    useActivityFilters();

  const {
    activities,
    loading,
    pagination,
    sortBy,
    sortOrder,
    fetchActivities,
    refreshActivities,
    changeActivityStatus,
    handleSort,
    canWrite,
    canChangeStatus,
    canManageTriggers
  } = useActivityManagement();

  // 抽屉和模态框状态
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [triggerDrawerOpen, setTriggerDrawerOpen] = useState(false);
  const [editingTriggerId, setEditingTriggerId] = useState<number | null>(null);
  const [detailInitialTab, setDetailInitialTab] = useState<
    'basic' | 'config' | 'triggers' | 'statistics'
  >('basic');

  // 初始化和筛选条件变化时获取数据
  useEffect(() => {
    fetchActivities(filters);
  }, [filters, fetchActivities]);

  /**
   * 打开创建活动对话框
   */
  const handleCreateActivity = () => {
    setEditingActivity(null);
    setEditModalOpen(true);
  };

  /**
   * 查看活动详情
   */
  const handleViewActivity = (activity: Activity) => {
    setSelectedActivityId(activity.id);
    setDetailInitialTab('basic');
    setDetailDrawerOpen(true);
  };

  /**
   * 编辑活动
   */
  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setEditModalOpen(true);
  };

  /**
   * 配置触发规则
   */
  const handleConfigureRules = (activity: Activity) => {
    setSelectedActivityId(activity.id);
    setDetailInitialTab('triggers');
    setDetailDrawerOpen(true);
  };

  /**
   * 配置单个触发规则
   */
  const handleConfigureTrigger = (activityId: number, triggerId?: number) => {
    setSelectedActivityId(activityId);
    setEditingTriggerId(triggerId || null);
    setTriggerDrawerOpen(true);
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

  /**
   * 处理排序
   */
  const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    handleSort(newSortBy, newSortOrder);
    // 更新 URL 中的排序参数
    const updatedFilters = {
      ...filters,
      sort_by: newSortBy,
      sort_order: newSortOrder
    };
    fetchActivities(updatedFilters);
  };

  /**
   * 活动编辑成功回调
   */
  const handleEditSuccess = () => {
    fetchActivities(filters);
    if (selectedActivityId) {
      // 如果详情抽屉打开，刷新详情数据
      setDetailDrawerOpen(false);
      setDetailDrawerOpen(true);
    }
  };

  /**
   * 触发规则编辑成功回调
   */
  const handleTriggerSuccess = () => {
    if (selectedActivityId) {
      // 刷新详情抽屉中的触发规则列表
      setDetailDrawerOpen(false);
      setDetailDrawerOpen(true);
      setDetailInitialTab('triggers');
    }
    fetchActivities(filters);
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-4'>
        {/* 页面头部 */}
        <ActivityPageHeader
          onCreateActivity={canWrite ? handleCreateActivity : undefined}
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
              sortBy={sortBy}
              sortOrder={sortOrder}
              onView={handleViewActivity}
              onEdit={handleEditActivity}
              onConfigureRules={handleConfigureRules}
              onChangeStatus={handleChangeStatus}
              onSort={handleSortChange}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              canWrite={canWrite}
              canChangeStatus={canChangeStatus}
              canManageTriggers={canManageTriggers}
              emptyState={{
                icon: <Gift className='text-muted-foreground h-8 w-8' />,
                title: hasActiveFilters ? '未找到匹配的活动' : '还没有活动',
                description: hasActiveFilters
                  ? '请尝试调整筛选条件以查看更多结果'
                  : '开始创建活动来管理平台营销',
                action:
                  !hasActiveFilters && canWrite ? (
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

        {/* 活动详情抽屉 */}
        <ActivityDetailDrawer
          open={detailDrawerOpen}
          activityId={selectedActivityId}
          onClose={() => {
            setDetailDrawerOpen(false);
            setSelectedActivityId(null);
          }}
          onEdit={handleEditActivity}
          onConfigureTrigger={handleConfigureTrigger}
          onRefresh={handleRefresh}
          initialTab={detailInitialTab}
        />

        {/* 活动编辑模态框 */}
        <ActivityEditModal
          open={editModalOpen}
          activity={editingActivity}
          onClose={() => {
            setEditModalOpen(false);
            setEditingActivity(null);
          }}
          onSuccess={handleEditSuccess}
        />

        {/* 触发规则编辑抽屉 */}
        <TriggerEditDrawer
          open={triggerDrawerOpen}
          activityId={selectedActivityId || 0}
          triggerId={editingTriggerId}
          onClose={() => {
            setTriggerDrawerOpen(false);
            setEditingTriggerId(null);
          }}
          onSuccess={handleTriggerSuccess}
        />
      </div>
    </PageContainer>
  );
}
