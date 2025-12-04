import React, { useState, useMemo } from 'react';
import { Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/table/data-table';
import {
  ActionDropdown,
  type ActionItem,
  type DeleteAction
} from '@/components/table/action-dropdown';
import { formatDateTime } from '@/components/table/utils';
import { Permission, PaginationInfo } from '../types';
import { TABLE_COLUMNS, MESSAGES } from '../constants';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

interface PermissionTableProps {
  /** 权限数据列表 */
  permissions: Permission[];
  /** 加载状态 */
  loading: boolean;
  /** 分页信息 */
  pagination: PaginationInfo;
  /** 编辑权限回调 */
  onEdit: (permission: Permission) => void;
  /** 删除权限回调 */
  onDelete: (permission: Permission) => void;
  /** 批量删除回调 */
  onBatchDelete?: (ids: number[]) => void;
  /** 父级权限映射（用于显示父级名称） */
  parentMap?: Map<number, Permission>;
  /** 空状态配置 */
  emptyState?: EmptyStateProps;
}

/**
 * 权限表格组件
 * 负责展示权限列表数据和操作按钮
 */
export function PermissionTable({
  permissions,
  loading,
  pagination,
  onEdit,
  onDelete,
  onBatchDelete,
  parentMap,
  emptyState
}: PermissionTableProps) {
  // 批量选择状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  // 获取父级权限ID（兼容新旧字段名）
  const getParentId = (perm: Permission): number | null => {
    return perm.parent_id ?? perm.parentId ?? null;
  };

  // 获取排序值（兼容新旧字段名）
  const getSortOrder = (perm: Permission): number => {
    return perm.sort_order ?? perm.sortOrder ?? 0;
  };

  // 获取创建时间（兼容新旧字段名）
  const getCreatedAt = (perm: Permission): string => {
    return perm.created_at ?? perm.createdAt ?? '';
  };

  // 获取更新时间（兼容新旧字段名）
  const getUpdatedAt = (perm: Permission): string => {
    return perm.updated_at ?? perm.updatedAt ?? '';
  };

  // 获取父级权限名称
  const getParentName = (perm: Permission): string => {
    const parentId = getParentId(perm);
    if (!parentId || !parentMap) return '-';
    const parent = parentMap.get(parentId);
    return parent ? parent.name : '-';
  };

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(permissions.map((p) => p.id));
    } else {
      setSelectedRowKeys([]);
    }
  };

  // 单选
  const handleSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRowKeys([...selectedRowKeys, id]);
    } else {
      setSelectedRowKeys(selectedRowKeys.filter((key) => key !== id));
    }
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (onBatchDelete && selectedRowKeys.length > 0) {
      onBatchDelete(selectedRowKeys);
      setSelectedRowKeys([]);
    }
  };

  // 是否全选
  const isAllSelected = useMemo(() => {
    return (
      permissions.length > 0 && selectedRowKeys.length === permissions.length
    );
  }, [permissions.length, selectedRowKeys.length]);

  // 是否部分选中
  const isIndeterminate = useMemo(() => {
    return (
      selectedRowKeys.length > 0 && selectedRowKeys.length < permissions.length
    );
  }, [selectedRowKeys.length, permissions.length]);

  // 表格列配置
  const columns = TABLE_COLUMNS.map((col) => {
    if (col.key === 'index') {
      return {
        ...col,
        render: (value: any, record: Permission, index: number) => {
          // 计算全局序号：(当前页 - 1) * 每页大小 + 当前索引 + 1
          return (pagination.page - 1) * pagination.limit + index + 1;
        }
      };
    }

    if (col.key === 'code') {
      return {
        ...col,
        render: (value: string) => (
          <Badge variant='outline' className='font-mono text-xs'>
            {value}
          </Badge>
        )
      };
    }

    if (col.key === 'parent_id') {
      return {
        ...col,
        render: (value: any, record: Permission) => {
          const parentName = getParentName(record);
          return (
            <span className='text-muted-foreground text-sm'>{parentName}</span>
          );
        }
      };
    }

    if (col.key === 'sort_order') {
      return {
        ...col,
        render: (value: any, record: Permission) => {
          const sortOrder = getSortOrder(record);
          return <span className='font-mono text-sm'>{sortOrder}</span>;
        }
      };
    }

    if (col.key === 'created_at') {
      return {
        ...col,
        render: (value: any, record: Permission) => {
          const createdAt = getCreatedAt(record);
          return createdAt ? (
            <span className='font-mono text-sm'>
              {formatDateTime(createdAt)}
            </span>
          ) : (
            <span className='text-muted-foreground text-sm'>-</span>
          );
        }
      };
    }

    if (col.key === 'updated_at') {
      return {
        ...col,
        render: (value: any, record: Permission) => {
          const updatedAt = getUpdatedAt(record);
          return updatedAt ? (
            <span className='font-mono text-sm'>
              {formatDateTime(updatedAt)}
            </span>
          ) : (
            <span className='text-muted-foreground text-sm'>-</span>
          );
        }
      };
    }

    if (col.key === 'actions') {
      return {
        ...col,
        render: (value: any, record: Permission) => {
          const actions: ActionItem[] = [
            {
              key: 'edit',
              label: '编辑',
              icon: <Edit className='mr-2 h-4 w-4' />,
              onClick: () => onEdit(record)
            }
          ];

          const deleteAction: DeleteAction = {
            description: MESSAGES.CONFIRM.DELETE(record.name),
            onConfirm: () => onDelete(record)
          };

          return (
            <ActionDropdown actions={actions} deleteAction={deleteAction} />
          );
        }
      };
    }

    return col;
  });

  // 添加选择列
  const columnsWithSelection = [
    {
      key: 'selection',
      title: (
        <div className='flex items-center gap-2'>
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={handleSelectAll}
            ref={(el) => {
              if (el) {
                el.indeterminate = isIndeterminate;
              }
            }}
          />
          {onBatchDelete && selectedRowKeys.length > 0 && (
            <Button
              variant='destructive'
              size='sm'
              onClick={handleBatchDelete}
              className='h-7 text-xs'
            >
              批量删除 ({selectedRowKeys.length})
            </Button>
          )}
        </div>
      ),
      className: 'w-[120px]',
      render: (value: any, record: Permission) => (
        <Checkbox
          checked={selectedRowKeys.includes(record.id)}
          onCheckedChange={(checked) =>
            handleSelect(record.id, checked === true)
          }
        />
      )
    },
    ...columns
  ];

  return (
    <div className='space-y-2'>
      {onBatchDelete && selectedRowKeys.length > 0 && (
        <div className='bg-muted/50 flex items-center justify-between rounded-md border px-4 py-2'>
          <span className='text-sm'>
            已选择 <strong>{selectedRowKeys.length}</strong> 项
          </span>
          <Button variant='destructive' size='sm' onClick={handleBatchDelete}>
            批量删除
          </Button>
        </div>
      )}
      <DataTable
        columns={columnsWithSelection}
        data={permissions}
        loading={loading}
        emptyText={MESSAGES.EMPTY.PERMISSIONS}
        emptyState={emptyState}
        rowKey='id'
      />
    </div>
  );
}
