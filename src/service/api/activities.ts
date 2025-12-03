import { apiRequest, buildSearchParams } from './base';
import { Activity } from '@/repository/models';

// 活动筛选参数
export interface ActivityListParams {
  id?: number;
  activity_code?: string;
  name?: string;
  activity_type?: string;
  status_in?: string; // 逗号分隔的状态列表，如 "active,paused"
  start_time_start?: string;
  start_time_end?: string;
  end_time_start?: string;
  end_time_end?: string;
  display_time_active?: boolean;
  has_active_trigger?: boolean;
  sort_by?: string; // id, start_time, end_time, created_at, priority, status
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

// 活动列表响应
export interface ActivityListResponse {
  code: number;
  message: string;
  data: {
    items: Activity[];
    total: number;
    page: number;
    page_size: number;
  };
}

// 活动详情响应
export interface ActivityDetailResponse {
  code: number;
  message: string;
  data: Activity;
}

// 创建活动参数
export interface CreateActivityParams {
  activity_code: string;
  activity_type: string;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  display_start_time?: string;
  display_end_time?: string;
  status?: string;
  priority?: number;
  participation_config?: Record<string, unknown>;
  extra_config?: Record<string, unknown>;
  icon_url?: string;
  banner_url?: string;
}

// 更新活动参数
export interface UpdateActivityParams extends Partial<CreateActivityParams> {
  id: number;
}

// 更新活动状态参数
export interface UpdateActivityStatusParams {
  id: number;
  status: string;
}

// 触发规则相关类型
export interface EventActivityTrigger {
  id: number;
  activity_id: number;
  event_type: string;
  match_criteria: Record<string, unknown>;
  trigger_mode: 'enqueue' | 'immediate' | 'suppress';
  reward_items: Record<string, unknown>;
  cooldown_seconds?: number | null;
  daily_limit_per_user?: number | null;
  total_limit?: number | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 触发规则列表响应
export interface TriggerListResponse {
  code: number;
  message: string;
  data: {
    items: EventActivityTrigger[];
    total: number;
  };
}

// 创建触发规则参数
export interface CreateTriggerParams {
  activity_id: number;
  event_type: string;
  match_criteria: Record<string, unknown>;
  trigger_mode: 'enqueue' | 'immediate' | 'suppress';
  reward_items: Record<string, unknown>;
  cooldown_seconds?: number | null;
  daily_limit_per_user?: number | null;
  total_limit?: number | null;
  priority?: number;
  is_active?: boolean;
}

// 更新触发规则参数
export interface UpdateTriggerParams extends Partial<CreateTriggerParams> {
  id: number;
}

// 更新触发规则状态参数
export interface UpdateTriggerStatusParams {
  id: number;
  is_active: boolean;
}

// 活动统计响应
export interface ActivityStatisticsResponse {
  code: number;
  message: string;
  data: {
    total_participants: number;
    total_rewards_given: number;
    participants_7d: number;
    rewards_7d: number;
    [key: string]: unknown;
  };
}

// 活动管理 API
export class ActivityAPI {
  // 获取活动列表
  static async getActivities(
    params?: ActivityListParams
  ): Promise<ActivityListResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiRequest(
      `/admin/activities${searchParams ? `?${searchParams}` : ''}`
    );
  }

  // 获取活动详情
  static async getActivity(id: number): Promise<ActivityDetailResponse> {
    return apiRequest(`/admin/activities/${id}`);
  }

  // 创建活动
  static async createActivity(
    data: CreateActivityParams
  ): Promise<ActivityDetailResponse> {
    return apiRequest('/admin/activities', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 更新活动
  static async updateActivity(
    id: number,
    data: Partial<CreateActivityParams>
  ): Promise<ActivityDetailResponse> {
    return apiRequest(`/admin/activities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // 更新活动状态
  static async updateActivityStatus(
    id: number,
    status: string
  ): Promise<{ code: number; message: string; data: Activity }> {
    return apiRequest(`/admin/activities/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // 获取活动触发规则列表
  static async getTriggers(
    activityId: number
  ): Promise<TriggerListResponse> {
    return apiRequest(`/admin/activities/${activityId}/triggers`);
  }

  // 创建触发规则
  static async createTrigger(
    activityId: number,
    data: CreateTriggerParams
  ): Promise<{ code: number; message: string; data: EventActivityTrigger }> {
    return apiRequest(`/admin/activities/${activityId}/triggers`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 更新触发规则
  static async updateTrigger(
    triggerId: number,
    data: Partial<CreateTriggerParams>
  ): Promise<{ code: number; message: string; data: EventActivityTrigger }> {
    return apiRequest(`/admin/event-triggers/${triggerId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // 更新触发规则状态
  static async updateTriggerStatus(
    triggerId: number,
    isActive: boolean
  ): Promise<{ code: number; message: string; data: EventActivityTrigger }> {
    return apiRequest(`/admin/event-triggers/${triggerId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive })
    });
  }

  // 获取活动统计信息（可选）
  static async getStatistics(
    activityId: number
  ): Promise<ActivityStatisticsResponse> {
    return apiRequest(`/admin/activities/${activityId}/statistics`);
  }
}

