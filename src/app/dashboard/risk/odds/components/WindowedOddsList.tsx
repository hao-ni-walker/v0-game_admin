'use client';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/table/data-table';
import { ActionDropdown } from '@/components/table/action-dropdown';
import type { OddsConfig } from '../types';

interface Props {
  configs: OddsConfig[];
  loading: boolean;
  canWrite: boolean;
  onAdd: () => void;
  onDelete: (cfg: OddsConfig) => void;
}

function fmt(ts: string | null): string {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

export function WindowedOddsList({ configs, loading, canWrite, onAdd, onDelete }: Props) {
  const windowed = configs.filter((c) => !c.is_base);

  const columns = [
    { key: 'period', title: '周期' },
    {
      key: 'payout_percent',
      title: '赔率',
      render: (_v: unknown, r: OddsConfig) => `${r.payout_percent}%`,
    },
    { key: 'priority', title: '优先级' },
    {
      key: 'window',
      title: '生效区间',
      render: (_v: unknown, r: OddsConfig) => `${fmt(r.effective_from)} ~ ${fmt(r.effective_to)}`,
    },
    {
      key: 'is_active',
      title: '状态',
      render: (_v: unknown, r: OddsConfig) =>
        r.is_active ? (
          <Badge variant='default'>启用</Badge>
        ) : (
          <Badge variant='secondary'>停用</Badge>
        ),
    },
    {
      key: 'actions',
      title: '操作',
      render: (_v: unknown, r: OddsConfig) =>
        canWrite ? (
          <ActionDropdown
            actions={[]}
            deleteAction={{
              description: `确认删除该 ${r.period} 窗口赔率？`,
              onConfirm: () => onDelete(r),
            }}
          />
        ) : (
          <span className='text-muted-foreground text-sm'>—</span>
        ),
    },
  ];

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>窗口活动赔率</h2>
        {canWrite && (
          <Button size='sm' onClick={onAdd} disabled={loading} className='cursor-pointer'>
            <Plus className='mr-2 h-4 w-4' />
            添加窗口赔率
          </Button>
        )}
      </div>
      <DataTable
        columns={columns}
        data={windowed}
        loading={loading}
        rowKey='id'
        emptyText='暂无窗口赔率'
      />
    </div>
  );
}
