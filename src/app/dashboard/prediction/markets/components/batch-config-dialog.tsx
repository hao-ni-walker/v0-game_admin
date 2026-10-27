'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PredictionMarketUpdateData } from '@/service/request';
import { parseBatchConfigForm, type BatchConfigForm } from '../utils';

const EMPTY_FORM: BatchConfigForm = {
  spread_bps: '',
  max_exposure_usdt: '',
  min_bet_usdt: '',
  max_bet_usdt: '',
  sort_order: '',
};

interface BatchConfigDialogProps {
  open: boolean;
  count: number;
  onOpenChange: (open: boolean) => void;
  onSubmit: (body: PredictionMarketUpdateData) => Promise<boolean>;
}

/**
 * 批量配置：把填写的字段统一覆盖到所有选中市场。与单市场弹窗的关键差异
 * ——留空 = 不修改该字段（保留各市场自身值），而非清空回落全局默认。
 */
export function BatchConfigDialog({ open, count, onOpenChange, onSubmit }: BatchConfigDialogProps) {
  const [form, setForm] = useState<BatchConfigForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const parsed = parseBatchConfigForm(form);

  const handleSubmit = async () => {
    if (parsed.status !== 'ok') return;
    setSaving(true);
    const ok = await onSubmit(parsed.body);
    setSaving(false);
    if (ok) {
      setForm(EMPTY_FORM);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>批量配置（{count} 个市场）</DialogTitle>
          <DialogDescription>
            填写的字段将统一覆盖到全部选中市场；留空字段不修改（保留各市场当前值）。
          </DialogDescription>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-4 py-2'>
          <div className='space-y-1.5'>
            <Label htmlFor='batch-spread_bps'>点差 (bp, 0–10000)</Label>
            <Input
              id='batch-spread_bps'
              placeholder='留空 = 不修改'
              value={form.spread_bps}
              onChange={(e) => setForm({ ...form, spread_bps: e.target.value })}
            />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='batch-max_exposure_usdt'>敞口上限 (USDT)</Label>
            <Input
              id='batch-max_exposure_usdt'
              placeholder='留空 = 不修改'
              value={form.max_exposure_usdt}
              onChange={(e) => setForm({ ...form, max_exposure_usdt: e.target.value })}
            />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='batch-min_bet_usdt'>最小注单 (USDT)</Label>
            <Input
              id='batch-min_bet_usdt'
              placeholder='留空 = 不修改'
              value={form.min_bet_usdt}
              onChange={(e) => setForm({ ...form, min_bet_usdt: e.target.value })}
            />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='batch-max_bet_usdt'>最大注单 (USDT)</Label>
            <Input
              id='batch-max_bet_usdt'
              placeholder='留空 = 不修改'
              value={form.max_bet_usdt}
              onChange={(e) => setForm({ ...form, max_bet_usdt: e.target.value })}
            />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='batch-sort_order'>排序权重</Label>
            <Input
              id='batch-sort_order'
              placeholder='留空 = 不修改'
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            />
          </div>
        </div>
        <p className='text-muted-foreground text-xs'>
          提示：批量设置的是同一值；如需逐市场微调请用行内「配置」。要清除某字段的覆盖
          （回落全局默认），请用单市场配置弹窗留空保存。
        </p>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={saving}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || parsed.status !== 'ok'}
            title={parsed.status === 'invalid' ? parsed.message : undefined}
          >
            {saving ? '应用中…' : parsed.status === 'invalid' ? parsed.message : `应用到 ${count} 个市场`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
