'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TRADEABLE_OPTIONS } from '../constants';
import type { CurrencyFilters } from '../types';

interface Props {
  filters: CurrencyFilters;
  setSearch: (v: string) => void;
  setTradeable: (v: CurrencyFilters['is_tradeable']) => void;
  onReset: () => void;
  loading: boolean;
}

export function CurrencyFilters({ filters, setSearch, setTradeable, onReset, loading }: Props) {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Input
        placeholder='搜索代码或名称'
        value={filters.search}
        onChange={(e) => setSearch(e.target.value)}
        className='w-64'
      />
      <div className='flex items-center gap-1'>
        {TRADEABLE_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={filters.is_tradeable === opt.value ? 'default' : 'outline'}
            size='sm'
            onClick={() => setTradeable(opt.value)}
            disabled={loading}
            className='cursor-pointer'
          >
            {opt.label}
          </Button>
        ))}
      </div>
      <Button variant='ghost' onClick={onReset} disabled={loading} className='cursor-pointer'>
        清除
      </Button>
    </div>
  );
}
