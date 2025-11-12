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
import { GiftPackFilters as GiftPackFiltersType } from '../types';
import {
  CATEGORY_OPTIONS,
  RARITY_OPTIONS,
  STATUS_OPTIONS,
  BOOLEAN_OPTIONS,
  LOCALE_OPTIONS,
  SORT_OPTIONS
} from '../constants';

interface GiftPackFiltersProps {
  filters: GiftPackFiltersType;
  onSearch: (filters: Partial<GiftPackFiltersType>) => void;
  onReset: () => void;
  loading?: boolean;
}

/**
 * 礼包筛选组件
 */
export function GiftPackFilters({
  filters,
  onSearch,
  onReset,
  loading = false
}: GiftPackFiltersProps) {
  const [localFilters, setLocalFilters] = useState<GiftPackFiltersType>(filters);

  // 更新本地筛选条件
  const updateLocalFilter = (key: keyof GiftPackFiltersType, value: any) => {
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
      locale: 'default',
      categories: [],
      rarities: [],
      statuses: ['active'],
      is_consumable: undefined,
      bind_flag: undefined,
      sort_by: 'sort_weight',
      sort_dir: 'desc',
      page: 1,
      page_size: 20
    });
    onReset();
  };

  // 计算激活的筛选条件数量
  const activeFiltersCount = [
    filters.keyword,
    filters.locale && filters.locale !== 'default',
    filters.categories && filters.categories.length > 0,
    filters.rarities && filters.rarities.length > 0,
    filters.statuses && filters.statuses.length > 0 && !(filters.statuses.length === 1 && filters.statuses[0] === 'active'),
    filters.is_consumable !== undefined,
    filters.bind_flag !== undefined,
    filters.vip_min !== undefined,
    filters.vip_max !== undefined,
    filters.level_min !== undefined,
    filters.level_max !== undefined
  ].filter(Boolean).length;

  return (
    <div className='space-y-4 rounded-lg border bg-card p-4'>
      {/* 第一行：关键词搜索 */}
      <div className='flex gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='搜索道具名称...'
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
        {/* 类别 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>类别</label>
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

        {/* 稀有度 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>稀有度</label>
          <Select
            value={localFilters.rarities && localFilters.rarities.length > 0 ? localFilters.rarities[0] : 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                updateLocalFilter('rarities', []);
              } else {
                updateLocalFilter('rarities', [value]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RARITY_OPTIONS.map((option) => (
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
            value={localFilters.statuses && localFilters.statuses.length > 0 ? localFilters.statuses[0] : 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                updateLocalFilter('statuses', []);
              } else {
                updateLocalFilter('statuses', [value]);
              }
            }}
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

        {/* 语言 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>语言</label>
          <Select
            value={localFilters.locale || 'default'}
            onValueChange={(value) => updateLocalFilter('locale', value === 'default' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOCALE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value || 'default'}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 消耗品 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>消耗品</label>
          <Select
            value={
              localFilters.is_consumable === true
                ? 'true'
                : localFilters.is_consumable === false
                  ? 'false'
                  : 'all'
            }
            onValueChange={(value) =>
              updateLocalFilter(
                'is_consumable',
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

        {/* 绑定 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>绑定</label>
          <Select
            value={
              localFilters.bind_flag === true
                ? 'true'
                : localFilters.bind_flag === false
                  ? 'false'
                  : 'all'
            }
            onValueChange={(value) =>
              updateLocalFilter(
                'bind_flag',
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
      </div>

      {/* 第三行：高级筛选 */}
      <div className='grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5'>
        {/* VIP等级范围 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>VIP等级</label>
          <div className='flex gap-1'>
            <Input
              type='number'
              placeholder='最低'
              value={localFilters.vip_min || ''}
              onChange={(e) => updateLocalFilter('vip_min', e.target.value ? parseInt(e.target.value) : undefined)}
              className='w-20'
            />
            <span className='flex items-center text-muted-foreground'>-</span>
            <Input
              type='number'
              placeholder='最高'
              value={localFilters.vip_max || ''}
              onChange={(e) => updateLocalFilter('vip_max', e.target.value ? parseInt(e.target.value) : undefined)}
              className='w-20'
            />
          </div>
        </div>

        {/* 玩家等级范围 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>玩家等级</label>
          <div className='flex gap-1'>
            <Input
              type='number'
              placeholder='最低'
              value={localFilters.level_min || ''}
              onChange={(e) => updateLocalFilter('level_min', e.target.value ? parseInt(e.target.value) : undefined)}
              className='w-20'
            />
            <span className='flex items-center text-muted-foreground'>-</span>
            <Input
              type='number'
              placeholder='最高'
              value={localFilters.level_max || ''}
              onChange={(e) => updateLocalFilter('level_max', e.target.value ? parseInt(e.target.value) : undefined)}
              className='w-20'
            />
          </div>
        </div>

        {/* 有效期 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>有效期(天)</label>
          <Input
            type='number'
            placeholder='最大天数'
            value={localFilters.expire_days_max || ''}
            onChange={(e) => updateLocalFilter('expire_days_max', e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </div>

        {/* 使用上限 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>使用上限</label>
          <Input
            type='number'
            placeholder='最大次数'
            value={localFilters.usage_limit_max || ''}
            onChange={(e) => updateLocalFilter('usage_limit_max', e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </div>

        {/* 排序 */}
        <div>
          <label className='mb-1.5 block text-sm font-medium'>排序方式</label>
          <Select
            value={localFilters.sort_by || 'sort_weight'}
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
