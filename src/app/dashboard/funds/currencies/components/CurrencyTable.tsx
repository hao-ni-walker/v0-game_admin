'use client';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/table/data-table';
import { ActionDropdown } from '@/components/table/action-dropdown';
import { TABLE_COLUMNS } from '../constants';
import type { Currency } from '../types';

interface Props {
  data: Currency[];
  loading: boolean;
  canWrite: boolean;
  onEdit: (c: Currency) => void;
  onToggle: (c: Currency) => void;
  onDelete: (c: Currency) => void;
}

export function CurrencyTable({ data, loading, canWrite, onEdit, onToggle, onDelete }: Props) {
  const columns = TABLE_COLUMNS.map((col) => {
    if (col.key === 'is_tradeable') {
      return {
        ...col,
        render: (_v: unknown, row: Currency) => (
          <Badge variant={row.is_tradeable ? 'default' : 'secondary'}>
            {row.is_tradeable ? '可交易' : '已停用'}
          </Badge>
        ),
      };
    }
    if (['is_depositable', 'is_withdrawable'].includes(col.key)) {
      return {
        ...col,
        render: (_v: unknown, row: Currency) => (row[col.key as keyof Currency] ? '是' : '否'),
      };
    }
    if (col.key === 'actions') {
      return {
        ...col,
        render: (_v: unknown, row: Currency) =>
          canWrite ? (
            <ActionDropdown
              actions={[
                { key: 'edit', label: '编辑', onClick: () => onEdit(row) },
                {
                  key: 'toggle',
                  label: row.is_tradeable ? '停用交易' : '激活交易',
                  onClick: () => onToggle(row),
                },
              ]}
              deleteAction={{ description: `确认删除 ${row.code}？`, onConfirm: () => onDelete(row) }}
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
      emptyText='暂无币种'
    />
  );
}
