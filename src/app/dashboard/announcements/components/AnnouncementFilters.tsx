import React, { useState } from 'react';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AnnouncementFilters as AnnouncementFiltersType } from '../types';
import {
  ANNOUNCEMENT_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  BOOLEAN_OPTIONS,
  SORT_OPTIONS
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
  const [localFilters, setLocalFilters] = useState<AnnouncementFiltersType>(filters);

  // 更新本地筛选条件
  const updateLocalFilter = (key: keyof AnnouncementFiltersType, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  // 处理搜索
  const handleSearch = () => {
    onSearch(localFilters);
  };

  // 处理重置
  const handleReset = () => {
    setLocalFilters({
      keyword: '',
      types: [],
      status: 'all',
      disabled: false,
      show_removed: false,
      active_only: false,
      sort_by: 'default',
      sort_dir: 'asc',
      page: 1,
      page_size: 20
    });
    onReset();
  };

  // 计算激活的筛选条件数量
  const activeFiltersCount = [
    filters.keyword,
    filters.types && filters.types.length > 0,
    filters.status !== 'all',
    filters.disabled,
    filters.show_removed,
    filters.active_only
  ].filter(Boolean).length;

  return (
    <div className='space-y-4 rounded-lg border bg-card p-4'>
      {/* 第一行：关键词搜索 */}
      <div className='flex gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='搜索公告标题...'
            value={localFilters.keyword || ''}
            onChange={(e) => updateLocalFilter('keyword', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className='pl-9'
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          <Search className='mr-2 h-4 w-4' />
          搜索
        </Button>
        <Button variant='outline' onClick={handleReset} disabled={loading}>
          <X className='mr-2 h-4 w-4' />
          重置
        </Button>
      </div>

      {/* 第二行：基础筛选 */}
      <div className='grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6'>
        {/* 类型 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>类型</label>
          <Select
            value={localFilters.types && localFilters.types.length > 0 ? String(localFilters.types[0]) : 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                updateLocalFilter('types', []);
              } else {
                updateLocalFilter('types', [Number(value)]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
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

        {/* 状态 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>状态</label>
          <Select
            value={String(localFilters.status || 'all')}
            onValueChange={(value) => updateLocalFilter('status', value === 'all' ? 'all' : Number(value))}
          >
            <SelectTrigger>
              <SelectValue />
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

        {/* 排序 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>排序方式</label>
          <Select
            value={localFilters.sort_by || 'default'}
            onValueChange={(value) => updateLocalFilter('sort_by', value)}
          >
            <SelectTrigger>
              <SelectValue />
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

        {/* 禁用 */}
        <div className='flex items-end'>
          <label className='flex items-center gap-2'>
            <Checkbox
              checked={localFilters.disabled || false}
              onCheckedChange={(checked) => updateLocalFilter('disabled', checked)}
            />
            <span className='text-sm'>显示禁用</span>
          </label>
        </div>

        {/* 已删除 */}
        <div className='flex items-end'>
          <label className='flex items-center gap-2'>
            <Checkbox
              checked={localFilters.show_removed || false}
              onCheckedChange={(checked) => updateLocalFilter('show_removed', checked)}
            />
            <span className='text-sm'>显示已删除</span>
          </label>
        </div>

        {/* 仅生效中 */}
        <div className='flex items-end'>
          <label className='flex items-center gap-2'>
            <Checkbox
              checked={localFilters.active_only || false}
              onCheckedChange={(checked) => updateLocalFilter('active_only', checked)}
            />
            <span className='text-sm'>仅生效中</span>
          </label>
        </div>
      </div>

      {/* 激活的筛选条件提示 */}
      {activeFiltersCount > 0 && (
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Filter className='h-4 w-4' />
          <span>
            当前有 <Badge variant='secondary'>{activeFiltersCount}</Badge> 个筛选条件激活
          </span>
        </div>
      )}
    </div>
  );
}
