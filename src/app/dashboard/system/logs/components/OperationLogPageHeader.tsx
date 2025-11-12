'use client';

import React from 'react';
import { FileText, RefreshCw, Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Heading } from '@/components/shared/heading';

interface OperationLogPageHeaderProps {
  /** 刷新回调 */
  onRefresh: () => void;
  /** 导出回调 */
  onExport?: () => void;
  /** 加载状态 */
  loading?: boolean;
}

/**
 * 操作日志页面头部组件
 */
export function OperationLogPageHeader({
  onRefresh,
  onExport,
  loading = false
}: OperationLogPageHeaderProps) {
  return (
    <div className='flex items-start justify-between'>
      <Heading
        title='用户操作日志'
        description='查看和管理系统用户操作审计日志'
        icon={<FileText className='h-6 w-6' />}
      />
      <div className='flex items-center gap-2'>
        {onExport && (
          <Button
            variant='outline'
            size='sm'
            onClick={onExport}
            disabled={loading}
            className='cursor-pointer'
          >
            <Download className='mr-2 h-4 w-4' />
            导出日志
          </Button>
        )}
        <Button
          variant='outline'
          size='sm'
          onClick={onRefresh}
          disabled={loading}
          className='cursor-pointer'
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
          />
          刷新
        </Button>
      </div>
    </div>
  );
}
