'use client';

import { useState } from 'react';
import {
  Eye,
  Pencil,
  Power,
  PowerOff,
  Trash2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Settings,
  Wallet
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  PaymentPlatform,
  PaymentChannel,
  PaymentChannelPagination,
  PaymentChannelTableEmptyState
} from '../types';
import {
  CHANNEL_TYPE_LABELS,
  CHANNEL_TYPE_COLORS,
  PAYMENT_TYPE_LABELS,
  PAYMENT_TYPE_COLORS
} from '../constants';

interface PaymentPlatformTableProps {
  platforms: PaymentPlatform[];
  loading?: boolean;
  pagination: PaymentChannelPagination;
  onEditPlatform?: (platform: PaymentPlatform) => void;
  onViewPlatform?: (platform: PaymentPlatform) => void;
  onTogglePlatformStatus?: (platform: PaymentPlatform) => void;
  onEditChannel?: (channel: PaymentChannel, platform: PaymentPlatform) => void;
  onViewChannel?: (channel: PaymentChannel, platform: PaymentPlatform) => void;
  onToggleChannelDisabled?: (channel: PaymentChannel) => void;
  onDeleteChannel?: (channel: PaymentChannel) => void;
  emptyState?: PaymentChannelTableEmptyState;
}

export function PaymentPlatformTable({
  platforms,
  loading,
  pagination,
  onEditPlatform,
  onViewPlatform,
  onTogglePlatformStatus,
  onEditChannel,
  onViewChannel,
  onToggleChannelDisabled,
  onDeleteChannel,
  emptyState
}: PaymentPlatformTableProps) {
  // 展开状态管理
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<number>>(
    new Set()
  );

  // 切换展开状态
  const toggleExpanded = (platformId: number) => {
    setExpandedPlatforms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(platformId)) {
        newSet.delete(platformId);
      } else {
        newSet.add(platformId);
      }
      return newSet;
    });
  };

  // 格式化金额
  const formatAmount = (amount: string | number | null) => {
    if (amount === null || amount === undefined) return '-';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '-';
    return num.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // 格式化费率
  const formatFeeRate = (rate: string | number) => {
    const num = typeof rate === 'string' ? parseFloat(rate) : rate;
    if (isNaN(num) || num === 0) return '-';
    return `${(num * 100).toFixed(2)}%`;
  };

  // 格式化时间
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 加载骨架屏
  if (loading && platforms.length === 0) {
    return (
      <div className='space-y-2 rounded-md border'>
        {[...Array(5)].map((_, i) => (
          <div key={i} className='flex items-center space-x-4 p-4'>
            <Skeleton className='h-12 w-12' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 空状态
  if (!loading && platforms.length === 0 && emptyState) {
    return (
      <div className='flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center'>
        <div className='mx-auto flex max-w-[420px] flex-col items-center justify-center text-center'>
          {emptyState.icon}
          <h3 className='mt-4 text-lg font-semibold'>{emptyState.title}</h3>
          <p className='text-muted-foreground mt-2 mb-4 text-sm'>
            {emptyState.description}
          </p>
          {emptyState.action}
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[40px]'></TableHead>
            <TableHead className='w-[60px]'>ID</TableHead>
            <TableHead>平台名称</TableHead>
            <TableHead>平台地址</TableHead>
            <TableHead className='text-center'>渠道数量</TableHead>
            <TableHead className='text-center'>状态</TableHead>
            <TableHead className='text-center'>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {platforms.map((platform) => {
            const isExpanded = expandedPlatforms.has(platform.id);
            const collectionChannels = platform.channels.filter(
              (c) => c.type === 'collection'
            );
            const disbursementChannels = platform.channels.filter(
              (c) => c.type === 'disbursement'
            );

            return (
              <Collapsible
                key={platform.id}
                open={isExpanded}
                onOpenChange={() => toggleExpanded(platform.id)}
                asChild
              >
                <>
                  {/* 平台行 */}
                  <TableRow className='bg-muted/30 hover:bg-muted/50'>
                    {/* 展开按钮 */}
                    <TableCell>
                      <CollapsibleTrigger asChild>
                        <Button variant='ghost' size='icon' className='h-6 w-6'>
                          {isExpanded ? (
                            <ChevronDown className='h-4 w-4' />
                          ) : (
                            <ChevronRight className='h-4 w-4' />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </TableCell>

                    {/* ID */}
                    <TableCell className='font-medium'>{platform.id}</TableCell>

                    {/* 平台名称 */}
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Wallet className='text-muted-foreground h-4 w-4' />
                        <span className='font-medium'>{platform.name}</span>
                      </div>
                    </TableCell>

                    {/* 平台地址 */}
                    <TableCell>
                      <a
                        href={platform.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-muted-foreground hover:text-primary flex items-center gap-1 text-sm'
                      >
                        <span className='max-w-[200px] truncate'>
                          {platform.url}
                        </span>
                        <ExternalLink className='h-3 w-3' />
                      </a>
                    </TableCell>

                    {/* 渠道数量 */}
                    <TableCell className='text-center'>
                      <div className='flex items-center justify-center gap-2'>
                        <Badge variant='outline' className='text-green-600'>
                          充值: {collectionChannels.length}
                        </Badge>
                        <Badge variant='outline' className='text-blue-600'>
                          提现: {disbursementChannels.length}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* 状态 */}
                    <TableCell className='text-center'>
                      <Badge
                        variant={platform.enabled ? 'default' : 'secondary'}
                      >
                        {platform.enabled ? '启用' : '停用'}
                      </Badge>
                    </TableCell>

                    {/* 操作 */}
                    <TableCell className='text-center'>
                      <div className='flex items-center justify-center gap-2'>
                        {/* 查看配置 */}
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => onViewPlatform?.(platform)}
                          title='查看配置'
                        >
                          <Settings className='h-4 w-4' />
                        </Button>

                        {/* 编辑 */}
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => onEditPlatform?.(platform)}
                          title='编辑'
                        >
                          <Pencil className='h-4 w-4' />
                        </Button>

                        {/* 启用/停用 */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              title={platform.enabled ? '停用' : '启用'}
                            >
                              {platform.enabled ? (
                                <PowerOff className='h-4 w-4 text-orange-600' />
                              ) : (
                                <Power className='h-4 w-4 text-green-600' />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {platform.enabled ? '停用平台' : '启用平台'}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                确定要{platform.enabled ? '停用' : '启用'}平台
                                &quot;{platform.name}&quot; 吗?
                                {platform.enabled &&
                                  ' 停用后该平台下的所有渠道将不可用。'}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  onTogglePlatformStatus?.(platform)
                                }
                              >
                                确定
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* 渠道列表（展开内容） */}
                  <CollapsibleContent asChild>
                    <>
                      {platform.channels.length > 0 ? (
                        platform.channels.map((channel) => (
                          <TableRow
                            key={`channel-${channel.id}`}
                            className='bg-background'
                          >
                            {/* 缩进 */}
                            <TableCell></TableCell>

                            {/* ID */}
                            <TableCell className='text-muted-foreground text-sm'>
                              {channel.id}
                            </TableCell>

                            {/* 渠道名称 */}
                            <TableCell>
                              <div className='flex flex-col gap-1 pl-4'>
                                <div className='flex items-center gap-2'>
                                  <span className='font-medium'>
                                    {channel.name}
                                  </span>
                                  <code className='bg-muted rounded px-1.5 py-0.5 text-xs'>
                                    {channel.code}
                                  </code>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <Badge
                                    className={
                                      PAYMENT_TYPE_COLORS[channel.type]
                                    }
                                    variant='outline'
                                  >
                                    {PAYMENT_TYPE_LABELS[channel.type]}
                                  </Badge>
                                  <Badge
                                    className={
                                      CHANNEL_TYPE_COLORS[channel.channel_type]
                                    }
                                    variant='outline'
                                  >
                                    {CHANNEL_TYPE_LABELS[channel.channel_type]}
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>

                            {/* 金额范围 */}
                            <TableCell>
                              <div className='flex flex-col text-xs'>
                                <span className='text-muted-foreground'>
                                  金额: ${formatAmount(channel.min_amount)} - $
                                  {formatAmount(channel.max_amount)}
                                </span>
                                {channel.daily_limit && (
                                  <span className='text-muted-foreground'>
                                    日限额: ${formatAmount(channel.daily_limit)}
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            {/* 费率 */}
                            <TableCell className='text-center'>
                              <div className='flex flex-col text-xs'>
                                <span className='font-medium'>
                                  费率: {formatFeeRate(channel.fee_rate)}
                                </span>
                                {parseFloat(channel.fixed_fee) > 0 && (
                                  <span className='text-muted-foreground'>
                                    固定: ${formatAmount(channel.fixed_fee)}
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            {/* 状态 */}
                            <TableCell className='text-center'>
                              <Badge
                                variant={
                                  channel.disabled ? 'destructive' : 'default'
                                }
                              >
                                {channel.disabled ? '已禁用' : '正常'}
                              </Badge>
                            </TableCell>

                            {/* 操作 */}
                            <TableCell className='text-center'>
                              <div className='flex items-center justify-center gap-1'>
                                {/* 查看 */}
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-7 w-7'
                                  onClick={() =>
                                    onViewChannel?.(channel, platform)
                                  }
                                  title='查看详情'
                                >
                                  <Eye className='h-3.5 w-3.5' />
                                </Button>

                                {/* 编辑 */}
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-7 w-7'
                                  onClick={() =>
                                    onEditChannel?.(channel, platform)
                                  }
                                  title='编辑'
                                >
                                  <Pencil className='h-3.5 w-3.5' />
                                </Button>

                                {/* 启用/禁用 */}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      className='h-7 w-7'
                                      title={channel.disabled ? '启用' : '禁用'}
                                    >
                                      {channel.disabled ? (
                                        <Power className='h-3.5 w-3.5 text-green-600' />
                                      ) : (
                                        <PowerOff className='h-3.5 w-3.5 text-orange-600' />
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        {channel.disabled
                                          ? '启用渠道'
                                          : '禁用渠道'}
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        确定要
                                        {channel.disabled ? '启用' : '禁用'}渠道
                                        &quot;{channel.name}&quot; 吗?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        取消
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          onToggleChannelDisabled?.(channel)
                                        }
                                      >
                                        确定
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>

                                {/* 删除 */}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      className='text-destructive hover:text-destructive h-7 w-7'
                                      title='删除'
                                    >
                                      <Trash2 className='h-3.5 w-3.5' />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        删除渠道
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        确定要删除渠道 &quot;{channel.name}
                                        &quot; 吗? 此操作不可恢复。
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        取消
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          onDeleteChannel?.(channel)
                                        }
                                        className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                      >
                                        删除
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className='text-muted-foreground py-4 text-center'
                          >
                            该平台暂无渠道
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  </CollapsibleContent>
                </>
              </Collapsible>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
