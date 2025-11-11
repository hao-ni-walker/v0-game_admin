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
import { GameFilters as GameFiltersType } from '../types';
import {
  CATEGORY_OPTIONS,
  PROVIDER_OPTIONS,
  LANGUAGE_OPTIONS,
  STATUS_OPTIONS,
  BOOLEAN_OPTIONS,
  SORT_OPTIONS
} from '../constants';

interface GameFiltersProps {
  filters: GameFiltersType;
  onSearch: (filters: Partial<GameFiltersType>) => void;
  onReset: () => void;
  loading?: boolean;
}

/**
 * 游戏筛选组件
 */
export function GameFilters({
  filters,
  onSearch,
  onReset,
  loading = false
}: GameFiltersProps) {
  const [localFilters, setLocalFilters] = useState<GameFiltersType>(filters);

  // 更新本地筛选条件
  const updateLocalFilter = (key: keyof GameFiltersType, value: any) => {
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
      provider_codes: [],
      categories: [],
      lang: '',
      status: 'all',
      is_new: undefined,
      is_featured: undefined,
      is_mobile_supported: undefined,
      is_demo_available: undefined,
      has_jackpot: undefined,
      sort_by: 'sort_order',
      sort_dir: 'desc',
      page: 1,
      page_size: 20
    });
    onReset();
  };

  // 处理多选
  const handleMultiSelect = (key: 'provider_codes' | 'categories', value: string) => {
    const currentValues = localFilters[key] || [];
    let newValues: string[];
    
    if (value === 'all') {
      newValues = [];
    } else if (currentValues.includes(value)) {
      newValues = currentValues.filter((v) => v !== value);
    } else {
      newValues = [...currentValues, value];
    }
    
    updateLocalFilter(key, newValues);
  };

  // 计算激活的筛选条件数量
  const activeFiltersCount = [
    filters.keyword,
    filters.provider_codes && filters.provider_codes.length > 0,
    filters.categories && filters.categories.length > 0,
    filters.lang,
    filters.status !== 'all',
    filters.is_new,
    filters.is_featured,
    filters.is_mobile_supported,
    filters.is_demo_available,
    filters.has_jackpot
  ].filter(Boolean).length;

  return (
    <div className='space-y-4 rounded-lg border bg-card p-4'>
      {/* 第一行：关键词搜索 */}
      <div className='flex gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='搜索游戏名称或游戏标识...'
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
        {/* 分类 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>分类</label>
          <Select
            value={localFilters.categories && localFilters.categories.length > 0 ? localFilters.categories[0] : 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                updateLocalFilter('categories', []);
              } else {
                updateLocalFilter('categories', [value]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 供应商 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>供应商</label>
          <Select
            value={localFilters.provider_codes && localFilters.provider_codes.length > 0 ? localFilters.provider_codes[0] : 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                updateLocalFilter('provider_codes', []);
              } else {
                updateLocalFilter('provider_codes', [value]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVIDER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 语言 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>语言</label>
          <Select
            value={localFilters.lang || 'all'}
            onValueChange={(value) =>
              updateLocalFilter('lang', value === 'all' ? '' : value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((option) => (
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
              localFilters.status === true
                ? 'true'
                : localFilters.status === false
                  ? 'false'
                  : 'all'
            }
            onValueChange={(value) =>
              updateLocalFilter(
                'status',
                value === 'all' ? 'all' : value === 'true'
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

        {/* 推荐 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>推荐</label>
          <Select
            value={
              localFilters.is_featured === true
                ? 'true'
                : localFilters.is_featured === false
                  ? 'false'
                  : 'all'
            }
            onValueChange={(value) =>
              updateLocalFilter(
                'is_featured',
                value === 'all' ? undefined : value === 'true'
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BOOLEAN_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 新品 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>新品</label>
          <Select
            value={
              localFilters.is_new === true
                ? 'true'
                : localFilters.is_new === false
                  ? 'false'
                  : 'all'
            }
            onValueChange={(value) =>
              updateLocalFilter('is_new', value === 'all' ? undefined : value === 'true')
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BOOLEAN_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 第三行：高级筛选 */}
      <div className='grid grid-cols-2 gap-2 md:grid-cols-4'>
        {/* 移动端支持 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>移动端</label>
          <Select
            value={
              localFilters.is_mobile_supported === true
                ? 'true'
                : localFilters.is_mobile_supported === false
                  ? 'false'
                  : 'all'
            }
            onValueChange={(value) =>
              updateLocalFilter(
                'is_mobile_supported',
                value === 'all' ? undefined : value === 'true'
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BOOLEAN_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 试玩 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>试玩</label>
          <Select
            value={
              localFilters.is_demo_available === true
                ? 'true'
                : localFilters.is_demo_available === false
                  ? 'false'
                  : 'all'
            }
            onValueChange={(value) =>
              updateLocalFilter(
                'is_demo_available',
                value === 'all' ? undefined : value === 'true'
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BOOLEAN_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 累积奖池 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>累积奖池</label>
          <Select
            value={
              localFilters.has_jackpot === true
                ? 'true'
                : localFilters.has_jackpot === false
                  ? 'false'
                  : 'all'
            }
            onValueChange={(value) =>
              updateLocalFilter(
                'has_jackpot',
                value === 'all' ? undefined : value === 'true'
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BOOLEAN_OPTIONS.map((option) => (
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
