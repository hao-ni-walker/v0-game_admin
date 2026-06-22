'use client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/table/data-table';
import { PERIODS, PERIOD_LABELS } from '../constants';
import type { OddsConfig, ResolvedPeriod } from '../types';

interface Props {
  resolved: ResolvedPeriod[];
  configs: OddsConfig[];
  loading: boolean;
  canWrite: boolean;
  onEditBase: (period: string) => void;
}

interface BaseRow {
  period: string;
  label: string;
  base: number | null;
  effective: ResolvedPeriod | undefined;
}

export function BaseOddsTable({ resolved, configs, loading, canWrite, onEditBase }: Props) {
  const resolvedByPeriod = new Map(resolved.map((r) => [r.period, r]));
  const baseByPeriod = new Map(
    configs.filter((c) => c.is_base).map((c) => [c.period, c])
  );

  const rows: BaseRow[] = PERIODS.map((period) => ({
    period,
    label: PERIOD_LABELS[period],
    base: baseByPeriod.get(period)?.payout_percent ?? null,
    effective: resolvedByPeriod.get(period),
  }));

  const columns = [
    { key: 'label', title: '周期' },
    {
      key: 'base',
      title: '基础赔率',
      render: (_v: unknown, row: BaseRow) =>
        row.base !== null ? (
          `${row.base}%`
        ) : (
          <span className='text-muted-foreground'>未配置</span>
        ),
    },
    {
      key: 'effective',
      title: '当前生效赔率',
      render: (_v: unknown, row: BaseRow) =>
        row.effective ? (
          <div className='flex items-center gap-2'>
            <span>{row.effective.payout_percent}%</span>
            {row.effective.is_available ? (
              <Badge variant='default'>生效中</Badge>
            ) : (
              <Badge variant='secondary'>{row.effective.reason || '未生效'}</Badge>
            )}
          </div>
        ) : (
          <span className='text-muted-foreground'>—</span>
        ),
    },
    {
      key: 'actions',
      title: '操作',
      render: (_v: unknown, row: BaseRow) =>
        canWrite ? (
          <Button
            size='sm'
            variant='outline'
            onClick={() => onEditBase(row.period)}
            className='cursor-pointer'
          >
            编辑基础
          </Button>
        ) : (
          <span className='text-muted-foreground text-sm'>—</span>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      loading={loading}
      rowKey='period'
      emptyText='暂无周期'
      stickyHeader={false}
    />
  );
}
