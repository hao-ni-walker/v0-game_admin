'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Loader2, Save, ExternalLink, Copy } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
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
import { DepositOrderAPI } from '@/service/api/deposit-order';
import type { DepositOrder, UserWallet, WalletTransaction } from '../types';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../constants';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

interface DepositOrderDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number | null;
  onOrderUpdate?: () => void;
}

export function DepositOrderDetailDrawer({
  open,
  onOpenChange,
  orderId,
  onOrderUpdate
}: DepositOrderDetailDrawerProps) {
  const router = useRouter();
  const [order, setOrder] = useState<DepositOrder | null>(null);
  const [userWallet, setUserWallet] = useState<UserWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [remark, setRemark] = useState('');
  const [isEditingRemark, setIsEditingRemark] = useState(false);

  // 获取订单详情
  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const response = await DepositOrderAPI.getDepositOrder(orderId);
      if (response.success && response.data) {
        setOrder(response.data.order);
        setUserWallet(response.data.userWallet || null);
        setTransactions(response.data.transactions || []);
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
      setRemark('');
      setIsEditingRemark(false);
    }
  }, [open, orderId, fetchOrderDetail]);

  // 保存备注
  const handleSaveRemark = async () => {
    if (!orderId) return;

    setSaving(true);
    try {
      const response = await DepositOrderAPI.updateOrderRemark(orderId, remark);
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

  const handleViewUserDetail = () => {
    if (order?.userId) {
      router.push(`/dashboard/players?id=${order.userId}`);
      onOpenChange(false);
    }
  };

  const handleViewUserTransactions = () => {
    if (order?.userId) {
      // 可以打开新页面或新抽屉查看该用户的资金流水
      router.push(`/dashboard/players?id=${order.userId}&tab=transactions`);
      onOpenChange(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction='right'>
      <DrawerContent className='h-full w-full sm:max-w-2xl'>
        <DrawerHeader className='border-b'>
          <div className='flex items-center justify-between'>
            <DrawerTitle>订单详情</DrawerTitle>
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
            <Tabs defaultValue='order' className='w-full'>
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='order'>订单信息</TabsTrigger>
                <TabsTrigger value='user'>用户信息</TabsTrigger>
                <TabsTrigger value='transactions'>资金流水</TabsTrigger>
              </TabsList>

              {/* 订单信息 */}
              <TabsContent value='order' className='mt-6 space-y-6'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label className='text-muted-foreground'>平台订单号</Label>
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
                    <Label className='text-muted-foreground'>渠道订单号</Label>
                    <div className='flex items-center gap-2'>
                      <span>{order.channelOrderNo || '—'}</span>
                      {order.channelOrderNo && (
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-6 w-6'
                          onClick={() => copyToClipboard(order.channelOrderNo!)}
                        >
                          <Copy className='h-3 w-3' />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-muted-foreground'>订单状态</Label>
                    <div>
                      <Badge
                        className={ORDER_STATUS_COLORS[order.status] || ''}
                      >
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </Badge>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-muted-foreground'>支付渠道</Label>
                    <div>
                      <div>{order.paymentChannelName || '—'}</div>
                      {order.paymentChannelCode && (
                        <div className='text-muted-foreground text-sm'>
                          {order.paymentChannelCode}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-muted-foreground'>充值金额</Label>
                    <div className='font-medium'>
                      {formatCurrency(order.amount)}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-muted-foreground'>手续费</Label>
                    <div>{formatCurrency(order.fee)}</div>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-muted-foreground'>赠送金额</Label>
                    <div
                      className={
                        order.bonusAmount > 0
                          ? 'font-medium text-orange-600'
                          : ''
                      }
                    >
                      {order.bonusAmount > 0
                        ? formatCurrency(order.bonusAmount)
                        : '—'}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-muted-foreground'>实收金额</Label>
                    <div className='font-semibold text-green-600'>
                      {formatCurrency(order.actualAmount)}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-muted-foreground'>币种</Label>
                    <div>{order.currency || 'CNY'}</div>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-muted-foreground'>IP 地址</Label>
                    <div>{order.ipAddress || '—'}</div>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-muted-foreground'>创建时间</Label>
                    <div>{formatDateTime(order.createdAt)}</div>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-muted-foreground'>完成时间</Label>
                    <div>
                      {order.completedAt
                        ? formatDateTime(order.completedAt)
                        : '—'}
                    </div>
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

              {/* 用户信息 */}
              <TabsContent value='user' className='mt-6 space-y-6'>
                {order && (
                  <div className='space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label className='text-muted-foreground'>用户 ID</Label>
                        <div className='font-medium'>{order.userId}</div>
                      </div>

                      <div className='space-y-2'>
                        <Label className='text-muted-foreground'>昵称</Label>
                        <div>{order.nickname || '—'}</div>
                      </div>

                      <div className='space-y-2'>
                        <Label className='text-muted-foreground'>用户名</Label>
                        <div>{order.username || '—'}</div>
                      </div>

                      <div className='space-y-2'>
                        <Label className='text-muted-foreground'>手机号</Label>
                        <div>{order.phone || '—'}</div>
                      </div>

                      <div className='space-y-2'>
                        <Label className='text-muted-foreground'>邮箱</Label>
                        <div>{order.email || '—'}</div>
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
                              赠送余额
                            </Label>
                            <div className='text-orange-600'>
                              {formatCurrency(userWallet.bonusBalance)}
                            </div>
                          </div>

                          <div className='space-y-2'>
                            <Label className='text-muted-foreground'>
                              币种
                            </Label>
                            <div>{userWallet.currency}</div>
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

                    <div className='flex gap-2 border-t pt-4'>
                      <Button variant='outline' onClick={handleViewUserDetail}>
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
                                {tx.walletType === 'balance' ? '余额' : '赠送'}
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
          ) : (
            <div className='text-muted-foreground py-8 text-center'>
              订单不存在或已删除
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
