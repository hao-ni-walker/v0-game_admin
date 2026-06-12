'use client';

import React, { useMemo } from 'react';
import { X, User, Database, FileText, Clock, Globe } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import type { UserOperationLog } from '../types';
import { OPERATION_TYPE_COLORS } from '../constants';
import { formatDateTime } from '@/components/table/utils';

interface OperationLogDetailDialogProps {
  log: UserOperationLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 用户操作日志详情对话框
 */
export function OperationLogDetailDialog({
  log,
  open,
  onOpenChange
}: OperationLogDetailDialogProps) {
  // 计算数据变更差异
  const dataDiff = useMemo(() => {
    if (!log || (!log.oldData && !log.newData)) {
      return null;
    }

    const oldData = (log.oldData as Record<string, any>) || {};
    const newData = (log.newData as Record<string, any>) || {};
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    const changes: Array<{
      key: string;
      oldValue: any;
      newValue: any;
      changed: boolean;
    }> = [];

    allKeys.forEach((key) => {
      const oldValue = oldData[key];
      const newValue = newData[key];
      const changed = JSON.stringify(oldValue) !== JSON.stringify(newValue);

      changes.push({
        key,
        oldValue,
        newValue,
        changed
      });
    });

    // 将有变更的字段排在前面
    return changes.sort((a, b) => {
      if (a.changed && !b.changed) return -1;
      if (!a.changed && b.changed) return 1;
      return 0;
    });
  }, [log]);

  // 统计变更数量
  const changedCount = useMemo(() => {
    return dataDiff?.filter((item) => item.changed).length || 0;
  }, [dataDiff]);

  if (!log) return null;

  const colorClass =
    OPERATION_TYPE_COLORS[log.operation] || 'bg-gray-100 text-gray-800';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[85vh] max-w-4xl'>
        <DialogHeader>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <DialogTitle className='flex items-center gap-2'>
                <FileText className='h-5 w-5' />
                操作日志详情
                <Badge className={colorClass}>{log.operation}</Badge>
              </DialogTitle>
              <p className='text-muted-foreground mt-1 text-sm'>
                ID: {log.id} | 操作时间: {formatDateTime(log.operationAt)}
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className='max-h-[calc(85vh-8rem)] pr-4'>
          <div className='space-y-6'>
            {/* 基本信息 */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold'>基本信息</h3>
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex items-start gap-2'>
                  <User className='text-muted-foreground mt-0.5 h-4 w-4' />
                  <div className='min-w-0 flex-1'>
                    <p className='text-muted-foreground text-xs'>用户</p>
                    <p className='text-sm font-medium'>
                      {log.username} (ID: {log.userId})
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-2'>
                  <Database className='text-muted-foreground mt-0.5 h-4 w-4' />
                  <div className='min-w-0 flex-1'>
                    <p className='text-muted-foreground text-xs'>表名</p>
                    <p className='text-sm font-medium'>{log.tableName}</p>
                  </div>
                </div>
                <div className='flex items-start gap-2'>
                  <FileText className='text-muted-foreground mt-0.5 h-4 w-4' />
                  <div className='min-w-0 flex-1'>
                    <p className='text-muted-foreground text-xs'>对象ID</p>
                    <p className='font-mono text-sm font-medium break-all'>
                      {log.objectId}
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-2'>
                  <Globe className='text-muted-foreground mt-0.5 h-4 w-4' />
                  <div className='min-w-0 flex-1'>
                    <p className='text-muted-foreground text-xs'>IP地址</p>
                    <p className='font-mono text-sm font-medium'>
                      {log.ipAddress || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* 操作说明 */}
            {log.description && (
              <>
                <div className='space-y-2'>
                  <h3 className='text-sm font-semibold'>操作说明</h3>
                  <p className='text-sm'>{log.description}</p>
                </div>
                <Separator />
              </>
            )}

            {/* 来源信息 */}
            {(log.source || log.userAgent) && (
              <>
                <div className='space-y-3'>
                  <h3 className='text-sm font-semibold'>来源信息</h3>
                  <div className='grid grid-cols-1 gap-3'>
                    {log.source && (
                      <div>
                        <p className='text-muted-foreground text-xs'>来源</p>
                        <Badge variant='outline'>{log.source}</Badge>
                      </div>
                    )}
                    {log.userAgent && (
                      <div>
                        <p className='text-muted-foreground text-xs'>
                          User Agent
                        </p>
                        <p className='text-muted-foreground font-mono text-xs break-all'>
                          {log.userAgent}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* 数据变更 */}
            {dataDiff && dataDiff.length > 0 && (
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-sm font-semibold'>数据变更</h3>
                  {changedCount > 0 && (
                    <Badge variant='outline' className='text-xs'>
                      {changedCount} 个字段已变更
                    </Badge>
                  )}
                </div>
                <div className='bg-muted/50 space-y-3 rounded-md p-4'>
                  {dataDiff.map((change, index) => (
                    <div
                      key={index}
                      className={
                        change.changed ? 'rounded bg-yellow-50 p-2' : ''
                      }
                    >
                      <div className='flex items-start justify-between gap-4'>
                        <div className='min-w-0 flex-1'>
                          <p className='mb-1 text-sm font-medium'>
                            {change.key}
                            {change.changed && (
                              <Badge variant='outline' className='ml-2 text-xs'>
                                已变更
                              </Badge>
                            )}
                          </p>
                          <div className='grid grid-cols-2 gap-3 text-xs'>
                            <div>
                              <p className='text-muted-foreground mb-1'>
                                旧值:
                              </p>
                              <pre className='bg-background max-h-32 overflow-auto rounded p-2'>
                                {JSON.stringify(change.oldValue, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <p className='text-muted-foreground mb-1'>
                                新值:
                              </p>
                              <pre className='bg-background max-h-32 overflow-auto rounded p-2'>
                                {JSON.stringify(change.newValue, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 完整数据 */}
            {!dataDiff && (log.oldData || log.newData) && (
              <div className='space-y-3'>
                <h3 className='text-sm font-semibold'>数据详情</h3>
                <div className='grid grid-cols-1 gap-3'>
                  {log.oldData && (
                    <div>
                      <p className='text-muted-foreground mb-2 text-xs'>
                        旧数据:
                      </p>
                      <pre className='bg-muted/50 max-h-64 overflow-auto rounded-md p-3 text-xs'>
                        {JSON.stringify(log.oldData, null, 2)}
                      </pre>
                    </div>
                  )}
                  {log.newData && (
                    <div>
                      <p className='text-muted-foreground mb-2 text-xs'>
                        新数据:
                      </p>
                      <pre className='bg-muted-50 max-h-64 overflow-auto rounded-md p-3 text-xs'>
                        {JSON.stringify(log.newData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className='flex justify-end pt-4'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
