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
import { VipLevelFilters as VipLevelFiltersType } from '../types';
import { SORT_OPTIONS, DEFAULT_FILTERS } from '../constants';

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
  const [localFilters, setLocalFilters] =
    useState<VipLevelFiltersType>(filters);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  // 同步外部 filters 到本地表单状态
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // 更新本地筛选条件
  const updateLocalFilter = (key: keyof VipLevelFiltersType, value: any) => {
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
      filters.level_min !== undefined ||
      filters.level_max !== undefined ||
      filters.required_exp_min !== undefined ||
      filters.required_exp_max !== undefined ||
      filters.disabled ||
      filters.show_removed ||
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
          placeholder='搜索等级名称...'
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
      {/* 第一行：关键词 */}
      <div className='grid grid-cols-1 gap-4'>
        <div className='space-y-2'>
          <Label>关键词</Label>
          <Input
            placeholder='搜索等级名称...'
            value={localFilters.keyword || ''}
            onChange={(e) => updateLocalFilter('keyword', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
      </div>

      {/* 第二行：等级范围 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>最小等级</Label>
          <Input
            type='number'
            placeholder='最小等级'
            value={localFilters.level_min ?? ''}
            onChange={(e) =>
              updateLocalFilter(
                'level_min',
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            min={0}
          />
        </div>
        <div className='space-y-2'>
          <Label>最大等级</Label>
          <Input
            type='number'
            placeholder='最大等级'
            value={localFilters.level_max ?? ''}
            onChange={(e) =>
              updateLocalFilter(
                'level_max',
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            min={0}
          />
        </div>
      </div>

      {/* 第三行：经验范围 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>最小经验</Label>
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
        <div className='space-y-2'>
          <Label>最大经验</Label>
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
      </div>

      {/* 第四行：排序 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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

      {/* 第五行：复选框筛选 */}
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
        title='VIP等级筛选'
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
