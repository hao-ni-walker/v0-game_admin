import { useState } from 'react';
import { Search, X } from 'lucide-react';
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
import type {
  PaymentChannelFilters,
  ChannelType,
  PaymentChannelType
} from '../types';
import {
  PAYMENT_TYPE_OPTIONS,
  CHANNEL_TYPE_OPTIONS,
  STATUS_OPTIONS
} from '../constants';

interface PaymentChannelFiltersProps {
  filters: PaymentChannelFilters;
  onSearch: (filters: Partial<PaymentChannelFilters>) => void;
  onReset: () => void;
  loading?: boolean;
}

export function PaymentChannelFilters({
  filters,
  onSearch,
  onReset,
  loading
}: PaymentChannelFiltersProps) {
  const [localFilters, setLocalFilters] = useState<
    Partial<PaymentChannelFilters>
  >({
    keyword: filters.keyword || '',
    types: filters.types || [],
    channel_types: filters.channel_types || [],
    status: filters.status || 'all',
    disabled: filters.disabled
  });

  const handleInputChange = (
    field: keyof PaymentChannelFilters,
    value: any
  ) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTypeToggle = (type: PaymentChannelType) => {
    const currentTypes = localFilters.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    handleInputChange('types', newTypes);
  };

  const handleChannelTypeToggle = (channelType: ChannelType) => {
    const currentTypes = localFilters.channel_types || [];
    const newTypes = currentTypes.includes(channelType)
      ? currentTypes.filter((t) => t !== channelType)
      : [...currentTypes, channelType];
    handleInputChange('channel_types', newTypes);
  };

  const handleSearch = () => {
    onSearch(localFilters);
  };

  const handleReset = () => {
    setLocalFilters({
      keyword: '',
      types: [],
      channel_types: [],
      status: 'all',
      disabled: undefined
    });
    onReset();
  };

  return (
    <div className='bg-card space-y-4 rounded-lg border p-4'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {/* 关键词搜索 */}
        <div className='space-y-2'>
          <Label htmlFor='keyword'>关键词</Label>
          <Input
            id='keyword'
            placeholder='搜索名称或代码'
            value={localFilters.keyword || ''}
            onChange={(e) => handleInputChange('keyword', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* 状态筛选 */}
        <div className='space-y-2'>
          <Label htmlFor='status'>状态</Label>
          <Select
            value={String(localFilters.status || 'all')}
            onValueChange={(value) =>
              handleInputChange(
                'status',
                value === 'all' ? 'all' : parseInt(value)
              )
            }
          >
            <SelectTrigger id='status'>
              <SelectValue placeholder='选择状态' />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 禁用状态 */}
        <div className='space-y-2'>
          <Label>禁用状态</Label>
          <div className='flex items-center space-x-2 pt-2'>
            <Checkbox
              id='disabled'
              checked={localFilters.disabled === true}
              onCheckedChange={(checked) =>
                handleInputChange('disabled', checked ? true : undefined)
              }
            />
            <label
              htmlFor='disabled'
              className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            >
              仅显示禁用渠道
            </label>
          </div>
        </div>
      </div>

      {/* 支付类型多选 */}
      <div className='space-y-2'>
        <Label>支付类型</Label>
        <div className='flex flex-wrap gap-2'>
          {PAYMENT_TYPE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type='button'
              variant={
                localFilters.types?.includes(option.value)
                  ? 'default'
                  : 'outline'
              }
              size='sm'
              onClick={() => handleTypeToggle(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 渠道类型多选 */}
      <div className='space-y-2'>
        <Label>渠道类型</Label>
        <div className='flex flex-wrap gap-2'>
          {CHANNEL_TYPE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type='button'
              variant={
                localFilters.channel_types?.includes(option.value)
                  ? 'default'
                  : 'outline'
              }
              size='sm'
              onClick={() => handleChannelTypeToggle(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className='flex items-center gap-2'>
        <Button onClick={handleSearch} disabled={loading}>
          <Search className='mr-2 h-4 w-4' />
          查询
        </Button>
        <Button variant='outline' onClick={handleReset} disabled={loading}>
          <X className='mr-2 h-4 w-4' />
          重置
        </Button>
      </div>
    </div>
  );
}
