'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RiskParamAPI } from '@/service/request';

interface AnomalyForm {
  freq_warn_count: number;
  freq_limit_count: number;
  freq_limit_cap: number;
  hedge_flag_threshold: number;
  deposit_trade_window_s: number;
  large_order_multiplier: number;
  large_order_hold_s: number;
  flash_inout_window_s: number;
  win_streak_count: number;
  win_streak_profit_ratio: number;
}

const FIELDS: (keyof AnomalyForm)[] = [
  'freq_warn_count',
  'freq_limit_count',
  'freq_limit_cap',
  'hedge_flag_threshold',
  'deposit_trade_window_s',
  'large_order_multiplier',
  'large_order_hold_s',
  'flash_inout_window_s',
  'win_streak_count',
  'win_streak_profit_ratio',
];

const EMPTY: AnomalyForm = FIELDS.reduce((acc, k) => ({ ...acc, [k]: 0 }), {} as AnomalyForm);

function parseForm(items: { key: string; value: unknown }[]): AnomalyForm {
  const map = new Map(items.map((i) => [i.key, i.value]));
  return FIELDS.reduce(
    (acc, k) => ({ ...acc, [k]: Number(map.get(`anomaly.${k}`) ?? 0) }),
    {} as AnomalyForm,
  );
}

export function useAnomalyConfig() {
  const [loaded, setLoaded] = useState<AnomalyForm | null>(null);
  const [form, setForm] = useState<AnomalyForm>(EMPTY);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await RiskParamAPI.getList();
      if (res.success && res.data) {
        const parsed = parseForm(res.data.items.filter((i) => i.key.startsWith('anomaly.')));
        setLoaded(parsed);
        setForm(parsed);
      } else {
        toast.error(res.message || '获取异常检测配置失败');
      }
    } catch {
      toast.error('获取异常检测配置失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const dirty = !!loaded && FIELDS.some((k) => form[k] !== loaded[k]);

  const setField = (k: keyof AnomalyForm, v: number) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const save = useCallback(async () => {
    if (!loaded || !dirty || reason.trim().length === 0) return;
    setSaving(true);
    const changed = FIELDS.filter((k) => form[k] !== loaded[k]);
    try {
      for (const k of changed) {
        const res = await RiskParamAPI.upsert(`anomaly.${k}`, {
          value: form[k],
          scope: 'global',
          reason: reason.trim(),
        });
        if (!res.success) {
          toast.error(res.message || `保存失败: anomaly.${k}`);
          return;
        }
      }
      toast.success(`已保存 ${changed.length} 项变更`);
      setLoaded(form);
      setReason('');
    } catch {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  }, [loaded, form, dirty, reason]);

  return { loading, saving, form, setField, reason, setReason, dirty, save, refresh, fields: FIELDS };
}
