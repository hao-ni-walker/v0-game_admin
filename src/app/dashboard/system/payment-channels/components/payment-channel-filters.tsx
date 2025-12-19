import { useState, useEffect } from 'react';
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
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  // 同步外部 filters 到本地表单状态
  useEffect(() => {
    setLocalFilters({
      keyword: filters.keyword || '',
      types: filters.types || [],
      channel_types: filters.channel_types || [],
      status: filters.status || 'all',
      disabled: filters.disabled
    });
  }, [filters]);

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
    onSearch({
      ...localFilters,
      page: 1 // 查询时重置到第一页
    });
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

  // 检查是否有激活的筛选条件
  const hasActiveFilters = Boolean(
    filters.keyword ||
      (filters.types && filters.types.length > 0) ||
      (filters.channel_types && filters.channel_types.length > 0) ||
      filters.status !== 'all' ||
      filters.disabled !== undefined
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
          placeholder='搜索名称或代码...'
          value={localFilters.keyword || ''}
          onChange={(e) => handleInputChange('keyword', e.target.value)}
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
      {/* 第一行：关键词和状态 */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label>关键词</Label>
          <Input
            placeholder='搜索名称或代码...'
            value={localFilters.keyword || ''}
            onChange={(e) => handleInputChange('keyword', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className='space-y-2'>
          <Label>状态</Label>
          <Select
            value={String(localFilters.status || 'all')}
            onValueChange={(value) =>
              handleInputChange(
                'status',
                value === 'all' ? 'all' : parseInt(value)
              )
            }
          >
            <SelectTrigger className='w-full'>
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
      </div>

      {/* 第二行：支付类型多选 */}
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

      {/* 第三行：渠道类型多选 */}
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

      {/* 第四行：复选框筛选 */}
      <div className='grid grid-cols-1 gap-4'>
        <div className='flex items-center space-x-2'>
          <Checkbox
            id='disabled'
            checked={localFilters.disabled === true}
            onCheckedChange={(checked) =>
              handleInputChange('disabled', checked ? true : undefined)
            }
          />
          <Label
            htmlFor='disabled'
            className='cursor-pointer text-sm font-normal'
          >
            仅显示禁用渠道
          </Label>
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
        title='支付渠道筛选'
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
