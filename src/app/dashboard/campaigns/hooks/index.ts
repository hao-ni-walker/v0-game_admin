import { useState, useEffect } from 'react';
import { Activity } from '@/repository/models';
import { ActivityFilters } from '../types';

// 模拟API调用
const mockFetchActivities = async (filters: ActivityFilters) => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // 模拟数据
  const mockData: Activity[] = [
    {
      id: 3001,
      activityCode: "FIRST_DEPOSIT_NOV",
      activityType: "first_deposit",
      name: "新用户首充返利",
      description: "首充返利 100%，上限 100 元。新用户首次充值即可享受超值返利优惠！",
      startTime: "2025-11-01T00:00:00Z",
      endTime: "2025-12-01T00:00:00Z",
      displayStartTime: "2025-10-28T00:00:00Z",
      displayEndTime: "2025-12-05T00:00:00Z",
      status: "active",
      priority: 900,
      participationConfig: {
        perUserDailyLimit: 1,
        minDeposit: 50,
        maxBonus: 100,
        eligibility: "new_user"
      },
      extraConfig: {
        theme: "purple",
        entry: "/promo/first-deposit",
        abGroup: "A"
      },
      totalParticipants: 12845,
      totalRewardsGiven: 11320,
      iconUrl: "https://cdn.example.com/icons/fd.png",
      bannerUrl: "https://cdn.example.com/banners/fd_1125.jpg",
      createdBy: 1,
      updatedBy: 1,
      createdAt: "2025-10-20T09:30:00Z",
      updatedAt: "2025-11-11T21:00:00Z"
    },
    {
      id: 3002,
      activityCode: "DAILY_SIGNIN_2025",
      activityType: "daily_signin",
      name: "每日签到送好礼",
      description: "连续签到7天送大礼包，每天都有惊喜！",
      startTime: "2025-01-01T00:00:00Z",
      endTime: "2025-12-31T23:59:59Z",
      displayStartTime: "2025-01-01T00:00:00Z",
      displayEndTime: "2025-12-31T23:59:59Z",
      status: "active",
      priority: 800,
      participationConfig: {
        perUserDailyLimit: 1,
        consecutiveDaysBonus: {
          "7": 100,
          "14": 200,
          "30": 500
        }
      },
      extraConfig: {
        theme: "blue",
        entry: "/promo/daily-signin"
      },
      totalParticipants: 45623,
      totalRewardsGiven: 38901,
      iconUrl: "https://cdn.example.com/icons/signin.png",
      bannerUrl: "https://cdn.example.com/banners/signin.jpg",
      createdBy: 1,
      updatedBy: 2,
      createdAt: "2024-12-15T10:00:00Z",
      updatedAt: "2025-11-10T14:30:00Z"
    }
  ];

  // 应用筛选条件（简化版）
  let filteredData = [...mockData];
  
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase();
    filteredData = filteredData.filter(
      (activity) =>
        activity.name.toLowerCase().includes(keyword) ||
        activity.activityCode.toLowerCase().includes(keyword) ||
        activity.activityType.toLowerCase().includes(keyword)
    );
  }
  
  if (filters.activityTypes && filters.activityTypes.length > 0) {
    filteredData = filteredData.filter((activity) =>
      filters.activityTypes?.includes(activity.activityType)
    );
  }
  
  if (filters.statuses && filters.statuses.length > 0) {
    filteredData = filteredData.filter((activity) =>
      filters.statuses?.includes(activity.status)
    );
  }

  // 分页
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const total = filteredData.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    page,
    page_size: pageSize,
    total,
    list: paginatedData
  };
};

export const useActivityFilters = () => {
  const [filters, setFilters] = useState<ActivityFilters>({
    page: 1,
    pageSize: 20
  });

  const updateFilters = (newFilters: Partial<ActivityFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const updatePagination = (pagination: { page?: number; pageSize?: number }) => {
    setFilters((prev) => ({
      ...prev,
      ...pagination,
      page: pagination.page || prev.page,
      pageSize: pagination.pageSize || prev.pageSize
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      pageSize: 20
    });
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) =>
      key !== 'page' &&
      key !== 'pageSize' &&
      filters[key as keyof ActivityFilters] !== undefined &&
      filters[key as keyof ActivityFilters] !== ''
  );

  return {
    filters,
    updateFilters,
    updatePagination,
    clearFilters,
    hasActiveFilters
  };
};

export const useActivityManagement = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 20,
    total: 0
  });

  const fetchActivities = async (filters: ActivityFilters) => {
    setLoading(true);
    try {
      const result = await mockFetchActivities(filters);
      setActivities(result.list);
      setPagination({
        page: result.page,
        page_size: result.page_size,
        total: result.total
      });
    } catch (error) {
      console.error('获取活动列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshActivities = async (filters: ActivityFilters) => {
    await fetchActivities({ ...filters, page: 1 });
  };

  const deleteActivity = async (id: number) => {
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log('删除活动:', id);
      return true;
    } catch (error) {
      console.error('删除活动失败:', error);
      return false;
    }
  };

  const changeActivityStatus = async (id: number, status: string) => {
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 300));
      console.log('更改活动状态:', id, status);
      return true;
    } catch (error) {
      console.error('更改活动状态失败:', error);
      return false;
    }
  };

  return {
    activities,
    loading,
    pagination,
    fetchActivities,
    refreshActivities,
    deleteActivity,
    changeActivityStatus
  };
};
