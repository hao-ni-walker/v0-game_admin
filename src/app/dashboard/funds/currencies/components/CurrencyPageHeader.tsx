'use client';
import { RefreshCw, Plus, CloudDownload } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CurrencySyncStatus } from '@/service/request';

interface Props {
  onRefresh: () => void;
  onCreate: () => void;
  onSync: () => void;
  loading: boolean;
  syncing: boolean;
  syncStatus: CurrencySyncStatus | null;
  canWrite: boolean;
}

/** 候选同步状态一行摘要：开关 / 最近一轮统计 / 完成时间 / 最近错误。 */
function SyncStatusLine({ status }: { status: CurrencySyncStatus | null }) {
  if (!status) return <span className='text-muted-foreground text-xs'>候选同步状态未知</span>;
  const parts: string[] = ['OKX 候选池每小时自动同步'];
  if (!status.enabled) {
    parts.length = 0;
    parts.push('候选同步已停用');
  } else if (status.last_stats) {
    const s = status.last_stats;
    if ('disabled' in s) {
      parts.push('已停用');
    } else {
      parts.push(`最近一轮：新增候选 ${s.created ?? 0} · 目录 ${s.catalog_size ?? 0} 个交易对`);
    }
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

export function CurrencyPageHeader({
  onRefresh,
  onCreate,
  onSync,
  loading,
  syncing,
  syncStatus,
  canWrite,
}: Props) {
  return (
    <div className='flex items-center justify-between'>
      <div className='space-y-2'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>币种管理</h1>
          <p className='text-muted-foreground mt-2'>
            管理可交易的 Web3 资产、充提开关与排序；OKX 新币每小时自动进候选池（未上架），运营挑选启用
          </p>
        </div>
        <SyncStatusLine status={syncStatus} />
      </div>
      <div className='flex items-center gap-2'>
        {canWrite && (
          <Button variant='outline' onClick={onSync} disabled={syncing || loading} className='cursor-pointer'>
            <CloudDownload className={syncing ? 'mr-2 h-4 w-4 animate-bounce' : 'mr-2 h-4 w-4'} />
            {syncing ? '同步中…' : '同步 OKX 候选'}
          </Button>
        )}
        <Button variant='outline' onClick={onRefresh} disabled={loading} className='cursor-pointer'>
          <RefreshCw className={loading ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />
          刷新
        </Button>
        {canWrite && (
          <Button onClick={onCreate} className='cursor-pointer'>
            <Plus className='mr-2 h-4 w-4' />
            新增币种
          </Button>
        )}
      </div>
    </div>
  );
}
