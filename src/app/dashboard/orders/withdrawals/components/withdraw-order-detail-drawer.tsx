'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Loader2,
  Save,
  ExternalLink,
  Copy,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { WithdrawOrderAPI } from '@/service/api/withdraw-order';
import type {
  WithdrawOrder,
  UserWallet,
  WalletTransaction,
  RiskInfo
} from '../types';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../constants';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

interface WithdrawOrderDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number | null;
  onOrderUpdate?: () => void;
  onNavigateOrder?: (direction: 'prev' | 'next') => void;
}

// 状态时间轴组件
function StatusTimeline({ order }: { order: WithdrawOrder }) {
  const steps = [
    {
      key: 'submitted',
      label: '已提交申请',
      completed: true,
      time: order.createdAt
    },
    {
      key: 'audited',
      label:
        order.auditStatus === 'approved'
          ? '审核通过'
          : order.auditStatus === 'rejected'
            ? '审核拒绝'
            : '待审核',
      completed: order.auditStatus !== 'pending',
      time: order.auditAt
    },
    {
      key: 'payout_processing',
      label: '出款中',
      completed:
        order.payoutStatus === 'processing' || order.payoutStatus === 'success',
      time: order.payoutStatus === 'processing' ? order.updatedAt : undefined
    },
    {
      key: 'completed',
      label:
        order.payoutStatus === 'success'
          ? '出款成功'
          : order.payoutStatus === 'failed'
            ? '出款失败'
            : '待出款',
      completed:
        order.payoutStatus === 'success' || order.payoutStatus === 'failed',
      time: order.payoutAt || order.completedAt
    }
  ];

  return (
    <div className='relative'>
      <div className='flex items-center justify-between'>
        {steps.map((step, index) => (
          <div key={step.key} className='flex flex-1 items-center'>
            <div className='flex flex-1 flex-col items-center'>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  step.completed
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 bg-gray-100 text-gray-400'
                }`}
              >
                {step.completed ? (
                  <CheckCircle className='h-5 w-5' />
                ) : (
                  <div className='h-2 w-2 rounded-full bg-current' />
                )}
              </div>
              <div className='mt-2 text-center'>
                <div
                  className={`text-sm font-medium ${
                    step.completed ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </div>
                {step.time && (
                  <div className='mt-1 text-xs text-gray-500'>
                    {format(new Date(step.time), 'MM-dd HH:mm', {
                      locale: zhCN
                    })}
                  </div>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 ${
                  step.completed ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function WithdrawOrderDetailDrawer({
  open,
  onOpenChange,
  orderId,
  onOrderUpdate,
  onNavigateOrder
}: WithdrawOrderDetailDrawerProps) {
  const router = useRouter();
  const [order, setOrder] = useState<WithdrawOrder | null>(null);
  const [userWallet, setUserWallet] = useState<UserWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [riskInfo, setRiskInfo] = useState<RiskInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [remark, setRemark] = useState('');
  const [isEditingRemark, setIsEditingRemark] = useState(false);

  // 审核对话框状态
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [auditAction, setAuditAction] = useState<'approve' | 'reject'>(
    'approve'
  );
  const [auditRemark, setAuditRemark] = useState('');

  // 标记出款对话框状态
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [payoutAction, setPayoutAction] = useState<'success' | 'failed'>(
    'success'
  );
  const [payoutChannelOrderNo, setPayoutChannelOrderNo] = useState('');
  const [payoutFailureReason, setPayoutFailureReason] = useState('');

  // 获取订单详情
  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const response = await WithdrawOrderAPI.getWithdrawOrder(orderId);
      if (response.success && response.data) {
        setOrder(response.data.order);
        setUserWallet(response.data.userWallet || null);
        setTransactions(response.data.transactions || []);
        setRiskInfo(response.data.riskInfo || null);
        setRemark(response.data.order.remark || '');
      } else {
        toast.error(response.message || '获取订单详情失败');
      }
    } catch (error) {
      console.error('获取订单详情失败:', error);
      toast.error('获取订单详情失败');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (open && orderId) {
      fetchOrderDetail();
    } else {
      setOrder(null);
      setUserWallet(null);
      setTransactions([]);
      setRiskInfo(null);
      setRemark('');
      setIsEditingRemark(false);
      setAuditDialogOpen(false);
      setPayoutDialogOpen(false);
    }
  }, [open, orderId, fetchOrderDetail]);

  // 保存备注
  const handleSaveRemark = async () => {
    if (!orderId) return;

    setSaving(true);
    try {
      const response = await WithdrawOrderAPI.updateOrderRemark(
        orderId,
        remark
      );
      if (response.success) {
        setIsEditingRemark(false);
        if (response.data) {
          setOrder(response.data);
        }
        onOrderUpdate?.();
        toast.success('备注更新成功');
      } else {
        toast.error(response.message || '更新备注失败');
      }
    } catch (error) {
      console.error('更新备注失败:', error);
      toast.error('更新备注失败');
    } finally {
      setSaving(false);
    }
  };

  // 打开审核对话框
  const handleOpenAuditDialog = (action: 'approve' | 'reject') => {
    setAuditAction(action);
    setAuditRemark('');
    setAuditDialogOpen(true);
  };

  // 提交审核
  const handleSubmitAudit = async () => {
    if (!orderId || !auditRemark.trim()) {
      toast.error('请填写审核备注');
      return;
    }

    setSaving(true);
    try {
      const response = await WithdrawOrderAPI.auditOrder({
        orderId,
        action: auditAction,
        remark: auditRemark
      });
      if (response.success && response.data) {
        setOrder(response.data);
        setAuditDialogOpen(false);
        setAuditRemark('');
        onOrderUpdate?.();
        toast.success(auditAction === 'approve' ? '审核通过' : '审核拒绝');
      } else {
        toast.error(response.message || '审核失败');
      }
    } catch (error) {
      console.error('审核失败:', error);
      toast.error('审核失败');
    } finally {
      setSaving(false);
    }
  };

  // 打开标记出款对话框
  const handleOpenPayoutDialog = (action: 'success' | 'failed') => {
    setPayoutAction(action);
    setPayoutChannelOrderNo('');
    setPayoutFailureReason('');
    setPayoutDialogOpen(true);
  };

  // 提交标记出款结果
  const handleSubmitPayout = async () => {
    if (!orderId) return;

    if (payoutAction === 'success' && !payoutChannelOrderNo.trim()) {
      toast.error('请填写渠道订单号');
      return;
    }

    if (payoutAction === 'failed' && !payoutFailureReason.trim()) {
      toast.error('请填写失败原因');
      return;
    }

    setSaving(true);
    try {
      const response = await WithdrawOrderAPI.markPayoutResult({
        orderId,
        action: payoutAction,
        channelOrderNo: payoutChannelOrderNo || undefined,
        failureReason: payoutFailureReason || undefined
      });
      if (response.success && response.data) {
        setOrder(response.data);
        setPayoutDialogOpen(false);
        setPayoutChannelOrderNo('');
        setPayoutFailureReason('');
        onOrderUpdate?.();
        toast.success(
          payoutAction === 'success' ? '标记出款成功' : '标记出款失败'
        );
      } else {
        toast.error(response.message || '标记出款结果失败');
      }
    } catch (error) {
      console.error('标记出款结果失败:', error);
      toast.error('标记出款结果失败');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss', {
      locale: zhCN
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制');
  };

  const maskAccountNumber = (accountNumber?: string | null) => {
    if (!accountNumber) return '—';
    if (accountNumber.length <= 8) return accountNumber;
    const start = accountNumber.slice(0, 4);
    const end = accountNumber.slice(-4);
    return `${start}****${end}`;
  };

  const handleViewUserDetail = () => {
    if (order?.userId) {
      router.push(`/dashboard/players?id=${order.userId}`);
      onOpenChange(false);
    }
  };

  const handleViewUserTransactions = () => {
    if (order?.userId) {
      router.push(`/dashboard/players?id=${order.userId}&tab=transactions`);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange} direction='right'>
        <DrawerContent className='h-full w-full sm:max-w-2xl'>
          <DrawerHeader className='border-b'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                {onNavigateOrder && (
                  <>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      onClick={() => onNavigateOrder('prev')}
                    >
                      <ArrowLeft className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      onClick={() => onNavigateOrder('next')}
                    >
                      <ArrowRight className='h-4 w-4' />
                    </Button>
                  </>
                )}
                <DrawerTitle>订单详情</DrawerTitle>
              </div>
              <DrawerClose asChild>
                <Button variant='ghost' size='icon' className='h-8 w-8'>
                  <X className='h-4 w-4' />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className='flex-1 overflow-y-auto p-6'>
            {loading ? (
              <div className='space-y-4'>
                <Skeleton className='h-32 w-full' />
                <Skeleton className='h-32 w-full' />
                <Skeleton className='h-64 w-full' />
              </div>
            ) : order ? (
              <div className='space-y-6'>
                {/* 顶部状态区和时间轴 */}
                <div className='bg-card space-y-4 rounded-lg border p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <Badge
                        className={`px-3 py-1 text-lg ${ORDER_STATUS_COLORS[order.status] || ''}`}
                      >
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </Badge>
                    </div>
                    <div className='text-right'>
                      <div className='text-muted-foreground text-sm'>
                        提现金额
                      </div>
                      <div className='text-2xl font-bold'>
                        {formatCurrency(order.amount)}
                      </div>
                      <div className='text-muted-foreground mt-1 text-sm'>
                        手续费: {formatCurrency(order.fee)} | 实际出款:{' '}
                        {formatCurrency(order.actualAmount)}
                      </div>
                    </div>
                  </div>
                  <StatusTimeline order={order} />
                </div>

                <Tabs defaultValue='basic' className='w-full'>
                  <TabsList className='grid w-full grid-cols-4'>
                    <TabsTrigger value='basic'>订单信息</TabsTrigger>
                    <TabsTrigger value='user'>用户与风控</TabsTrigger>
                    <TabsTrigger value='audit'>审核与出款</TabsTrigger>
                    <TabsTrigger value='transactions'>资金流水</TabsTrigger>
                  </TabsList>

                  {/* 订单基础信息 */}
                  <TabsContent value='basic' className='mt-6 space-y-6'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label className='text-muted-foreground'>
                          平台订单号
                        </Label>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium'>{order.orderNo}</span>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-6 w-6'
                            onClick={() => copyToClipboard(order.orderNo)}
                          >
                            <Copy className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <Label className='text-muted-foreground'>
                          渠道订单号
                        </Label>
                        <div className='flex items-center gap-2'>
                          <span>{order.channelOrderNo || '—'}</span>
                          {order.channelOrderNo && (
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-6 w-6'
                              onClick={() =>
                                copyToClipboard(order.channelOrderNo!)
                              }
                            >
                              <Copy className='h-3 w-3' />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <Label className='text-muted-foreground'>
                          提现渠道
                        </Label>
                        <div>
                          <div>{order.paymentChannelName || '—'}</div>
                          {order.channelType && (
                            <div className='text-muted-foreground text-sm'>
                              {order.channelType === 'bank'
                                ? '银行卡'
                                : order.channelType === 'usdt'
                                  ? 'USDT'
                                  : order.channelType}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <Label className='text-muted-foreground'>币种</Label>
                        <div>{order.currency || 'CNY'}</div>
                      </div>

                      <div className='col-span-2 space-y-2'>
                        <Label className='text-muted-foreground'>
                          提现账户信息
                        </Label>
                        <div className='space-y-1'>
                          {order.bankName && (
                            <div>
                              <span className='font-medium'>银行:</span>{' '}
                              {order.bankName}
                            </div>
                          )}
                          {order.accountName && (
                            <div>
                              <span className='font-medium'>账户名:</span>{' '}
                              {order.accountName}
                            </div>
                          )}
                          {order.accountNumber && (
                            <div className='font-mono'>
                              <span className='font-medium'>账户号:</span>{' '}
                              {maskAccountNumber(order.accountNumber)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <Label className='text-muted-foreground'>IP 地址</Label>
                        <div>{order.ipAddress || '—'}</div>
                      </div>

                      <div className='space-y-2'>
                        <Label className='text-muted-foreground'>
                          申请时间
                        </Label>
                        <div>{formatDateTime(order.createdAt)}</div>
                      </div>

                      <div className='col-span-2 space-y-2'>
                        <Label className='text-muted-foreground'>备注</Label>
                        {isEditingRemark ? (
                          <div className='space-y-2'>
                            <Textarea
                              value={remark}
                              onChange={(e) => setRemark(e.target.value)}
                              rows={3}
                              placeholder='输入备注信息'
                            />
                            <div className='flex gap-2'>
                              <Button
                                size='sm'
                                onClick={handleSaveRemark}
                                disabled={saving}
                              >
                                {saving ? (
                                  <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    保存中...
                                  </>
                                ) : (
                                  <>
                                    <Save className='mr-2 h-4 w-4' />
                                    保存
                                  </>
                                )}
                              </Button>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => {
                                  setIsEditingRemark(false);
                                  setRemark(order.remark || '');
                                }}
                              >
                                取消
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className='flex items-center justify-between'>
                            <div className='flex-1'>
                              {remark || (
                                <span className='text-muted-foreground'>
                                  暂无备注
                                </span>
                              )}
                            </div>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => setIsEditingRemark(true)}
                            >
                              编辑
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* 用户与风控信息 */}
                  <TabsContent value='user' className='mt-6 space-y-6'>
                    {order && (
                      <div className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                          <div className='space-y-2'>
                            <Label className='text-muted-foreground'>
                              用户 ID
                            </Label>
                            <div className='font-medium'>{order.userId}</div>
                          </div>

                          <div className='space-y-2'>
                            <Label className='text-muted-foreground'>
                              昵称
                            </Label>
                            <div>{order.nickname || '—'}</div>
                          </div>

                          <div className='space-y-2'>
                            <Label className='text-muted-foreground'>
                              用户名
                            </Label>
                            <div>{order.username || '—'}</div>
                          </div>

                          <div className='space-y-2'>
                            <Label className='text-muted-foreground'>
                              手机号
                            </Label>
                            <div>{order.phone || '—'}</div>
                          </div>
                        </div>

                        {userWallet && (
                          <div className='border-t pt-4'>
                            <h4 className='mb-4 font-semibold'>钱包信息</h4>
                            <div className='grid grid-cols-2 gap-4'>
                              <div className='space-y-2'>
                                <Label className='text-muted-foreground'>
                                  余额
                                </Label>
                                <div className='font-medium'>
                                  {formatCurrency(userWallet.balance)}
                                </div>
                              </div>

                              <div className='space-y-2'>
                                <Label className='text-muted-foreground'>
                                  冻结金额
                                </Label>
                                <div>
                                  {formatCurrency(userWallet.frozenBalance)}
                                </div>
                              </div>

                              <div className='space-y-2'>
                                <Label className='text-muted-foreground'>
                                  可提现金额
                                </Label>
                                <div className='text-green-600'>
                                  {formatCurrency(userWallet.withdrawable || 0)}
                                </div>
                              </div>

                              <div className='space-y-2'>
                                <Label className='text-muted-foreground'>
                                  累计充值
                                </Label>
                                <div className='font-medium text-green-600'>
                                  {formatCurrency(userWallet.totalDeposit)}
                                </div>
                              </div>

                              <div className='space-y-2'>
                                <Label className='text-muted-foreground'>
                                  累计提现
                                </Label>
                                <div>
                                  {formatCurrency(userWallet.totalWithdraw)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {riskInfo && (
                          <div className='border-t pt-4'>
                            <h4 className='mb-4 font-semibold'>风控信息</h4>
                            <div className='grid grid-cols-2 gap-4'>
                              {riskInfo.withdrawCountLast7Days !==
                                undefined && (
                                <div className='space-y-2'>
                                  <Label className='text-muted-foreground'>
                                    近7天提现次数
                                  </Label>
                                  <div>
                                    {riskInfo.withdrawCountLast7Days} 次
                                  </div>
                                </div>
                              )}
                              {riskInfo.withdrawAmountLast7Days !==
                                undefined && (
                                <div className='space-y-2'>
                                  <Label className='text-muted-foreground'>
                                    近7天提现金额
                                  </Label>
                                  <div>
                                    {formatCurrency(
                                      riskInfo.withdrawAmountLast7Days
                                    )}
                                  </div>
                                </div>
                              )}
                              {riskInfo.riskTags &&
                                riskInfo.riskTags.length > 0 && (
                                  <div className='col-span-2 space-y-2'>
                                    <Label className='text-muted-foreground'>
                                      风险标签
                                    </Label>
                                    <div className='flex flex-wrap gap-2'>
                                      {riskInfo.riskTags.map((tag, index) => (
                                        <Badge
                                          key={index}
                                          variant='destructive'
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        )}

                        <div className='flex gap-2 border-t pt-4'>
                          <Button
                            variant='outline'
                            onClick={handleViewUserDetail}
                          >
                            <ExternalLink className='mr-2 h-4 w-4' />
                            查看用户详情
                          </Button>
                          <Button
                            variant='outline'
                            onClick={handleViewUserTransactions}
                          >
                            <ExternalLink className='mr-2 h-4 w-4' />
                            查看资金流水
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* 审核与出款信息 */}
                  <TabsContent value='audit' className='mt-6 space-y-6'>
                    <div className='space-y-4'>
                      <div className='rounded-lg border p-4'>
                        <h4 className='mb-4 font-semibold'>审核信息</h4>
                        <div className='grid grid-cols-2 gap-4'>
                          <div className='space-y-2'>
                            <Label className='text-muted-foreground'>
                              审核状态
                            </Label>
                            <div>
                              {order.auditStatus === 'approved' ? (
                                <Badge className='bg-green-100 text-green-800'>
                                  已通过
                                </Badge>
                              ) : order.auditStatus === 'rejected' ? (
                                <Badge className='bg-red-100 text-red-800'>
                                  已拒绝
                                </Badge>
                              ) : (
                                <Badge className='bg-yellow-100 text-yellow-800'>
                                  未审核
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className='space-y-2'>
                            <Label className='text-muted-foreground'>
                              审核人
                            </Label>
                            <div>{order.auditorName || '—'}</div>
                          </div>

                          <div className='space-y-2'>
                            <Label className='text-muted-foreground'>
                              审核时间
                            </Label>
                            <div>
                              {order.auditAt
                                ? formatDateTime(order.auditAt)
                                : '—'}
                            </div>
                          </div>

                          <div className='col-span-2 space-y-2'>
                            <Label className='text-muted-foreground'>
                              审核备注/拒绝原因
                            </Label>
                            <div>{order.auditRemark || '—'}</div>
                          </div>
                        </div>
                      </div>

                      <div className='rounded-lg border p-4'>
                        <h4 className='mb-4 font-semibold'>出款信息</h4>
                        <div className='grid grid-cols-2 gap-4'>
                          <div className='space-y-2'>
                            <Label className='text-muted-foreground'>
                              出款状态
                            </Label>
                            <div>
                              {order.payoutStatus === 'success' ? (
                                <Badge className='bg-green-100 text-green-800'>
                                  成功
                                </Badge>
                              ) : order.payoutStatus === 'failed' ? (
                                <Badge className='bg-red-100 text-red-800'>
                                  失败
                                </Badge>
                              ) : order.payoutStatus === 'processing' ? (
                                <Badge className='bg-blue-100 text-blue-800'>
                                  出款中
                                </Badge>
                              ) : (
                                <Badge className='bg-gray-100 text-gray-800'>
                                  未出款
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className='space-y-2'>
                            <Label className='text-muted-foreground'>
                              出款方式
                            </Label>
                            <div>
                              {order.payoutMethod === 'auto'
                                ? '自动代付'
                                : '手工打款'}
                            </div>
                          </div>

                          <div className='space-y-2'>
                            <Label className='text-muted-foreground'>
                              渠道订单号
                            </Label>
                            <div>{order.channelOrderNo || '—'}</div>
                          </div>

                          <div className='space-y-2'>
                            <Label className='text-muted-foreground'>
                              出款完成时间
                            </Label>
                            <div>
                              {order.payoutAt
                                ? formatDateTime(order.payoutAt)
                                : '—'}
                            </div>
                          </div>

                          {order.payoutFailureReason && (
                            <div className='col-span-2 space-y-2'>
                              <Label className='text-muted-foreground'>
                                出款失败原因
                              </Label>
                              <div className='text-red-600'>
                                {order.payoutFailureReason}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* 资金流水 */}
                  <TabsContent value='transactions' className='mt-6 space-y-6'>
                    {transactions.length > 0 ? (
                      <div className='rounded-md border'>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>流水 ID</TableHead>
                              <TableHead>类型</TableHead>
                              <TableHead>钱包类型</TableHead>
                              <TableHead className='text-right'>金额</TableHead>
                              <TableHead className='text-right'>
                                变更前余额
                              </TableHead>
                              <TableHead className='text-right'>
                                变更后余额
                              </TableHead>
                              <TableHead>状态</TableHead>
                              <TableHead>时间</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {transactions.map((tx) => (
                              <TableRow key={tx.id}>
                                <TableCell className='font-medium'>
                                  #{tx.id}
                                </TableCell>
                                <TableCell>{tx.transactionType}</TableCell>
                                <TableCell>
                                  <Badge variant='outline'>
                                    {tx.walletType === 'balance'
                                      ? '余额'
                                      : '赠送'}
                                  </Badge>
                                </TableCell>
                                <TableCell
                                  className={`text-right font-medium ${
                                    tx.amount >= 0
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  {tx.amount >= 0 ? '+' : ''}
                                  {formatCurrency(tx.amount)}
                                </TableCell>
                                <TableCell className='text-right'>
                                  {formatCurrency(tx.balanceBefore)}
                                </TableCell>
                                <TableCell className='text-right font-medium'>
                                  {formatCurrency(tx.balanceAfter)}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      tx.status === 'success'
                                        ? 'bg-green-100 text-green-800'
                                        : tx.status === 'failed'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                    }
                                  >
                                    {tx.status === 'success'
                                      ? '成功'
                                      : tx.status === 'failed'
                                        ? '失败'
                                        : '处理中'}
                                  </Badge>
                                </TableCell>
                                <TableCell className='text-muted-foreground'>
                                  {formatDateTime(tx.createdAt)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className='text-muted-foreground py-8 text-center'>
                        暂无资金流水记录
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className='text-muted-foreground py-8 text-center'>
                订单不存在或已删除
              </div>
            )}
          </div>

          {/* 操作区（固定在底部） */}
          {order && (
            <DrawerFooter className='border-t'>
              <div className='flex justify-end gap-2'>
                {order.status === 'pending_audit' && (
                  <>
                    <Button
                      variant='default'
                      onClick={() => handleOpenAuditDialog('approve')}
                      disabled={saving}
                    >
                      <CheckCircle className='mr-2 h-4 w-4' />
                      审核通过
                    </Button>
                    <Button
                      variant='destructive'
                      onClick={() => handleOpenAuditDialog('reject')}
                      disabled={saving}
                    >
                      <XCircle className='mr-2 h-4 w-4' />
                      审核拒绝
                    </Button>
                  </>
                )}
                {order.payoutStatus === 'pending' && (
                  <>
                    <Button
                      variant='default'
                      onClick={() => handleOpenPayoutDialog('success')}
                      disabled={saving}
                    >
                      <CheckCircle className='mr-2 h-4 w-4' />
                      标记出款成功
                    </Button>
                    <Button
                      variant='destructive'
                      onClick={() => handleOpenPayoutDialog('failed')}
                      disabled={saving}
                    >
                      <XCircle className='mr-2 h-4 w-4' />
                      标记出款失败
                    </Button>
                  </>
                )}
              </div>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>

      {/* 审核对话框 */}
      <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {auditAction === 'approve' ? '审核通过' : '审核拒绝'}
            </DialogTitle>
            <DialogDescription>
              {auditAction === 'approve'
                ? '确认通过该提现订单的审核？'
                : '请填写拒绝原因'}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label>
                {auditAction === 'approve' ? '审核备注' : '拒绝原因'} *
              </Label>
              <Textarea
                value={auditRemark}
                onChange={(e) => setAuditRemark(e.target.value)}
                placeholder={
                  auditAction === 'approve'
                    ? '输入审核备注（可选）'
                    : '请输入拒绝原因'
                }
                rows={4}
                required={auditAction === 'reject'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setAuditDialogOpen(false);
                setAuditRemark('');
              }}
            >
              取消
            </Button>
            <Button onClick={handleSubmitAudit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  提交中...
                </>
              ) : (
                '确认'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 标记出款对话框 */}
      <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {payoutAction === 'success' ? '标记出款成功' : '标记出款失败'}
            </DialogTitle>
            <DialogDescription>
              {payoutAction === 'success'
                ? '请填写渠道订单号等信息'
                : '请填写出款失败原因'}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            {payoutAction === 'success' && (
              <div className='space-y-2'>
                <Label>渠道订单号 *</Label>
                <Input
                  value={payoutChannelOrderNo}
                  onChange={(e) => setPayoutChannelOrderNo(e.target.value)}
                  placeholder='输入渠道订单号'
                  required
                />
              </div>
            )}
            {payoutAction === 'failed' && (
              <div className='space-y-2'>
                <Label>失败原因 *</Label>
                <Textarea
                  value={payoutFailureReason}
                  onChange={(e) => setPayoutFailureReason(e.target.value)}
                  placeholder='请输入出款失败原因'
                  rows={4}
                  required
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setPayoutDialogOpen(false);
                setPayoutChannelOrderNo('');
                setPayoutFailureReason('');
              }}
            >
              取消
            </Button>
            <Button onClick={handleSubmitPayout} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  提交中...
                </>
              ) : (
                '确认'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
