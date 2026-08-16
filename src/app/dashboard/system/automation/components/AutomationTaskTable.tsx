'use client';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DataTable } from '@/components/table/data-table';
import { ActionDropdown } from '@/components/table/action-dropdown';
import { STATUS_BADGES, TASK_TYPE_LABELS, TASK_TABLE_COLUMNS } from '../constants';
import type { AutomationTask } from '../types';

export function fmtTime(v: string | null | undefined): string {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('zh-CN', { hour12: false });
}

interface Props {
  data: AutomationTask[];
  loading: boolean;
  canWrite: boolean;
  onEdit: (t: AutomationTask) => void;
  onToggle: (t: AutomationTask) => void;
  onRun: (t: AutomationTask) => void;
  onDelete: (t: AutomationTask) => void;
}

export function AutomationTaskTable({ data, loading, canWrite, onEdit, onToggle, onRun, onDelete }: Props) {
  const columns = TASK_TABLE_COLUMNS.map((col) => {
    if (col.key === 'task_type') {
      return {
        ...col,
        render: (_v: unknown, row: AutomationTask) => (
          <Badge variant='outline'>{TASK_TYPE_LABELS[row.task_type] || row.task_type}</Badge>
        ),
      };
    }
    if (col.key === 'schedule') {
      return {
        ...col,
        render: (_v: unknown, row: AutomationTask) => (
          <div className='font-mono text-xs'>{row.schedule}</div>
        ),
      };
    }
    if (col.key === 'next_run_at') {
      return {
        ...col,
        render: (_v: unknown, row: AutomationTask) => (
          <span className={row.enabled ? '' : 'text-muted-foreground'}>
            {row.enabled ? fmtTime(row.next_run_at) : '已停用'}
          </span>
        ),
      };
    }
    if (col.key === 'last_status') {
      return {
        ...col,
        render: (_v: unknown, row: AutomationTask) => {
          if (!row.last_status) return <span className='text-muted-foreground text-sm'>未运行</span>;
          const badge = STATUS_BADGES[row.last_status] || { label: row.last_status, variant: 'secondary' as const };
          return (
            <Badge variant={badge.variant}>{badge.label}</Badge>
          );
        },
      };
    }
    if (col.key === 'enabled') {
      return {
        ...col,
        render: (_v: unknown, row: AutomationTask) => (
          <Switch
            checked={row.enabled}
            disabled={!canWrite}
            onCheckedChange={() => onToggle(row)}
          />
        ),
      };
    }
    if (col.key === 'actions') {
      return {
        ...col,
        render: (_v: unknown, row: AutomationTask) =>
          canWrite ? (
            <ActionDropdown
              actions={[
                { key: 'run', label: '立即运行', onClick: () => onRun(row) },
                { key: 'edit', label: '编辑', onClick: () => onEdit(row) },
                {
                  key: 'toggle',
                  label: row.enabled ? '停用' : '启用',
                  onClick: () => onToggle(row),
                },
              ]}
              deleteAction={{ description: `确认删除任务「${row.name}」？执行历史将一并删除。`, onConfirm: () => onDelete(row) }}
            />
          ) : (
            <span className='text-muted-foreground text-sm'>—</span>
          ),
      };
    }
    return col;
  });

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      rowKey='id'
      emptyText='暂无自动化任务'
    />
  );
}
