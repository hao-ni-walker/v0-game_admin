'use client';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/table/data-table';
import { ActionDropdown } from '@/components/table/action-dropdown';
import { TABLE_COLUMNS, FEE_TYPE_LABELS } from '../constants';
import type { FeeConfig, Currency } from '../types';

interface Props {
  data: FeeConfig[];
  loading: boolean;
  canWrite: boolean;
  currencies: Currency[];
  onEdit: (f: FeeConfig) => void;
  onDelete: (f: FeeConfig) => void;
}

function fmt(ts: string | null): string {
  if (!ts) return '永久';
  try { return new Date(ts).toLocaleString(); } catch { return ts; }
}

function targetLabel(f: FeeConfig, currencies: Currency[]): string {
  if (f.scope_type === 'currency') {
    const c = currencies.find((x) => x.id === f.currency_id);
    return c ? `${c.code}` : `#${f.currency_id}`;
  }
  if (f.scope_type === 'user') return `用户 #${f.user_id}`;
  return '—';
}

export function FeeTable({ data, loading, canWrite, currencies, onEdit, onDelete }: Props) {
  const columns = TABLE_COLUMNS.map((col) => {
    if (col.key === 'fee_type') return { ...col, render: (_v: unknown, r: FeeConfig) => FEE_TYPE_LABELS[r.fee_type] ?? r.fee_type };
    if (col.key === 'target') return { ...col, render: (_v: unknown, r: FeeConfig) => targetLabel(r, currencies) };
    if (col.key === 'fee_rate') return { ...col, render: (_v: unknown, r: FeeConfig) => `${(r.fee_rate * 100).toFixed(2)}%` };
    if (col.key === 'window') return { ...col, render: (_v: unknown, r: FeeConfig) => `${fmt(r.effective_from)} ~ ${fmt(r.effective_to)}` };
    if (col.key === 'is_active') return { ...col, render: (_v: unknown, r: FeeConfig) => (r.is_active ? <Badge variant='default'>启用</Badge> : <Badge variant='secondary'>停用</Badge>) };
    if (col.key === 'actions') {
      return {
        ...col,
        render: (_v: unknown, r: FeeConfig) =>
          canWrite ? (
            <ActionDropdown
              actions={[{ key: 'edit', label: '编辑', onClick: () => onEdit(r) }]}
              deleteAction={{ description: `确认删除该 ${FEE_TYPE_LABELS[r.fee_type]} 费率配置？`, onConfirm: () => onDelete(r) }}
            />
          ) : (
            <span className='text-muted-foreground text-sm'>—</span>
          ),
      };
    }
    return col;
  });

  return <DataTable columns={columns} data={data} loading={loading} rowKey='id' emptyText='暂无费率配置' />;
}
