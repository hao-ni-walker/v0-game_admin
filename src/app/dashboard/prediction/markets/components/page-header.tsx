'use client';

import { RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { PredictionSyncStatus } from '@/service/request';

interface MarketPageHeaderProps {
  syncStatus: PredictionSyncStatus | null;
  syncing: boolean;
  loading: boolean;
  canWrite: boolean;
  onRefresh: () => void;
  onSync: () => void;
}

/** 同步状态一行摘要：开关 / 最近完成时间 / 最近一轮统计 / 最近错误。 */
function SyncStatusLine({ status }: { status: PredictionSyncStatus | null }) {
  if (!status) return <span className='text-muted-foreground text-xs'>同步状态未知</span>;
  const parts: string[] = [];
  if (!status.enabled) {
    parts.push('同步已停用');
  } else if (status.last_stats) {
    const s = status.last_stats;
    parts.push(
      `最近一轮：新增 ${s.inserted ?? 0} / 更新 ${s.updated ?? 0} / 刷新已知 ${s.known_refreshed ?? 0}`
    );
  } else {
    parts.push('等待首轮同步');
  }
  if (status.last_finished_at) {
    try {
      parts.push(`完成于 ${format(new Date(status.last_finished_at), 'MM-dd HH:mm:ss')}`);
    } catch {
      /* 非法时间戳时省略 */
    }
  }
  return (
    <span className='text-muted-foreground text-xs'>
      {parts.join(' · ')}
      {status.last_error && (
        <span className='ml-2'>
          <Badge variant='destructive'>上次同步出错</Badge>
        </span>
      )}
    </span>
  );
}

export function MarketPageHeader({
  syncStatus,
  syncing,
  loading,
  canWrite,
  onRefresh,
  onSync,
}: MarketPageHeaderProps) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-3'>
      <div className='space-y-1'>
        <div className='flex items-center gap-2'>
          <TrendingUp className='h-5 w-5' />
          <h1 className='text-lg font-semibold'>预测市场</h1>
          <Badge variant='outline' className='text-xs'>
            Polymarket 目录
          </Badge>
        </div>
        <SyncStatusLine status={syncStatus} />
      </div>
      <div className='flex items-center gap-2'>
        <Button variant='outline' size='sm' onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
        {canWrite && (
          <Button size='sm' onClick={onSync} disabled={syncing}>
            <Sparkles className={`mr-1 h-4 w-4 ${syncing ? 'animate-pulse' : ''}`} />
            {syncing ? '同步中…' : '手动同步'}
          </Button>
        )}
      </div>
    </div>
  );
}
