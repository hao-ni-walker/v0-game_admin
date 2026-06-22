'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  MarketControlAPI,
  RiskParamAPI,
  type RiskStatus,
  type RiskEventItem,
} from '@/service/request';

interface Layer4Form {
  thresholds: Record<string, Record<string, number>>;
  actions: Record<string, Record<string, number | null | boolean>>;
  cooldown_seconds: Record<string, number>;
}
const EMPTY: Layer4Form = { thresholds: {}, actions: {}, cooldown_seconds: {} };

function parseConfig(items: { key: string; value: unknown }[]): Layer4Form {
  const map = new Map(items.map((i) => [i.key, i.value]));
  return {
    thresholds: (map.get('layer4.thresholds') as Layer4Form['thresholds']) || {},
    actions: (map.get('layer4.actions') as Layer4Form['actions']) || {},
    cooldown_seconds: (map.get('layer4.cooldown_seconds') as Layer4Form['cooldown_seconds']) || {},
  };
}

export function useMarketControl() {
  const [status, setStatus] = useState<RiskStatus | null>(null);
  const [events, setEvents] = useState<RiskEventItem[]>([]);
  const [loaded, setLoaded] = useState<Layer4Form | null>(null);
  const [form, setForm] = useState<Layer4Form>(EMPTY);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await MarketControlAPI.getStatus();
      if (res.success && res.data) setStatus(res.data);
    } catch {
      /* silent poll */
    }
  }, []);

  const refreshEvents = useCallback(async () => {
    try {
      const res = await MarketControlAPI.getEvents({ size: 20 });
      if (res.success && res.data) setEvents(res.data.items);
    } catch {
      /* silent */
    }
  }, []);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await RiskParamAPI.getList();
      if (res.success && res.data) {
        const parsed = parseConfig(res.data.items.filter((i) => i.key.startsWith('layer4.')));
        setLoaded(JSON.parse(JSON.stringify(parsed)));
        setForm(parsed);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
    refreshEvents();
    loadConfig();
    timer.current = setInterval(refreshStatus, 5000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [refreshStatus, refreshEvents, loadConfig]);

  const dirty = !!loaded && JSON.stringify(form) !== JSON.stringify(loaded);

  const setSection = (
    section: 'thresholds' | 'actions',
    level: string,
    field: string,
    v: number | null | boolean,
  ) =>
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [level]: { ...(prev[section][level] as Record<string, unknown>), [field]: v },
      },
    }));

  // cooldown_seconds is flat (level → number), not level → {fields}.
  const setCooldown = (level: string, v: number) =>
    setForm((prev) => ({
      ...prev,
      cooldown_seconds: { ...prev.cooldown_seconds, [level]: v },
    }));

  const saveConfig = useCallback(async () => {
    if (!loaded || !dirty || reason.trim().length === 0) return;
    setSaving(true);
    const sections: (keyof Layer4Form)[] = ['thresholds', 'actions', 'cooldown_seconds'];
    const keyOf = (s: keyof Layer4Form) => `layer4.${s}`;
    try {
      for (const s of sections) {
        if (JSON.stringify(form[s]) !== JSON.stringify(loaded[s])) {
          const res = await RiskParamAPI.upsert(keyOf(s), {
            value: form[s],
            scope: 'level',
            reason: reason.trim(),
          });
          if (!res.success) {
            toast.error(res.message || `保存失败: ${keyOf(s)}`);
            return;
          }
        }
      }
      toast.success('配置已保存');
      setLoaded(JSON.parse(JSON.stringify(form)));
      setReason('');
    } finally {
      setSaving(false);
    }
  }, [loaded, form, dirty, reason]);

  const runAction = useCallback(
    async (
      fn: () => Promise<{ success: boolean; message?: string }>,
      label: string,
      successMsg?: string,
    ) => {
      setBusy(true);
      try {
        const res = await fn();
        if (res.success) {
          toast.success(successMsg ?? `${label}成功`);
          await Promise.all([refreshStatus(), refreshEvents()]);
        } else {
          toast.error(res.message || `${label}失败`);
        }
      } catch {
        toast.error(`${label}失败`);
      } finally {
        setBusy(false);
      }
    },
    [refreshStatus, refreshEvents],
  );

  return {
    status,
    events,
    loaded,
    form,
    setSection,
    setCooldown,
    reason,
    setReason,
    dirty,
    saving,
    saveConfig,
    busy,
    runAction,
    loading,
    refreshStatus,
  };
}
