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
import { SystemConfigFilters as SystemConfigFiltersType } from '../types';
import {
  CONFIG_TYPE_OPTIONS,
  SORT_OPTIONS
} from '../constants';

interface SystemConfigFiltersProps {
  filters: SystemConfigFiltersType;
  onSearch: (filters: Partial<SystemConfigFiltersType>) => void;
  onReset: () => void;
  loading?: boolean;
}

/**
 * 系统配置筛选组件
 */
export function SystemConfigFilters({
  filters,
  onSearch,
  onReset,
  loading = false
}: SystemConfigFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SystemConfigFiltersType>(filters);

  // 更新本地筛选条件
  const updateLocalFilter = (key: keyof SystemConfigFiltersType, value: any) => {
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
      config_types: [],
      is_public: undefined,
      disabled: false,
      show_removed: false,
      sort_by: 'updated_at',
      sort_dir: 'desc',
      page: 1,
      page_size: 20
    });
    onReset();
  };

  // 计算激活的筛选条件数量
  const activeFiltersCount = [
    filters.keyword,
    filters.config_types && filters.config_types.length > 0,
    filters.is_public !== undefined,
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
            placeholder='搜索配置键或描述...'
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
        {/* 配置类型 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>类型</label>
          <Select
            value={localFilters.config_types && localFilters.config_types.length > 0 ? localFilters.config_types[0] : 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                updateLocalFilter('config_types', []);
              } else {
                updateLocalFilter('config_types', [value]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONFIG_TYPE_OPTIONS.map((option) => (
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
            value={localFilters.sort_by || 'updated_at'}
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
        {/* 是否公开 */}
        <div className='flex items-center gap-2'>
          <Checkbox
            id='is_public'
            checked={localFilters.is_public === true}
            onCheckedChange={(checked) => 
              updateLocalFilter('is_public', checked ? true : undefined)
            }
          />
          <Label htmlFor='is_public' className='text-sm font-medium cursor-pointer'>
            仅公开配置
          </Label>
        </div>

        {/* 是否禁用 */}
        <div className='flex items-center gap-2'>
          <Checkbox
            id='disabled'
            checked={localFilters.disabled || false}
            onCheckedChange={(checked) => updateLocalFilter('disabled', checked)}
          />
          <Label htmlFor='disabled' className='text-sm font-medium cursor-pointer'>
            仅禁用项
          </Label>
        </div>

        {/* 显示已删除 */}
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
