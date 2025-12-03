'use client';

import { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { CalendarIcon, Filter, RotateCcw, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { ActivityFilters } from '../types';
import { AdvancedFilterContainer } from '@/components/shared/advanced-filter-container';
import { TYPE_LABELS, STATUS_LABELS } from '../types';

interface ActivityFiltersProps {
  filters: ActivityFilters;
  onSearch: (filters: ActivityFilters) => void;
  onReset: () => void;
  loading?: boolean;
}

interface FilterFormData {
  id?: string;
  activity_code?: string;
  name?: string;
  activity_type?: string;
  statuses?: string[];
  startTimeRange?: { from: Date | undefined; to: Date | undefined };
  endTimeRange?: { from: Date | undefined; to: Date | undefined };
  display_time_active?: boolean;
  has_active_trigger?: boolean;
}

export function ActivityFilters({
  filters,
  onSearch,
  onReset,
  loading
}: ActivityFiltersProps) {
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [formData, setFormData] = useState<FilterFormData>({});

  // 初始化表单数据
  useEffect(() => {
    setFormData({
      id: filters.id?.toString(),
      activity_code: filters.activity_code,
      name: filters.name,
      activity_type: filters.activity_type,
      statuses: filters.statuses || [],
      startTimeRange: filters.start_time_start || filters.start_time_end
        ? {
            from: filters.start_time_start
              ? new Date(filters.start_time_start)
              : undefined,
            to: filters.start_time_end
              ? new Date(filters.start_time_end)
              : undefined
          }
        : undefined,
      endTimeRange: filters.end_time_start || filters.end_time_end
        ? {
            from: filters.end_time_start
              ? new Date(filters.end_time_start)
              : undefined,
            to: filters.end_time_end
              ? new Date(filters.end_time_end)
              : undefined
          }
        : undefined,
      display_time_active: filters.display_time_active,
      has_active_trigger: filters.has_active_trigger
    });
  }, [filters]);

  const updateFormField = (field: keyof FilterFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const hasActiveFilters = () => {
    return !!(
      filters.id ||
      filters.activity_code ||
      filters.name ||
      filters.activity_type ||
      (filters.statuses && filters.statuses.length > 0) ||
      filters.start_time_start ||
      filters.start_time_end ||
      filters.end_time_start ||
      filters.end_time_end ||
      filters.display_time_active ||
      filters.has_active_trigger
    );
  };

  const handleQuickSearch = () => {
    if (!quickSearch.trim()) {
      onSearch({ page: 1, page_size: filters.page_size || 20 });
      return;
    }

    // 快速搜索：尝试匹配活动编码或名称
    onSearch({
      ...filters,
      activity_code: quickSearch.trim(),
      name: quickSearch.trim(),
      page: 1,
      page_size: filters.page_size || 20
    });
  };

  const handleSearch = () => {
    const searchFilters: ActivityFilters = {
      page: 1,
      page_size: filters.page_size || 20,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order
    };

    // 基础信息筛选
    if (formData.id) {
      const idNum = parseInt(formData.id, 10);
      if (!isNaN(idNum)) {
        searchFilters.id = idNum;
      }
    }
    if (formData.activity_code) {
      searchFilters.activity_code = formData.activity_code;
    }
    if (formData.name) {
      searchFilters.name = formData.name;
    }
    if (formData.activity_type) {
      searchFilters.activity_type = formData.activity_type;
    }

    // 状态筛选
    if (formData.statuses && formData.statuses.length > 0) {
      searchFilters.statuses = formData.statuses;
    }

    // 活动开始时间范围
    if (formData.startTimeRange?.from) {
      searchFilters.start_time_start = formData.startTimeRange.from.toISOString();
    }
    if (formData.startTimeRange?.to) {
      searchFilters.start_time_end = formData.startTimeRange.to.toISOString();
    }

    // 活动结束时间范围
    if (formData.endTimeRange?.from) {
      searchFilters.end_time_start = formData.endTimeRange.from.toISOString();
    }
    if (formData.endTimeRange?.to) {
      searchFilters.end_time_end = formData.endTimeRange.to.toISOString();
    }

    // 展示时间状态
    if (formData.display_time_active !== undefined) {
      searchFilters.display_time_active = formData.display_time_active;
    }

    // 触发规则筛选
    if (formData.has_active_trigger !== undefined) {
      searchFilters.has_active_trigger = formData.has_active_trigger;
    }

    onSearch(searchFilters);
    setIsAdvancedFilterOpen(false);
  };

  const handleReset = () => {
    setFormData({});
    setQuickSearch('');
    onReset();
    setIsAdvancedFilterOpen(false);
  };

  const renderQuickSearch = () => (
    <div className='flex items-center gap-2'>
      <div className='relative flex-1'>
        <Search className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
        <Input
          placeholder='搜索活动编码或名称...'
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch()}
          className='pl-9'
        />
      </div>
      <Button
        variant='outline'
        onClick={() => setIsAdvancedFilterOpen(true)}
        className={cn(hasActiveFilters() && 'border-primary')}
      >
        <Filter className='mr-2 h-4 w-4' />
        高级筛选
        {hasActiveFilters() && (
          <span className='bg-primary ml-2 flex h-5 w-5 items-center justify-center rounded-full text-xs text-primary-foreground'>
            {Object.values(filters).filter(
              (v) => v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0)
            ).length}
          </span>
        )}
      </Button>
      {hasActiveFilters() && (
        <Button variant='outline' onClick={handleReset} disabled={loading}>
          <X className='mr-2 h-4 w-4' />
          清空
        </Button>
      )}
    </div>
  );

  const renderAdvancedFilterForm = () => (
    <div className='grid gap-4'>
      {/* 第一行：基础信息 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>活动ID</Label>
          <Input
            placeholder='请输入活动ID'
            value={formData.id || ''}
            onChange={(e) => updateFormField('id', e.target.value)}
            type='number'
          />
        </div>
        <div className='space-y-2'>
          <Label>活动编码</Label>
          <Input
            placeholder='请输入活动编码'
            value={formData.activity_code || ''}
            onChange={(e) => updateFormField('activity_code', e.target.value)}
          />
        </div>
        <div className='space-y-2'>
          <Label>活动名称</Label>
          <Input
            placeholder='请输入活动名称'
            value={formData.name || ''}
            onChange={(e) => updateFormField('name', e.target.value)}
          />
        </div>
        <div className='space-y-2'>
          <Label>活动类型</Label>
          <Select
            value={formData.activity_type || ''}
            onValueChange={(value) =>
              updateFormField('activity_type', value || undefined)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='请选择活动类型' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=''>全部</SelectItem>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 第二行：状态筛选 */}
      <div className='grid grid-cols-1 gap-4'>
        <div className='space-y-2'>
          <Label>活动状态</Label>
          <div className='flex flex-wrap gap-2'>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <div key={value} className='flex items-center space-x-2'>
                <Checkbox
                  id={`status-${value}`}
                  checked={formData.statuses?.includes(value) || false}
                  onCheckedChange={(checked) => {
                    const currentStatuses = formData.statuses || [];
                    if (checked) {
                      updateFormField('statuses', [...currentStatuses, value]);
                    } else {
                      updateFormField(
                        'statuses',
                        currentStatuses.filter((s) => s !== value)
                      );
                    }
                  }}
                />
                <Label
                  htmlFor={`status-${value}`}
                  className='cursor-pointer text-sm font-normal'
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 第三行：活动开始时间范围 */}
      <div className='grid grid-cols-1 gap-4'>
        <div className='space-y-2'>
          <Label>活动开始时间</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !formData.startTimeRange && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {formData.startTimeRange?.from && formData.startTimeRange?.to
                  ? `${format(formData.startTimeRange.from, 'yyyy-MM-dd', { locale: zhCN })} - ${format(formData.startTimeRange.to, 'yyyy-MM-dd', { locale: zhCN })}`
                  : '选择时间范围'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                mode='range'
                selected={formData.startTimeRange}
                onSelect={(range) => updateFormField('startTimeRange', range)}
                numberOfMonths={2}
                locale={zhCN}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* 第四行：活动结束时间范围 */}
      <div className='grid grid-cols-1 gap-4'>
        <div className='space-y-2'>
          <Label>活动结束时间</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !formData.endTimeRange && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {formData.endTimeRange?.from && formData.endTimeRange?.to
                  ? `${format(formData.endTimeRange.from, 'yyyy-MM-dd', { locale: zhCN })} - ${format(formData.endTimeRange.to, 'yyyy-MM-dd', { locale: zhCN })}`
                  : '选择时间范围'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                mode='range'
                selected={formData.endTimeRange}
                onSelect={(range) => updateFormField('endTimeRange', range)}
                numberOfMonths={2}
                locale={zhCN}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* 第五行：其他筛选条件 */}
      <div className='grid grid-cols-1 gap-4'>
        <div className='flex flex-col space-y-2'>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='display_time_active'
              checked={formData.display_time_active === true}
              onCheckedChange={(checked) =>
                updateFormField('display_time_active', checked ? true : undefined)
              }
            />
            <Label
              htmlFor='display_time_active'
              className='cursor-pointer text-sm font-normal'
            >
              当前展示中
            </Label>
          </div>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='has_active_trigger'
              checked={formData.has_active_trigger === true}
              onCheckedChange={(checked) =>
                updateFormField('has_active_trigger', checked ? true : undefined)
              }
            />
            <Label
              htmlFor='has_active_trigger'
              className='cursor-pointer text-sm font-normal'
            >
              有启用中的触发规则
            </Label>
          </div>
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
        title='活动筛选'
        hasActiveFilters={hasActiveFilters()}
        onSearch={handleSearch}
        onReset={handleReset}
        loading={loading}
      >
        {renderAdvancedFilterForm()}
      </AdvancedFilterContainer>
    </div>
  );
}
