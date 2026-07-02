'use client';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { PERIODS, PERIOD_LABELS } from '../constants';

interface Props {
  open: boolean;
  /** Number of currencies the batch will apply to. */
  currencyCount: number;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    period: string,
    payout_percent: number,
    reason: string,
  ) => Promise<{ ok: boolean; success: number; total: number } | null>;
}

interface BatchForm {
  period: string;
  payout: string;
  reason: string;
}

const EMPTY: BatchForm = { period: '1m', payout: '', reason: '' };

export function OddsBatchEditDialog({ open, currencyCount, onOpenChange, onSubmit }: Props) {
  const [form, setForm] = useState<BatchForm>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setForm(EMPTY);
  }, [open]);

  const payoutNum = Number(form.payout);
  const payoutValid = Number.isFinite(payoutNum) && payoutNum >= 0 && payoutNum <= 200;
  const reasonValid = form.reason.trim().length > 0;
  const canSubmit = payoutValid && reasonValid && currencyCount > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const res = await onSubmit(form.period, payoutNum, form.reason.trim());
    setSubmitting(false);
    if (res) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[520px]'>
        <DialogHeader>
          <DialogTitle>批量修改基础收益率</DialogTitle>
          <DialogDescription>
            按时间周期将所有币种的基础收益率统一设置为同一数值。
          </DialogDescription>
        </DialogHeader>

        <div className='grid grid-cols-2 gap-4 py-2'>
          <div className='space-y-1'>
            <Label>时间周期</Label>
            <Select
              value={form.period}
              onValueChange={(v) => setForm((p) => ({ ...p, period: v }))}
            >
              <SelectTrigger className='w-full cursor-pointer'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((p) => (
                  <SelectItem key={p} value={p} className='cursor-pointer'>
                    {PERIOD_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-1'>
            <Label>基础收益率 (%)</Label>
            <Input
              type='number'
              min={0}
              max={200}
              step='0.1'
              placeholder='0 ~ 200'
              value={form.payout}
              onChange={(e) => setForm((p) => ({ ...p, payout: e.target.value }))}
            />
          </div>
          <div className='col-span-2 space-y-1'>
            <Label>修改原因（必填，记入审计）</Label>
            <Input
              placeholder='例如：统一促销收益率'
              value={form.reason}
              onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
            />
          </div>
        </div>

        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>将影响 {currencyCount} 个币种</AlertTitle>
          <AlertDescription>
            该操作会把所有币种的「{PERIOD_LABELS[form.period as keyof typeof PERIOD_LABELS] ?? form.period}
            」基础收益率设置为 {payoutValid ? `${payoutNum}%` : '—'}，立即生效。已配置的窗口收益率仍会按优先级覆盖此基础值。
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={submitting}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? `保存中…（${currencyCount} 个币种）` : `确认批量修改 ${currencyCount} 个币种`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
