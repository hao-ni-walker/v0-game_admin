'use client';

import * as React from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Check,
  ChevronsUpDown,
  RotateCcw,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DashboardFilter } from '@/types/revenue-dashboard';

// --- MultiSelect Component (Internal) ---

interface MultiSelectProps {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  className
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn('justify-between', className)}
        >
          {selected.length === 0 ? placeholder : `${selected.length} selected`}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0' align='start'>
        <Command>
          <CommandInput
            placeholder={`Search ${placeholder.toLowerCase()}...`}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value} // Use value for search too, ideally use label if needed
                  onSelect={() => handleSelect(option.value)}
                >
                  <div
                    className={cn(
                      'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                      selected.includes(option.value)
                        ? 'bg-primary text-primary-foreground'
                        : 'opacity-50 [&_svg]:invisible'
                    )}
                  >
                    <Check className={cn('h-4 w-4')} />
                  </div>
                  <span>{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {selected.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onChange([])}
                    className='justify-center text-center'
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// --- Main FilterBar Component ---

interface FilterBarProps {
  filters: DashboardFilter;
  onFilterChange: (newFilters: DashboardFilter) => void;
  onSearch: () => void;
  onReset: () => void;
  loading?: boolean;
}

export function FilterBar({
  filters,
  onFilterChange,
  onSearch,
  onReset,
  loading
}: FilterBarProps) {
  // Mock Options
  const gameOptions = [
    { label: 'Game A', value: 'game_a' },
    { label: 'Game B', value: 'game_b' },
    { label: 'Game C', value: 'game_c' }
  ];
  const serverOptions = [
    { label: 'Server 1', value: 's1' },
    { label: 'Server 2', value: 's2' }
  ];
  const channelOptions = [
    { label: 'App Store', value: 'app_store' },
    { label: 'Google Play', value: 'google_play' },
    { label: 'Web', value: 'web' }
  ];

  const updateFilter = (key: keyof DashboardFilter, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className='bg-card flex flex-col gap-4 rounded-lg border p-4 shadow-sm'>
      {/* Top Row: Date & Main Filters */}
      <div className='flex flex-wrap items-center gap-4'>
        {/* Date Range Picker */}
        <div className='grid gap-2'>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id='date'
                variant={'outline'}
                className={cn(
                  'w-[260px] justify-start text-left font-normal',
                  !filters.dateRange && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {filters.dateRange?.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, 'LLL dd, y')} -{' '}
                      {format(filters.dateRange.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(filters.dateRange.from, 'LLL dd, y')
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                initialFocus
                mode='range'
                defaultMonth={filters.dateRange?.from}
                selected={filters.dateRange}
                onSelect={(range) => updateFilter('dateRange', range)}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Game Selection */}
        <MultiSelect
          options={gameOptions}
          selected={filters.games}
          onChange={(val) => updateFilter('games', val)}
          placeholder='Select Games'
          className='w-[200px]'
        />

        {/* Server Selection */}
        <MultiSelect
          options={serverOptions}
          selected={filters.servers}
          onChange={(val) => updateFilter('servers', val)}
          placeholder='Select Servers'
          className='w-[200px]'
        />

        {/* Channel Selection */}
        <MultiSelect
          options={channelOptions}
          selected={filters.channels}
          onChange={(val) => updateFilter('channels', val)}
          placeholder='Select Channels'
          className='w-[200px]'
        />

        {/* Platform Selection */}
        <Select
          value={filters.platforms[0] || 'all'}
          onValueChange={(val) =>
            updateFilter('platforms', val === 'all' ? [] : [val])
          }
        >
          <SelectTrigger className='w-[150px]'>
            <SelectValue placeholder='Platform' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Platforms</SelectItem>
            <SelectItem value='pc'>PC</SelectItem>
            <SelectItem value='ios'>iOS</SelectItem>
            <SelectItem value='android'>Android</SelectItem>
            <SelectItem value='h5'>H5</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bottom Row: Detailed Filters & Actions */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex flex-wrap items-center gap-4'>
          {/* User ID */}
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium'>User ID:</span>
            <Input
              placeholder='Search User ID...'
              value={filters.userId}
              onChange={(e) => updateFilter('userId', e.target.value)}
              className='w-[150px]'
            />
          </div>

          {/* Amount Range */}
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium'>Amount:</span>
            <Input
              type='number'
              placeholder='Min'
              value={filters.minAmount}
              onChange={(e) => updateFilter('minAmount', e.target.value)}
              className='w-[100px]'
            />
            <span className='text-muted-foreground'>-</span>
            <Input
              type='number'
              placeholder='Max'
              value={filters.maxAmount}
              onChange={(e) => updateFilter('maxAmount', e.target.value)}
              className='w-[100px]'
            />
          </div>
        </div>

        <div className='ml-auto flex items-center gap-2'>
          <Button variant='ghost' onClick={onReset} disabled={loading}>
            <RotateCcw className='mr-2 h-4 w-4' />
            Reset
          </Button>
          <Button onClick={onSearch} disabled={loading}>
            <Filter className='mr-2 h-4 w-4' />
            Apply Filter
          </Button>
        </div>
      </div>
    </div>
  );
}
