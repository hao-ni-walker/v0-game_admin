import React from 'react';
import { Gamepad2, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/shared/heading';

interface GamePageHeaderProps {
  onSyncGames: () => void;
  onRefresh?: () => void;
  loading?: boolean;
}

/**
 * 游戏页面头部组件
 */
export function GamePageHeader({
  onSyncGames,
  onRefresh,
  loading = false
}: GamePageHeaderProps) {
  return (
    <div className='flex items-start justify-between'>
      <Heading
        title='游戏管理'
        description='管理游戏列表，包括游戏信息、分类、供应商等'
      />
      <div className='flex gap-2'>
        {onRefresh && (
          <Button
            variant='outline'
            size='sm'
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            刷新
          </Button>
        )}
        <Button onClick={onSyncGames} size='sm'>
          <Download className='mr-2 h-4 w-4' />
          同步平台游戏
        </Button>
      </div>
    </div>
  );
}
