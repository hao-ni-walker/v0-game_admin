import { apiRequest } from './base';

export type AutomationTaskType = 'db_backup' | 'daily_report' | 'shell' | 'python';

export interface AutomationTask {
  id: number;
  name: string;
  task_type: AutomationTaskType;
  schedule: string;
  enabled: boolean;
  params: Record<string, unknown>;
  timeout_seconds: number;
  notify_on_success: boolean;
  notify_on_failure: boolean;
  notify_chat_id: string | null;
  last_run_at: string | null;
  last_status: string | null;
  next_run_at: string | null;
  version: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface AutomationTaskListResult {
  items: AutomationTask[];
  total: number;
}

export interface AutomationTaskFormData {
  name: string;
  task_type: AutomationTaskType;
  schedule: string;
  enabled: boolean;
  params: Record<string, unknown>;
  timeout_seconds: number;
  notify_on_success: boolean;
  notify_on_failure: boolean;
  notify_chat_id?: string | null;
}

export interface AutomationTaskUpdateData extends AutomationTaskFormData {
  version: number;
}

export interface AutomationRunArtifact {
  r2_key?: string;
  size?: number;
}

export interface AutomationTaskRun {
  id: number;
  task_id: number;
  task_name: string | null;
  trigger: 'scheduled' | 'manual';
  status: 'running' | 'success' | 'failed';
  started_at: string | null;
  finished_at: string | null;
  duration_ms: number | null;
  output: string | null;
  error: string | null;
  artifacts: AutomationRunArtifact[];
}

export interface AutomationRunListResult {
  items: AutomationTaskRun[];
  total: number;
}

export const AutomationAPI = {
  getTasks() {
    return apiRequest<AutomationTaskListResult>('/admin/automation/tasks');
  },
  createTask(body: AutomationTaskFormData & { reason: string }) {
    return apiRequest<AutomationTask>('/admin/automation/tasks', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  updateTask(id: number, body: AutomationTaskUpdateData & { reason: string }) {
    return apiRequest<AutomationTask>(`/admin/automation/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },
  deleteTask(id: number) {
    return apiRequest<{ deleted: number }>(`/admin/automation/tasks/${id}`, {
      method: 'DELETE',
    });
  },
  toggleTask(id: number) {
    return apiRequest<AutomationTask>(`/admin/automation/tasks/${id}/toggle`, {
      method: 'POST',
    });
  },
  runTask(id: number) {
    return apiRequest<{
      task_id: number;
      run_id: number | null;
      triggered: boolean;
      message?: string | null;
    }>(`/admin/automation/tasks/${id}/run`, { method: 'POST' });
  },
  getRuns(params: { task_id?: number; status?: string; page?: number; page_size?: number } = {}) {
    const sp = new URLSearchParams();
    if (params.task_id !== undefined) sp.set('task_id', String(params.task_id));
    if (params.status) sp.set('status', params.status);
    if (params.page !== undefined) sp.set('page', String(params.page));
    if (params.page_size !== undefined) sp.set('page_size', String(params.page_size));
    const qs = sp.toString();
    return apiRequest<AutomationRunListResult>(`/admin/automation/runs${qs ? `?${qs}` : ''}`);
  },
  getRun(id: number) {
    return apiRequest<AutomationTaskRun>(`/admin/automation/runs/${id}`);
  },
};
