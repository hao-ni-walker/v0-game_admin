'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import type { Currency } from '../types';

interface Props {
  open: boolean;
  /** All currencies available for selection. */
  currencies: Currency[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    period: string,
    payout_percent: number,
    reason: string,
    currencyIds: number[],
  ) => Promise<{ ok: boolean; success: number; total: number } | null>;
}

interface BatchForm {
  period: string;
  payout: string;
  reason: string;
}

const EMPTY: BatchForm = { period: '1m', payout: '', reason: '' };

export function OddsBatchEditDialog({ open, currencies, onOpenChange, onSubmit }: Props) {
  const [form, setForm] = useState<BatchForm>(EMPTY);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const defaultsApplied = useRef(false);

  // Reset the form only on the open transition. Coupling this to `currencies`
  // wiped the user's selection whenever the parent list refreshed mid-edit.
  useEffect(() => {
    if (!open) {
      defaultsApplied.current = false;
      setSelectedIds([]);
      return;
    }
    setForm(EMPTY);
    setSearch('');
  }, [open]);

  // Apply the tradeable default once per open, as soon as currencies exist.
  useEffect(() => {
    if (!open || defaultsApplied.current || currencies.length === 0) return;
    setSelectedIds(currencies.filter((c) => c.is_tradeable).map((c) => c.id));
    defaultsApplied.current = true;
  }, [open, currencies]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return currencies;
    return currencies.filter((c) => `${c.code} ${c.name} ${c.symbol}`.toLowerCase().includes(q));
  }, [currencies, search]);

  const filteredIds = useMemo(() => filtered.map((c) => c.id), [filtered]);
  const filteredSelected = useMemo(
    () => filteredIds.filter((id) => selectedIds.includes(id)).length,
    [filteredIds, selectedIds]
  );
  const allFilteredSelected =
    filteredIds.length > 0 && filteredSelected === filteredIds.length;

  const payoutNum = Number(form.payout);
  const payoutValid = Number.isFinite(payoutNum) && payoutNum >= 0 && payoutNum <= 200;
  const reasonValid = form.reason.trim().length > 0;
  const canSubmit = payoutValid && reasonValid && selectedIds.length > 0 && !submitting;

  const toggle = (id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id)
    );
  };

  const selectFiltered = (checked: boolean) => {
    setSelectedIds((prev) => {
      if (!checked) return prev.filter((id) => !filteredIds.includes(id));
      return Array.from(new Set([...prev, ...filteredIds]));
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await onSubmit(form.period, payoutNum, form.reason.trim(), selectedIds);
      if (res) onOpenChange(false);
    } catch {
      // The hook reports per-item failures; a throw here means the batch
      // could not run at all. Keep the dialog open so the user can retry.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[560px]'>
        <DialogHeader>
          <DialogTitle>批量修改基础收益率</DialogTitle>
          <DialogDescription>
            按时间周期将选中币种的基础收益率统一设置为同一数值。
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

        <div className='space-y-2'>
          <div className='flex items-center justify-between gap-2'>
            <Label>
              选择币种{' '}
              <Badge variant='secondary' className='ml-1'>
                已选 {selectedIds.length} / {currencies.length}
              </Badge>
            </Label>
            <div className='flex items-center gap-1'>
              <Button variant='ghost' size='sm' className='h-7 text-xs' onClick={() => selectFiltered(true)}>
                全选{search.trim() ? '（筛内）' : ''}
              </Button>
              <Button variant='ghost' size='sm' className='h-7 text-xs' onClick={() => setSelectedIds(currencies.filter((c) => c.is_tradeable).map((c) => c.id))}>
                仅在架
              </Button>
              <Button variant='ghost' size='sm' className='h-7 text-xs' onClick={() => selectFiltered(false)}>
                清空{search.trim() ? '（筛内）' : ''}
              </Button>
            </div>
          </div>
          <Input
            placeholder='搜索代码 / 名称'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='h-8'
          />
          <div className='border-muted max-h-56 space-y-0.5 overflow-y-auto rounded-md border p-2'>
            {filtered.length === 0 ? (
              <p className='text-muted-foreground py-4 text-center text-xs'>无匹配币种</p>
            ) : (
              filtered.map((c) => (
                <label
                  key={c.id}
                  className='hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded px-2 py-1.5'
                >
                  <Checkbox
                    checked={selectedIds.includes(c.id)}
                    onCheckedChange={(checked) => toggle(c.id, checked === true)}
                  />
                  <span className='text-sm font-semibold'>{c.code}</span>
                  <span className='text-muted-foreground truncate text-xs'>{c.name}</span>
                  {c.is_tradeable && <Badge variant='default' className='ml-auto text-[10px]'>在架</Badge>}
                </label>
              ))
            )}
          </div>
          {filteredIds.length > 0 && (
            <div className='flex items-center gap-2'>
              <Checkbox
                checked={allFilteredSelected}
                onCheckedChange={(checked) => selectFiltered(checked === true)}
              />
              <span className='text-muted-foreground text-xs'>
                {search.trim() ? `选中当前搜索结果（${filtered.length} 个）` : `全选全部（${currencies.length} 个）`}
              </span>
            </div>
          )}
        </div>

        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>将影响 {selectedIds.length} 个币种</AlertTitle>
          <AlertDescription>
            该操作会把选中币种的「{PERIOD_LABELS[form.period as keyof typeof PERIOD_LABELS] ?? form.period}
            」基础收益率设置为 {payoutValid ? `${payoutNum}%` : '—'}，立即生效。已配置的窗口收益率仍会按优先级覆盖此基础值。
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={submitting}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? `保存中…（${selectedIds.length} 个币种）` : `确认批量修改 ${selectedIds.length} 个币种`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
