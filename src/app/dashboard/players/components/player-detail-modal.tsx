'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Edit, Wallet, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { PlayerDetail, PeriodType } from '../types';
import {
  formatCurrency,
  formatDateTime,
  getPlayerStatusText,
  getVipLevelColor,
  getRegistrationMethodText,
  getIdentityCategoryText,
  getPeriodTypeText
} from '../utils';
import { useRouter } from 'next/navigation';

interface PlayerDetailModalProps {
  open: boolean;
  playerId: number | null;
  onClose: () => void;
  onEdit: (player: PlayerDetail) => void;
  onAdjustWallet: (player: PlayerDetail) => void;
  onRefresh: (playerId: number) => Promise<PlayerDetail | null>;
}

/**
 * 玩家详情弹窗组件
 */
export function PlayerDetailModal({
  open,
  playerId,
  onClose,
  onEdit,
  onAdjustWallet,
  onRefresh
}: PlayerDetailModalProps) {
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [spinQuotaFilter, setSpinQuotaFilter] = useState<PeriodType | 'all'>(
    'all'
  );

  const loadPlayerDetail = useCallback(async () => {
    if (!playerId) return;
    setLoading(true);
    try {
      const playerData = await onRefresh(playerId);
      if (playerData) {
        setPlayer(playerData);
      }
    } finally {
      setLoading(false);
    }
  }, [playerId, onRefresh]);

  // 加载玩家详情
  useEffect(() => {
    if (open && playerId) {
      loadPlayerDetail();
    } else {
      setPlayer(null);
    }
  }, [open, playerId, loadPlayerDetail]);

  // 过滤转盘配额
  const filteredSpinQuotas = React.useMemo(() => {
    if (!player?.spin_quotas) return [];
    if (spinQuotaFilter === 'all') return player.spin_quotas;
    return player.spin_quotas.filter((q) => q.period_type === spinQuotaFilter);
  }, [player?.spin_quotas, spinQuotaFilter]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <span>玩家详情</span>
            <div className='flex gap-2'>
              {player && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => onEdit(player)}
                >
                  <Edit className='mr-2 h-4 w-4' />
                  编辑
                </Button>
              )}
              <Button variant='ghost' size='sm' onClick={onClose}>
                <X className='h-4 w-4' />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className='space-y-4'>
            <Skeleton className='h-64 w-full' />
          </div>
        ) : !player ? (
          <div className='text-muted-foreground py-8 text-center'>
            <p>玩家不存在或加载失败</p>
            <Button
              variant='outline'
              className='mt-4'
              onClick={loadPlayerDetail}
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              重试
            </Button>
          </div>
        ) : (
          <Tabs defaultValue='basic' className='w-full'>
            <TabsList className='grid w-full grid-cols-5'>
              <TabsTrigger value='basic'>基本信息</TabsTrigger>
              <TabsTrigger value='wallet'>钱包信息</TabsTrigger>
              <TabsTrigger value='vip'>VIP信息</TabsTrigger>
              <TabsTrigger value='spin'>转盘配额</TabsTrigger>
              <TabsTrigger value='agency'>代理关系</TabsTrigger>
            </TabsList>

            {/* 基本信息 Tab */}
            <TabsContent value='basic' className='mt-4 space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    玩家ID
                  </label>
                  <p className='mt-1'>{player.id}</p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    ID名称
                  </label>
                  <p className='mt-1'>{player.idname || '-'}</p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    用户名
                  </label>
                  <p className='mt-1'>{player.username}</p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    邮箱
                  </label>
                  <p className='mt-1'>{player.email}</p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    账户状态
                  </label>
                  <p className='mt-1'>
                    <Badge variant='default'>
                      {getPlayerStatusText(player.status)}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    VIP等级
                  </label>
                  <p className='mt-1'>
                    <Badge
                      variant='outline'
                      className={getVipLevelColor(player.vip_level)}
                    >
                      VIP {player.vip_level}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    注册方式
                  </label>
                  <p className='mt-1'>
                    {getRegistrationMethodText(player.registration_method)}
                  </p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    注册来源
                  </label>
                  <p className='mt-1'>{player.registration_source || '-'}</p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    身份类别
                  </label>
                  <p className='mt-1'>
                    {getIdentityCategoryText(player.identity_category)}
                  </p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    创建时间
                  </label>
                  <p className='mt-1'>{formatDateTime(player.created_at)}</p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    更新时间
                  </label>
                  <p className='mt-1'>{formatDateTime(player.updated_at)}</p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    最后登录时间
                  </label>
                  <p className='mt-1'>{formatDateTime(player.last_login)}</p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    登录失败次数
                  </label>
                  <p className='mt-1'>{player.login_failure_count || 0}</p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    账户锁定时间
                  </label>
                  <p className='mt-1'>{formatDateTime(player.locked_at)}</p>
                </div>
              </div>
            </TabsContent>

            {/* 钱包信息 Tab */}
            <TabsContent value='wallet' className='mt-4 space-y-4'>
              {player.wallet ? (
                <>
                  <div className='flex justify-end'>
                    <Button onClick={() => onAdjustWallet(player)}>
                      <Wallet className='mr-2 h-4 w-4' />
                      调整余额
                    </Button>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='text-muted-foreground text-sm font-medium'>
                        可用余额
                      </label>
                      <p className='mt-1 font-mono text-lg'>
                        {formatCurrency(player.wallet.balance)}
                      </p>
                    </div>
                    <div>
                      <label className='text-muted-foreground text-sm font-medium'>
                        冻结余额
                      </label>
                      <p className='mt-1 font-mono text-lg'>
                        {formatCurrency(player.wallet.frozen_balance)}
                      </p>
                    </div>
                    <div>
                      <label className='text-muted-foreground text-sm font-medium'>
                        赠送金额
                      </label>
                      <p className='mt-1 font-mono'>
                        {formatCurrency(player.wallet.bonus)}
                      </p>
                    </div>
                    <div>
                      <label className='text-muted-foreground text-sm font-medium'>
                        积分
                      </label>
                      <p className='mt-1 font-mono'>
                        {formatCurrency(player.wallet.credit)}
                      </p>
                    </div>
                    <div>
                      <label className='text-muted-foreground text-sm font-medium'>
                        可提现金额
                      </label>
                      <p className='mt-1 font-mono'>
                        {formatCurrency(player.wallet.withdrawable)}
                      </p>
                    </div>
                    <div>
                      <label className='text-muted-foreground text-sm font-medium'>
                        货币类型
                      </label>
                      <p className='mt-1'>{player.wallet.currency}</p>
                    </div>
                    <div>
                      <label className='text-muted-foreground text-sm font-medium'>
                        总存款
                      </label>
                      <p className='mt-1 font-mono'>
                        {formatCurrency(player.wallet.total_deposit)}
                      </p>
                    </div>
                    <div>
                      <label className='text-muted-foreground text-sm font-medium'>
                        总取款
                      </label>
                      <p className='mt-1 font-mono'>
                        {formatCurrency(player.wallet.total_withdraw)}
                      </p>
                    </div>
                    <div>
                      <label className='text-muted-foreground text-sm font-medium'>
                        总投注
                      </label>
                      <p className='mt-1 font-mono'>
                        {formatCurrency(player.wallet.total_bet)}
                      </p>
                    </div>
                    <div>
                      <label className='text-muted-foreground text-sm font-medium'>
                        总赢取
                      </label>
                      <p className='mt-1 font-mono'>
                        {formatCurrency(player.wallet.total_win)}
                      </p>
                    </div>
                    <div>
                      <label className='text-muted-foreground text-sm font-medium'>
                        钱包状态
                      </label>
                      <p className='mt-1'>
                        <Badge variant='outline'>{player.wallet.status}</Badge>
                      </p>
                    </div>
                    <div>
                      <label className='text-muted-foreground text-sm font-medium'>
                        版本号
                      </label>
                      <p className='mt-1'>{player.wallet.version}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className='text-muted-foreground py-8 text-center'>
                  <p>暂无钱包信息</p>
                </div>
              )}
            </TabsContent>

            {/* VIP信息 Tab */}
            <TabsContent value='vip' className='mt-4 space-y-4'>
              {player.vip_info ? (
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='text-muted-foreground text-sm font-medium'>
                      VIP等级
                    </label>
                    <p className='mt-1'>
                      <Badge
                        variant='outline'
                        className={getVipLevelColor(player.vip_info.level)}
                      >
                        VIP {player.vip_info.level}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className='text-muted-foreground text-sm font-medium'>
                      经验值
                    </label>
                    <p className='mt-1'>{player.vip_info.experience}</p>
                  </div>
                  <div>
                    <label className='text-muted-foreground text-sm font-medium'>
                      上次领取每日奖励日期
                    </label>
                    <p className='mt-1'>
                      {formatDateTime(player.vip_info.last_daily_reward_date)}
                    </p>
                  </div>
                  <div>
                    <label className='text-muted-foreground text-sm font-medium'>
                      VIP状态
                    </label>
                    <p className='mt-1'>
                      <Badge variant='outline'>{player.vip_info.status}</Badge>
                    </p>
                  </div>
                  <div>
                    <label className='text-muted-foreground text-sm font-medium'>
                      创建时间
                    </label>
                    <p className='mt-1'>
                      {formatDateTime(player.vip_info.created_at)}
                    </p>
                  </div>
                  <div>
                    <label className='text-muted-foreground text-sm font-medium'>
                      更新时间
                    </label>
                    <p className='mt-1'>
                      {formatDateTime(player.vip_info.updated_at)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className='text-muted-foreground py-8 text-center'>
                  <p>暂无VIP信息</p>
                </div>
              )}
            </TabsContent>

            {/* 转盘配额 Tab */}
            <TabsContent value='spin' className='mt-4 space-y-4'>
              <div className='flex items-center justify-between'>
                <Select
                  value={spinQuotaFilter}
                  onValueChange={(v) => setSpinQuotaFilter(v as any)}
                >
                  <SelectTrigger className='w-40'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>全部</SelectItem>
                    <SelectItem value='daily'>每日</SelectItem>
                    <SelectItem value='weekly'>每周</SelectItem>
                    <SelectItem value='monthly'>每月</SelectItem>
                    <SelectItem value='custom'>自定义</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {filteredSpinQuotas.length > 0 ? (
                <div className='rounded-lg border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>活动ID</TableHead>
                        <TableHead>周期类型</TableHead>
                        <TableHead>周期开始</TableHead>
                        <TableHead>周期结束</TableHead>
                        <TableHead>累计发放总额度</TableHead>
                        <TableHead>累计已使用</TableHead>
                        <TableHead>本周期配额</TableHead>
                        <TableHead>本周期已用</TableHead>
                        <TableHead>本周期剩余</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSpinQuotas.map((quota, index) => (
                        <TableRow key={index}>
                          <TableCell>{quota.activity_id}</TableCell>
                          <TableCell>
                            {getPeriodTypeText(quota.period_type)}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(quota.period_start)}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(quota.period_end)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(quota.total_allowed)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(quota.total_used)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(quota.period_allowed)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(quota.period_used)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(quota.period_remaining)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className='text-muted-foreground py-8 text-center'>
                  <p>暂无转盘配额数据</p>
                </div>
              )}
            </TabsContent>

            {/* 代理关系 Tab */}
            <TabsContent value='agency' className='mt-4 space-y-4'>
              {player.agency ? (
                <>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='text-muted-foreground text-sm font-medium'>
                        直属上级ID
                      </label>
                      <p className='mt-1'>
                        {player.agency.direct_superior_id || '-'}
                      </p>
                    </div>
                    <div>
                      <label className='text-muted-foreground text-sm font-medium'>
                        上级用户名
                      </label>
                      <p className='mt-1'>
                        {player.agency.superior_username || '-'}
                      </p>
                    </div>
                    <div>
                      <label className='text-muted-foreground text-sm font-medium'>
                        代理商名称
                      </label>
                      <p className='mt-1'>{player.agency.agent || '-'}</p>
                    </div>
                    <div>
                      <label className='text-muted-foreground text-sm font-medium'>
                        下级用户数量
                      </label>
                      <p className='mt-1'>{player.agency.subordinate_count}</p>
                    </div>
                  </div>
                  {player.agency.subordinates &&
                    player.agency.subordinates.length > 0 && (
                      <div className='mt-4'>
                        <div className='mb-2 flex items-center justify-between'>
                          <label className='text-sm font-medium'>
                            下级用户列表（前10条）
                          </label>
                          <Button
                            variant='link'
                            size='sm'
                            onClick={() => {
                              router.push(
                                `/dashboard/players?direct_superior_id=${player.id}`
                              );
                              onClose();
                            }}
                          >
                            查看全部下级
                          </Button>
                        </div>
                        <div className='rounded-lg border'>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>用户名</TableHead>
                                <TableHead>VIP等级</TableHead>
                                <TableHead>注册时间</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {player.agency.subordinates.map((sub) => (
                                <TableRow key={sub.id}>
                                  <TableCell>{sub.id}</TableCell>
                                  <TableCell>{sub.username}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant='outline'
                                      className={getVipLevelColor(
                                        sub.vip_level
                                      )}
                                    >
                                      VIP {sub.vip_level}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {formatDateTime(sub.created_at)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                </>
              ) : (
                <div className='text-muted-foreground py-8 text-center'>
                  <p>暂无代理关系信息</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
