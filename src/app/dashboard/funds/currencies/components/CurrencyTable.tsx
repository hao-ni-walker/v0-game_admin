'use client';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/table/data-table';
import { ActionDropdown } from '@/components/table/action-dropdown';
import { TABLE_COLUMNS } from '../constants';
import type { Currency } from '../types';

interface Props {
  data: Currency[];
  loading: boolean;
  canWrite: boolean;
  selectedIds: number[];
  onSelect: (c: Currency, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onEdit: (c: Currency) => void;
  onToggle: (c: Currency) => void;
  onDelete: (c: Currency) => void;
}

export function CurrencyTable({
  data,
  loading,
  canWrite,
  selectedIds,
  onSelect,
  onSelectAll,
  onEdit,
  onToggle,
  onDelete,
}: Props) {
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

  const selectedVisible = data.filter((c) => selectedIds.includes(c.id)).length;
  const allSelected = data.length > 0 && selectedVisible === data.length;
  const someSelected = selectedVisible > 0 && !allSelected;

  const columnsWithSelection = canWrite
    ? [
        {
          key: 'selection',
          title: (
            <Checkbox
              aria-label='全选'
              checked={allSelected ? true : someSelected ? 'indeterminate' : false}
              onCheckedChange={(checked) => onSelectAll(checked === true)}
            />
          ),
          className: 'w-10',
          render: (_v: unknown, row: Currency) => (
            <Checkbox
              aria-label={`选择 ${row.code}`}
              checked={selectedIds.includes(row.id)}
              onCheckedChange={(checked) => onSelect(row, checked === true)}
            />
          ),
        },
        ...columns,
      ]
    : columns;

  return (
    <DataTable
      columns={columnsWithSelection}
      data={data}
      loading={loading}
      rowKey='id'
      emptyText='暂无币种'
    />
  );
}
