export interface Broadcast {
  broadcast_id: string;
  target_type: 'all' | 'vip_level' | 'user_list' | 'condition';
  target_config: Record<string, unknown>;
  category: string;
  template_type: string;
  priority: string;
  title: string;
  status:
    | 'awaiting_approval'
    | 'approved'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled';
  total_count: number;
  sent_count: number;
  failed_count: number;
  created_by: string | null;
  approved_by: string | null;
  created_at: number;
  completed_at: number | null;
}

export interface BroadcastPagination {
  page: number;
  size: number;
  total: number;
  has_more: boolean;
}

export interface BroadcastListResult {
  list: Broadcast[];
  pagination: BroadcastPagination;
}

export interface BroadcastFilters {
  status: string;
  page: number;
  page_size: number;
}
