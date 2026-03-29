import {
  Eye,
  Pencil,
  Power,
  PowerOff,
  Trash2,
  AlertTriangle
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

interface PaymentChannelTableProps {
  channels: PaymentChannel[];
  loading?: boolean;
  pagination: PaymentChannelPagination;
  onEdit: (channel: PaymentChannel) => void;
  onView: (channel: PaymentChannel) => void;
  onDelete: (channel: PaymentChannel) => void;
  onToggleStatus: (channel: PaymentChannel) => void;
  onDisable: (channel: PaymentChannel) => void;
  emptyState?: PaymentChannelTableEmptyState;
}

export function PaymentChannelTable({
  channels,
  loading,
  pagination,
  onEdit,
  onView,
  onDelete,
  onToggleStatus,
  onDisable,
  emptyState
}: PaymentChannelTableProps) {
  // 格式化金额
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // 格式化费率
  const formatFeeRate = (rate: number) => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  // 格式化时间
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 计算手续费示例
  const calculateFee = (channel: PaymentChannel, amount: number = 100) => {
    const fee =
      amount * parseFloat(channel.fee_rate) + parseFloat(channel.fixed_fee);
    return fee.toFixed(2);
  };

  // 加载骨架屏
  if (loading && channels.length === 0) {
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
  if (!loading && channels.length === 0 && emptyState) {
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
            <TableHead className='w-[60px]'>ID</TableHead>
            <TableHead>渠道名称</TableHead>
            <TableHead>渠道代码</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>渠道类型</TableHead>
            <TableHead className='text-right'>金额范围</TableHead>
            <TableHead className='text-right'>每日限额</TableHead>
            <TableHead className='text-right'>费率</TableHead>
            <TableHead className='text-right'>固定费用</TableHead>
            <TableHead className='text-center'>排序</TableHead>
            <TableHead className='text-center'>状态</TableHead>
            <TableHead className='text-center'>更新时间</TableHead>
            <TableHead className='text-center'>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {channels.map((channel) => (
            <TableRow key={channel.id}>
              {/* ID */}
              <TableCell className='font-medium'>{channel.id}</TableCell>

              {/* 渠道名称 */}
              <TableCell>
                <div className='flex flex-col'>
                  <span className='font-medium'>{channel.name}</span>
                  {channel.disabled && (
                    <Badge variant='destructive' className='mt-1 w-fit text-xs'>
                      <AlertTriangle className='mr-1 h-3 w-3' />
                      已禁用
                    </Badge>
                  )}
                </div>
              </TableCell>

              {/* 渠道代码 */}
              <TableCell>
                <code className='bg-muted rounded px-2 py-1 text-xs'>
                  {channel.code}
                </code>
              </TableCell>

              {/* 类型 */}
              <TableCell>
                <Badge className={PAYMENT_TYPE_COLORS[channel.type]}>
                  {PAYMENT_TYPE_LABELS[channel.type]}
                </Badge>
              </TableCell>

              {/* 渠道类型 */}
              <TableCell>
                <Badge className={CHANNEL_TYPE_COLORS[channel.channel_type]}>
                  {CHANNEL_TYPE_LABELS[channel.channel_type]}
                </Badge>
              </TableCell>

              {/* 金额范围 */}
              <TableCell className='text-right'>
                <div className='flex flex-col text-xs'>
                  <span className='text-muted-foreground'>
                    最小: ¥{formatAmount(parseFloat(channel.min_amount))}
                  </span>
                  <span className='text-muted-foreground'>
                    最大: ¥{formatAmount(parseFloat(channel.max_amount))}
                  </span>
                </div>
              </TableCell>

              {/* 每日限额 */}
              <TableCell className='text-right'>
                <span className='font-medium'>
                  ¥{formatAmount(parseFloat(channel.daily_limit ?? '0'))}
                </span>
              </TableCell>

              {/* 费率 */}
              <TableCell className='text-right'>
                <div className='flex flex-col text-xs'>
                  <span className='font-medium text-orange-600'>
                    {formatFeeRate(parseFloat(channel.fee_rate))}
                  </span>
                  <span className='text-muted-foreground'>
                    100元收¥{calculateFee(channel)}
                  </span>
                </div>
              </TableCell>

              {/* 固定费用 */}
              <TableCell className='text-right'>
                <span className='font-medium'>
                  {parseFloat(channel.fixed_fee) > 0
                    ? `¥${formatAmount(parseFloat(channel.fixed_fee))}`
                    : '-'}
                </span>
              </TableCell>

              {/* 排序 */}
              <TableCell className='text-center'>
                <Badge variant='outline'>{channel.sort_order}</Badge>
              </TableCell>

              {/* 状态 */}
              <TableCell className='text-center'>
                <Badge variant={!channel.disabled ? 'default' : 'secondary'}>
                  {!channel.disabled ? '启用' : '停用'}
                </Badge>
              </TableCell>

              {/* 更新时间 */}
              <TableCell className='text-muted-foreground text-center text-xs'>
                {formatDate(channel.updated_at)}
              </TableCell>

              {/* 操作 */}
              <TableCell className='text-center'>
                <div className='flex items-center justify-center gap-2'>
                  {/* 查看 */}
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => onView(channel)}
                    title='查看详情'
                  >
                    <Eye className='h-4 w-4' />
                  </Button>

                  {/* 编辑 */}
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => onEdit(channel)}
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
                        title={!channel.disabled ? '停用' : '启用'}
                      >
                        {!channel.disabled ? (
                          <PowerOff className='h-4 w-4 text-orange-600' />
                        ) : (
                          <Power className='h-4 w-4 text-green-600' />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {!channel.disabled ? '停用渠道' : '启用渠道'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          确定要{!channel.disabled ? '停用' : '启用'}渠道 "
                          {channel.name}" 吗?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onToggleStatus(channel)}
                        >
                          确定
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* 紧急禁用 */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        title={channel.disabled ? '解除禁用' : '紧急禁用'}
                      >
                        <AlertTriangle
                          className={`h-4 w-4 ${channel.disabled ? 'text-red-600' : 'text-gray-400'}`}
                        />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {channel.disabled ? '解除禁用' : '紧急禁用'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {channel.disabled
                            ? `确定要解除禁用渠道 "${channel.name}" 吗?`
                            : `紧急禁用将立即使该渠道不可用,确定要禁用渠道 "${channel.name}" 吗?`}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDisable(channel)}>
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
                        title='删除'
                        className='text-destructive hover:text-destructive'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>删除渠道</AlertDialogTitle>
                        <AlertDialogDescription>
                          确定要删除渠道 "{channel.name}" 吗?
                          此操作为逻辑删除,可以恢复。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(channel)}
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
