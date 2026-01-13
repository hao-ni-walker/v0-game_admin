'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { ActivityParticipationFilters as FiltersType } from '../types';
import { STATUS_OPTIONS } from '../constants';

interface ActivityParticipationFiltersProps {
  filters: FiltersType;
  onSearch: (filters: FiltersType) => void;
  onReset: () => void;
  loading?: boolean;
}

export function ActivityParticipationFilters({
  filters,
  onSearch,
  onReset,
  loading = false
}: ActivityParticipationFiltersProps) {
  const [formData, setFormData] = useState<FiltersType>(filters);

  useEffect(() => {
    setFormData(filters);
  }, [filters]);

  const updateField = (key: keyof FiltersType, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(formData);
  };

  const handleReset = () => {
    const resetData = {
      page: 1,
      page_size: filters.page_size
    };
    setFormData(resetData);
    onReset();
  };

  return (
    <Card className='p-4'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <div className='space-y-2'>
          <Label>用户ID</Label>
          <Input
            placeholder='请输入用户ID'
            value={formData.user_id || ''}
            onChange={(e) =>
              updateField(
                'user_id',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            type='number'
          />
        </div>
        <div className='space-y-2'>
          <Label>用户名</Label>
          <Input
            placeholder='请输入用户名'
            value={formData.username || ''}
            onChange={(e) => updateField('username', e.target.value)}
          />
        </div>
        <div className='space-y-2'>
          <Label>活动ID</Label>
          <Input
            placeholder='请输入活动ID'
            value={formData.activity_id || ''}
            onChange={(e) =>
              updateField(
                'activity_id',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            type='number'
          />
        </div>
        <div className='space-y-2'>
          <Label>状态</Label>
          <Select
            value={formData.status || 'all'}
            onValueChange={(value) =>
              updateField('status', value === 'all' ? undefined : value)
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
          <Label>参与时间</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className='w-full justify-start text-left font-normal'
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {formData.dateRange?.from ? (
                  formData.dateRange.to ? (
                    <>
                      {format(formData.dateRange.from, 'yyyy-MM-dd')} -{' '}
                      {format(formData.dateRange.to, 'yyyy-MM-dd')}
                    </>
                  ) : (
                    format(formData.dateRange.from, 'yyyy-MM-dd')
                  )
                ) : (
                  <span className='text-muted-foreground'>选择日期范围</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                mode='range'
                selected={formData.dateRange}
                onSelect={(range) => updateField('dateRange', range)}
                numberOfMonths={2}
                locale={zhCN}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className='mt-4 flex justify-end gap-2'>
        <Button variant='outline' onClick={handleReset} disabled={loading}>
          <RotateCcw className='mr-2 h-4 w-4' />
          重置
        </Button>
        <Button onClick={handleSearch} disabled={loading}>
          查询
        </Button>
      </div>
    </Card>
  );
}
