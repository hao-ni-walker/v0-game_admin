'use client';
import { useEffect, useCallback, useState } from 'react';
import { Timer } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Pagination } from '@/components/table/pagination';
import { usePermissions } from '@/hooks/use-permissions';
import {
  AutomationPageHeader,
  AutomationTaskTable,
  AutomationTaskDialog,
  AutomationRunsTable,
} from './components';
import { useAutomationTasks, useAutomationRuns } from './hooks';
import { MESSAGES } from './constants';
import type { AutomationTask, AutomationTaskFormData, AutomationTaskUpdateData } from './types';

const RUNS_PAGE_SIZE = 10;

export default function AutomationPage() {
  const {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    runTask,
    compose,
    openCreate,
    openEdit,
    closeCompose,
  } = useAutomationTasks();
  const runs = useAutomationRuns();

  const { hasPermission } = usePermissions();
  const canWrite = hasPermission('automation:write');

  const [activeTab, setActiveTab] = useState<'tasks' | 'runs'>('tasks');

  const refreshAll = useCallback(() => {
    fetchTasks();
    runs.fetchRuns(runs.page, runs.filters);
  }, [fetchTasks, runs]);

  useEffect(() => {
    fetchTasks();
    runs.fetchRuns(1, runs.filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = useCallback(
    async (t: AutomationTask) => {
      const ok = await toggleTask(t);
      if (ok) fetchTasks();
    },
    [toggleTask, fetchTasks]
  );

  const handleRun = useCallback(
    async (t: AutomationTask) => {
      const ok = await runTask(t);
      if (ok) {
        fetchTasks();
        setTimeout(() => runs.fetchRuns(1, { ...runs.filters, task_id: runs.filters.task_id === 'all' ? t.id : runs.filters.task_id }), 1500);
        setActiveTab('runs');
      }
    },
    [runTask, fetchTasks, runs]
  );

  const handleDelete = useCallback(
    async (t: AutomationTask) => {
      const ok = await deleteTask(t.id);
      if (ok) refreshAll();
    },
    [deleteTask, refreshAll]
  );

  const handleSubmit = useCallback(
    async (data: AutomationTaskFormData, reason: string) => {
      if (compose.mode === 'edit' && compose.editing) {
        const payload: AutomationTaskUpdateData = { ...data, version: compose.editing.version };
        const ok = await updateTask(compose.editing.id, payload, reason);
        if (ok) fetchTasks();
        return ok;
      }
      const ok = await createTask(data, reason);
      if (ok) fetchTasks();
      return ok;
    },
    [compose, createTask, updateTask, fetchTasks]
  );

  return (
    <PermissionGuard permissions='automation:read'>
      <PageContainer scrollable={false}>
        <div className='flex h-[calc(100vh-8rem)] w-full flex-col space-y-4'>
          <AutomationPageHeader onRefresh={refreshAll} onCreate={openCreate} loading={loading} canWrite={canWrite} />

          <div className='flex items-center gap-1 border-b pb-px'>
            <button
              className={`cursor-pointer px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'tasks'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('tasks')}
            >
              任务列表
            </button>
            <button
              className={`cursor-pointer px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'runs'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('runs')}
            >
              执行历史
            </button>
          </div>

          {activeTab === 'tasks' ? (
            <div className='min-h-0 flex-1'>
              {tasks.length === 0 && !loading ? (
                <div className='flex h-full flex-col items-center justify-center space-y-3 p-8'>
                  <Timer className='text-muted-foreground h-12 w-12' />
                  <p className='text-lg font-medium'>{MESSAGES.EMPTY}</p>
                </div>
              ) : (
                <AutomationTaskTable
                  data={tasks}
                  loading={loading}
                  canWrite={canWrite}
                  onEdit={openEdit}
                  onToggle={handleToggle}
                  onRun={handleRun}
                  onDelete={handleDelete}
                />
              )}
            </div>
          ) : (
            <div className='flex min-h-0 flex-1 flex-col gap-3'>
              <div className='min-h-0 flex-1'>
                <AutomationRunsTable
                  runs={runs.runs}
                  tasks={tasks}
                  filters={runs.filters}
                  loading={runs.loading}
                  onFilter={runs.applyFilters}
                />
              </div>
              <Pagination
                pagination={{
                  page: runs.page,
                  limit: RUNS_PAGE_SIZE,
                  total: runs.total,
                  totalPages: runs.totalPages,
                }}
                onPageChange={runs.changePage}
                onPageSizeChange={() => {}}
                showPageSizeSelector={false}
              />
            </div>
          )}

          <AutomationTaskDialog
            open={compose.open}
            mode={compose.mode}
            editing={compose.editing}
            onOpenChange={(open) => { if (!open) closeCompose(); }}
            onSubmit={handleSubmit}
          />
        </div>
      </PageContainer>
    </PermissionGuard>
  );
}
