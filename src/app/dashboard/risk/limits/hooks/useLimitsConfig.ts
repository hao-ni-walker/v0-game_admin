'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RiskParamAPI } from '@/service/request';

const TIER_NAMES = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5'] as const;
const PERIODS = ['1m', '3m', '5m', '10m'] as const;

export interface TierLimit {
  single: number;
  daily: number;
  open_positions: number;
}

export interface LimitsForm {
  tiers: Record<string, TierLimit>;
  platform: { per_period: number; per_direction: number };
  cutoff: Record<string, number>;
}

const EMPTY_FORM: LimitsForm = {
  tiers: Object.fromEntries(
    TIER_NAMES.map((t) => [t, { single: 0, daily: 0, open_positions: 0 }]),
  ),
  platform: { per_period: 0, per_direction: 0 },
  cutoff: Object.fromEntries(PERIODS.map((p) => [p, 0])),
};

function parseForm(items: { key: string; value: unknown }[]): LimitsForm {
  const form: LimitsForm = JSON.parse(JSON.stringify(EMPTY_FORM));
  for (const it of items) {
    if (it.key.startsWith('limits.user_tier.')) {
      const tier = it.key.split('.').pop()!;
      if (tier in form.tiers && it.value && typeof it.value === 'object') {
        const v = it.value as Partial<TierLimit>;
        form.tiers[tier] = {
          single: Number(v.single ?? 0),
          daily: Number(v.daily ?? 0),
          open_positions: Number(v.open_positions ?? 0),
        };
      }
    } else if (it.key === 'limits.platform.per_period') {
      form.platform.per_period = Number(it.value ?? 0);
    } else if (it.key === 'limits.platform.per_direction') {
      form.platform.per_direction = Number(it.value ?? 0);
    } else if (it.key === 'limits.cutoff_seconds' && it.value && typeof it.value === 'object') {
      const v = it.value as Record<string, number>;
      for (const p of PERIODS) form.cutoff[p] = Number(v[p] ?? 0);
    }
  }
  return form;
}

function formToJson(form: LimitsForm) {
  return {
    tiers: Object.fromEntries(
      TIER_NAMES.map((t) => [`limits.user_tier.${t}`, form.tiers[t]] as const),
    ),
    'limits.platform.per_period': form.platform.per_period,
    'limits.platform.per_direction': form.platform.per_direction,
    'limits.cutoff_seconds': Object.fromEntries(
      PERIODS.map((p) => [p, form.cutoff[p]] as const),
    ),
  } as Record<string, unknown>;
}

export function useLimitsConfig() {
  const [loaded, setLoaded] = useState<LimitsForm | null>(null);
  const [form, setForm] = useState<LimitsForm>(EMPTY_FORM);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await RiskParamAPI.getList();
      if (res.success && res.data) {
        const parsed = parseForm(res.data.items.filter((i) => i.key.startsWith('limits.')));
        setLoaded(parsed);
        setForm(parsed);
      } else {
        toast.error(res.message || '获取限额配置失败');
      }
    } catch {
      toast.error('获取限额配置失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const dirty =
    !!loaded && JSON.stringify(formToJson(form)) !== JSON.stringify(formToJson(loaded));

  const save = useCallback(async () => {
    if (!loaded || !dirty || reason.trim().length === 0) return;
    setSaving(true);
    const currentJson = formToJson(form);
    const loadedJson = formToJson(loaded);
    const changedKeys = Object.keys(currentJson).filter(
      (k) => JSON.stringify(currentJson[k]) !== JSON.stringify(loadedJson[k]),
    );
    try {
      for (const key of changedKeys) {
        const res = await RiskParamAPI.upsert(key, {
          value: currentJson[key],
          scope: 'global',
          reason: reason.trim(),
        });
        if (!res.success) {
          toast.error(res.message || `保存失败: ${key}`);
          return;
        }
      }
      toast.success(`已保存 ${changedKeys.length} 项变更`);
      setLoaded(form);
      setReason('');
    } catch {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  }, [loaded, form, dirty, reason]);

  return {
    loading,
    saving,
    form,
    setForm,
    reason,
    setReason,
    dirty,
    save,
    refresh,
    tierNames: TIER_NAMES,
    periods: PERIODS,
  };
}
