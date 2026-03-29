import { apiRequest, buildSearchParams } from './base';

export interface UserActivityRecord {
  user_id: number;
  username: string;
  email: string;
  activity_id: number;
  activity_display_name: string;
  status: string;
  participation_count: number;
  rewards_claimed: {
    amount: number;
    currency: string;
    trigger_context?: any;
    [key: string]: any;
  } | null;
  first_participation_time: string;
  last_participation_time: string;
  completed_at: string | null;
}

export interface UserActivityRecordFilters {
  user_id?: number;
  username?: string;
  email?: string;
  activity_id?: number;
  activity_name?: string;
  status?: string;
  participation_count_min?: number;
  participation_count_max?: number;
  start_time?: string;
  end_time?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface UserActivityRecordResponse {
  list: UserActivityRecord[];
  total: number;
  page: number;
  page_size: number;
}

export class UserActivityRecordsAPI {
  static async getRecords(
    filters: UserActivityRecordFilters
  ): Promise<{
    code: number;
    message?: string;
    data?: UserActivityRecordResponse;
  }> {
    const searchParams = buildSearchParams(filters);
    const url = `/admin/user-activity-records${searchParams ? `?${searchParams}` : ''}`;
    return apiRequest(url);
  }
}
