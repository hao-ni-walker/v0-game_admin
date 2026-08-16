'use client';
import { useState } from 'react';
import { FileClock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/table/data-table';
import { RUNS_TABLE_COLUMNS, STATUS_BADGES, TRIGGER_LABELS } from '../constants';
import type { AutomationTask, AutomationTaskRun, RunsFilterState } from '../types';
import { fmtTime } from './AutomationTaskTable';

interface Props {
  runs: AutomationTaskRun[];
  tasks: AutomationTask[];
  filters: RunsFilterState;
  loading: boolean;
  onFilter: (next: Partial<RunsFilterState>) => void;
}

const STATUS_OPTIONS = [
  { label: '全部状态', value: 'all' as const },
  { label: '运行中', value: 'running' as const },
  { label: '成功', value: 'success' as const },
  { label: '失败', value: 'failed' as const },
];

export function AutomationRunsTable({ runs, tasks, filters, loading, onFilter }: Props) {
  const [detail, setDetail] = useState<AutomationTaskRun | null>(null);

  const columns = RUNS_TABLE_COLUMNS.map((col) => {
    if (col.key === 'status') {
      return {
        ...col,
        render: (_v: unknown, row: AutomationTaskRun) => {
          const badge = STATUS_BADGES[row.status] || { label: row.status, variant: 'secondary' as const };
          return <Badge variant={badge.variant}>{badge.label}</Badge>;
        },
      };
    }
    if (col.key === 'trigger') {
      return {
        ...col,
        render: (_v: unknown, row: AutomationTaskRun) => TRIGGER_LABELS[row.trigger] || row.trigger,
      };
    }
    if (col.key === 'started_at') {
      return { ...col, render: (_v: unknown, row: AutomationTaskRun) => fmtTime(row.started_at) };
    }
    if (col.key === 'duration_ms') {
      return {
        ...col,
        render: (_v: unknown, row: AutomationTaskRun) =>
          row.duration_ms != null ? `${(row.duration_ms / 1000).toFixed(1)}s` : '—',
      };
    }
    if (col.key === 'artifacts') {
      return {
        ...col,
        render: (_v: unknown, row: AutomationTaskRun) =>
          row.artifacts?.length ? (
            <span className='text-xs' title={row.artifacts.map((a) => a.r2_key).join('\n')}>
              📦 {row.artifacts.length} 个
            </span>
          ) : (
            '—'
          ),
      };
    }
    if (col.key === 'actions') {
      return {
        ...col,
        render: (_v: unknown, row: AutomationTaskRun) => (
          <Button variant='ghost' size='sm' className='cursor-pointer' onClick={() => setDetail(row)}>
            <FileClock className='mr-1 h-4 w-4' />
            查看
          </Button>
        ),
      };
    }
    return col;
  });

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-center gap-2'>
        <Select
          value={filters.task_id === 'all' ? 'all' : String(filters.task_id)}
          onValueChange={(v) => onFilter({ task_id: v === 'all' ? 'all' : Number(v) })}
        >
          <SelectTrigger className='w-[220px]'>
            <SelectValue placeholder='全部任务' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>全部任务</SelectItem>
            {tasks.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.status} onValueChange={(v) => onFilter({ status: v as RunsFilterState['status'] })}>
          <SelectTrigger className='w-[140px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={columns} data={runs} loading={loading} rowKey='id' emptyText='暂无执行记录' />

      <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className='sm:max-w-[720px]'>
          <DialogHeader>
            <DialogTitle>
              执行记录 #{detail?.id} — {detail?.task_name || `任务 ${detail?.task_id}`}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <div className='text-muted-foreground flex flex-wrap gap-x-6 gap-y-1 text-sm'>
              <span>状态：{detail ? (STATUS_BADGES[detail.status]?.label || detail.status) : ''}</span>
              <span>触发：{detail ? (TRIGGER_LABELS[detail.trigger] || detail.trigger) : ''}</span>
              <span>开始：{fmtTime(detail?.started_at)}</span>
              <span>耗时：{detail?.duration_ms != null ? `${(detail.duration_ms / 1000).toFixed(1)}s` : '—'}</span>
            </div>
            {detail?.artifacts?.length ? (
              <div className='rounded-md border p-3 text-xs'>
                <p className='mb-1 font-medium'>已上传产物</p>
                {detail.artifacts.map((a, i) => (
                  <p key={i} className='font-mono break-all'>
                    {a.r2_key}
                    {a.size != null ? `（${(a.size / 1024 / 1024).toFixed(2)} MB）` : ''}
                  </p>
                ))}
              </div>
            ) : null}
            {detail?.error && (
              <div className='rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950'>
                <p className='mb-1 text-sm font-medium text-red-600 dark:text-red-400'>错误</p>
                <pre className='max-h-60 overflow-auto whitespace-pre-wrap break-all text-xs'>{detail.error}</pre>
              </div>
            )}
            <div>
              <p className='mb-1 text-sm font-medium'>输出</p>
              <pre className='bg-muted max-h-72 overflow-auto rounded-md p-3 text-xs whitespace-pre-wrap break-all'>
                {detail?.output || '（无输出）'}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
