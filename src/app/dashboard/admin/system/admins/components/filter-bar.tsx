'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, RotateCcw, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
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
import { AdminFilters } from '../types';
import { useAdminFilters } from '../hooks/use-admin-filters';

interface FilterBarProps {
  /** 查询回调 */
  onSearch?: () => void;
  /** 加载状态 */
  loading?: boolean;
  /** 角色列表 */
  roles?: Array<{ id: number; name: string }>;
}

/**
 * 管理员筛选组件
 */
export function FilterBar({ onSearch, loading = false, roles = [] }: FilterBarProps) {
  const {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters
  } = useAdminFilters();

  // 本地表单状态
  const [formData, setFormData] = useState<Partial<AdminFilters>>({});
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  // 同步 filters 到本地表单状态
  useEffect(() => {
    setFormData(filters);
  }, [filters]);

  /**
   * 更新表单字段值
   */
  const updateFormField = (key: keyof AdminFilters, value: any) => {
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
      updateFilter(key as keyof AdminFilters, value);
    });
    onSearch?.();
  };

  /**
   * 重置筛选条件
   */
  const handleReset = () => {
    setFormData({});
    resetFilters();
    onSearch?.();
  };

  /**
   * 快速搜索（用户名/邮箱）
   */
  const handleQuickSearch = (value: string) => {
    updateFilter('username', value || undefined);
    onSearch?.();
  };

  return (
    <div className='space-y-4 rounded-lg border bg-card p-4'>
      {/* 快速搜索栏 */}
      <div className='flex flex-col gap-4 md:flex-row md:items-end'>
        <div className='flex-1 space-y-2'>
          <Label>快速搜索</Label>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='输入用户名或邮箱进行搜索'
              className='pl-9'
              value={formData.username || formData.email || ''}
              onChange={(e) => {
                const value = e.target.value;
                updateFormField('username', value || undefined);
                updateFormField('email', value || undefined);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </div>
        </div>

        <div className='flex gap-2'>
          <Button onClick={handleSearch} disabled={loading}>
            <Search className='mr-2 h-4 w-4' />
            查询
          </Button>
          <Button variant='outline' onClick={handleReset} disabled={loading}>
            <RotateCcw className='mr-2 h-4 w-4' />
            重置
          </Button>
          <Button
            variant='outline'
            onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
          >
            <Filter className='mr-2 h-4 w-4' />
            高级筛选
          </Button>
        </div>
      </div>

      {/* 高级筛选表单 */}
      {isAdvancedFilterOpen && (
        <div className='grid gap-4 border-t pt-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {/* 管理员ID */}
            <div className='space-y-2'>
              <Label>管理员ID</Label>
              <Input
                type='number'
                placeholder='精确ID'
                value={formData.id || ''}
                onChange={(e) =>
                  updateFormField('id', e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>

            {/* 用户名 */}
            <div className='space-y-2'>
              <Label>用户名</Label>
              <Input
                placeholder='模糊匹配'
                value={formData.username || ''}
                onChange={(e) => updateFormField('username', e.target.value || undefined)}
              />
            </div>

            {/* 邮箱 */}
            <div className='space-y-2'>
              <Label>邮箱</Label>
              <Input
                placeholder='模糊匹配'
                value={formData.email || ''}
                onChange={(e) => updateFormField('email', e.target.value || undefined)}
              />
            </div>

            {/* 状态 */}
            <div className='space-y-2'>
              <Label>状态</Label>
              <Select
                value={formData.status || 'all'}
                onValueChange={(value) =>
                  updateFormField('status', value === 'all' ? undefined : (value as any))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='全部状态' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>全部状态</SelectItem>
                  <SelectItem value='active'>启用</SelectItem>
                  <SelectItem value='disabled'>禁用</SelectItem>
                  <SelectItem value='locked'>已锁定</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 角色 */}
            <div className='space-y-2'>
              <Label>角色</Label>
              <Select
                value={formData.role_id ? String(formData.role_id) : 'all'}
                onValueChange={(value) =>
                  updateFormField('role_id', value === 'all' ? undefined : Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='全部角色' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>全部角色</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={String(role.id)}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 超管标识 */}
            <div className='space-y-2'>
              <Label>超管标识</Label>
              <Select
                value={
                  formData.is_super_admin === true
                    ? 'true'
                    : formData.is_super_admin === false
                      ? 'false'
                      : 'all'
                }
                onValueChange={(value) =>
                  updateFormField(
                    'is_super_admin',
                    value === 'all' ? undefined : value === 'true'
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='全部' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>全部</SelectItem>
                  <SelectItem value='true'>是</SelectItem>
                  <SelectItem value='false'>否</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 创建时间范围 */}
            <div className='space-y-2'>
              <Label>创建时间</Label>
              <div className='flex gap-2'>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className='flex-1 justify-start text-left font-normal'
                    >
                      <Calendar className='mr-2 h-4 w-4' />
                      {formData.created_at_start
                        ? format(new Date(formData.created_at_start), 'yyyy-MM-dd', {
                            locale: zhCN
                          })
                        : '开始日期'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <CalendarComponent
                      mode='single'
                      selected={
                        formData.created_at_start
                          ? new Date(formData.created_at_start)
                          : undefined
                      }
                      onSelect={(date) =>
                        updateFormField(
                          'created_at_start',
                          date ? date.toISOString() : undefined
                        )
                      }
                    />
                  </PopoverContent>
                </Popover>
                <span className='self-center text-muted-foreground'>-</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className='flex-1 justify-start text-left font-normal'
                    >
                      <Calendar className='mr-2 h-4 w-4' />
                      {formData.created_at_end
                        ? format(new Date(formData.created_at_end), 'yyyy-MM-dd', {
                            locale: zhCN
                          })
                        : '结束日期'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <CalendarComponent
                      mode='single'
                      selected={
                        formData.created_at_end ? new Date(formData.created_at_end) : undefined
                      }
                      onSelect={(date) =>
                        updateFormField(
                          'created_at_end',
                          date ? date.toISOString() : undefined
                        )
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* 最后登录时间范围 */}
            <div className='space-y-2'>
              <Label>最后登录时间</Label>
              <div className='flex gap-2'>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className='flex-1 justify-start text-left font-normal'
                    >
                      <Calendar className='mr-2 h-4 w-4' />
                      {formData.last_login_start
                        ? format(new Date(formData.last_login_start), 'yyyy-MM-dd', {
                            locale: zhCN
                          })
                        : '开始日期'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <CalendarComponent
                      mode='single'
                      selected={
                        formData.last_login_start
                          ? new Date(formData.last_login_start)
                          : undefined
                      }
                      onSelect={(date) =>
                        updateFormField(
                          'last_login_start',
                          date ? date.toISOString() : undefined
                        )
                      }
                    />
                  </PopoverContent>
                </Popover>
                <span className='self-center text-muted-foreground'>-</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className='flex-1 justify-start text-left font-normal'
                    >
                      <Calendar className='mr-2 h-4 w-4' />
                      {formData.last_login_end
                        ? format(new Date(formData.last_login_end), 'yyyy-MM-dd', {
                            locale: zhCN
                          })
                        : '结束日期'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <CalendarComponent
                      mode='single'
                      selected={
                        formData.last_login_end
                          ? new Date(formData.last_login_end)
                          : undefined
                      }
                      onSelect={(date) =>
                        updateFormField(
                          'last_login_end',
                          date ? date.toISOString() : undefined
                        )
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

