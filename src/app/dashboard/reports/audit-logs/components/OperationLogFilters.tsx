'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { AdvancedFilterContainer } from '@/components/shared/advanced-filter-container';
import { Checkbox } from '@/components/ui/checkbox';

import type { UserOperationLogFilters, OperationType } from '../types';
import {
  OPERATION_TYPE_OPTIONS,
  DEFAULT_OPERATION_LOG_FILTERS
} from '../constants';

interface OperationLogFiltersProps {
  /** 筛选条件值 */
  filters: UserOperationLogFilters;
  /** 查询回调 */
  onSearch: (filters: Partial<UserOperationLogFilters>) => void;
  /** 重置回调 */
  onReset: () => void;
  /** 加载状态 */
  loading?: boolean;
}

/**
 * 用户操作日志筛选组件
 * 负责操作日志列表的搜索和筛选功能（手动查询模式）
 */
export function OperationLogFilters({
  filters,
  onSearch,
  onReset,
  loading = false
}: OperationLogFiltersProps) {
  // 本地表单状态
  const [formData, setFormData] = useState<UserOperationLogFilters>(
    DEFAULT_OPERATION_LOG_FILTERS
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // 控制高级筛选弹窗
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  // 同步外部 filters 到本地表单状态
  useEffect(() => {
    setFormData({
      keyword: filters.keyword || '',
      userIds: filters.userIds,
      usernames: filters.usernames,
      operations: filters.operations,
      tables: filters.tables,
      objectId: filters.objectId || '',
      ipAddress: filters.ipAddress || '',
      hasDiff: filters.hasDiff,
      from: filters.from,
      to: filters.to,
      sortBy: filters.sortBy || 'operationAt',
      sortDir: filters.sortDir || 'desc',
      page: filters.page || 1,
      pageSize: filters.pageSize || 20
    });

    // 设置日期范围
    if (filters.from && filters.to) {
      setDateRange({
        from: new Date(filters.from),
        to: new Date(filters.to)
      });
    } else {
      setDateRange(undefined);
    }
  }, [filters]);

  /**
   * 更新表单字段值
   */
  const updateFormField = (key: keyof UserOperationLogFilters, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * 执行查询
   */
  const handleSearch = () => {
    const searchFilters: Partial<UserOperationLogFilters> = {
      ...formData,
      page: 1 // 查询时重置到第一页
    };

    // 处理日期范围
    if (dateRange?.from && dateRange?.to) {
      searchFilters.from = dateRange.from.toISOString();
      searchFilters.to = dateRange.to.toISOString();
    } else {
      searchFilters.from = undefined;
      searchFilters.to = undefined;
    }

    onSearch(searchFilters);
  };

  /**
   * 重置筛选条件
   */
  const handleReset = () => {
    setFormData(DEFAULT_OPERATION_LOG_FILTERS);
    setDateRange(undefined);
    onReset();
  };

  /**
   * 回车键查询
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  /**
   * 检查是否有激活的筛选条件
   */
  const hasActiveFilters = Boolean(
    formData.keyword ||
      formData.objectId ||
      formData.ipAddress ||
      (formData.operations && formData.operations.length > 0) ||
      (formData.tables && formData.tables.length > 0) ||
      (formData.usernames && formData.usernames.length > 0) ||
      formData.hasDiff !== undefined ||
      dateRange
  );

  /**
   * 渲染快速搜索栏
   */
  const renderQuickSearch = () => (
    <div className='flex items-center gap-3'>
      {/* 关键词搜索 */}
      <div className='relative max-w-sm flex-1'>
        <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
        <Input
          placeholder='搜索用户名、表名、对象ID、说明...'
          value={formData.keyword || ''}
          onChange={(e) => updateFormField('keyword', e.target.value)}
          onKeyDown={handleKeyPress}
          className='pl-10'
        />
      </div>

      {/* 查询按钮 */}
      <Button
        onClick={handleSearch}
        disabled={loading}
        className='shrink-0 cursor-pointer'
      >
        <Search className='mr-2 h-4 w-4' />
        查询
      </Button>

      {/* 高级筛选按钮 */}
      <Button
        variant='outline'
        onClick={() => setIsAdvancedFilterOpen(true)}
        className='shrink-0 cursor-pointer'
      >
        <Filter className='mr-2 h-4 w-4' />
        高级筛选
        {hasActiveFilters && (
          <span className='bg-primary ml-2 h-2 w-2 rounded-full' />
        )}
      </Button>

      {/* 重置按钮 */}
      {hasActiveFilters && (
        <Button
          variant='ghost'
          onClick={handleReset}
          className='text-muted-foreground hover:text-foreground shrink-0 cursor-pointer'
        >
          <RotateCcw className='mr-1 h-4 w-4' />
          重置
        </Button>
      )}
    </div>
  );

  /**
   * 渲染高级筛选表单内容
   */
  const renderAdvancedFilterForm = () => (
    <div className='grid gap-4'>
      {/* 第一行：关键词和操作类型 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>关键词</Label>
          <Input
            placeholder='搜索用户名、表名、对象ID、说明'
            value={formData.keyword || ''}
            onChange={(e) => updateFormField('keyword', e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </div>
        <div className='space-y-2'>
          <Label>操作类型</Label>
          <Select
            value={formData.operations?.[0] || 'all'}
            onValueChange={(value) =>
              updateFormField(
                'operations',
                value === 'all' ? undefined : [value as OperationType]
              )
            }
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='选择操作类型' />
            </SelectTrigger>
            <SelectContent>
              {OPERATION_TYPE_OPTIONS.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 第二行：用户名和表名 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>用户名</Label>
          <Input
            placeholder='请输入用户名'
            value={formData.usernames?.[0] || ''}
            onChange={(e) =>
              updateFormField(
                'usernames',
                e.target.value ? [e.target.value] : undefined
              )
            }
            onKeyDown={handleKeyPress}
          />
        </div>
        <div className='space-y-2'>
          <Label>表名</Label>
          <Input
            placeholder='请输入表名'
            value={formData.tables?.[0] || ''}
            onChange={(e) =>
              updateFormField(
                'tables',
                e.target.value ? [e.target.value] : undefined
              )
            }
            onKeyDown={handleKeyPress}
          />
        </div>
      </div>

      {/* 第三行：对象ID和IP地址 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>对象ID</Label>
          <Input
            placeholder='请输入对象ID'
            value={formData.objectId || ''}
            onChange={(e) => updateFormField('objectId', e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </div>
        <div className='space-y-2'>
          <Label>IP地址</Label>
          <Input
            placeholder='请输入IP地址'
            value={formData.ipAddress || ''}
            onChange={(e) => updateFormField('ipAddress', e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </div>
      </div>

      {/* 第四行：操作时间范围 */}
      <div className='grid grid-cols-1 gap-4'>
        <div className='space-y-2'>
          <Label>操作时间</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dateRange && 'text-muted-foreground'
                )}
              >
                <Calendar className='mr-2 h-4 w-4' />
                {dateRange?.from && dateRange?.to
                  ? `${format(dateRange.from, 'yyyy-MM-dd')} - ${format(dateRange.to, 'yyyy-MM-dd')}`
                  : '选择时间范围'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <CalendarComponent
                mode='range'
                selected={dateRange}
                onSelect={(range) => setDateRange(range)}
                numberOfMonths={2}
                locale={zhCN}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* 第五行：数据变更筛选 */}
      <div className='grid grid-cols-1 gap-4'>
        <div className='flex items-center space-x-2'>
          <Checkbox
            id='hasDiff'
            checked={formData.hasDiff === true}
            onCheckedChange={(checked) =>
              updateFormField('hasDiff', checked ? true : undefined)
            }
          />
          <Label
            htmlFor='hasDiff'
            className='cursor-pointer text-sm font-normal'
          >
            仅显示有数据变更的记录
          </Label>
        </div>
      </div>
    </div>
  );

  return (
    <div className='space-y-4'>
      {/* 快速搜索栏 */}
      {renderQuickSearch()}

      {/* 高级筛选弹窗 */}
      <AdvancedFilterContainer
        open={isAdvancedFilterOpen}
        onClose={() => setIsAdvancedFilterOpen(false)}
        title='操作日志筛选'
        hasActiveFilters={hasActiveFilters}
        onSearch={handleSearch}
        onReset={handleReset}
        loading={loading}
      >
        {renderAdvancedFilterForm()}
      </AdvancedFilterContainer>
    </div>
  );
}
