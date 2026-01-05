'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';

import type { UserRetentionFilters } from '../types';

interface UserRetentionFiltersProps {
  /** 筛选条件值 */
  filters: UserRetentionFilters;
  /** 查询回调 */
  onSearch: (filters: Partial<UserRetentionFilters>) => void;
  /** 重置回调 */
  onReset: () => void;
  /** 加载状态 */
  loading?: boolean;
}

/**
 * 用户留存筛选组件
 */
export function UserRetentionFilters({
  filters,
  onSearch,
  onReset,
  loading = false
}: UserRetentionFiltersProps) {
  // 本地表单状态
  const [formData, setFormData] = useState<UserRetentionFilters>({
    dateRange: undefined,
    page: 1,
    page_size: 20
  });

  // 同步外部 filters 到本地表单状态
  useEffect(() => {
    setFormData({
      dateRange: filters.dateRange,
      page: filters.page || 1,
      page_size: filters.page_size || 20
    });
  }, [filters]);

  /**
   * 更新表单字段值
   */
  const updateFormField = (key: keyof UserRetentionFilters, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * 执行查询
   */
  const handleSearch = () => {
    onSearch({
      ...formData,
      page: 1 // 查询时重置到第一页
    });
  };

  /**
   * 重置筛选条件
   */
  const handleReset = () => {
    const resetData = {
      dateRange: undefined,
      page: 1,
      page_size: 20
    };
    setFormData(resetData);
    onReset();
  };

  /**
   * 检查是否有激活的筛选条件
   */
  const hasActiveFilters = Boolean(formData.dateRange);

  return (
    <Card className='p-4'>
      <div className='flex flex-wrap items-center gap-4'>
        {/* 日期范围选择器 */}
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground text-sm font-medium whitespace-nowrap'>
            日期范围
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className='w-[260px] justify-start text-left font-normal'
              >
                <Calendar className='mr-2 h-4 w-4' />
                {formData.dateRange?.from && formData.dateRange?.to ? (
                  <>
                    {format(formData.dateRange.from, 'yyyy-MM-dd', {
                      locale: zhCN
                    })}{' '}
                    -{' '}
                    {format(formData.dateRange.to, 'yyyy-MM-dd', {
                      locale: zhCN
                    })}
                  </>
                ) : (
                  <span className='text-muted-foreground'>选择日期范围</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <CalendarComponent
                mode='range'
                selected={formData.dateRange}
                onSelect={(range) => updateFormField('dateRange', range)}
                numberOfMonths={2}
                locale={zhCN}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* 操作按钮 */}
        <div className='flex items-center gap-2'>
          <Button onClick={handleSearch} disabled={loading}>
            查询
          </Button>
          {hasActiveFilters && (
            <Button variant='outline' onClick={handleReset} disabled={loading}>
              <RotateCcw className='mr-2 h-4 w-4' />
              重置
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
