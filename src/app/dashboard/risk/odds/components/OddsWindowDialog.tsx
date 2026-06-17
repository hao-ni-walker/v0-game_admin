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
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    period: string;
    payout_percent: number;
    effective_from: string | null;
    effective_to: string | null;
    priority: number;
    reason: string | null;
  }) => Promise<boolean>;
}

interface WindowForm {
  period: string;
  payout: string;
  from: string;
  to: string;
  priority: string;
  reason: string;
}

const EMPTY: WindowForm = {
  period: '1m',
  payout: '',
  from: '',
  to: '',
  priority: '10',
  reason: '',
};

export function OddsWindowDialog({ open, onOpenChange, onSubmit }: Props) {
  const [form, setForm] = useState<WindowForm>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setForm(EMPTY);
  }, [open]);

  const handleSubmit = async () => {
    const payout = Number(form.payout);
    if (!Number.isFinite(payout) || payout < 0 || payout > 200) return;
    if (form.from && form.to && new Date(form.from) >= new Date(form.to)) return;
    setSubmitting(true);
    const ok = await onSubmit({
      period: form.period,
      payout_percent: payout,
      effective_from: form.from || null,
      effective_to: form.to || null,
      priority: Number(form.priority) || 0,
      reason: form.reason || null,
    });
    setSubmitting(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[520px]'>
        <DialogHeader>
          <DialogTitle>添加窗口活动赔率</DialogTitle>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-4 py-2'>
          <div className='space-y-1'>
            <Label>周期</Label>
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
            <Label>赔率 (%)</Label>
            <Input
              type='number'
              min={0}
              max={200}
              step='0.1'
              value={form.payout}
              onChange={(e) => setForm((p) => ({ ...p, payout: e.target.value }))}
            />
          </div>
          <div className='space-y-1'>
            <Label>生效开始</Label>
            <Input
              type='datetime-local'
              value={form.from}
              onChange={(e) => setForm((p) => ({ ...p, from: e.target.value }))}
            />
          </div>
          <div className='space-y-1'>
            <Label>生效结束</Label>
            <Input
              type='datetime-local'
              value={form.to}
              onChange={(e) => setForm((p) => ({ ...p, to: e.target.value }))}
            />
          </div>
          <div className='space-y-1'>
            <Label>优先级</Label>
            <Input
              type='number'
              value={form.priority}
              onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
            />
          </div>
          <div className='col-span-2 space-y-1'>
            <Label>原因（可选）</Label>
            <Input
              value={form.reason}
              onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
            />
          </div>
        </div>
        <p className='text-muted-foreground text-xs'>
          窗口期内该赔率将覆盖基础赔率；优先级数值越大越优先。留空开始/结束表示无下限/上限。
        </p>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={submitting}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? '保存中…' : '添加'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
