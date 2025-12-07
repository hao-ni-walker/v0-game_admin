import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { GiftPackFilters as GiftPackFiltersType } from '../types';
import { AdvancedFilterContainer } from '@/components/shared/advanced-filter-container';
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
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');

  // 初始化本地筛选状态
  useEffect(() => {
    setLocalFilters(filters);
    setQuickSearch(filters.keyword || '');
  }, [filters]);

  // 更新本地筛选条件
  const updateLocalFilter = (key: keyof GiftPackFiltersType, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  // 处理搜索
  const handleSearch = () => {
    onSearch(localFilters);
    setIsAdvancedFilterOpen(false);
  };

  // 处理快速搜索
  const handleQuickSearch = (value: string) => {
    setQuickSearch(value);
  };

  const executeQuickSearch = () => {
    onSearch({ ...filters, keyword: quickSearch, page: 1 });
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
    setQuickSearch('');
    onReset();
  };

  // 计算激活的筛选条件数量
  const activeFiltersCount = [
    localFilters.keyword,
    localFilters.locale && localFilters.locale !== 'default',
    localFilters.categories && localFilters.categories.length > 0,
    localFilters.rarities && localFilters.rarities.length > 0,
    localFilters.statuses && localFilters.statuses.length > 0 && !(localFilters.statuses.length === 1 && localFilters.statuses[0] === 'active'),
    localFilters.is_consumable !== undefined,
    localFilters.bind_flag !== undefined,
    localFilters.vip_min !== undefined,
    localFilters.vip_max !== undefined,
    localFilters.level_min !== undefined,
    localFilters.level_max !== undefined,
    localFilters.expire_days_max !== undefined,
    localFilters.usage_limit_max !== undefined
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0;

  // 渲染快速搜索栏
  const renderQuickSearch = () => (
    <div className='flex items-center gap-2'>
      <div className='relative flex-1'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          placeholder='搜索道具名称...'
          value={quickSearch}
          onChange={(e) => handleQuickSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && executeQuickSearch()}
          className='pl-9'
        />
      </div>
      <Button onClick={executeQuickSearch} disabled={loading}>
        <Search className='mr-2 h-4 w-4' />
        搜索
      </Button>
      <Button
        variant='outline'
        onClick={() => setIsAdvancedFilterOpen(true)}
        className={hasActiveFilters ? 'border-primary' : ''}
      >
        <Filter className='mr-2 h-4 w-4' />
        高级筛选
        {hasActiveFilters && (
          <span className='ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground'>
            {activeFiltersCount}
          </span>
        )}
      </Button>
      {hasActiveFilters && (
        <Button variant='ghost' size='sm' onClick={handleReset} disabled={loading}>
          <X className='mr-1 h-4 w-4' />
          清空
        </Button>
      )}
    </div>
  );

  // 渲染高级筛选表单
  const renderAdvancedFilterForm = () => (
    <div className='grid gap-4'>
      {/* 基础筛选 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* 类别 */}
        <div className='space-y-2'>
          <Label>类别</Label>
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
        <div className='space-y-2'>
          <Label>稀有度</Label>
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
        <div className='space-y-2'>
          <Label>状态</Label>
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
        <div className='space-y-2'>
          <Label>语言</Label>
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
        <div className='space-y-2'>
          <Label>消耗品</Label>
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
        <div className='space-y-2'>
          <Label>绑定</Label>
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

      <div className='border-t pt-4'>
        <Label className='mb-2 block text-base'>数值范围</Label>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {/* VIP等级范围 */}
          <div className='space-y-2'>
            <Label className='text-xs text-muted-foreground'>VIP等级</Label>
            <div className='flex items-center gap-2'>
              <Input
                type='number'
                placeholder='最低'
                value={localFilters.vip_min || ''}
                onChange={(e) => updateLocalFilter('vip_min', e.target.value ? parseInt(e.target.value) : undefined)}
              />
              <span className='text-muted-foreground'>-</span>
              <Input
                type='number'
                placeholder='最高'
                value={localFilters.vip_max || ''}
                onChange={(e) => updateLocalFilter('vip_max', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* 玩家等级范围 */}
          <div className='space-y-2'>
            <Label className='text-xs text-muted-foreground'>玩家等级</Label>
            <div className='flex items-center gap-2'>
              <Input
                type='number'
                placeholder='最低'
                value={localFilters.level_min || ''}
                onChange={(e) => updateLocalFilter('level_min', e.target.value ? parseInt(e.target.value) : undefined)}
              />
              <span className='text-muted-foreground'>-</span>
              <Input
                type='number'
                placeholder='最高'
                value={localFilters.level_max || ''}
                onChange={(e) => updateLocalFilter('level_max', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* 有效期 */}
          <div className='space-y-2'>
            <Label className='text-xs text-muted-foreground'>有效期(天)</Label>
            <Input
              type='number'
              placeholder='最大天数'
              value={localFilters.expire_days_max || ''}
              onChange={(e) => updateLocalFilter('expire_days_max', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>

          {/* 使用上限 */}
          <div className='space-y-2'>
            <Label className='text-xs text-muted-foreground'>使用上限</Label>
            <Input
              type='number'
              placeholder='最大次数'
              value={localFilters.usage_limit_max || ''}
              onChange={(e) => updateLocalFilter('usage_limit_max', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
        </div>
      </div>

      <div className='border-t pt-4'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {/* 排序 */}
          <div className='space-y-2'>
            <Label>排序方式</Label>
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
          
          <div className='space-y-2'>
            <Label>排序顺序</Label>
            <Select
              value={localFilters.sort_dir || 'desc'}
              onValueChange={(value) => updateLocalFilter('sort_dir', value as 'asc' | 'desc')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">升序 (A-Z, 0-9)</SelectItem>
                <SelectItem value="desc">降序 (Z-A, 9-0)</SelectItem>
              </SelectContent>
            </Select>
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
        title='礼包筛选'
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
