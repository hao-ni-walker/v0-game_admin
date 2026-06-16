'use client';

import React, { useState, useEffect } from 'react';
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

import type { MessageFilters } from '../types';
import { CATEGORY_OPTIONS, DEFAULT_FILTERS } from '../constants';

interface MessageFiltersProps {
  filters: MessageFilters;
  onSearch: (next: Partial<MessageFilters>) => void;
  onReset: () => void;
  loading?: boolean;
}

export function MessageFilters({
  filters,
  onSearch,
  onReset,
  loading = false,
}: MessageFiltersProps) {
  const [formData, setFormData] = useState<MessageFilters>(DEFAULT_FILTERS);

  useEffect(() => {
    setFormData({
      user_id: filters.user_id || '',
      category: filters.category || '',
      page: filters.page || 1,
      page_size: filters.page_size || 20,
    });
  }, [filters]);

  const updateFormField = (
    key: keyof MessageFilters,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch({
      user_id: formData.user_id,
      category: formData.category,
      page: 1,
    });
  };

  const handleReset = () => {
    setFormData(DEFAULT_FILTERS);
    onReset();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const hasActiveFilters = Boolean(filters.user_id || filters.category);

  return (
    <div className='flex flex-wrap items-center gap-3'>
      <div className='relative max-w-xs flex-1'>
        <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
        <Input
          placeholder='请输入用户 ID'
          value={formData.user_id}
          onChange={(e) => updateFormField('user_id', e.target.value)}
          onKeyDown={handleKeyPress}
          className='pl-10'
        />
      </div>

      <Select
        value={formData.category}
        onValueChange={(value) =>
          updateFormField('category', value as MessageFilters['category'])
        }
      >
        <SelectTrigger className='w-[140px] cursor-pointer'>
          <SelectValue placeholder='消息分类' />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className='cursor-pointer'>
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
