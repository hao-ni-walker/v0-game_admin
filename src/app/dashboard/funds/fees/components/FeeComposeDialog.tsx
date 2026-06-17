'use client';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { FEE_TYPE_OPTIONS, SCOPE_OPTIONS } from '../constants';
import type { Currency, FeeConfig, FeeCreateData, FeeUpdateData, FeeType, FeeScope } from '../types';

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  editing: FeeConfig | null;
  currencies: Currency[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FeeCreateData | FeeUpdateData) => Promise<boolean>;
}

interface FormState {
  fee_type: FeeType;
  scope_type: FeeScope;
  currency_id: string;
  user_id: string;
  fee_rate: string;
  min_fee: string;
  gas: string;
  effective_from: string;
  effective_to: string;
  priority: string;
  is_active: boolean;
  reason: string;
}

const EMPTY: FormState = {
  fee_type: 'withdraw', scope_type: 'platform', currency_id: '', user_id: '',
  fee_rate: '', min_fee: '', gas: '', effective_from: '', effective_to: '',
  priority: '0', is_active: true, reason: '',
};

export function FeeComposeDialog({ open, mode, editing, currencies, onOpenChange, onSubmit }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && editing) {
      setForm({
        fee_type: editing.fee_type,
        scope_type: editing.scope_type,
        currency_id: editing.currency_id !== null ? String(editing.currency_id) : '',
        user_id: editing.user_id !== null ? String(editing.user_id) : '',
        fee_rate: String(editing.fee_rate),
        min_fee: String(editing.min_fee),
        gas: String(editing.gas),
        effective_from: editing.effective_from ?? '',
        effective_to: editing.effective_to ?? '',
        priority: String(editing.priority),
        is_active: editing.is_active,
        reason: editing.reason ?? '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, mode, editing]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    const fee_rate = Number(form.fee_rate);
    if (!Number.isFinite(fee_rate) || fee_rate < 0 || fee_rate >= 1) return;
    if (form.effective_from && form.effective_to && new Date(form.effective_from) >= new Date(form.effective_to)) return;

    const common = {
      fee_rate,
      min_fee: Number(form.min_fee) || 0,
      gas: Number(form.gas) || 0,
      effective_from: form.effective_from || null,
      effective_to: form.effective_to || null,
      priority: Number(form.priority) || 0,
      is_active: form.is_active,
      reason: form.reason || null,
    };

    let payload: FeeCreateData | FeeUpdateData;
    if (mode === 'create') {
      const create: FeeCreateData = {
        fee_type: form.fee_type,
        scope_type: form.scope_type,
        ...common,
        ...(form.scope_type === 'currency' ? { currency_id: Number(form.currency_id) || null } : {}),
        ...(form.scope_type === 'user' ? { user_id: Number(form.user_id) || null } : {}),
      };
      payload = create;
    } else {
      payload = common;
    }

    setSubmitting(true);
    const ok = await onSubmit(payload);
    setSubmitting(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[560px]'>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? '编辑费率配置' : '新增费率配置'}</DialogTitle>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-4 py-2'>
          <div className='space-y-1'>
            <Label>类型</Label>
            <Select value={form.fee_type} onValueChange={(v) => update('fee_type', v as FeeType)} disabled={mode === 'edit'}>
              <SelectTrigger className='w-full'><SelectValue /></SelectTrigger>
              <SelectContent>
                {FEE_TYPE_OPTIONS.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-1'>
            <Label>作用域</Label>
            <Select value={form.scope_type} onValueChange={(v) => update('scope_type', v as FeeScope)} disabled={mode === 'edit'}>
              <SelectTrigger className='w-full'><SelectValue /></SelectTrigger>
              <SelectContent>
                {SCOPE_OPTIONS.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          {form.scope_type === 'currency' && (
            <div className='col-span-2 space-y-1'>
              <Label>币种</Label>
              <Select value={form.currency_id || undefined} onValueChange={(v) => update('currency_id', v)} disabled={mode === 'edit'}>
                <SelectTrigger className='w-full'><SelectValue placeholder='选择币种' /></SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.code} · {c.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          )}
          {form.scope_type === 'user' && (
            <div className='col-span-2 space-y-1'>
              <Label>用户 ID</Label>
              <Input type='number' value={form.user_id} onChange={(e) => update('user_id', e.target.value)} disabled={mode === 'edit'} />
            </div>
          )}

          <div className='space-y-1'>
            <Label>费率 (0 ~ 1)</Label>
            <Input type='number' min={0} max={0.999} step='0.001' value={form.fee_rate} onChange={(e) => update('fee_rate', e.target.value)} />
          </div>
          <div className='space-y-1'>
            <Label>最低费</Label>
            <Input type='number' min={0} step='0.01' value={form.min_fee} onChange={(e) => update('min_fee', e.target.value)} />
          </div>
          <div className='space-y-1'>
            <Label>矿工费</Label>
            <Input type='number' min={0} step='0.01' value={form.gas} onChange={(e) => update('gas', e.target.value)} />
          </div>
          <div className='space-y-1'>
            <Label>优先级</Label>
            <Input type='number' value={form.priority} onChange={(e) => update('priority', e.target.value)} />
          </div>
          <div className='space-y-1'>
            <Label>生效开始</Label>
            <Input type='datetime-local' value={form.effective_from} onChange={(e) => update('effective_from', e.target.value)} />
          </div>
          <div className='space-y-1'>
            <Label>生效结束</Label>
            <Input type='datetime-local' value={form.effective_to} onChange={(e) => update('effective_to', e.target.value)} />
          </div>
          <div className='col-span-2 space-y-1'>
            <Label>原因（可选）</Label>
            <Input value={form.reason} onChange={(e) => update('reason', e.target.value)} />
          </div>
          <div className='col-span-2 flex items-center gap-2'>
            <Switch checked={form.is_active} onCheckedChange={(v) => update('is_active', v)} />
            <Label>启用</Label>
          </div>
        </div>
        <p className='text-muted-foreground text-xs'>费率 0~1（如 0.001 = 0.1%）；生效区间留空表示永久。作用域/类型编辑后不可改。</p>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={submitting}>取消</Button>
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? '保存中…' : '保存'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
