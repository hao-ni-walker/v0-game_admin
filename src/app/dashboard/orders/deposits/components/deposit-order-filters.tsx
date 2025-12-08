'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import type { DepositOrderFilters, PaymentChannel } from '../types';
import {
  ORDER_STATUS_OPTIONS,
  HAS_BONUS_OPTIONS,
  getDefaultDateRange
} from '../constants';
import { DepositOrderAPI } from '@/service/api/deposit-order';
import { toast } from 'sonner';

interface DepositOrderFiltersProps {
  filters: DepositOrderFilters;
  onSearch: (filters: Partial<DepositOrderFilters>) => void;
  onReset: () => void;
  onExport?: () => void;
  loading?: boolean;
}

export function DepositOrderFilters({
  filters,
  onSearch,
  onReset,
  onExport,
  loading
}: DepositOrderFiltersProps) {
  const [orderNo, setOrderNo] = useState(filters.orderNo || '');
  const [userKeyword, setUserKeyword] = useState(filters.userKeyword || '');
  const [paymentChannelId, setPaymentChannelId] = useState<string>(
    filters.paymentChannelId?.toString() || ''
  );
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    filters.statuses || []
  );
  const [createdDateRange, setCreatedDateRange] = useState<
    DateRange | undefined
  >(
    filters.createdFrom && filters.createdTo
      ? {
          from: new Date(filters.createdFrom),
          to: new Date(filters.createdTo)
        }
      : getDefaultDateRange()
  );
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [minAmount, setMinAmount] = useState<string>(
    filters.minAmount?.toString() || ''
  );
  const [maxAmount, setMaxAmount] = useState<string>(
    filters.maxAmount?.toString() || ''
  );
  const [hasBonus, setHasBonus] = useState<string>(
    filters.hasBonus === null
      ? 'all'
      : filters.hasBonus === true
        ? 'true'
        : 'false'
  );
  const [currency, setCurrency] = useState(filters.currency || '');
  const [ipAddress, setIpAddress] = useState(filters.ipAddress || '');
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannel[]>([]);

  // 加载支付渠道列表
  useEffect(() => {
    DepositOrderAPI.getPaymentChannels().then((response) => {
      if (response.success && response.data) {
        setPaymentChannels(response.data);
      }
    });
  }, []);

  const handleSearch = () => {
    const searchFilters: Partial<DepositOrderFilters> = {};

    if (orderNo.trim()) {
      searchFilters.orderNo = orderNo.trim();
    }

    if (userKeyword.trim()) {
      searchFilters.userKeyword = userKeyword.trim();
    }

    if (paymentChannelId) {
      searchFilters.paymentChannelId = parseInt(paymentChannelId);
    }

    if (selectedStatuses.length > 0) {
      searchFilters.statuses = selectedStatuses as any[];
    }

    if (createdDateRange?.from && createdDateRange?.to) {
      searchFilters.createdFrom = createdDateRange.from.toISOString();
      searchFilters.createdTo = createdDateRange.to.toISOString();
    }

    // 高级筛选
    if (minAmount.trim()) {
      searchFilters.minAmount = parseFloat(minAmount);
    }

    if (maxAmount.trim()) {
      searchFilters.maxAmount = parseFloat(maxAmount);
    }

    if (hasBonus !== 'all') {
      searchFilters.hasBonus = hasBonus === 'true';
    }

    if (currency.trim()) {
      searchFilters.currency = currency.trim();
    }

    if (ipAddress.trim()) {
      searchFilters.ipAddress = ipAddress.trim();
    }

    onSearch(searchFilters);
  };

  const handleReset = () => {
    setOrderNo('');
    setUserKeyword('');
    setPaymentChannelId('');
    setSelectedStatuses([]);
    setCreatedDateRange(getDefaultDateRange());
    setMinAmount('');
    setMaxAmount('');
    setHasBonus('all');
    setCurrency('');
    setIpAddress('');
    onReset();
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const hasActiveFilters =
    orderNo ||
    userKeyword ||
    paymentChannelId ||
    selectedStatuses.length > 0 ||
    minAmount ||
    maxAmount ||
    hasBonus !== 'all' ||
    currency ||
    ipAddress;

  return (
    <div className='bg-card space-y-4 rounded-lg border p-4'>
      {/* 第一行：高频筛选 */}
      <div className='flex flex-wrap items-center gap-2'>
        <Input
          placeholder='订单号（平台/渠道订单号）'
          value={orderNo}
          onChange={(e) => setOrderNo(e.target.value)}
          className='w-64'
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />

        <Input
          placeholder='用户 ID / 用户名 / 手机号'
          value={userKeyword}
          onChange={(e) => setUserKeyword(e.target.value)}
          className='w-64'
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />

        <Select value={paymentChannelId} onValueChange={setPaymentChannelId}>
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='支付渠道' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=''>全部渠道</SelectItem>
            {paymentChannels.map((channel) => (
              <SelectItem key={channel.id} value={channel.id.toString()}>
                {channel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 订单状态多选 */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='outline' className='w-40 justify-between'>
              <span>订单状态</span>
              {selectedStatuses.length > 0 && (
                <Badge variant='secondary' className='ml-2'>
                  {selectedStatuses.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-56'>
            <div className='space-y-2'>
              {ORDER_STATUS_OPTIONS.map((option) => (
                <div key={option.value} className='flex items-center space-x-2'>
                  <Checkbox
                    id={`status-${option.value}`}
                    checked={selectedStatuses.includes(option.value)}
                    onCheckedChange={() => toggleStatus(option.value)}
                  />
                  <label
                    htmlFor={`status-${option.value}`}
                    className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* 创建时间范围 */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className='w-64 justify-start text-left font-normal'
            >
              <Calendar className='mr-2 h-4 w-4' />
              {createdDateRange?.from && createdDateRange?.to
                ? `${format(createdDateRange.from, 'yyyy-MM-dd', { locale: zhCN })} - ${format(createdDateRange.to, 'yyyy-MM-dd', { locale: zhCN })}`
                : '选择日期范围'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <CalendarComponent
              mode='range'
              selected={createdDateRange}
              onSelect={setCreatedDateRange}
              numberOfMonths={2}
              locale={zhCN}
            />
          </PopoverContent>
        </Popover>

        <Button onClick={handleSearch} disabled={loading}>
          <Search className='mr-2 h-4 w-4' />
          查询
        </Button>

        <Button variant='outline' onClick={handleReset} disabled={loading}>
          重置
        </Button>

        {onExport && (
          <Button variant='outline' onClick={onExport} disabled={loading}>
            <Download className='mr-2 h-4 w-4' />
            导出
          </Button>
        )}

        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant='outline'>
              <Filter className='mr-2 h-4 w-4' />
              高级筛选
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </div>

      {/* 第二行：高级筛选（可折叠） */}
      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <CollapsibleContent className='space-y-4 border-t pt-4'>
          <div className='grid grid-cols-2 gap-4'>
            {/* 金额区间 */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>最小金额</label>
              <Input
                type='number'
                placeholder='输入最小金额'
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>最大金额</label>
              <Input
                type='number'
                placeholder='输入最大金额'
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>

            {/* 是否有赠送 */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>是否有赠送</label>
              <Select value={hasBonus} onValueChange={setHasBonus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HAS_BONUS_OPTIONS.map((option) => (
                    <SelectItem
                      key={String(option.value)}
                      value={
                        option.value === null ? 'all' : String(option.value)
                      }
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 币种 */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>币种</label>
              <Input
                placeholder='输入币种（如：CNY、USD）'
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>

            {/* IP 地址 */}
            <div className='col-span-2 space-y-2'>
              <label className='text-sm font-medium'>IP 地址</label>
              <Input
                placeholder='支持前缀匹配'
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
