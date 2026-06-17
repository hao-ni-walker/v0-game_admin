'use client';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { Currency, CurrencyFormData, CurrencyUpdateData } from '../types';

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  editing: Currency | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CurrencyFormData | CurrencyUpdateData) => Promise<boolean>;
}

const EMPTY_FORM: CurrencyFormData = {
  code: '',
  symbol: '',
  name: '',
  display_precision: 2,
  icon_url: '',
  is_depositable: false,
  is_withdrawable: false,
  sort_order: 0,
};

export function CurrencyComposeDialog({ open, mode, editing, onOpenChange, onSubmit }: Props) {
  const [form, setForm] = useState<CurrencyFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && editing) {
        setForm({
          code: editing.code,
          symbol: editing.symbol,
          name: editing.name,
          display_precision: editing.display_precision,
          icon_url: editing.icon_url ?? '',
          is_depositable: editing.is_depositable,
          is_withdrawable: editing.is_withdrawable,
          sort_order: editing.sort_order,
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, mode, editing]);

  const update = <K extends keyof CurrencyFormData>(k: K, v: CurrencyFormData[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.code.trim() || !form.symbol.trim() || !form.name.trim()) return;
    setSubmitting(true);
    const payload: CurrencyFormData | CurrencyUpdateData =
      mode === 'edit' ? { ...form, code: undefined } : form;
    const ok = await onSubmit(payload);
    setSubmitting(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? '编辑币种' : '新增币种'}</DialogTitle>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-4 py-2'>
          <div className='col-span-1 space-y-1'>
            <Label>代码</Label>
            <Input value={form.code} onChange={(e) => update('code', e.target.value.toUpperCase())} disabled={mode === 'edit'} />
          </div>
          <div className='col-span-1 space-y-1'>
            <Label>交易对</Label>
            <Input value={form.symbol} onChange={(e) => update('symbol', e.target.value)} placeholder='BTC/USDT' disabled={mode === 'edit'} />
          </div>
          <div className='col-span-2 space-y-1'>
            <Label>名称</Label>
            <Input value={form.name} onChange={(e) => update('name', e.target.value)} />
          </div>
          <div className='col-span-1 space-y-1'>
            <Label>显示精度</Label>
            <Input type='number' min={0} max={8} value={form.display_precision} onChange={(e) => update('display_precision', Number(e.target.value))} />
          </div>
          <div className='col-span-1 space-y-1'>
            <Label>排序</Label>
            <Input type='number' value={form.sort_order} onChange={(e) => update('sort_order', Number(e.target.value))} />
          </div>
          <div className='col-span-2 space-y-1'>
            <Label>图标 URL（可选）</Label>
            <Input value={form.icon_url ?? ''} onChange={(e) => update('icon_url', e.target.value)} />
          </div>
          <div className='col-span-1 flex items-center gap-2'>
            <Switch checked={form.is_depositable} onCheckedChange={(v) => update('is_depositable', v)} />
            <Label>可充值</Label>
          </div>
          <div className='col-span-1 flex items-center gap-2'>
            <Switch checked={form.is_withdrawable} onCheckedChange={(v) => update('is_withdrawable', v)} />
            <Label>可提现</Label>
          </div>
        </div>
        <p className='text-muted-foreground text-xs'>
          交易状态（激活/停用）请通过列表中的「激活交易」操作切换；激活前需先在赔率管理为该币种配置全部 4 个周期的基础赔率。
        </p>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={submitting}>取消</Button>
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? '保存中…' : '保存'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
