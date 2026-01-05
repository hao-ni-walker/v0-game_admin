'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
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
import { Card } from '@/components/ui/card';

import type { GameFlowFilters, GameOption, PlatformOption } from '../types';
import { apiRequest } from '@/service/api/base';

interface GameFlowFiltersProps {
  /** 筛选条件值 */
  filters: GameFlowFilters;
  /** 查询回调 */
  onSearch: (filters: Partial<GameFlowFilters>) => void;
  /** 重置回调 */
  onReset: () => void;
  /** 加载状态 */
  loading?: boolean;
}

/**
 * 游戏流水筛选组件
 */
export function GameFlowFilters({
  filters,
  onSearch,
  onReset,
  loading = false
}: GameFlowFiltersProps) {
  // 本地表单状态
  const [formData, setFormData] = useState<GameFlowFilters>({
    dateRange: undefined,
    game_id: undefined,
    platform_id: undefined,
    page: 1,
    page_size: 10
  });

  // 游戏和平台选项
  const [games, setGames] = useState<GameOption[]>([]);
  const [platforms, setPlatforms] = useState<PlatformOption[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);

  // 同步外部 filters 到本地表单状态
  useEffect(() => {
    setFormData({
      dateRange: filters.dateRange,
      game_id: filters.game_id,
      platform_id: filters.platform_id,
      page: filters.page || 1,
      page_size: filters.page_size || 10
    });
  }, [filters]);

  // 加载游戏列表
  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoadingGames(true);
        const res = await apiRequest<{
          items: Array<{ id: number; name: string }>;
        }>('/admin/games?page=1&page_size=1000');

        if (res.success && res.data?.items) {
          setGames(res.data.items);
        }
      } catch (error) {
        console.error('获取游戏列表失败:', error);
      } finally {
        setLoadingGames(false);
      }
    };

    loadGames();
  }, []);

  // 加载平台列表
  useEffect(() => {
    const loadPlatforms = async () => {
      try {
        setLoadingPlatforms(true);
        const res = await apiRequest<{
          items: Array<{ id: number; name: string }>;
        }>('/admin/platforms?page=1&page_size=1000');

        if (res.success && res.data?.items) {
          setPlatforms(res.data.items);
        }
      } catch (error) {
        console.error('获取平台列表失败:', error);
      } finally {
        setLoadingPlatforms(false);
      }
    };

    loadPlatforms();
  }, []);

  /**
   * 更新表单字段值
   */
  const updateFormField = (key: keyof GameFlowFilters, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * 执行查询
   */
  const handleSearch = () => {
    onSearch({
      ...formData,
      page: 1 // 查询时重置到第一页
    });
  };

  /**
   * 重置筛选条件
   */
  const handleReset = () => {
    const resetData = {
      dateRange: undefined,
      game_id: undefined,
      platform_id: undefined,
      page: 1,
      page_size: 10
    };
    setFormData(resetData);
    onReset();
  };

  /**
   * 检查是否有激活的筛选条件
   */
  const hasActiveFilters = Boolean(
    formData.dateRange || formData.game_id || formData.platform_id
  );

  return (
    <Card className='p-4'>
      <div className='flex flex-wrap items-center gap-4'>
        {/* 日期范围选择器 */}
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground text-sm font-medium whitespace-nowrap'>
            日期范围
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className='w-[260px] justify-start text-left font-normal'
              >
                <Calendar className='mr-2 h-4 w-4' />
                {formData.dateRange?.from && formData.dateRange?.to ? (
                  <>
                    {format(formData.dateRange.from, 'yyyy-MM-dd', {
                      locale: zhCN
                    })}{' '}
                    -{' '}
                    {format(formData.dateRange.to, 'yyyy-MM-dd', {
                      locale: zhCN
                    })}
                  </>
                ) : (
                  <span className='text-muted-foreground'>选择日期范围</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <CalendarComponent
                mode='range'
                selected={formData.dateRange}
                onSelect={(range) => updateFormField('dateRange', range)}
                numberOfMonths={2}
                locale={zhCN}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* 游戏选择 */}
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground text-sm font-medium whitespace-nowrap'>
            游戏
          </span>
          <Select
            value={formData.game_id?.toString() || 'all'}
            onValueChange={(value) =>
              updateFormField(
                'game_id',
                value === 'all' ? undefined : parseInt(value)
              )
            }
            disabled={loadingGames}
          >
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='全部游戏' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部游戏</SelectItem>
              {games.map((game) => (
                <SelectItem key={game.id} value={game.id.toString()}>
                  {game.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 平台选择 */}
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground text-sm font-medium whitespace-nowrap'>
            平台
          </span>
          <Select
            value={formData.platform_id?.toString() || 'all'}
            onValueChange={(value) =>
              updateFormField(
                'platform_id',
                value === 'all' ? undefined : parseInt(value)
              )
            }
            disabled={loadingPlatforms}
          >
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='全部平台' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部平台</SelectItem>
              {platforms.map((platform) => (
                <SelectItem key={platform.id} value={platform.id.toString()}>
                  {platform.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 操作按钮 */}
        <div className='flex items-center gap-2'>
          <Button onClick={handleSearch} disabled={loading}>
            查询
          </Button>
          {hasActiveFilters && (
            <Button variant='outline' onClick={handleReset} disabled={loading}>
              <RotateCcw className='mr-2 h-4 w-4' />
              重置
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
