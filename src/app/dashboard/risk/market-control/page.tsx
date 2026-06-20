'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { RefreshCw } from 'lucide-react';
import { MarketControlAPI } from '@/service/request';
import { ParamNumberField } from '../components/ParamNumberField';
import { SaveBar } from '../components/SaveBar';
import { useMarketControl } from './hooks/useMarketControl';

const PERIODS = ['1m', '3m', '5m', '10m'] as const;
const LEVELS = ['L1', 'L2', 'L3', 'L4'] as const;
const PRICE_FIELD: Record<string, string> = {
  L1: 'price_1m',
  L2: 'price_3m',
  L3: 'price_5m',
  L4: 'price_5m',
};

export default function MarketControlPage() {
  const {
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
  } = useMarketControl();

  const { hasPermission } = usePermissions();
  const canWrite = hasPermission('risk:write');
  const canAct = hasPermission('risk:zero_single');
  const canActAll = hasPermission('risk:zero_all');

  const [actPeriod, setActPeriod] = useState<string>('1m');
  const [actDirection, setActDirection] = useState<'UP' | 'DOWN'>('UP');
  const [actReason, setActReason] = useState('');

  const configReady = !!loaded && Object.keys(form.thresholds).length > 0;

  return (
    <PermissionGuard permissions='risk:read'>
      <PageContainer>
        <PageHeader
          title='单边行情控制'
          description='配置阈值/动作、查看实时状态、手动执行风控动作'
          action={{
            label: '刷新状态',
            onClick: () => refreshStatus(),
            icon: <RefreshCw className='mr-2 h-4 w-4' />,
          }}
        />

        {/* ① 实时状态 */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>当前状态</CardTitle>
            <CardDescription>
              每 5 秒自动刷新。level/dominant_side/is_accepting 来自 MarketMonitor；敞口金额需检测引擎（暂为 0）。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>周期</TableHead>
                  <TableHead>等级</TableHead>
                  <TableHead>主方向</TableHead>
                  <TableHead>赔率状态</TableHead>
                  <TableHead>接受下单</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(status?.periods ?? []).map((p) => (
                  <TableRow key={p.period}>
                    <TableCell className='font-medium'>{p.period}</TableCell>
                    <TableCell>
                      <Badge variant={p.risk_level === 'normal' ? 'outline' : 'destructive'}>
                        {p.risk_level}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.dominant_side ?? '—'}</TableCell>
                    <TableCell>{p.odds_status}</TableCell>
                    <TableCell>{p.is_accepting ? '是' : '否'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ② 配置：阈值 / 动作 / 冷却 */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>阈值与动作配置</CardTitle>
            <CardDescription>
              layer4 单边行情阈值、响应动作、自动恢复冷却（4 级）。自动检测引擎尚未接入运行时，配置将在接入后生效；方向关闭等手动动作现在即生效。
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!configReady ? (
              <div className='text-muted-foreground text-sm'>{loading ? '加载中…' : '无配置数据'}</div>
            ) : (
              <div className='space-y-4'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>等级</TableHead>
                      <TableHead>单边占比阈值</TableHead>
                      <TableHead>价格阈值</TableHead>
                      <TableHead>敞口比率</TableHead>
                      <TableHead>赔率调整(%)</TableHead>
                      <TableHead>限额除数</TableHead>
                      <TableHead>单笔上限</TableHead>
                      <TableHead>冷却(秒)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {LEVELS.map((lvl) => (
                      <TableRow key={lvl}>
                        <TableCell className='font-medium'>{lvl}</TableCell>
                        <TableCell>
                          <ParamNumberField
                            label=''
                            value={Number(form.thresholds[lvl]?.single_side ?? 0)}
                            onChange={(n) => setSection('thresholds', lvl, 'single_side', n)}
                            disabled={!canWrite || loading}
                          />
                        </TableCell>
                        <TableCell>
                          <ParamNumberField
                            label=''
                            value={Number(form.thresholds[lvl]?.[PRICE_FIELD[lvl]] ?? 0)}
                            onChange={(n) => setSection('thresholds', lvl, PRICE_FIELD[lvl], n)}
                            disabled={!canWrite || loading}
                          />
                        </TableCell>
                        <TableCell>
                          <ParamNumberField
                            label=''
                            value={Number(form.thresholds[lvl]?.risk ?? 0)}
                            onChange={(n) => setSection('thresholds', lvl, 'risk', n)}
                            disabled={!canWrite || loading}
                          />
                        </TableCell>
                        <TableCell>
                          <ParamNumberField
                            label=''
                            value={Number(form.actions[lvl]?.odds_delta ?? 0)}
                            onChange={(n) => setSection('actions', lvl, 'odds_delta', n)}
                            disabled={!canWrite || loading}
                          />
                        </TableCell>
                        <TableCell>
                          <ParamNumberField
                            label=''
                            value={Number(form.actions[lvl]?.limit_div ?? 0)}
                            onChange={(n) => setSection('actions', lvl, 'limit_div', n)}
                            disabled={!canWrite || loading}
                          />
                        </TableCell>
                        <TableCell>
                          <ParamNumberField
                            label=''
                            value={Number(form.actions[lvl]?.single_cap ?? 0)}
                            onChange={(n) => setSection('actions', lvl, 'single_cap', n)}
                            disabled={!canWrite || loading}
                          />
                        </TableCell>
                        <TableCell>
                          <ParamNumberField
                            label=''
                            value={Number(form.cooldown_seconds[lvl] ?? 0)}
                            onChange={(n) => setCooldown(lvl, n)}
                            disabled={!canWrite || loading}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {canWrite && (
                  <SaveBar
                    reason={reason}
                    onReasonChange={setReason}
                    onSave={saveConfig}
                    saving={saving}
                    dirty={dirty}
                    canWrite={canWrite}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ③ 手动动作 */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>手动风控动作</CardTitle>
            <CardDescription>赔率清零/恢复、方向关闭/恢复。全周期操作走双人审批。</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex flex-wrap items-end gap-3'>
              <div className='flex flex-col gap-1'>
                <label className='text-muted-foreground text-xs'>周期</label>
                <select
                  className='border-input h-9 rounded-md border bg-background px-2 text-sm'
                  value={actPeriod}
                  onChange={(e) => setActPeriod(e.target.value)}
                  disabled={!canAct || busy}
                >
                  {PERIODS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-muted-foreground text-xs'>方向（关闭/恢复用）</label>
                <select
                  className='border-input h-9 rounded-md border bg-background px-2 text-sm'
                  value={actDirection}
                  onChange={(e) => setActDirection(e.target.value as 'UP' | 'DOWN')}
                  disabled={!canAct || busy}
                >
                  <option value='UP'>UP（买涨）</option>
                  <option value='DOWN'>DOWN（买跌）</option>
                </select>
              </div>
              <div className='flex flex-col gap-1'>
                <label className='text-muted-foreground text-xs'>操作原因（必填）</label>
                <Input
                  placeholder='原因'
                  className='w-64'
                  value={actReason}
                  onChange={(e) => setActReason(e.target.value)}
                  disabled={!canAct || busy}
                />
              </div>
            </div>
            <div className='flex flex-wrap gap-2'>
              <Button
                variant='outline'
                disabled={!canAct || busy || actReason.trim().length === 0}
                onClick={() =>
                  runAction(
                    () => MarketControlAPI.zeroOdds(actPeriod, actReason.trim()),
                    `清零 ${actPeriod} 赔率`,
                  )
                }
              >
                清零赔率（{actPeriod}）
              </Button>
              <Button
                variant='outline'
                disabled={!canAct || busy || actReason.trim().length === 0}
                onClick={() =>
                  runAction(
                    () => MarketControlAPI.restoreOdds(actPeriod, actReason.trim()),
                    `恢复 ${actPeriod} 赔率`,
                  )
                }
              >
                恢复赔率（{actPeriod}）
              </Button>
              <Button
                variant='outline'
                disabled={!canAct || busy || actReason.trim().length === 0}
                onClick={() =>
                  runAction(
                    () => MarketControlAPI.closeDirection(actPeriod, actDirection, actReason.trim()),
                    `关闭 ${actPeriod}/${actDirection}`,
                  )
                }
              >
                关闭方向（{actPeriod}/{actDirection}）
              </Button>
              <Button
                variant='outline'
                disabled={!canAct || busy || actReason.trim().length === 0}
                onClick={() =>
                  runAction(
                    () => MarketControlAPI.restoreDirection(actPeriod, actDirection, actReason.trim()),
                    `恢复 ${actPeriod}/${actDirection}`,
                  )
                }
              >
                恢复方向（{actPeriod}/{actDirection}）
              </Button>
            </div>
            <div className='flex flex-wrap gap-2 border-t pt-3'>
              <Button
                variant='destructive'
                disabled={!canActAll || busy || actReason.trim().length === 0}
                onClick={() =>
                  runAction(
                    () => MarketControlAPI.zeroAll(actReason.trim(), true),
                    '全部清零',
                    '已提交双人审批，待审批通过后生效',
                  )
                }
              >
                全部清零（双人审批）
              </Button>
              <Button
                variant='outline'
                disabled={!canActAll || busy || actReason.trim().length === 0}
                onClick={() =>
                  runAction(
                    () => MarketControlAPI.restoreAll(actReason.trim(), true),
                    '全部恢复',
                    '已提交双人审批，待审批通过后生效',
                  )
                }
              >
                全部恢复（双人审批）
              </Button>
            </div>
            <p className='text-muted-foreground text-xs'>
              待审批列表的查看/审批需后端新增"列出待审批"接口，暂未实现；执行全周期操作后请到审批流程跟进。
            </p>
          </CardContent>
        </Card>

        {/* ④ 事件记录 */}
        <Card>
          <CardHeader>
            <CardTitle>触发事件记录</CardTitle>
            <CardDescription>风控事件历史（手动 + 自动）</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className='text-muted-foreground flex h-20 items-center justify-center text-sm'>
                暂无事件
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>周期</TableHead>
                    <TableHead>操作人</TableHead>
                    <TableHead>原因</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((e) => (
                    <TableRow key={e.event_id}>
                      <TableCell className='text-sm'>
                        {new Date(e.created_at * 1000).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>{e.type}</Badge>
                      </TableCell>
                      <TableCell>{e.period ?? '—'}</TableCell>
                      <TableCell>{e.operator ?? '—'}</TableCell>
                      <TableCell className='text-muted-foreground text-sm'>{e.reason ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </PageContainer>
    </PermissionGuard>
  );
}
