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
import { AdvancedFilterContainer } from '@/components/shared/advanced-filter-container';
import type { PaymentPlatformFilters } from '../types';
import { STATUS_OPTIONS } from '../constants';

interface PaymentChannelFiltersProps {
  filters: PaymentPlatformFilters;
  onSearch: (filters: Partial<PaymentPlatformFilters>) => void;
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
    Partial<PaymentPlatformFilters>
  >({
    keyword: filters.keyword || '',
    enabled: filters.enabled ?? 'all'
  });
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  // 同步外部 filters 到本地表单状态
  useEffect(() => {
    setLocalFilters({
      keyword: filters.keyword || '',
      enabled: filters.enabled ?? 'all'
    });
  }, [filters]);

  const handleInputChange = (
    field: keyof PaymentPlatformFilters,
    value: any
  ) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value
    }));
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
      enabled: 'all'
    });
    onReset();
  };

  // 检查是否有激活的筛选条件
  const hasActiveFilters = Boolean(
    filters.keyword ||
      (filters.enabled !== undefined && filters.enabled !== 'all')
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
          placeholder='搜索平台名称...'
          value={localFilters.keyword || ''}
          onChange={(e) => handleInputChange('keyword', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className='pl-10'
        />
      </div>

      {/* 状态筛选 */}
      <Select
        value={String(localFilters.enabled ?? 'all')}
        onValueChange={(value) =>
          handleInputChange(
            'enabled',
            value === 'all' ? 'all' : value === 'true'
          )
        }
      >
        <SelectTrigger className='w-[120px]'>
          <SelectValue placeholder='状态' />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={String(option.value)} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 查询按钮 */}
      <Button
        onClick={handleSearch}
        disabled={loading}
        className='shrink-0 cursor-pointer'
      >
        <Search className='mr-2 h-4 w-4' />
        查询
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
            placeholder='搜索平台名称...'
            value={localFilters.keyword || ''}
            onChange={(e) => handleInputChange('keyword', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className='space-y-2'>
          <Label>状态</Label>
          <Select
            value={String(localFilters.enabled ?? 'all')}
            onValueChange={(value) =>
              handleInputChange(
                'enabled',
                value === 'all' ? 'all' : value === 'true'
              )
            }
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='选择状态' />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem
                  key={String(option.value)}
                  value={String(option.value)}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        title='支付平台筛选'
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
