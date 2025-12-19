'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '@/lib/utils';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { AdvancedFilterContainer } from '@/components/shared/advanced-filter-container';
import { GameFilters as GameFiltersType } from '../types';
import {
  CATEGORY_OPTIONS,
  PROVIDER_OPTIONS,
  LANGUAGE_OPTIONS,
  STATUS_OPTIONS,
  BOOLEAN_OPTIONS,
  SORT_OPTIONS,
  CURRENCY_OPTIONS
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
  // 本地表单状态（用于高级筛选弹窗）
  const [formData, setFormData] = useState<Partial<GameFiltersType>>({});
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  // 同步 filters 到本地表单状态
  useEffect(() => {
    setFormData(filters);
  }, [filters]);

  /**
   * 更新表单字段值
   */
  const updateFormField = (key: keyof GameFiltersType, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * 执行查询
   */
  const handleSearch = () => {
    onSearch(formData);
  };

  /**
   * 重置筛选条件
   */
  const handleReset = () => {
    setFormData({
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

  /**
   * 快速搜索（关键词）
   */
  const handleQuickSearch = (value: string) => {
    onSearch({ keyword: value || undefined });
  };

  /**
   * 处理多选
   */
  const handleMultiSelect = (key: 'provider_codes' | 'categories', value: string) => {
    const currentValues = (formData[key] as string[]) || [];
    let newValues: string[];
    
    if (value === 'all') {
      newValues = [];
    } else if (currentValues.includes(value)) {
      newValues = currentValues.filter((v) => v !== value);
    } else {
      newValues = [...currentValues, value];
    }
    
    updateFormField(key, newValues);
  };

  /**
   * 检查是否有激活的筛选条件
   */
  const hasActiveFilters = Boolean(
    filters.keyword ||
      (filters.provider_codes && filters.provider_codes.length > 0) ||
      (filters.categories && filters.categories.length > 0) ||
      filters.lang ||
      (filters.status && filters.status !== 'all') ||
      filters.is_new !== undefined ||
      filters.is_featured !== undefined ||
      filters.is_mobile_supported !== undefined ||
      filters.is_demo_available !== undefined ||
      filters.has_jackpot !== undefined ||
      filters.min_bet_min ||
      filters.min_bet_max ||
      filters.max_bet_min ||
      filters.max_bet_max ||
      filters.rtp_min ||
      filters.rtp_max ||
      filters.supported_language ||
      filters.supported_currency ||
      filters.created_from ||
      filters.created_to ||
      filters.updated_from ||
      filters.updated_to ||
      filters.last_played_from ||
      filters.last_played_to
  );

  /**
   * 计算激活的筛选条件数量（与玩家列表保持一致的计算方式）
   */
  const activeFiltersCount = Object.keys(filters).filter(
    (k) => {
      const value = filters[k as keyof GameFiltersType];
      if (value === undefined || value === null) return false;
      if (value === '') return false;
      if (value === 'all') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }
  ).length;

  /**
   * 渲染高级筛选表单
   */
  const renderAdvancedFilterForm = () => (
    <div className='grid gap-4'>
      {/* 第一行：基础信息 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>游戏名称/标识</Label>
          <Input
            placeholder='搜索游戏名称或游戏标识...'
            value={formData.keyword || ''}
            onChange={(e) => updateFormField('keyword', e.target.value || undefined)}
          />
        </div>
        <div className='space-y-2'>
          <Label>语言</Label>
          <Select
            value={formData.lang || 'all'}
            onValueChange={(value) =>
              updateFormField('lang', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='全部语言' />
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
      </div>

      {/* 第二行：分类和供应商 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>分类</Label>
          <Select
            value={
              formData.categories && formData.categories.length > 0
                ? formData.categories[0]
                : 'all'
            }
            onValueChange={(value) => {
              if (value === 'all') {
                updateFormField('categories', []);
              } else {
                updateFormField('categories', [value]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder='全部分类' />
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
        <div className='space-y-2'>
          <Label>供应商</Label>
          <Select
            value={
              formData.provider_codes && formData.provider_codes.length > 0
                ? formData.provider_codes[0]
                : 'all'
            }
            onValueChange={(value) => {
              if (value === 'all') {
                updateFormField('provider_codes', []);
              } else {
                updateFormField('provider_codes', [value]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder='全部供应商' />
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
      </div>

      {/* 第三行：状态和特性 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>状态</Label>
          <Select
            value={
              formData.status === true
                ? 'true'
                : formData.status === false
                  ? 'false'
                  : 'all'
            }
            onValueChange={(value) =>
              updateFormField(
                'status',
                value === 'all' ? 'all' : value === 'true'
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='全部状态' />
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
        <div className='space-y-2'>
          <Label>排序方式</Label>
          <Select
            value={formData.sort_by || 'sort_order'}
            onValueChange={(value) => updateFormField('sort_by', value)}
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

      {/* 第四行：布尔特性 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>推荐</Label>
          <Select
            value={
              formData.is_featured === true
                ? 'true'
                : formData.is_featured === false
                  ? 'false'
                  : 'all'
            }
            onValueChange={(value) =>
              updateFormField(
                'is_featured',
                value === 'all' ? undefined : value === 'true'
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='全部' />
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
        <div className='space-y-2'>
          <Label>新品</Label>
          <Select
            value={
              formData.is_new === true
                ? 'true'
                : formData.is_new === false
                  ? 'false'
                  : 'all'
            }
            onValueChange={(value) =>
              updateFormField('is_new', value === 'all' ? undefined : value === 'true')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='全部' />
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
        <div className='space-y-2'>
          <Label>移动端支持</Label>
          <Select
            value={
              formData.is_mobile_supported === true
                ? 'true'
                : formData.is_mobile_supported === false
                  ? 'false'
                  : 'all'
            }
            onValueChange={(value) =>
              updateFormField(
                'is_mobile_supported',
                value === 'all' ? undefined : value === 'true'
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='全部' />
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
        <div className='space-y-2'>
          <Label>试玩</Label>
          <Select
            value={
              formData.is_demo_available === true
                ? 'true'
                : formData.is_demo_available === false
                  ? 'false'
                  : 'all'
            }
            onValueChange={(value) =>
              updateFormField(
                'is_demo_available',
                value === 'all' ? undefined : value === 'true'
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='全部' />
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
        <div className='space-y-2'>
          <Label>累积奖池</Label>
          <Select
            value={
              formData.has_jackpot === true
                ? 'true'
                : formData.has_jackpot === false
                  ? 'false'
                  : 'all'
            }
            onValueChange={(value) =>
              updateFormField(
                'has_jackpot',
                value === 'all' ? undefined : value === 'true'
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='全部' />
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

      {/* 第五行：下注范围 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>最小下注范围</Label>
          <div className='flex gap-2'>
            <Input
              type='number'
              step='0.01'
              placeholder='最小值'
              value={formData.min_bet_min || ''}
              onChange={(e) =>
                updateFormField(
                  'min_bet_min',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
            <span className='self-center text-muted-foreground'>-</span>
            <Input
              type='number'
              step='0.01'
              placeholder='最大值'
              value={formData.min_bet_max || ''}
              onChange={(e) =>
                updateFormField(
                  'min_bet_max',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>
        </div>
        <div className='space-y-2'>
          <Label>最大下注范围</Label>
          <div className='flex gap-2'>
            <Input
              type='number'
              step='0.01'
              placeholder='最小值'
              value={formData.max_bet_min || ''}
              onChange={(e) =>
                updateFormField(
                  'max_bet_min',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
            <span className='self-center text-muted-foreground'>-</span>
            <Input
              type='number'
              step='0.01'
              placeholder='最大值'
              value={formData.max_bet_max || ''}
              onChange={(e) =>
                updateFormField(
                  'max_bet_max',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>
        </div>
        <div className='space-y-2'>
          <Label>RTP范围</Label>
          <div className='flex gap-2'>
            <Input
              type='number'
              step='0.01'
              placeholder='最小值'
              value={formData.rtp_min || ''}
              onChange={(e) =>
                updateFormField(
                  'rtp_min',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
            <span className='self-center text-muted-foreground'>-</span>
            <Input
              type='number'
              step='0.01'
              placeholder='最大值'
              value={formData.rtp_max || ''}
              onChange={(e) =>
                updateFormField(
                  'rtp_max',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>
        </div>
      </div>

      {/* 第六行：支持的语言和货币 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>支持的语言</Label>
          <Input
            placeholder='支持的语言'
            value={formData.supported_language || ''}
            onChange={(e) =>
              updateFormField('supported_language', e.target.value || undefined)
            }
          />
        </div>
        <div className='space-y-2'>
          <Label>支持的货币</Label>
          <Select
            value={formData.supported_currency || 'all'}
            onValueChange={(value) =>
              updateFormField(
                'supported_currency',
                value === 'all' ? undefined : value
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='全部货币' />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 第七行：时间范围 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>创建时间</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'w-full justify-start text-left font-normal',
                  (!formData.created_from || !formData.created_to) &&
                    'text-muted-foreground'
                )}
              >
                <Calendar className='mr-2 h-4 w-4' />
                {formData.created_from && formData.created_to
                  ? `${formData.created_from} - ${formData.created_to}`
                  : '选择日期范围'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <CalendarComponent
                mode='range'
                selected={
                  formData.created_from && formData.created_to
                    ? {
                        from: new Date(formData.created_from),
                        to: new Date(formData.created_to)
                      }
                    : undefined
                }
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    updateFormField(
                      'created_from',
                      format(range.from, 'yyyy-MM-dd')
                    );
                    updateFormField(
                      'created_to',
                      format(range.to, 'yyyy-MM-dd')
                    );
                  } else {
                    updateFormField('created_from', undefined);
                    updateFormField('created_to', undefined);
                  }
                }}
                numberOfMonths={2}
                locale={zhCN}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className='space-y-2'>
          <Label>更新时间</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'w-full justify-start text-left font-normal',
                  (!formData.updated_from || !formData.updated_to) &&
                    'text-muted-foreground'
                )}
              >
                <Calendar className='mr-2 h-4 w-4' />
                {formData.updated_from && formData.updated_to
                  ? `${formData.updated_from} - ${formData.updated_to}`
                  : '选择日期范围'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <CalendarComponent
                mode='range'
                selected={
                  formData.updated_from && formData.updated_to
                    ? {
                        from: new Date(formData.updated_from),
                        to: new Date(formData.updated_to)
                      }
                    : undefined
                }
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    updateFormField(
                      'updated_from',
                      format(range.from, 'yyyy-MM-dd')
                    );
                    updateFormField(
                      'updated_to',
                      format(range.to, 'yyyy-MM-dd')
                    );
                  } else {
                    updateFormField('updated_from', undefined);
                    updateFormField('updated_to', undefined);
                  }
                }}
                numberOfMonths={2}
                locale={zhCN}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className='space-y-2'>
          <Label>最后游玩时间</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'w-full justify-start text-left font-normal',
                  (!formData.last_played_from || !formData.last_played_to) &&
                    'text-muted-foreground'
                )}
              >
                <Calendar className='mr-2 h-4 w-4' />
                {formData.last_played_from && formData.last_played_to
                  ? `${formData.last_played_from} - ${formData.last_played_to}`
                  : '选择日期范围'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <CalendarComponent
                mode='range'
                selected={
                  formData.last_played_from && formData.last_played_to
                    ? {
                        from: new Date(formData.last_played_from),
                        to: new Date(formData.last_played_to)
                      }
                    : undefined
                }
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    updateFormField(
                      'last_played_from',
                      format(range.from, 'yyyy-MM-dd')
                    );
                    updateFormField(
                      'last_played_to',
                      format(range.to, 'yyyy-MM-dd')
                    );
                  } else {
                    updateFormField('last_played_from', undefined);
                    updateFormField('last_played_to', undefined);
                  }
                }}
                numberOfMonths={2}
                locale={zhCN}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );

  return (
    <div className='space-y-4'>
      {/* 快速搜索栏 */}
      <div className='flex items-center gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='搜索游戏名称或游戏标识...'
            className='pl-9'
            value={filters.keyword || ''}
            onChange={(e) => handleQuickSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleQuickSearch(e.currentTarget.value);
              }
            }}
          />
        </div>
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
          <Button variant='ghost' size='sm' onClick={handleReset}>
            <X className='mr-1 h-4 w-4' />
            清空
          </Button>
        )}
      </div>

      {/* 高级筛选弹窗 */}
      <AdvancedFilterContainer
        open={isAdvancedFilterOpen}
        onClose={() => setIsAdvancedFilterOpen(false)}
        title='游戏筛选'
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
