'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/table/page-header';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { usePermissions } from '@/hooks/use-permissions';
import { ParamNumberField } from '../components/ParamNumberField';
import { SaveBar } from '../components/SaveBar';
import { useAnomalyConfig } from './hooks/useAnomalyConfig';

export default function AnomalyDetectionPage() {
  const { loading, saving, form, setField, reason, setReason, dirty, save } =
    useAnomalyConfig();
  const { hasPermission } = usePermissions();
  const canWrite = hasPermission('risk:write');
  const dis = !canWrite || loading;

  return (
    <PermissionGuard permissions='risk:read'>
      <PageContainer>
        <PageHeader title='异常行为检测' description='编辑各规则阈值（保存后立即生效）' />

        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Badge variant='outline'>规则 1</Badge>
                <CardTitle className='text-base'>高频下单检测</CardTitle>
              </div>
              <CardDescription>同一用户 60 秒内下单次数达预警/限制阈值则触发</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-wrap gap-6'>
              <ParamNumberField label='预警笔数' value={form.freq_warn_count} onChange={(n) => setField('freq_warn_count', n)} disabled={dis} suffix='笔' />
              <ParamNumberField label='限制笔数' value={form.freq_limit_count} onChange={(n) => setField('freq_limit_count', n)} disabled={dis} suffix='笔' />
              <ParamNumberField label='限制单笔上限' value={form.freq_limit_cap} onChange={(n) => setField('freq_limit_cap', n)} disabled={dis} suffix='USDT' />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Badge variant='outline'>规则 2</Badge>
                <CardTitle className='text-base'>双向对冲检测</CardTitle>
              </div>
              <CardDescription>同周期同时持有买涨/买跌累计达阈值则暂停 Bonus 流水</CardDescription>
            </CardHeader>
            <CardContent>
              <ParamNumberField label='触发次数阈值' value={form.hedge_flag_threshold} onChange={(n) => setField('hedge_flag_threshold', n)} disabled={dis} suffix='次' />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Badge variant='outline'>规则 3</Badge>
                <CardTitle className='text-base'>充值未交易即提现</CardTitle>
              </div>
              <CardDescription>充值后窗口内未交易直接提现则进入人工审核</CardDescription>
            </CardHeader>
            <CardContent>
              <ParamNumberField label='观察窗口' value={form.deposit_trade_window_s} onChange={(n) => setField('deposit_trade_window_s', n)} disabled={dis} suffix='秒' />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Badge variant='outline'>规则 4</Badge>
                <CardTitle className='text-base'>大额异常下单</CardTitle>
              </div>
              <CardDescription>下单金额超过日均倍数则暂扣审查</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-wrap gap-6'>
              <ParamNumberField label='异常倍数' value={form.large_order_multiplier} onChange={(n) => setField('large_order_multiplier', n)} disabled={dis} suffix='倍' />
              <ParamNumberField label='暂扣时长' value={form.large_order_hold_s} onChange={(n) => setField('large_order_hold_s', n)} disabled={dis} suffix='秒' />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Badge variant='outline'>规则 5</Badge>
                <CardTitle className='text-base'>闪进闪出</CardTitle>
              </div>
              <CardDescription>注册后窗口内充值即提现、无交易则冻结</CardDescription>
            </CardHeader>
            <CardContent>
              <ParamNumberField label='观察窗口' value={form.flash_inout_window_s} onChange={(n) => setField('flash_inout_window_s', n)} disabled={dis} suffix='秒' />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Badge variant='outline'>规则 6</Badge>
                <CardTitle className='text-base'>连胜异常</CardTitle>
              </div>
              <CardDescription>连续盈利达阈值且利润超充值倍数则暂停提现</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-wrap gap-6'>
              <ParamNumberField label='连胜次数' value={form.win_streak_count} onChange={(n) => setField('win_streak_count', n)} disabled={dis} suffix='次' />
              <ParamNumberField label='利润倍数' value={form.win_streak_profit_ratio} onChange={(n) => setField('win_streak_profit_ratio', n)} disabled={dis} suffix='倍' />
            </CardContent>
          </Card>
        </div>

        {canWrite && (
          <div className='mt-6'>
            <SaveBar reason={reason} onReasonChange={setReason} onSave={save} saving={saving} dirty={dirty} canWrite={canWrite} />
          </div>
        )}
      </PageContainer>
    </PermissionGuard>
  );
}
