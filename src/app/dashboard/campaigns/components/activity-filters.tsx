import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { CalendarIcon, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { ActivityFilters } from '../types';

interface ActivityFiltersProps {
  filters: ActivityFilters;
  onSearch: (filters: ActivityFilters) => void;
  onReset: () => void;
  loading?: boolean;
}

export function ActivityFilters({
  filters,
  onSearch,
  onReset,
  loading
}: ActivityFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ActivityFilters>(filters);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    filters.startFrom ? new Date(filters.startFrom) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    filters.startTo ? new Date(filters.startTo) : undefined
  );

  const handleSearch = () => {
    const searchFilters = { ...localFilters };

    if (dateFrom) {
      searchFilters.startFrom = dateFrom.toISOString();
    }

    if (dateTo) {
      searchFilters.startTo = dateTo.toISOString();
    }

    onSearch(searchFilters);
  };

  const handleReset = () => {
    setLocalFilters({
      page: 1,
      pageSize: 20
    });
    setDateFrom(undefined);
    setDateTo(undefined);
    onReset();
  };

  const handleInputChange = (field: keyof ActivityFilters, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className='bg-card rounded-lg border p-4'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {/* 关键词搜索 */}
        <div className='space-y-2'>
          <label className='text-sm font-medium'>关键词</label>
          <Input
            placeholder='活动名称/编码/类型'
            value={localFilters.keyword || ''}
            onChange={(e) => handleInputChange('keyword', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* 活动类型 */}
        <div className='space-y-2'>
          <label className='text-sm font-medium'>活动类型</label>
          <Select
            value={localFilters.activityTypes?.[0] || ''}
            onValueChange={(value) =>
              handleInputChange('activityTypes', value ? [value] : [])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='请选择类型' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='first_deposit'>首充活动</SelectItem>
              <SelectItem value='daily_signin'>每日签到</SelectItem>
              <SelectItem value='vip_reward'>VIP奖励</SelectItem>
              <SelectItem value='limited_pack'>限时礼包</SelectItem>
              <SelectItem value='lottery'>抽奖活动</SelectItem>
              <SelectItem value='leaderboard'>排行榜</SelectItem>
              <SelectItem value='cashback'>返利活动</SelectItem>
              <SelectItem value='referral'>推荐奖励</SelectItem>
              <SelectItem value='other'>其他活动</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 状态 */}
        <div className='space-y-2'>
          <label className='text-sm font-medium'>状态</label>
          <Select
            value={localFilters.statuses?.[0] || ''}
            onValueChange={(value) =>
              handleInputChange('statuses', value ? [value] : [])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder='请选择状态' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='draft'>草稿</SelectItem>
              <SelectItem value='scheduled'>待上线</SelectItem>
              <SelectItem value='active'>进行中</SelectItem>
              <SelectItem value='paused'>已暂停</SelectItem>
              <SelectItem value='ended'>已结束</SelectItem>
              <SelectItem value='disabled'>已禁用</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 时间范围 */}
        <div className='space-y-2'>
          <label className='text-sm font-medium'>时间范围</label>
          <div className='flex gap-2'>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dateFrom && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {dateFrom ? format(dateFrom, 'yyyy-MM-dd') : '开始时间'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0'>
                <Calendar
                  mode='single'
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  locale={zhCN}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dateTo && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {dateTo ? format(dateTo, 'yyyy-MM-dd') : '结束时间'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0'>
                <Calendar
                  mode='single'
                  selected={dateTo}
                  onSelect={setDateTo}
                  locale={zhCN}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className='mt-4 flex justify-end gap-2'>
        <Button variant='outline' onClick={handleReset} disabled={loading}>
          <RotateCcw className='mr-2 h-4 w-4' />
          重置
        </Button>
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? '搜索中...' : '搜索'}
        </Button>
      </div>
    </div>
  );
}
