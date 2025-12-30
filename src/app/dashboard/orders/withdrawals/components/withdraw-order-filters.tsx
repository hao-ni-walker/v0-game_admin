'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Download } from 'lucide-react';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import type { WithdrawOrderFilters, PaymentChannel } from '../types';
import {
  ORDER_STATUS_OPTIONS,
  AUDIT_STATUS_OPTIONS,
  PAYOUT_STATUS_OPTIONS,
  STATUS_TAB_OPTIONS,
  getDefaultDateRange
} from '../constants';
import { WithdrawOrderAPI } from '@/service/api/withdraw-order';

interface WithdrawOrderFiltersProps {
  filters: WithdrawOrderFilters;
  onSearch: (filters: Partial<WithdrawOrderFilters>) => void;
  onReset: () => void;
  onExport?: () => void;
  onStatusTabChange?: (status: string) => void;
  loading?: boolean;
}

export function WithdrawOrderFilters({
  filters,
  onSearch,
  onReset,
  onExport,
  onStatusTabChange,
  loading
}: WithdrawOrderFiltersProps) {
  const [orderNo, setOrderNo] = useState(filters.orderNo || '');
  const [channelOrderNo, setChannelOrderNo] = useState(
    filters.channelOrderNo || ''
  );
  const [userKeyword, setUserKeyword] = useState(filters.userKeyword || '');
  const [paymentChannelId, setPaymentChannelId] = useState<string>(
    filters.paymentChannelId?.toString() || 'all'
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
  const [auditStatus, setAuditStatus] = useState<string>(
    filters.auditStatus || 'all'
  );
  const [payoutStatus, setPayoutStatus] = useState<string>(
    filters.payoutStatus || 'all'
  );
  const [auditorKeyword, setAuditorKeyword] = useState(
    filters.auditorKeyword || ''
  );
  const [auditDateRange, setAuditDateRange] = useState<DateRange | undefined>(
    filters.auditFrom && filters.auditTo
      ? {
          from: new Date(filters.auditFrom),
          to: new Date(filters.auditTo)
        }
      : undefined
  );
  const [completedDateRange, setCompletedDateRange] = useState<
    DateRange | undefined
  >(
    filters.completedFrom && filters.completedTo
      ? {
          from: new Date(filters.completedFrom),
          to: new Date(filters.completedTo)
        }
      : undefined
  );
  const [ipAddress, setIpAddress] = useState(filters.ipAddress || '');
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannel[]>([]);
  const [activeStatusTab, setActiveStatusTab] = useState<string>('all');

  // 加载支付渠道列表
  useEffect(() => {
    WithdrawOrderAPI.getPaymentChannels().then((response) => {
      if (response.success && response.data) {
        setPaymentChannels(response.data);
      }
    });
  }, []);

  // 状态 Tab 变化处理
  const handleStatusTabChange = (value: string) => {
    setActiveStatusTab(value);
    if (value === 'all') {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses([value]);
    }
    onStatusTabChange?.(value);
  };

  const handleSearch = () => {
    const searchFilters: Partial<WithdrawOrderFilters> = {};

    if (orderNo.trim()) {
      searchFilters.orderNo = orderNo.trim();
    }

    if (channelOrderNo.trim()) {
      searchFilters.channelOrderNo = channelOrderNo.trim();
    }

    if (userKeyword.trim()) {
      searchFilters.userKeyword = userKeyword.trim();
    }

    if (paymentChannelId && paymentChannelId !== 'all') {
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

    if (auditStatus !== 'all') {
      searchFilters.auditStatus = auditStatus as any;
    }

    if (payoutStatus !== 'all') {
      searchFilters.payoutStatus = payoutStatus as any;
    }

    if (auditorKeyword.trim()) {
      searchFilters.auditorKeyword = auditorKeyword.trim();
    }

    if (auditDateRange?.from && auditDateRange?.to) {
      searchFilters.auditFrom = auditDateRange.from.toISOString();
      searchFilters.auditTo = auditDateRange.to.toISOString();
    }

    if (completedDateRange?.from && completedDateRange?.to) {
      searchFilters.completedFrom = completedDateRange.from.toISOString();
      searchFilters.completedTo = completedDateRange.to.toISOString();
    }

    if (ipAddress.trim()) {
      searchFilters.ipAddress = ipAddress.trim();
    }

    onSearch(searchFilters);
  };

  const handleReset = () => {
    setOrderNo('');
    setChannelOrderNo('');
    setUserKeyword('');
    setPaymentChannelId('all');
    setSelectedStatuses([]);
    setCreatedDateRange(getDefaultDateRange());
    setMinAmount('');
    setMaxAmount('');
    setAuditStatus('all');
    setPayoutStatus('all');
    setAuditorKeyword('');
    setAuditDateRange(undefined);
    setCompletedDateRange(undefined);
    setIpAddress('');
    setActiveStatusTab('all');
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
    channelOrderNo ||
    userKeyword ||
    (paymentChannelId && paymentChannelId !== 'all') ||
    selectedStatuses.length > 0 ||
    minAmount ||
    maxAmount ||
    auditStatus !== 'all' ||
    payoutStatus !== 'all' ||
    auditorKeyword ||
    auditDateRange ||
    completedDateRange ||
    ipAddress;

  return (
    <div className='space-y-4'>
      {/* 状态快捷筛选 Tab */}
      <div className='bg-card rounded-lg border p-2'>
        <Tabs value={activeStatusTab} onValueChange={handleStatusTabChange}>
          <TabsList className='grid w-full grid-cols-5'>
            {STATUS_TAB_OPTIONS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
                {tab.count !== undefined && (
                  <Badge variant='secondary' className='ml-2'>
                    {tab.count}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* 筛选区 */}
      <div className='bg-card space-y-4 rounded-lg border p-4'>
        {/* 第一行：高频筛选 */}
        <div className='flex flex-wrap items-center gap-2'>
          <Input
            placeholder='平台订单号'
            value={orderNo}
            onChange={(e) => setOrderNo(e.target.value)}
            className='w-48'
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />

          <Input
            placeholder='渠道订单号'
            value={channelOrderNo}
            onChange={(e) => setChannelOrderNo(e.target.value)}
            className='w-48'
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />

          <Input
            placeholder='用户 ID / 用户名 / 手机号'
            value={userKeyword}
            onChange={(e) => setUserKeyword(e.target.value)}
            className='w-56'
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />

          <Select value={paymentChannelId} onValueChange={setPaymentChannelId}>
            <SelectTrigger className='w-48'>
              <SelectValue placeholder='提现渠道' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部渠道</SelectItem>
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
                  <div
                    key={option.value}
                    className='flex items-center space-x-2'
                  >
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

          {/* 申请时间范围 */}
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

              {/* 审核状态 */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>审核状态</label>
                <Select value={auditStatus} onValueChange={setAuditStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUDIT_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 出款状态 */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>出款状态</label>
                <Select value={payoutStatus} onValueChange={setPayoutStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYOUT_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 审核人 */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>审核人</label>
                <Input
                  placeholder='审核人姓名或ID'
                  value={auditorKeyword}
                  onChange={(e) => setAuditorKeyword(e.target.value)}
                />
              </div>

              {/* 审核时间范围 */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>审核时间</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className='w-full justify-start text-left font-normal'
                    >
                      <Calendar className='mr-2 h-4 w-4' />
                      {auditDateRange?.from && auditDateRange?.to
                        ? `${format(auditDateRange.from, 'yyyy-MM-dd', { locale: zhCN })} - ${format(auditDateRange.to, 'yyyy-MM-dd', { locale: zhCN })}`
                        : '选择日期范围'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <CalendarComponent
                      mode='range'
                      selected={auditDateRange}
                      onSelect={setAuditDateRange}
                      numberOfMonths={2}
                      locale={zhCN}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* 完成时间范围 */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>完成时间</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className='w-full justify-start text-left font-normal'
                    >
                      <Calendar className='mr-2 h-4 w-4' />
                      {completedDateRange?.from && completedDateRange?.to
                        ? `${format(completedDateRange.from, 'yyyy-MM-dd', { locale: zhCN })} - ${format(completedDateRange.to, 'yyyy-MM-dd', { locale: zhCN })}`
                        : '选择日期范围'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <CalendarComponent
                      mode='range'
                      selected={completedDateRange}
                      onSelect={setCompletedDateRange}
                      numberOfMonths={2}
                      locale={zhCN}
                    />
                  </PopoverContent>
                </Popover>
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
    </div>
  );
}
