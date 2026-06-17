'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { FEE_TYPE_OPTIONS, SCOPE_LABELS } from '../constants';
import type { Currency, FeeType, FeePreviewResult } from '../types';

interface Props {
  open: boolean;
  currencies: Currency[];
  onOpenChange: (open: boolean) => void;
  onPreview: (params: { fee_type: FeeType; currency_id?: number; user_id?: number; amount: number }) => Promise<FeePreviewResult | null>;
}

export function FeePreviewDialog({ open, currencies, onOpenChange, onPreview }: Props) {
  const [feeType, setFeeType] = useState<FeeType>('withdraw');
  const [currencyId, setCurrencyId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [amount, setAmount] = useState<string>('100');
  const [result, setResult] = useState<FeePreviewResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 0) return;
    setLoading(true);
    const res = await onPreview({
      fee_type: feeType,
      currency_id: currencyId ? Number(currencyId) : undefined,
      user_id: userId ? Number(userId) : undefined,
      amount: amt,
    });
    setLoading(false);
    setResult(res);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[520px]'>
        <DialogHeader>
          <DialogTitle>预览费率解析</DialogTitle>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-4 py-2'>
          <div className='space-y-1'>
            <Label>类型</Label>
            <Select value={feeType} onValueChange={(v) => setFeeType(v as FeeType)}>
              <SelectTrigger className='w-full'><SelectValue /></SelectTrigger>
              <SelectContent>
                {FEE_TYPE_OPTIONS.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-1'>
            <Label>金额</Label>
            <Input type='number' min={0} step='0.01' value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className='space-y-1'>
            <Label>币种（可选）</Label>
            <Select value={currencyId || undefined} onValueChange={setCurrencyId}>
              <SelectTrigger className='w-full'><SelectValue placeholder='不限' /></SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.code}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-1'>
            <Label>用户 ID（可选）</Label>
            <Input type='number' value={userId} onChange={(e) => setUserId(e.target.value)} placeholder='不限' />
          </div>
        </div>

        {result && (
          <div className='border-muted rounded-md border p-3 text-sm'>
            {result.matched_scope ? (
              <>
                <div>命中作用域：<b>{SCOPE_LABELS[result.matched_scope] ?? result.matched_scope}</b></div>
                <div>费率：{(result.fee_rate ?? 0) * 100}% · 最低 {result.min_fee} · 矿工费 {result.gas}</div>
                <div className='text-base font-semibold'>计算费用：{result.fee}</div>
              </>
            ) : (
              <div className='text-muted-foreground'>未命中任何费率配置</div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>关闭</Button>
          <Button onClick={handleRun} disabled={loading}>{loading ? '计算中…' : '计算'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
