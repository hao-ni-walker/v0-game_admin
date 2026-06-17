'use client';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PERIOD_LABELS, type Period } from '../constants';
import type { OddsConfig } from '../types';

interface Props {
  open: boolean;
  period: string | null;
  baseConfig: OddsConfig | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (period: string, payout: number) => Promise<boolean>;
}

export function OddsBaseEditDialog({
  open,
  period,
  baseConfig,
  onOpenChange,
  onSubmit,
}: Props) {
  const [payout, setPayout] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setPayout(baseConfig ? String(baseConfig.payout_percent) : '');
  }, [open, baseConfig]);

  const handleSubmit = async () => {
    if (!period) return;
    const n = Number(payout);
    if (!Number.isFinite(n) || n < 0 || n > 200) return;
    setSubmitting(true);
    const ok = await onSubmit(period, n);
    setSubmitting(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[400px]'>
        <DialogHeader>
          <DialogTitle>
            编辑基础赔率
            {period ? ` · ${PERIOD_LABELS[period as Period] ?? period}` : ''}
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-2 py-2'>
          <Label>赔率 (%)</Label>
          <Input
            type='number'
            min={0}
            max={200}
            step='0.1'
            value={payout}
            onChange={(e) => setPayout(e.target.value)}
          />
          <p className='text-muted-foreground text-xs'>
            基础赔率作为默认值；存在生效中的窗口赔率时，窗口赔率优先。
          </p>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={submitting}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? '保存中…' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
