'use client';

import { useEffect, useState } from 'react';
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
import type { PredictionMarket, PredictionMarketUpdateData } from '@/service/request';

interface ConfigDialogProps {
  open: boolean;
  market: PredictionMarket | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: number, body: PredictionMarketUpdateData) => Promise<boolean>;
}

/** 数值输入 → number；空串 → null（清除该字段，回落全局默认）。 */
function parseNum(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function ConfigDialog({ open, market, onOpenChange, onSubmit }: ConfigDialogProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    spread_bps: '',
    max_exposure_usdt: '',
    min_bet_usdt: '',
    max_bet_usdt: '',
    sort_order: '0',
  });

  useEffect(() => {
    if (market) {
      setForm({
        spread_bps: market.spread_bps !== null && market.spread_bps !== undefined ? String(market.spread_bps) : '',
        max_exposure_usdt:
          market.max_exposure_usdt !== null && market.max_exposure_usdt !== undefined
            ? String(market.max_exposure_usdt)
            : '',
        min_bet_usdt:
          market.min_bet_usdt !== null && market.min_bet_usdt !== undefined ? String(market.min_bet_usdt) : '',
        max_bet_usdt:
          market.max_bet_usdt !== null && market.max_bet_usdt !== undefined ? String(market.max_bet_usdt) : '',
        sort_order: String(market.sort_order ?? 0),
      });
    }
  }, [market, open]);

  if (!market) return null;

  const handleSubmit = async () => {
    const body: PredictionMarketUpdateData = {
      spread_bps: parseNum(form.spread_bps),
      max_exposure_usdt: parseNum(form.max_exposure_usdt),
      min_bet_usdt: parseNum(form.min_bet_usdt),
      max_bet_usdt: parseNum(form.max_bet_usdt),
      sort_order: parseNum(form.sort_order) ?? 0,
    };
    const min = body.min_bet_usdt;
    const max = body.max_bet_usdt;
    if (min != null && max != null && min > max) {
      return; // 输入框层面已校验，理论上到不了这里
    }
    setSaving(true);
    const ok = await onSubmit(market.id, body);
    setSaving(false);
    if (ok) onOpenChange(false);
  };

  const minMaxInvalid = (() => {
    const min = parseNum(form.min_bet_usdt);
    const max = parseNum(form.max_bet_usdt);
    return min != null && max != null && min > max;
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>上架配置</DialogTitle>
          <DialogDescription className='line-clamp-2' title={market.question}>
            {market.question}
          </DialogDescription>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-4 py-2'>
          <div className='space-y-1.5'>
            <Label htmlFor='spread_bps'>点差 (bp, 0–10000)</Label>
            <Input
              id='spread_bps'
              placeholder='留空 = 全局默认'
              value={form.spread_bps}
              onChange={(e) => setForm({ ...form, spread_bps: e.target.value })}
            />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='max_exposure_usdt'>敞口上限 (USDT)</Label>
            <Input
              id='max_exposure_usdt'
              placeholder='留空 = 全局默认'
              value={form.max_exposure_usdt}
              onChange={(e) => setForm({ ...form, max_exposure_usdt: e.target.value })}
            />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='min_bet_usdt'>最小注单 (USDT)</Label>
            <Input
              id='min_bet_usdt'
              placeholder='留空 = 全局默认'
              value={form.min_bet_usdt}
              onChange={(e) => setForm({ ...form, min_bet_usdt: e.target.value })}
            />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='max_bet_usdt'>最大注单 (USDT)</Label>
            <Input
              id='max_bet_usdt'
              placeholder='留空 = 全局默认'
              value={form.max_bet_usdt}
              onChange={(e) => setForm({ ...form, max_bet_usdt: e.target.value })}
            />
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='sort_order'>排序权重</Label>
            <Input
              id='sort_order'
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            />
          </div>
        </div>
        <p className='text-muted-foreground text-xs'>
          点差是平台的确定性收入（PM 市价之上加收）；敞口上限触顶自动暂停该市场下注。留空字段回落全局默认。
        </p>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={saving}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={saving || minMaxInvalid}>
            {saving ? '保存中…' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
