'use client';

import React, { useEffect, useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { BroadcastFilters } from '../types';
import { DEFAULT_FILTERS, STATUS_OPTIONS } from '../constants';

const ALL_STATUS_VALUE = '__all__';

interface BroadcastFiltersProps {
  filters: BroadcastFilters;
  onSearch: (next: Partial<BroadcastFilters>) => void;
  onReset: () => void;
  loading?: boolean;
}

export function BroadcastFilters({
  filters,
  onSearch,
  onReset,
  loading = false,
}: BroadcastFiltersProps) {
  const [formData, setFormData] = useState<BroadcastFilters>(DEFAULT_FILTERS);

  useEffect(() => {
    setFormData({
      status: filters.status || '',
      page: filters.page || 1,
      page_size: filters.page_size || 20,
    });
  }, [filters]);

  const updateFormField = (
    key: keyof BroadcastFilters,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch({
      status: formData.status,
      page: 1,
    });
  };

  const handleReset = () => {
    setFormData(DEFAULT_FILTERS);
    onReset();
  };

  const hasActiveFilters = Boolean(filters.status);

  return (
    <div className='flex flex-wrap items-center gap-3'>
      <Select
        value={formData.status || ALL_STATUS_VALUE}
        onValueChange={(value) =>
          updateFormField(
            'status',
            value === ALL_STATUS_VALUE ? '' : value
          )
        }
      >
        <SelectTrigger className='w-[160px] cursor-pointer'>
          <SelectValue placeholder='群发状态' />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem
              key={opt.value || ALL_STATUS_VALUE}
              value={opt.value || ALL_STATUS_VALUE}
              className='cursor-pointer'
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        onClick={handleSearch}
        disabled={loading}
        className='shrink-0 cursor-pointer'
      >
        <Search className='mr-2 h-4 w-4' />
        查询
      </Button>

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
}
