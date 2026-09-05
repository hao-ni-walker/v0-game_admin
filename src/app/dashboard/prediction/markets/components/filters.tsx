'use client';

import { Search, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PredictionFilters } from '../hooks';

interface MarketFiltersProps {
  filters: PredictionFilters;
  onSearch: (patch: Partial<PredictionFilters>) => void;
  onReset: () => void;
  loading: boolean;
}

export function MarketFilters({ filters, onSearch, onReset, loading }: MarketFiltersProps) {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Input
        placeholder='搜索市场问题 / slug'
        value={filters.q}
        onChange={(e) => onSearch({ q: e.target.value, page: 1 })}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSearch({ q: filters.q, page: 1 });
        }}
        className='w-72'
        disabled={loading}
      />
      <Select
        value={filters.is_listed}
        onValueChange={(v) => onSearch({ is_listed: v as PredictionFilters['is_listed'], page: 1 })}
        disabled={loading}
      >
        <SelectTrigger className='w-32'>
          <SelectValue placeholder='上架状态' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>全部上架状态</SelectItem>
          <SelectItem value='true'>已上架</SelectItem>
          <SelectItem value='false'>未上架</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.closed}
        onValueChange={(v) => onSearch({ closed: v as PredictionFilters['closed'], page: 1 })}
        disabled={loading}
      >
        <SelectTrigger className='w-32'>
          <SelectValue placeholder='市场状态' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>全部市场</SelectItem>
          <SelectItem value='false'>进行中</SelectItem>
          <SelectItem value='true'>已关闭</SelectItem>
        </SelectContent>
      </Select>
      <Button variant='ghost' size='sm' onClick={onReset} disabled={loading}>
        <RotateCcw className='mr-1 h-4 w-4' />
        重置
      </Button>
      <span className='text-muted-foreground ml-auto hidden text-xs sm:inline'>
        <Search className='mr-1 inline h-3 w-3' />
        搜索框回车提交
      </span>
    </div>
  );
}
