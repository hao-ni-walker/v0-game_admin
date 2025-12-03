'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, RotateCcw, X, Calendar } from 'lucide-react';
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
import { PlayerFilters } from '../types';
import { usePlayerFiltersEnhanced } from '../hooks/use-player-filters-enhanced';

interface PlayerFilterBarProps {
  /** 查询回调 */
  onSearch?: () => void;
  /** 加载状态 */
  loading?: boolean;
}

/**
 * 玩家筛选组件
 */
export function PlayerFilterBar({ onSearch, loading = false }: PlayerFilterBarProps) {
  const {
    filters,
    updateFilter,
    resetFilters,
    applyFilters,
    hasActiveFilters
  } = usePlayerFiltersEnhanced();

  // 本地表单状态（用于高级筛选弹窗）
  const [formData, setFormData] = useState<Partial<PlayerFilters>>({});
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  // 同步 filters 到本地表单状态
  useEffect(() => {
    setFormData(filters);
  }, [filters]);

  /**
   * 更新表单字段值
   */
  const updateFormField = (key: keyof PlayerFilters, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * 执行查询
   */
  const handleSearch = () => {
    // 将表单数据同步到筛选条件
    Object.entries(formData).forEach(([key, value]) => {
      updateFilter(key as keyof PlayerFilters, value);
    });
    applyFilters();
    onSearch?.();
  };

  /**
   * 重置筛选条件
   */
  const handleReset = () => {
    setFormData({});
    resetFilters();
  };

  /**
   * 快速搜索（用户名/邮箱）
   */
  const handleQuickSearch = (value: string) => {
    updateFilter('username', value || undefined);
    applyFilters();
    onSearch?.();
  };

  /**
   * 渲染高级筛选表单
   */
  const renderAdvancedFilterForm = () => (
    <div className='grid gap-4'>
      {/* 第一行：用户基本信息 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>玩家ID</Label>
          <Input
            type='number'
            placeholder='精确ID'
            value={formData.id || ''}
            onChange={(e) =>
              updateFormField('id', e.target.value ? Number(e.target.value) : undefined)
            }
          />
        </div>
        <div className='space-y-2'>
          <Label>玩家ID范围</Label>
          <div className='flex gap-2'>
            <Input
              type='number'
              placeholder='最小ID'
              value={formData.id_min || ''}
              onChange={(e) =>
                updateFormField('id_min', e.target.value ? Number(e.target.value) : undefined)
              }
            />
            <span className='self-center text-muted-foreground'>-</span>
            <Input
              type='number'
              placeholder='最大ID'
              value={formData.id_max || ''}
              onChange={(e) =>
                updateFormField('id_max', e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
        </div>
        <div className='space-y-2'>
          <Label>用户名</Label>
          <Input
            placeholder='模糊匹配'
            value={formData.username || ''}
            onChange={(e) => updateFormField('username', e.target.value || undefined)}
          />
        </div>
        <div className='space-y-2'>
          <Label>邮箱</Label>
          <Input
            placeholder='模糊匹配'
            value={formData.email || ''}
            onChange={(e) => updateFormField('email', e.target.value || undefined)}
          />
        </div>
        <div className='space-y-2'>
          <Label>ID名称</Label>
          <Input
            placeholder='精确匹配'
            value={formData.idname || ''}
            onChange={(e) => updateFormField('idname', e.target.value || undefined)}
          />
        </div>
      </div>

      {/* 第二行：账户状态 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>账户状态</Label>
          <Select
            value={
              formData.status === undefined || formData.status === ''
                ? 'all'
                : typeof formData.status === 'boolean'
                  ? String(formData.status)
                  : String(formData.status)
            }
            onValueChange={(value) => {
              if (value === 'all') {
                updateFormField('status', undefined);
              } else if (value === 'true' || value === 'false') {
                updateFormField('status', value === 'true');
              } else {
                updateFormField('status', value as any);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder='全部状态' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部状态</SelectItem>
              <SelectItem value='true'>启用</SelectItem>
              <SelectItem value='false'>禁用</SelectItem>
              <SelectItem value='active'>启用</SelectItem>
              <SelectItem value='disabled'>禁用</SelectItem>
              <SelectItem value='locked'>已锁定</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label>VIP等级</Label>
          <div className='flex gap-2'>
            <Input
              type='number'
              placeholder='最小等级'
              value={formData.vip_level_min || ''}
              onChange={(e) =>
                updateFormField('vip_level_min', e.target.value ? Number(e.target.value) : undefined)
              }
            />
            <span className='self-center text-muted-foreground'>-</span>
            <Input
              type='number'
              placeholder='最大等级'
              value={formData.vip_level_max || ''}
              onChange={(e) =>
                updateFormField('vip_level_max', e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
        </div>
        <div className='space-y-2'>
          <Label>账户锁定状态</Label>
          <Select
            value={
              formData.is_locked === undefined || formData.is_locked === ''
                ? 'all'
                : String(formData.is_locked)
            }
            onValueChange={(value) =>
              updateFormField('is_locked', value === 'all' ? undefined : value === 'true')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='全部' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部</SelectItem>
              <SelectItem value='true'>已锁定</SelectItem>
              <SelectItem value='false'>未锁定</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 第三行：代理关系 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>代理商</Label>
          <Input
            placeholder='代理商名称'
            value={formData.agent || ''}
            onChange={(e) => updateFormField('agent', e.target.value || undefined)}
          />
        </div>
        <div className='space-y-2'>
          <Label>直属上级ID</Label>
          <Input
            type='number'
            placeholder='上级用户ID'
            value={formData.direct_superior_id || ''}
            onChange={(e) =>
              updateFormField('direct_superior_id', e.target.value ? Number(e.target.value) : undefined)
            }
          />
        </div>
      </div>

      {/* 第四行：注册信息 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>注册方式</Label>
          <Select
            value={formData.registration_method || 'all'}
            onValueChange={(value) =>
              updateFormField('registration_method', value === 'all' ? undefined : (value as any))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='全部方式' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部方式</SelectItem>
              <SelectItem value='email'>邮箱</SelectItem>
              <SelectItem value='google'>Google</SelectItem>
              <SelectItem value='apple'>Apple</SelectItem>
              <SelectItem value='phone'>手机</SelectItem>
              <SelectItem value='facebook'>Facebook</SelectItem>
              <SelectItem value='other'>其他</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label>注册来源</Label>
          <Input
            placeholder='注册来源'
            value={formData.registration_source || ''}
            onChange={(e) => updateFormField('registration_source', e.target.value || undefined)}
          />
        </div>
        <div className='space-y-2'>
          <Label>身份类别</Label>
          <Select
            value={formData.identity_category || 'all'}
            onValueChange={(value) =>
              updateFormField('identity_category', value === 'all' ? undefined : (value as any))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='全部类别' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部类别</SelectItem>
              <SelectItem value='user'>普通用户</SelectItem>
              <SelectItem value='agent'>代理</SelectItem>
              <SelectItem value='internal'>内部账号</SelectItem>
              <SelectItem value='test'>测试账号</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 第五行：钱包信息范围 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>可用余额范围</Label>
          <div className='flex gap-2'>
            <Input
              type='number'
              step='0.01'
              placeholder='最小余额'
              value={formData.balance_min || ''}
              onChange={(e) =>
                updateFormField('balance_min', e.target.value ? Number(e.target.value) : undefined)
              }
            />
            <span className='self-center text-muted-foreground'>-</span>
            <Input
              type='number'
              step='0.01'
              placeholder='最大余额'
              value={formData.balance_max || ''}
              onChange={(e) =>
                updateFormField('balance_max', e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
        </div>
        <div className='space-y-2'>
          <Label>总存款范围</Label>
          <div className='flex gap-2'>
            <Input
              type='number'
              step='0.01'
              placeholder='最小存款'
              value={formData.total_deposit_min || ''}
              onChange={(e) =>
                updateFormField('total_deposit_min', e.target.value ? Number(e.target.value) : undefined)
              }
            />
            <span className='self-center text-muted-foreground'>-</span>
            <Input
              type='number'
              step='0.01'
              placeholder='最大存款'
              value={formData.total_deposit_max || ''}
              onChange={(e) =>
                updateFormField('total_deposit_max', e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
        </div>
        <div className='space-y-2'>
          <Label>总取款范围</Label>
          <div className='flex gap-2'>
            <Input
              type='number'
              step='0.01'
              placeholder='最小取款'
              value={formData.total_withdraw_min || ''}
              onChange={(e) =>
                updateFormField('total_withdraw_min', e.target.value ? Number(e.target.value) : undefined)
              }
            />
            <span className='self-center text-muted-foreground'>-</span>
            <Input
              type='number'
              step='0.01'
              placeholder='最大取款'
              value={formData.total_withdraw_max || ''}
              onChange={(e) =>
                updateFormField('total_withdraw_max', e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
        </div>
      </div>

      {/* 第六行：时间范围 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>注册时间</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'w-full justify-start text-left font-normal',
                  (!formData.created_at_start || !formData.created_at_end) && 'text-muted-foreground'
                )}
              >
                <Calendar className='mr-2 h-4 w-4' />
                {formData.created_at_start && formData.created_at_end
                  ? `${formData.created_at_start} - ${formData.created_at_end}`
                  : '选择日期范围'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <CalendarComponent
                mode='range'
                selected={
                  formData.created_at_start && formData.created_at_end
                    ? {
                        from: new Date(formData.created_at_start),
                        to: new Date(formData.created_at_end)
                      }
                    : undefined
                }
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    updateFormField('created_at_start', format(range.from, 'yyyy-MM-dd'));
                    updateFormField('created_at_end', format(range.to, 'yyyy-MM-dd'));
                  } else {
                    updateFormField('created_at_start', undefined);
                    updateFormField('created_at_end', undefined);
                  }
                }}
                numberOfMonths={2}
                locale={zhCN}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className='space-y-2'>
          <Label>最后登录时间</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'w-full justify-start text-left font-normal',
                  (!formData.last_login_start || !formData.last_login_end) && 'text-muted-foreground'
                )}
              >
                <Calendar className='mr-2 h-4 w-4' />
                {formData.last_login_start && formData.last_login_end
                  ? `${formData.last_login_start} - ${formData.last_login_end}`
                  : '选择日期范围'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <CalendarComponent
                mode='range'
                selected={
                  formData.last_login_start && formData.last_login_end
                    ? {
                        from: new Date(formData.last_login_start),
                        to: new Date(formData.last_login_end)
                      }
                    : undefined
                }
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    updateFormField('last_login_start', format(range.from, 'yyyy-MM-dd'));
                    updateFormField('last_login_end', format(range.to, 'yyyy-MM-dd'));
                  } else {
                    updateFormField('last_login_start', undefined);
                    updateFormField('last_login_end', undefined);
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
            placeholder='搜索用户名或邮箱...'
            className='pl-9'
            value={filters.username || filters.keyword || ''}
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
              {Object.keys(filters).filter((k) => filters[k as keyof PlayerFilters] !== undefined && filters[k as keyof PlayerFilters] !== '').length}
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
        title='玩家筛选'
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

