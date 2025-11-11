import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { BannerFilters as BannerFiltersType } from '../types';
import {
  POSITION_OPTIONS,
  STATUS_OPTIONS,
  SORT_OPTIONS
} from '../constants';

interface BannerFiltersProps {
  filters: BannerFiltersType;
  onSearch: (filters: Partial<BannerFiltersType>) => void;
  onReset: () => void;
  loading?: boolean;
}

/**
 * 轮播图筛选组件
 */
export function BannerFilters({
  filters,
  onSearch,
  onReset,
  loading = false
}: BannerFiltersProps) {
  const [localFilters, setLocalFilters] = useState<BannerFiltersType>(filters);

  // 更新本地筛选条件
  const updateLocalFilter = (key: keyof BannerFiltersType, value: any) => {
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
      positions: [],
      status: 'all',
      disabled: false,
      show_removed: false,
      active_only: false,
      sort_by: 'sort_order',
      sort_dir: 'desc',
      page: 1,
      page_size: 20
    });
    onReset();
  };

  // 计算激活的筛选条件数量
  const activeFiltersCount = [
    filters.keyword,
    filters.positions && filters.positions.length > 0,
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
            placeholder='搜索标题或链接...'
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
        {/* 位置 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>位置</label>
          <Select
            value={localFilters.positions && localFilters.positions.length > 0 ? localFilters.positions[0] : 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                updateLocalFilter('positions', []);
              } else {
                updateLocalFilter('positions', [value]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POSITION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
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
            value={
              localFilters.status === 1
                ? '1'
                : localFilters.status === 0
                  ? '0'
                  : 'all'
            }
            onValueChange={(value) =>
              updateLocalFilter(
                'status',
                value === 'all' ? 'all' : (parseInt(value) as 0 | 1)
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
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
            value={localFilters.sort_by || 'sort_order'}
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

        {/* 排序方向 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>方向</label>
          <Select
            value={localFilters.sort_dir || 'desc'}
            onValueChange={(value) => updateLocalFilter('sort_dir', value as 'asc' | 'desc')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='desc'>降序</SelectItem>
              <SelectItem value='asc'>升序</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 第三行：高级筛选 */}
      <div className='flex flex-wrap gap-4'>
        {/* 是否禁用 */}
        <div className='flex items-center gap-2'>
          <Checkbox
            id='disabled'
            checked={localFilters.disabled || false}
            onCheckedChange={(checked) => updateLocalFilter('disabled', checked)}
          />
          <Label htmlFor='disabled' className='text-sm font-medium cursor-pointer'>
            仅显示禁用
          </Label>
        </div>

        {/* 是否删除 */}
        <div className='flex items-center gap-2'>
          <Checkbox
            id='show_removed'
            checked={localFilters.show_removed || false}
            onCheckedChange={(checked) => updateLocalFilter('show_removed', checked)}
          />
          <Label htmlFor='show_removed' className='text-sm font-medium cursor-pointer'>
            显示已删除
          </Label>
        </div>

        {/* 仅显示生效中 */}
        <div className='flex items-center gap-2'>
          <Checkbox
            id='active_only'
            checked={localFilters.active_only || false}
            onCheckedChange={(checked) => updateLocalFilter('active_only', checked)}
          />
          <Label htmlFor='active_only' className='text-sm font-medium cursor-pointer'>
            仅生效中
          </Label>
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
