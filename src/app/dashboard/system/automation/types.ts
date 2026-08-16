import type {
  AutomationTask,
  AutomationTaskType,
  AutomationTaskFormData,
  AutomationTaskUpdateData,
  AutomationTaskRun,
} from '@/service/api/automation';

export type { AutomationTask, AutomationTaskType, AutomationTaskFormData, AutomationTaskUpdateData, AutomationTaskRun };

export interface AutomationComposeState {
  open: boolean;
  mode: 'create' | 'edit';
  editing: AutomationTask | null;
}

export interface RunsFilterState {
  task_id: number | 'all';
  status: 'all' | 'running' | 'success' | 'failed';
}
