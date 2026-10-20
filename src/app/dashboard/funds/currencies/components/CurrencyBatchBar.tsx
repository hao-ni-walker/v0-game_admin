'use client';
import { Ban, CheckCircle2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  count: number;
  busy: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export function CurrencyBatchBar({ count, busy, onActivate, onDeactivate, onDelete, onClear }: Props) {
  return (
    <div className='bg-muted/50 flex flex-wrap items-center gap-2 rounded-lg border p-3'>
      <span className='text-sm font-medium'>已选择 {count} 个币种</span>
      <Button size='sm' variant='outline' onClick={onActivate} disabled={busy} className='cursor-pointer'>
        <CheckCircle2 className='mr-2 h-4 w-4' />
        批量激活
      </Button>
      <Button size='sm' variant='outline' onClick={onDeactivate} disabled={busy} className='cursor-pointer'>
        <Ban className='mr-2 h-4 w-4' />
        批量停用
      </Button>
      <Button size='sm' variant='destructive' onClick={onDelete} disabled={busy} className='cursor-pointer'>
        <Trash2 className='mr-2 h-4 w-4' />
        批量删除
      </Button>
      <Button size='sm' variant='ghost' onClick={onClear} disabled={busy} className='cursor-pointer'>
        <X className='mr-2 h-4 w-4' />
        取消选择
      </Button>
      {busy && <span className='text-muted-foreground text-xs'>正在处理，请勿关闭页面…</span>}
    </div>
  );
}
