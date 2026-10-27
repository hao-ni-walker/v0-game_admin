'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ListChecks, Settings2 } from 'lucide-react';

interface BatchActionBarProps {
  count: number;
  busy: boolean;
  onBatchList: () => void;
  onBatchDelist: () => void;
  onBatchConfig: () => void;
  onClear: () => void;
}

/** 批量操作条：选中行后出现在筛选区与表格之间。 */
export function BatchActionBar({
  count,
  busy,
  onBatchList,
  onBatchDelist,
  onBatchConfig,
  onClear,
}: BatchActionBarProps) {
  return (
    <div className='bg-card flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm'>
      <ListChecks className='text-muted-foreground h-4 w-4' />
      <span className='font-medium'>已选 {count} 个市场</span>
      <div className='ml-auto flex flex-wrap gap-2'>
        <Button size='sm' variant='outline' onClick={onBatchList} disabled={busy}>
          批量上架
        </Button>
        <Button size='sm' variant='outline' onClick={onBatchDelist} disabled={busy}>
          批量下架
        </Button>
        <Button size='sm' variant='outline' onClick={onBatchConfig} disabled={busy}>
          <Settings2 className='mr-1 h-4 w-4' />
          批量配置
        </Button>
        <Button size='sm' variant='ghost' onClick={onClear} disabled={busy}>
          <X className='mr-1 h-4 w-4' />
          清除
        </Button>
      </div>
    </div>
  );
}

interface BatchToggleConfirmDialogProps {
  open: boolean;
  listed: boolean;
  count: number;
  busy: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export function BatchToggleConfirmDialog({
  open,
  listed,
  count,
  busy,
  onConfirm,
  onOpenChange,
}: BatchToggleConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{listed ? `批量上架 ${count} 个市场` : `批量下架 ${count} 个市场`}</DialogTitle>
          <DialogDescription>
            {listed
              ? '将逐个尝试上架（5 并发）。不满足条件的单个市场（如已过结束时间、缺少定价）会被后端拒绝并在结果中给出原因，不影响其余市场。'
              : '下架始终允许；已下架市场的存量注单不受影响，仍正常等待结算。'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={busy}>
            取消
          </Button>
          <Button onClick={onConfirm} disabled={busy}>
            {busy ? '处理中…' : listed ? '确认上架' : '确认下架'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export interface BatchFailureRow {
  question: string;
  message: string;
}

interface BatchResultDialogProps {
  open: boolean;
  action: string;
  ok: number;
  failures: BatchFailureRow[];
  onOpenChange: (open: boolean) => void;
}

/** 批量结果：成功数 + 逐条失败原因（上架被拒的主场景）。 */
export function BatchResultDialog({
  open,
  action,
  ok,
  failures,
  onOpenChange,
}: BatchResultDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>
            {action}完成：成功 {ok}
            {failures.length > 0 ? `，失败 ${failures.length}` : ''}
          </DialogTitle>
          {failures.length > 0 && (
            <DialogDescription>失败项保持原状，可处理后重试。</DialogDescription>
          )}
        </DialogHeader>
        {failures.length > 0 && (
          <div className='max-h-[50vh] space-y-2 overflow-y-auto'>
            {failures.map((f, i) => (
              <div key={i} className='rounded-md border p-2 text-sm'>
                <p className='truncate font-medium' title={f.question}>
                  {f.question}
                </p>
                <p className='text-destructive mt-0.5 text-xs'>{f.message}</p>
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>知道了</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
