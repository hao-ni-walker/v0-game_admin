'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/table/page-header';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { usePermissions } from '@/hooks/use-permissions';
import { CopyTradeAPI, type CopyTradeConfig } from '@/service/request';
import { toast } from 'sonner';

interface FormState {
  min_deposit: number;
  min_orders: number;
  min_register_days: number;
  max_following_per_user: number;
  default_max_followers_per_leader: number;
  default_daily_copy_limit: number;
  default_rate: number;
  min_rate: number;
  max_rate: number;
  frozen_hours: number;
  min_withdraw: number;
  max_copy_orders_per_leader_order: number;
}

export default function CopyTradeConfigPage() {
  const canWrite = usePermissions().hasPermission('copytrade:write');
  const [form, setForm] = useState<FormState>({
    min_deposit: 200, min_orders: 50, min_register_days: 7,
    max_following_per_user: 5, default_max_followers_per_leader: 500, default_daily_copy_limit: 500,
    default_rate: 0.08, min_rate: 0.03, max_rate: 0.15, frozen_hours: 24, min_withdraw: 10,
    max_copy_orders_per_leader_order: 500,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await CopyTradeAPI.getConfig();
      if (res.success && res.data) {
        const d: CopyTradeConfig = res.data;
        const la = (d.leader_apply_conditions ?? {}) as Record<string, number>;
        const fl = (d.follow_limits ?? {}) as Record<string, number>;
        const co = (d.commission ?? {}) as Record<string, number>;
        const ri = (d.risk ?? {}) as Record<string, number>;
        setForm({
          min_deposit: la.min_deposit ?? 200,
          min_orders: la.min_orders ?? 50,
          min_register_days: la.min_register_days ?? 7,
          max_following_per_user: fl.max_following_per_user ?? 5,
          default_max_followers_per_leader: fl.default_max_followers_per_leader ?? 500,
          default_daily_copy_limit: fl.default_daily_copy_limit ?? 500,
          default_rate: co.default_rate ?? 0.08,
          min_rate: co.min_rate ?? 0.03,
          max_rate: co.max_rate ?? 0.15,
          frozen_hours: co.frozen_hours ?? 24,
          min_withdraw: co.min_withdraw ?? 10,
          max_copy_orders_per_leader_order: ri.max_copy_orders_per_leader_order ?? 500,
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await CopyTradeAPI.updateConfig({
        leader_apply_conditions: { min_deposit: form.min_deposit, min_orders: form.min_orders, min_register_days: form.min_register_days },
        follow_limits: { max_following_per_user: form.max_following_per_user, default_max_followers_per_leader: form.default_max_followers_per_leader, default_daily_copy_limit: form.default_daily_copy_limit },
        commission: { default_rate: form.default_rate, min_rate: form.min_rate, max_rate: form.max_rate, frozen_hours: form.frozen_hours, min_withdraw: form.min_withdraw },
        risk: { copy_order_counts_toward_user_limits: true, copy_order_respects_odds_zero: true, max_copy_orders_per_leader_order: form.max_copy_orders_per_leader_order },
      });
      if (res.success) {
        toast.success('配置已保存');
      } else {
        toast.error(res.message || '保存失败');
      }
    } finally {
      setSaving(false);
    }
  };

  const num = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: Number(e.target.value) }));

  const field = (label: string, key: keyof FormState, step = 1) => (
    <div className='grid gap-1'>
      <Label htmlFor={key}>{label}</Label>
      <Input id={key} type='number' step={step} value={form[key]} onChange={num(key)} disabled={!canWrite || loading} />
    </div>
  );

  return (
    <PermissionGuard permissions='copytrade:read'>
      <PageContainer>
        <PageHeader title='跟单全局配置' description='带单员申请条件、跟随限制、佣金规则与风控' />

        <div className='grid gap-6 md:grid-cols-2'>
          <Card>
            <CardHeader><CardTitle>带单员申请条件</CardTitle><CardDescription>用户申请成为带单员的门槛</CardDescription></CardHeader>
            <CardContent className='grid gap-3'>
              {field('最低累计充值 (USDT)', 'min_deposit')}
              {field('最低历史订单数', 'min_orders')}
              {field('最低注册天数', 'min_register_days')}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>跟随限制</CardTitle><CardDescription>跟随关系的全局上限</CardDescription></CardHeader>
            <CardContent className='grid gap-3'>
              {field('单用户最大跟随数', 'max_following_per_user')}
              {field('单带单员默认最大跟随者', 'default_max_followers_per_leader')}
              {field('默认每日跟单总额上限', 'default_daily_copy_limit')}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>佣金规则</CardTitle><CardDescription>佣金比例与冻结期</CardDescription></CardHeader>
            <CardContent className='grid gap-3'>
              {field('默认佣金比例', 'default_rate', 0.005)}
              {field('最低佣金比例', 'min_rate', 0.005)}
              {field('最高佣金比例', 'max_rate', 0.005)}
              {field('佣金冻结时长 (小时)', 'frozen_hours')}
              {field('最低提取金额', 'min_withdraw')}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>风控</CardTitle><CardDescription>跟单订单的风控联动</CardDescription></CardHeader>
            <CardContent className='grid gap-3'>
              {field('单笔带单订单最大镜像数', 'max_copy_orders_per_leader_order')}
              <p className='text-muted-foreground text-xs'>跟单订单计入用户限额与赔率清零保护始终启用。</p>
            </CardContent>
          </Card>
        </div>

        {canWrite && (
          <div className='mt-6 flex justify-end'>
            <Button onClick={save} disabled={saving || loading}>{saving ? '保存中...' : '保存配置'}</Button>
          </div>
        )}
      </PageContainer>
    </PermissionGuard>
  );
}
