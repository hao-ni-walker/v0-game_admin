import React from 'react';
import { Edit, Copy, Globe, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/table/data-table';
import {
  ActionDropdown,
  type ActionItem
} from '@/components/table/action-dropdown';
import { formatDateTime } from '@/components/table/utils';
import { toast } from 'sonner';
import { SystemConfig, PaginationInfo } from '../types';
import { TABLE_COLUMNS, MESSAGES } from '../constants';
import {
  getCatalogEntry,
  catalogFields,
  getPathValue,
  formatFieldValue
} from '../field-catalog';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

interface SystemConfigTableProps {
  configs: SystemConfig[];
  loading: boolean;
  pagination: PaginationInfo;
  onEdit: (config: SystemConfig) => void;
  emptyState?: EmptyStateProps;
}

/** 表格「参数一览」最多直接展示的 chips 数，超出折叠为 +N */
const MAX_CHIPS = 6;

/**
 * 系统配置表格组件 — 按业务语言目录展示
 */
export function SystemConfigTable({
  configs,
  loading,
  pagination,
  onEdit,
  emptyState
}: SystemConfigTableProps) {
  // 复制配置值（原始 JSON/字符串）
  const handleCopyValue = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success('配置值已复制');
  };

  // 解析JSON值
  const parseValue = (value: string, type: string) => {
    if (type === 'json') {
      try {
        const parsed = JSON.parse(value);
        return JSON.stringify(parsed).substring(0, 60) + '...';
      } catch {
        return value;
      }
    }
    if (type === 'boolean') {
      return value === 'true' || value === '1' ? '是' : '否';
    }
    return value;
  };

  // 表格列配置
  const columns = TABLE_COLUMNS.map((col) => {
    if (col.key === 'index') {
      return {
        ...col,
        render: (value: any, record: SystemConfig, index: number) => {
          return (pagination.page - 1) * pagination.page_size + index + 1;
        }
      };
    }

    if (col.key === 'config_key') {
      return {
        ...col,
        render: (value: string) => {
          const entry = getCatalogEntry(value);
          return (
            <div className='space-y-1'>
              {entry ? (
                <>
                  <div className='flex flex-wrap items-center gap-1.5'>
                    <span className='text-sm leading-tight font-medium'>
                      {entry.name}
                    </span>
                    <Badge variant='outline' className='h-4 px-1.5 text-[10px]'>
                      {entry.category}
                    </Badge>
                    {!entry.live && (
                      <Badge
                        variant='destructive'
                        className='h-4 px-1.5 text-[10px]'
                      >
                        不生效
                      </Badge>
                    )}
                  </div>
                  <div className='text-muted-foreground font-mono text-[11px] break-all'>
                    {value}
                  </div>
                </>
              ) : (
                <div className='font-mono text-sm font-medium break-all'>
                  {value}
                </div>
              )}
            </div>
          );
        }
      };
    }

    if (col.key === 'config_value') {
      return {
        ...col,
        render: (value: string, record: SystemConfig) => {
          const entry = getCatalogEntry(record.config_key);
          let chips: { name: string; text: string }[] = [];
          let parseFailed = false;
          if (entry) {
            try {
              const parsed = JSON.parse(value);
              if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                chips = catalogFields(entry).flatMap((f) => {
                  const v = getPathValue(parsed, f.path);
                  return v === undefined ? [] : [{ name: f.name, text: formatFieldValue(v) }];
                });
              } else {
                parseFailed = true;
              }
            } catch {
              parseFailed = true;
            }
          }
          const shown = chips.slice(0, MAX_CHIPS);
          const rest = chips.length - shown.length;
          return (
            <div className='flex items-start gap-1'>
              <div className='flex flex-wrap gap-1'>
                {shown.map((c) => (
                  <span
                    key={c.name}
                    className='bg-muted inline-flex max-w-full items-center gap-1 rounded px-1.5 py-0.5 text-xs'
                    title={`${c.name} = ${c.text}`}
                  >
                    <span className='text-muted-foreground shrink-0'>{c.name}</span>
                    <span className='truncate font-mono'>{c.text}</span>
                  </span>
                ))}
                {rest > 0 && (
                  <button
                    type='button'
                    className='text-muted-foreground hover:text-foreground px-1 text-xs underline-offset-2 hover:underline'
                    onClick={() => onEdit(record)}
                    title='点击进入编辑查看全部参数'
                  >
                    +{rest} 项
                  </button>
                )}
                {!entry || parseFailed ? (
                  <span className='font-mono text-xs break-all'>
                    {parseValue(value, record.config_type)}
                  </span>
                ) : null}
              </div>
              <Copy
                className='text-muted-foreground hover:text-foreground mt-0.5 h-3 w-3 flex-shrink-0 cursor-pointer'
                onClick={() => handleCopyValue(value)}
              />
            </div>
          );
        }
      };
    }

    if (col.key === 'description') {
      return {
        ...col,
        render: (value: string, record: SystemConfig) => {
          const entry = getCatalogEntry(record.config_key);
          return (
            <div className='space-y-1'>
              <span className='line-clamp-2 text-sm'>
                {entry?.description || value || (
                  <span className='text-muted-foreground'>无描述</span>
                )}
              </span>
              {entry?.note && (
                <span
                  className='line-clamp-2 text-xs text-amber-600 dark:text-amber-400'
                  title={entry.note}
                >
                  {entry.note}
                </span>
              )}
            </div>
          );
        }
      };
    }

    if (col.key === 'is_public') {
      return {
        ...col,
        render: (value: boolean) => {
          return (
            <div className='flex justify-center'>
              {value ? (
                <Badge variant='outline' className='gap-1'>
                  <Globe className='h-3 w-3' />
                  公开
                </Badge>
              ) : (
                <Badge variant='secondary' className='gap-1'>
                  <EyeOff className='h-3 w-3' />
                  私有
                </Badge>
              )}
            </div>
          );
        }
      };
    }

    if (col.key === 'status') {
      return {
        ...col,
        render: (value: any, record: SystemConfig) => {
          return (
            <div className='flex justify-center'>
              {record.disabled ? (
                <Badge variant='secondary'>已禁用</Badge>
              ) : (
                <Badge variant='outline' className='gap-1'>
                  <span className='inline-block h-1.5 w-1.5 rounded-full bg-emerald-500' />
                  启用
                </Badge>
              )}
            </div>
          );
        }
      };
    }

    if (col.key === 'version') {
      return {
        ...col,
        render: (value: number) => {
          return <div className='text-center font-mono text-sm'>v{value}</div>;
        }
      };
    }

    if (col.key === 'updated_at') {
      return {
        ...col,
        render: (value: string) => (
          <span className='font-mono text-xs'>{formatDateTime(value)}</span>
        )
      };
    }

    if (col.key === 'actions') {
      return {
        ...col,
        render: (value: any, record: SystemConfig) => {
          const actions: ActionItem[] = [
            {
              key: 'edit',
              label: '编辑',
              icon: <Edit className='mr-2 h-4 w-4' />,
              onClick: () => onEdit(record)
            }
          ];

          return (
            <ActionDropdown actions={actions} />
          );
        }
      };
    }

    return col;
  });

  return (
    <DataTable
      columns={columns}
      data={configs}
      loading={loading}
      emptyText={MESSAGES.EMPTY.CONFIGS}
      emptyState={emptyState}
      rowKey='id'
    />
  );
}
