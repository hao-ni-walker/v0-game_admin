'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/table/page-header';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { usePermissions } from '@/hooks/use-permissions';
import { ParamNumberField } from '../components/ParamNumberField';
import { SaveBar } from '../components/SaveBar';
import { useLimitsConfig } from './hooks/useLimitsConfig';

export default function LimitsConfigPage() {
  const {
    loading,
    saving,
    form,
    setForm,
    reason,
    setReason,
    dirty,
    save,
    tierNames,
    periods,
  } = useLimitsConfig();

  const { hasPermission } = usePermissions();
  const canWrite = hasPermission('risk:config');

  const setTier = (
    tier: string,
    field: 'single' | 'daily' | 'open_positions',
    next: number,
  ) => {
    setForm((prev) => ({
      ...prev,
      tiers: { ...prev.tiers, [tier]: { ...prev.tiers[tier], [field]: next } },
    }));
  };

  const setPlatform = (
    field: 'per_period' | 'per_direction',
    next: number,
  ) => {
    setForm((prev) => ({
      ...prev,
      platform: { ...prev.platform, [field]: next },
    }));
  };

  const setCutoff = (period: string, next: number) => {
    setForm((prev) => ({
      ...prev,
      cutoff: { ...prev.cutoff, [period]: next },
    }));
  };

  return (
    <PermissionGuard permissions='risk:config'>
      <PageContainer>
        <PageHeader
          title='限额配置'
          description='编辑下单限额与截止时间（保存后立即生效）'
        />

        {/* 等级限额表 */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>用户等级限额</CardTitle>
            <CardDescription>按用户等级配置单笔 / 日额 / 持仓数上限（USDT / 笔）</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>等级</TableHead>
                  <TableHead>单笔上限</TableHead>
                  <TableHead>日累计上限</TableHead>
                  <TableHead>最大持仓数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tierNames.map((tier) => (
                  <TableRow key={tier}>
                    <TableCell className='font-medium'>{tier}</TableCell>
                    <TableCell>
                      <ParamNumberField
                        label=''
                        value={form.tiers[tier].single}
                        onChange={(n) => setTier(tier, 'single', n)}
                        disabled={!canWrite || loading}
                        suffix='USDT'
                      />
                    </TableCell>
                    <TableCell>
                      <ParamNumberField
                        label=''
                        value={form.tiers[tier].daily}
                        onChange={(n) => setTier(tier, 'daily', n)}
                        disabled={!canWrite || loading}
                        suffix='USDT'
                      />
                    </TableCell>
                    <TableCell>
                      <ParamNumberField
                        label=''
                        value={form.tiers[tier].open_positions}
                        onChange={(n) => setTier(tier, 'open_positions', n)}
                        disabled={!canWrite || loading}
                        suffix='笔'
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 平台全局限额 */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>平台全局限额</CardTitle>
            <CardDescription>控制全平台下单总量（USDT）</CardDescription>
          </CardHeader>
          <CardContent className='flex gap-6'>
            <ParamNumberField
              label='单周期全平台总额上限'
              value={form.platform.per_period}
              onChange={(n) => setPlatform('per_period', n)}
              disabled={!canWrite || loading}
              suffix='USDT'
            />
            <ParamNumberField
              label='单方向单周期上限'
              value={form.platform.per_direction}
              onChange={(n) => setPlatform('per_direction', n)}
              disabled={!canWrite || loading}
              suffix='USDT'
            />
          </CardContent>
        </Card>

        {/* 截止下单时间 */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>截止下单时间控制</CardTitle>
            <CardDescription>每周期下单截止提前量（秒），截止后前端锁定下单</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-6'>
            {periods.map((p) => (
              <ParamNumberField
                key={p}
                label={`${p} 提前截止`}
                value={form.cutoff[p]}
                onChange={(n) => setCutoff(p, n)}
                disabled={!canWrite || loading}
                suffix='秒'
              />
            ))}
          </CardContent>
        </Card>

        {/* 保存 */}
        {canWrite && (
          <SaveBar
            reason={reason}
            onReasonChange={setReason}
            onSave={save}
            saving={saving}
            dirty={dirty}
            canWrite={canWrite}
          />
        )}
      </PageContainer>
    </PermissionGuard>
  );
}
