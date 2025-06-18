'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
}

export function Pagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50, 100],
  showPageSizeSelector = true
}: PaginationProps) {
  const { page, limit, total, totalPages } = pagination;

  return (
    <div className='mt-4 flex items-center justify-between'>
      <div className='text-muted-foreground text-sm'>总计 {total} 条记录</div>
      <div className='flex items-center gap-6'>
        {showPageSizeSelector && (
          <div className='flex items-center gap-2'>
            <span className='text-muted-foreground text-sm'>每页显示</span>
            <Select
              value={String(limit)}
              onValueChange={(value) => onPageSizeChange(parseInt(value))}
            >
              <SelectTrigger className='h-8 w-[80px] cursor-pointer'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem
                    key={pageSize}
                    value={String(pageSize)}
                    className='cursor-pointer'
                  >
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className='flex items-center gap-4'>
          <span className='text-muted-foreground text-sm'>
            第 {page} 页，共 {totalPages} 页
          </span>
          <div className='flex items-center gap-1'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onPageChange(1)}
              disabled={page <= 1}
              className='h-8 w-8 cursor-pointer p-0'
            >
              «
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className='h-8 w-8 cursor-pointer p-0'
            >
              ‹
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className='h-8 w-8 cursor-pointer p-0'
            >
              ›
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages}
              className='h-8 w-8 cursor-pointer p-0'
            >
              »
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
