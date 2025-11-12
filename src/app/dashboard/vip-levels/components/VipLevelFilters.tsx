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
import { VipLevelFilters as VipLevelFiltersType } from '../types';
import { SORT_OPTIONS } from '../constants';

interface VipLevelFiltersProps {
  filters: VipLevelFiltersType;
  onSearch: (filters: Partial<VipLevelFiltersType>) => void;
  onReset: () => void;
  loading?: boolean;
}

/**
 * VIP等级筛选组件
 */
export function VipLevelFilters({
  filters,
  onSearch,
  onReset,
  loading = false
}: VipLevelFiltersProps) {
  const [localFilters, setLocalFilters] = useState<VipLevelFiltersType>(filters);

  // 更新本地筛选条件
  const updateLocalFilter = (key: keyof VipLevelFiltersType, value: any) => {
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
      disabled: false,
      show_removed: false,
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
    filters.level_min !== undefined,
    filters.level_max !== undefined,
    filters.required_exp_min !== undefined,
    filters.required_exp_max !== undefined,
    filters.disabled,
    filters.show_removed
  ].filter(Boolean).length;

  return (
    <div className='space-y-4 rounded-lg border bg-card p-4'>
      {/* 第一行：关键词搜索 */}
      <div className='flex gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='搜索等级名称...'
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

      {/* 第二行：范围筛选 */}
      <div className='grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6'>
        {/* 等级范围 - 最小值 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>最小等级</label>
          <Input
            type='number'
            placeholder='最小等级'
            value={localFilters.level_min ?? ''}
            onChange={(e) =>
              updateLocalFilter('level_min', e.target.value ? parseInt(e.target.value) : undefined)
            }
            min={0}
          />
        </div>

        {/* 等级范围 - 最大值 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>最大等级</label>
          <Input
            type='number'
            placeholder='最大等级'
            value={localFilters.level_max ?? ''}
            onChange={(e) =>
              updateLocalFilter('level_max', e.target.value ? parseInt(e.target.value) : undefined)
            }
            min={0}
          />
        </div>

        {/* 经验范围 - 最小值 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>最小经验</label>
          <Input
            type='number'
            placeholder='最小经验'
            value={localFilters.required_exp_min ?? ''}
            onChange={(e) =>
              updateLocalFilter(
                'required_exp_min',
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            min={0}
          />
        </div>

        {/* 经验范围 - 最大值 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>最大经验</label>
          <Input
            type='number'
            placeholder='最大经验'
            value={localFilters.required_exp_max ?? ''}
            onChange={(e) =>
              updateLocalFilter(
                'required_exp_max',
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            min={0}
          />
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

        {/* 排序方向 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>排序方向</label>
          <Select
            value={localFilters.sort_dir || 'asc'}
            onValueChange={(value) => updateLocalFilter('sort_dir', value as 'asc' | 'desc')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='asc'>升序</SelectItem>
              <SelectItem value='desc'>降序</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 第三行：复选框筛选 */}
      <div className='flex flex-wrap gap-4'>
        {/* 禁用 */}
        <label className='flex items-center gap-2'>
          <Checkbox
            checked={localFilters.disabled || false}
            onCheckedChange={(checked) => updateLocalFilter('disabled', checked)}
          />
          <span className='text-sm'>显示禁用</span>
        </label>

        {/* 已删除 */}
        <label className='flex items-center gap-2'>
          <Checkbox
            checked={localFilters.show_removed || false}
            onCheckedChange={(checked) => updateLocalFilter('show_removed', checked)}
          />
          <span className='text-sm'>显示已删除</span>
        </label>
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
