import React, { useState, useEffect } from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
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
import { AdvancedFilterContainer } from '@/components/shared/advanced-filter-container';
import { AnnouncementFilters as AnnouncementFiltersType } from '../types';
import {
  ANNOUNCEMENT_TYPE_OPTIONS,
  STATUS_OPTIONS,
  SORT_OPTIONS,
  DEFAULT_FILTERS
} from '../constants';

interface AnnouncementFiltersProps {
  filters: AnnouncementFiltersType;
  onSearch: (filters: Partial<AnnouncementFiltersType>) => void;
  onReset: () => void;
  loading?: boolean;
}

/**
 * 公告筛选组件
 */
export function AnnouncementFilters({
  filters,
  onSearch,
  onReset,
  loading = false
}: AnnouncementFiltersProps) {
  const [localFilters, setLocalFilters] =
    useState<AnnouncementFiltersType>(filters);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  // 同步外部 filters 到本地表单状态
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // 更新本地筛选条件
  const updateLocalFilter = (
    key: keyof AnnouncementFiltersType,
    value: any
  ) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  // 处理搜索
  const handleSearch = () => {
    onSearch({
      ...localFilters,
      page: 1 // 查询时重置到第一页
    });
  };

  // 处理重置
  const handleReset = () => {
    setLocalFilters(DEFAULT_FILTERS);
    onReset();
  };

  // 检查是否有激活的筛选条件
  const hasActiveFilters = Boolean(
    filters.keyword ||
      (filters.types && filters.types.length > 0) ||
      filters.status !== 'all' ||
      filters.disabled ||
      filters.show_removed ||
      filters.active_only ||
      filters.sort_by !== 'default' ||
      filters.sort_dir !== 'asc'
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
          placeholder='搜索公告标题...'
          value={localFilters.keyword || ''}
          onChange={(e) => updateLocalFilter('keyword', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
      {/* 第一行：关键词和类型 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>关键词</Label>
          <Input
            placeholder='搜索公告标题...'
            value={localFilters.keyword || ''}
            onChange={(e) => updateLocalFilter('keyword', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className='space-y-2'>
          <Label>类型</Label>
          <Select
            value={
              localFilters.types && localFilters.types.length > 0
                ? String(localFilters.types[0])
                : 'all'
            }
            onValueChange={(value) => {
              if (value === 'all') {
                updateLocalFilter('types', []);
              } else {
                updateLocalFilter('types', [Number(value)]);
              }
            }}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='选择类型' />
            </SelectTrigger>
            <SelectContent>
              {ANNOUNCEMENT_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 第二行：状态和排序 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>状态</Label>
          <Select
            value={String(localFilters.status || 'all')}
            onValueChange={(value) =>
              updateLocalFilter(
                'status',
                value === 'all' ? 'all' : Number(value)
              )
            }
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='选择状态' />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label>排序方式</Label>
          <Select
            value={localFilters.sort_by || 'default'}
            onValueChange={(value) => updateLocalFilter('sort_by', value)}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='选择排序方式' />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 第三行：排序方向 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>排序方向</Label>
          <Select
            value={localFilters.sort_dir || 'asc'}
            onValueChange={(value) =>
              updateLocalFilter('sort_dir', value as 'asc' | 'desc')
            }
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='选择排序方向' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='asc'>升序</SelectItem>
              <SelectItem value='desc'>降序</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 第四行：复选框筛选 */}
      <div className='grid grid-cols-1 gap-4'>
        <div className='flex flex-wrap gap-4'>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='disabled'
              checked={localFilters.disabled || false}
              onCheckedChange={(checked) =>
                updateLocalFilter('disabled', checked)
              }
            />
            <Label
              htmlFor='disabled'
              className='cursor-pointer text-sm font-normal'
            >
              显示禁用
            </Label>
          </div>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='show_removed'
              checked={localFilters.show_removed || false}
              onCheckedChange={(checked) =>
                updateLocalFilter('show_removed', checked)
              }
            />
            <Label
              htmlFor='show_removed'
              className='cursor-pointer text-sm font-normal'
            >
              显示已删除
            </Label>
          </div>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='active_only'
              checked={localFilters.active_only || false}
              onCheckedChange={(checked) =>
                updateLocalFilter('active_only', checked)
              }
            />
            <Label
              htmlFor='active_only'
              className='cursor-pointer text-sm font-normal'
            >
              仅生效中
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
        title='公告筛选'
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
