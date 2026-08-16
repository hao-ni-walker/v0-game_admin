'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Gift, Percent } from 'lucide-react';
import { toast } from 'sonner';
import PageContainer from '@/components/layout/page-container';
import { PermissionGuard } from '@/components/auth/permission-guard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/table/page-header';
import { usePermissions } from '@/hooks/use-permissions';
import { ReferralConfigAPI } from '@/service/request';

const DEFAULT_COMMISSION_PERCENT = 5;
const REWARD_SHARE_PERCENT = 50;

export default function ReferralRewardConfigPage() {
  const canWrite = usePermissions().hasPermission('system:write');
  const [commissionPercent, setCommissionPercent] = useState(
    DEFAULT_COMMISSION_PERCENT
  );
  const [reason, setReason] = useState('调整邀请奖励佣金比例');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ReferralConfigAPI.get();
      if (response.success && response.data) {
        setCommissionPercent(response.data.commission_rate * 100);
      } else {
        toast.error(response.message || '获取配置失败');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const effectivePercent = useMemo(
    () => commissionPercent * (REWARD_SHARE_PERCENT / 100),
    [commissionPercent]
  );
  const isValid =
    Number.isFinite(commissionPercent) &&
    commissionPercent >= 0 &&
    commissionPercent <= 100 &&
    reason.trim().length > 0;

  const save = async () => {
    if (!isValid) {
      toast.error('佣金比例须在 0% 到 100% 之间，并填写调整原因');
      return;
    }
    setSaving(true);
    try {
      const response = await ReferralConfigAPI.update({
        commission_rate: commissionPercent / 100,
        reason: reason.trim()
      });
      if (response.success) {
        toast.success('邀请奖励配置已保存');
        await load();
      } else {
        toast.error(response.message || '保存失败');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <PermissionGuard permissions='risk:read'>
      <PageContainer>
        <PageHeader
          title='邀请奖励配置'
          description='配置受邀用户投注流水产生的佣金；直属邀请人固定获得佣金的 50%'
        />

        <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Percent className='h-5 w-5' />
                投注流水佣金
              </CardTitle>
              <CardDescription>
                例如填写 5，代表佣金 = 有效投注流水 × 5%
              </CardDescription>
            </CardHeader>
            <CardContent className='grid gap-5'>
              <div className='grid gap-2'>
                <Label htmlFor='commission-rate'>佣金比例（%）</Label>
                <Input
                  id='commission-rate'
                  type='number'
                  min={0}
                  max={100}
                  step={0.01}
                  value={commissionPercent}
                  disabled={loading || !canWrite}
                  onChange={(event) =>
                    setCommissionPercent(Number(event.target.value))
                  }
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='reason'>调整原因</Label>
                <Input
                  id='reason'
                  value={reason}
                  maxLength={500}
                  disabled={loading || !canWrite}
                  onChange={(event) => setReason(event.target.value)}
                />
              </div>
              {canWrite && (
                <div className='flex justify-end'>
                  <Button
                    onClick={save}
                    disabled={loading || saving || !isValid}
                  >
                    {saving ? '保存中...' : '保存配置'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Gift className='h-5 w-5' />
                奖励预览
              </CardTitle>
              <CardDescription>邀请人分佣固定为 50%</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='rounded-lg border p-4 text-sm'>
                <p className='text-muted-foreground'>计算公式</p>
                <p className='mt-2 font-medium'>
                  投注流水 × {commissionPercent || 0}% × 50%
                </p>
              </div>
              <div className='rounded-lg border p-4 text-sm'>
                <p className='text-muted-foreground'>邀请人实际奖励比例</p>
                <p className='mt-2 text-2xl font-semibold'>
                  {effectivePercent.toFixed(2)}%
                </p>
              </div>
              <p className='text-muted-foreground text-xs'>
                按每笔已结算且非退款的真实投注发放；系统通过订单唯一标识防止重复发奖。
              </p>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </PermissionGuard>
  );
}
