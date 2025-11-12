import React from 'react';
import { Edit, Eye, Copy, Check, AlertTriangle, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/table/data-table';
import {
  ActionDropdown,
  type ActionItem,
  type DeleteAction
} from '@/components/table/action-dropdown';
import { formatDateTime } from '@/components/table/utils';
import { toast } from 'sonner';
import { VipLevel, PaginationInfo } from '../types';
import { TABLE_COLUMNS, MESSAGES } from '../constants';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

interface VipLevelTableProps {
  vipLevels: VipLevel[];
  loading: boolean;
  pagination: PaginationInfo;
  onEdit: (vipLevel: VipLevel) => void;
  onView: (vipLevel: VipLevel) => void;
  onDelete: (vipLevel: VipLevel) => void;
  onToggleDisabled: (vipLevel: VipLevel) => void;
  emptyState?: EmptyStateProps;
}

/**
 * VIP等级表格组件
 */
export function VipLevelTable({
  vipLevels,
  loading,
  pagination,
  onEdit,
  onView,
  onDelete,
  onToggleDisabled,
  emptyState
}: VipLevelTableProps) {
  // 复制ID
  const handleCopyId = (id: number) => {
    navigator.clipboard.writeText(String(id));
    toast.success('ID已复制');
  };

  // 格式化金额（保留两位小数）
  const formatCurrency = (value: number | null): string => {
    if (value === null) return '-';
    return value.toFixed(2);
  };

  // 格式化佣金比例（保留四位小数并转换为百分比）
  const formatCommissionRate = (rate: number): string => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  // 格式化权益数据
  const formatBenefits = (benefits: Record<string, any> | null): string => {
    if (!benefits || Object.keys(benefits).length === 0) return '-';
    const count = Object.keys(benefits).length;
    return `${count}项权益`;
  };

  // 表格列配置
  const columns = TABLE_COLUMNS.map((col) => {
    if (col.key === 'index') {
      return {
        ...col,
        render: (value: any, record: VipLevel, index: number) => {
          return (pagination.page - 1) * pagination.page_size + index + 1;
        }
      };
    }

    if (col.key === 'id') {
      return {
        ...col,
        render: (value: number) => {
          return (
            <div className='flex items-center justify-center gap-1'>
              <span className='truncate font-mono text-xs'>{value}</span>
              <Copy
                className='h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground'
                onClick={() => handleCopyId(value)}
              />
            </div>
          );
        }
      };
    }

    if (col.key === 'level') {
      return {
        ...col,
        render: (value: number) => {
          return (
            <div className='flex items-center justify-center gap-1'>
              <Crown className='h-3.5 w-3.5 text-amber-500' />
              <span className='font-semibold'>{value}</span>
            </div>
          );
        }
      };
    }

    if (col.key === 'name') {
      return {
        ...col,
        render: (value: string) => {
          return <span className='font-medium'>{value}</span>;
        }
      };
    }

    if (col.key === 'required_exp') {
      return {
        ...col,
        render: (value: number) => {
          return <span className='font-mono text-xs'>{value.toLocaleString()}</span>;
        }
      };
    }

    if (col.key === 'upgrade_reward') {
      return {
        ...col,
        render: (value: number | null) => {
          return (
            <span className='font-mono text-xs'>{value !== null ? formatCurrency(value) : '-'}</span>
          );
        }
      };
    }

    if (col.key === 'daily_reward') {
      return {
        ...col,
        render: (value: number | null) => {
          return (
            <span className='font-mono text-xs'>{value !== null ? formatCurrency(value) : '-'}</span>
          );
        }
      };
    }

    if (col.key === 'withdraw_limits') {
      return {
        ...col,
        render: (value: any, record: VipLevel) => {
          const dailyLimit = record.withdraw_daily_limit;
          const amountLimit = record.withdraw_amount_limit;
          
          if (dailyLimit === null && amountLimit === null) {
            return <span className='text-xs text-muted-foreground'>系统默认</span>;
          }

          return (
            <div className='space-y-0.5 text-xs'>
              {dailyLimit !== null && (
                <div className='text-muted-foreground'>
                  次数: <span className='font-mono'>{dailyLimit}</span>
                </div>
              )}
              {amountLimit !== null && (
                <div className='text-muted-foreground'>
                  金额: <span className='font-mono'>{formatCurrency(amountLimit)}</span>
                </div>
              )}
            </div>
          );
        }
      };
    }

    if (col.key === 'commission_rate') {
      return {
        ...col,
        render: (value: number) => {
          return <span className='font-mono text-xs'>{formatCommissionRate(value)}</span>;
        }
      };
    }

    if (col.key === 'disabled') {
      return {
        ...col,
        render: (value: boolean) => {
          return value ? (
            <Badge variant='destructive' className='text-xs'>
              已禁用
            </Badge>
          ) : (
            <Badge variant='outline' className='text-xs'>
              正常
            </Badge>
          );
        }
      };
    }

    if (col.key === 'version') {
      return {
        ...col,
        render: (value: number) => {
          return <span className='font-mono text-xs'>{value}</span>;
        }
      };
    }

    if (col.key === 'updated_at') {
      return {
        ...col,
        render: (value: string) => {
          return <span className='font-mono text-xs'>{formatDateTime(value)}</span>;
        }
      };
    }

    if (col.key === 'actions') {
      return {
        ...col,
        render: (value: any, record: VipLevel) => {
          const actions: ActionItem[] = [
            {
              key: 'view',
              label: '查看详情',
              icon: <Eye className='mr-2 h-4 w-4' />,
              onClick: () => onView(record)
            },
            {
              key: 'edit',
              label: '编辑',
              icon: <Edit className='mr-2 h-4 w-4' />,
              onClick: () => onEdit(record)
            }
          ];

          // 禁用/启用
          if (record.disabled) {
            actions.push({
              key: 'enable',
              label: '启用',
              icon: <Check className='mr-2 h-4 w-4' />,
              onClick: () => onToggleDisabled(record)
            });
          } else {
            actions.push({
              key: 'disable',
              label: '禁用',
              icon: <AlertTriangle className='mr-2 h-4 w-4' />,
              onClick: () => onToggleDisabled(record)
            });
          }

          const deleteAction: DeleteAction = {
            description: MESSAGES.CONFIRM.DELETE(record.name),
            onConfirm: () => onDelete(record)
          };

          return <ActionDropdown actions={actions} deleteAction={deleteAction} />;
        }
      };
    }

    return col;
  });

  return (
    <DataTable
      columns={columns}
      data={vipLevels}
      loading={loading}
      emptyText={MESSAGES.EMPTY.VIP_LEVELS}
      emptyState={emptyState}
      rowKey='id'
    />
  );
}
