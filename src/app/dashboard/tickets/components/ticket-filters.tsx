'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar } from 'lucide-react';
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
import type { TicketListParams } from '@/service/api/ticket';
import type { DateRange } from 'react-day-picker';

interface TicketFiltersProps {
  filters: TicketListParams;
  onSearch: (filters: Partial<TicketListParams>) => void;
  onReset: () => void;
  loading?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'open', label: '待处理' },
  { value: 'in_progress', label: '处理中' },
  { value: 'pending', label: '挂起' },
  { value: 'resolved', label: '已解决' },
  { value: 'closed', label: '已关闭' },
  { value: 'canceled', label: '已取消' }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: '低' },
  { value: 'normal', label: '普通' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '紧急' }
];

const CATEGORY_OPTIONS = [
  { value: 'payment', label: '支付问题' },
  { value: 'account', label: '账户问题' },
  { value: 'game', label: '游戏问题' },
  { value: 'technical', label: '技术问题' },
  { value: 'other', label: '其他' }
];

export function TicketFilters({
  filters,
  onSearch,
  onReset,
  loading
}: TicketFiltersProps) {
  const [keyword, setKeyword] = useState(filters.keyword || '');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    filters.statuses || []
  );
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(
    filters.priorities || []
  );
  const [category, setCategory] = useState<string>(
    filters.categories?.[0] || 'all'
  );
  const [userId, setUserId] = useState<string>(
    filters.userIds?.[0]?.toString() || ''
  );
  const [assigneeId, setAssigneeId] = useState<string>(
    filters.assigneeIds?.[0]?.toString() || ''
  );
  const [tags, setTags] = useState<string[]>(filters.tagsAny || []);
  const [tagInput, setTagInput] = useState('');
  const [createdDateRange, setCreatedDateRange] = useState<
    DateRange | undefined
  >(
    filters.createdFrom && filters.createdTo
      ? {
          from: new Date(filters.createdFrom),
          to: new Date(filters.createdTo)
        }
      : undefined
  );
  const [dueDateRange, setDueDateRange] = useState<DateRange | undefined>(
    filters.dueFrom && filters.dueTo
      ? {
          from: new Date(filters.dueFrom),
          to: new Date(filters.dueTo)
        }
      : undefined
  );
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleSearch = () => {
    const searchFilters: Partial<TicketListParams> = {};

    if (keyword.trim()) {
      searchFilters.keyword = keyword.trim();
    }

    if (selectedStatuses.length > 0) {
      searchFilters.statuses = selectedStatuses as any[];
    }

    if (selectedPriorities.length > 0) {
      searchFilters.priorities = selectedPriorities as any[];
    }

    if (category && category !== 'all') {
      searchFilters.categories = [category];
    }

    if (userId.trim()) {
      const userIdNum = parseInt(userId.trim());
      if (!isNaN(userIdNum)) {
        searchFilters.userIds = [userIdNum];
      }
    }

    if (assigneeId.trim()) {
      const assigneeIdNum = parseInt(assigneeId.trim());
      if (!isNaN(assigneeIdNum)) {
        searchFilters.assigneeIds = [assigneeIdNum];
      }
    }

    if (tags.length > 0) {
      searchFilters.tagsAny = tags;
    }

    if (createdDateRange?.from && createdDateRange?.to) {
      searchFilters.createdFrom = createdDateRange.from.toISOString();
      searchFilters.createdTo = createdDateRange.to.toISOString();
    }

    if (dueDateRange?.from && dueDateRange?.to) {
      searchFilters.dueFrom = dueDateRange.from.toISOString();
      searchFilters.dueTo = dueDateRange.to.toISOString();
    }

    onSearch(searchFilters);
  };

  const handleReset = () => {
    setKeyword('');
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setCategory('all');
    setUserId('');
    setAssigneeId('');
    setTags([]);
    setTagInput('');
    setCreatedDateRange(undefined);
    setDueDateRange(undefined);
    onReset();
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const togglePriority = (priority: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority]
    );
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const hasActiveFilters =
    keyword ||
    selectedStatuses.length > 0 ||
    selectedPriorities.length > 0 ||
    (category && category !== 'all') ||
    userId ||
    assigneeId ||
    tags.length > 0 ||
    createdDateRange ||
    dueDateRange;

  return (
    <div className='bg-card space-y-4 rounded-lg border p-4'>
      {/* 基础筛选 */}
      <div className='flex flex-wrap items-center gap-2'>
        <Input
          placeholder='搜索标题或描述...'
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className='w-64'
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />

        {/* 状态多选 */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='outline' className='w-40 justify-between'>
              <span>状态</span>
              {selectedStatuses.length > 0 && (
                <Badge variant='secondary' className='ml-2'>
                  {selectedStatuses.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-56'>
            <div className='space-y-2'>
              {STATUS_OPTIONS.map((option) => (
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

        {/* 优先级多选 */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='outline' className='w-40 justify-between'>
              <span>优先级</span>
              {selectedPriorities.length > 0 && (
                <Badge variant='secondary' className='ml-2'>
                  {selectedPriorities.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-56'>
            <div className='space-y-2'>
              {PRIORITY_OPTIONS.map((option) => (
                <div key={option.value} className='flex items-center space-x-2'>
                  <Checkbox
                    id={`priority-${option.value}`}
                    checked={selectedPriorities.includes(option.value)}
                    onCheckedChange={() => togglePriority(option.value)}
                  />
                  <label
                    htmlFor={`priority-${option.value}`}
                    className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='分类' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>全部分类</SelectItem>
            {CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleSearch} disabled={loading}>
          <Search className='mr-2 h-4 w-4' />
          搜索
        </Button>

        <Button variant='outline' onClick={handleReset} disabled={loading}>
          重置
        </Button>

        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant='outline'>
              <Filter className='mr-2 h-4 w-4' />
              高级筛选
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </div>

      {/* 高级筛选 */}
      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <CollapsibleContent className='space-y-4 border-t pt-4'>
          <div className='grid grid-cols-2 gap-4'>
            {/* 用户ID */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>用户ID</label>
              <Input
                type='number'
                placeholder='输入用户ID'
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>

            {/* 处理人ID */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>处理人ID</label>
              <Input
                type='number'
                placeholder='输入处理人ID'
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              />
            </div>

            {/* 创建时间范围 */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>创建时间</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className='w-full justify-start text-left font-normal'
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
            </div>

            {/* 截止时间范围 */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>截止时间</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className='w-full justify-start text-left font-normal'
                  >
                    <Calendar className='mr-2 h-4 w-4' />
                    {dueDateRange?.from && dueDateRange?.to
                      ? `${format(dueDateRange.from, 'yyyy-MM-dd', { locale: zhCN })} - ${format(dueDateRange.to, 'yyyy-MM-dd', { locale: zhCN })}`
                      : '选择日期范围'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <CalendarComponent
                    mode='range'
                    selected={dueDateRange}
                    onSelect={setDueDateRange}
                    numberOfMonths={2}
                    locale={zhCN}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* 标签 */}
            <div className='col-span-2 space-y-2'>
              <label className='text-sm font-medium'>标签</label>
              <div className='flex flex-wrap gap-2'>
                {tags.map((tag) => (
                  <Badge key={tag} variant='secondary' className='gap-1'>
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className='hover:bg-secondary-foreground/20 ml-1 rounded-full'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </Badge>
                ))}
                <div className='flex gap-2'>
                  <Input
                    placeholder='输入标签后按回车'
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className='w-48'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={addTag}
                  >
                    添加
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
