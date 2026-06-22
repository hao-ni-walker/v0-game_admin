'use client';

import React, { useCallback, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/table/page-header';
import { UserCog, Search, Snowflake, Sun, Ban, DollarSign } from 'lucide-react';
import { apiRequest } from '@/service/api/base';
import { toast } from 'sonner';

interface UserInfo {
  user_id: number;
  display_name: string;
  tg_username?: string;
  telegram_id?: number;
  status: string;
  balance: number;
  vip_level: number;
  total_deposit: number;
  total_bet: number;
}

const accountOperations = [
  { operation: '冻结账户', permission: '风控专员', description: '禁止该账户下单、充值、提现' },
  { operation: '解冻账户', permission: '风控主管', description: '需填写解冻理由' },
  { operation: '调整余额', permission: '主管以上', description: '加/减余额，记录入审计日志' },
  { operation: '加入黑名单', permission: '风控主管', description: '永久禁止，立即生效' },
];

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  normal: { text: '正常', cls: 'bg-green-100 text-green-800' },
  frozen: { text: '已冻结', cls: 'bg-blue-100 text-blue-800' },
  blacklist: { text: '黑名单', cls: 'bg-red-100 text-red-800' },
  warning: { text: '预警', cls: 'bg-yellow-100 text-yellow-800' },
};

type ActionType = 'freeze' | 'unfreeze' | 'blacklist' | 'balance-adjust';

export default function UserOperationsPage() {
  const [searchId, setSearchId] = useState('');
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);
  const [reason, setReason] = useState('');
  const [delta, setDelta] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUser = useCallback(async () => {
    const id = searchId.trim();
    if (!id) {
      toast.error('请输入用户 ID');
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest<UserInfo>(`/admin/users/${id}`);
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        toast.error(res.message || '用户不存在');
        setUser(null);
      }
    } catch {
      toast.error('查询用户失败');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [searchId]);

  const openAction = (a: ActionType) => {
    setReason('');
    setDelta('');
    setPendingAction(a);
  };

  const handleSubmit = useCallback(async () => {
    if (!user || !pendingAction) return;
    const minLen = pendingAction === 'balance-adjust' ? 10 : pendingAction === 'blacklist' ? 10 : 5;
    if (reason.trim().length < minLen) {
      toast.error(`原因至少 ${minLen} 个字符`);
      return;
    }
    if (pendingAction === 'balance-adjust') {
      const d = parseFloat(delta);
      if (Number.isNaN(d) || d === 0) {
        toast.error('金额必须是非零数字（正数加款，负数扣款）');
        return;
      }
    }
    setSubmitting(true);
    try {
      let body: Record<string, unknown>;
      if (pendingAction === 'balance-adjust') {
        body = { delta: parseFloat(delta), reason: reason.trim() };
      } else if (pendingAction === 'freeze') {
        body = { reason: reason.trim(), freeze_type: 'full' };
      } else {
        body = { reason: reason.trim() };
      }
      const res = await apiRequest(`/admin/users/${user.user_id}/${pendingAction}`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (res.success) {
        toast.success('操作成功');
        setPendingAction(null);
        await fetchUser();
      } else {
        toast.error(res.message || '操作失败');
      }
    } catch {
      toast.error('操作失败');
    } finally {
      setSubmitting(false);
    }
  }, [user, pendingAction, reason, delta, fetchUser]);

  const statusMeta = user ? (STATUS_LABEL[user.status] || { text: user.status, cls: 'bg-gray-100 text-gray-800' }) : null;

  const actionButtons = [
    { key: 'freeze' as const, label: '冻结', icon: Snowflake, disabled: user?.status === 'frozen' },
    { key: 'unfreeze' as const, label: '解冻', icon: Sun, disabled: user?.status !== 'frozen' && user?.status !== 'blacklist' },
    { key: 'balance-adjust' as const, label: '调整余额', icon: DollarSign, disabled: user?.status === 'blacklist' },
    { key: 'blacklist' as const, label: '加黑名单', icon: Ban, disabled: user?.status === 'blacklist' },
  ];

  const actionLabel: Record<ActionType, string> = {
    freeze: '冻结账户',
    unfreeze: '解冻账户',
    blacklist: '加入黑名单',
    'balance-adjust': '调整余额',
  };

  return (
    <PageContainer>
      <PageHeader
        title='账户操作'
        description='对用户账户进行余额调整、冻结/解冻、黑名单等操作（全部记录入审计日志）'
      />

      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>可用操作</CardTitle>
          <CardDescription>权限要求与说明</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>操作</TableHead>
                <TableHead>权限要求</TableHead>
                <TableHead>说明</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountOperations.map((op) => (
                <TableRow key={op.operation}>
                  <TableCell className='font-medium'>{op.operation}</TableCell>
                  <TableCell>
                    <Badge variant='outline'>{op.permission}</Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>{op.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>执行操作</CardTitle>
          <CardDescription>输入用户 ID 查询后执行账户操作</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='mb-4 flex items-center gap-3'>
            <Input
              placeholder='输入用户 ID'
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchUser(); }}
              className='w-64'
            />
            <Button onClick={fetchUser} disabled={loading}>
              <Search className='mr-2 h-4 w-4' />
              {loading ? '查询中...' : '查询'}
            </Button>
          </div>

          {user && statusMeta ? (
            <div className='rounded-lg border p-4'>
              <div className='mb-4 flex flex-wrap items-center gap-4'>
                <div>
                  <p className='text-muted-foreground text-xs'>用户 ID</p>
                  <p className='font-mono font-medium'>{user.user_id}</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-xs'>昵称</p>
                  <p className='font-medium'>{user.display_name || '—'}</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-xs'>Telegram</p>
                  <p className='font-mono text-sm'>{user.tg_username || user.telegram_id || '—'}</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-xs'>余额</p>
                  <p className='font-medium'>${user.balance.toLocaleString()}</p>
                </div>
                <div>
                  <p className='text-muted-foreground text-xs'>状态</p>
                  <Badge className={statusMeta.cls}>{statusMeta.text}</Badge>
                </div>
              </div>
              <div className='flex flex-wrap gap-2'>
                {actionButtons.map((b) => (
                  <Button
                    key={b.key}
                    variant={b.key === 'blacklist' ? 'destructive' : 'outline'}
                    disabled={b.disabled || submitting}
                    onClick={() => openAction(b.key)}
                  >
                    <b.icon className='mr-2 h-4 w-4' />
                    {b.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className='flex h-48 flex-col items-center justify-center gap-3 text-muted-foreground'>
              <UserCog className='h-12 w-12' />
              <p>{loading ? '查询中...' : '输入用户 ID 查询后执行操作'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={pendingAction !== null} onOpenChange={(o) => { if (!o) setPendingAction(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pendingAction ? actionLabel[pendingAction] : ''}</DialogTitle>
            <DialogDescription>
              操作将立即生效并记录入审计日志
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-2'>
            {pendingAction === 'balance-adjust' && (
              <div className='space-y-2'>
                <Label htmlFor='op-delta'>金额变动（正数加款，负数扣款）</Label>
                <Input
                  id='op-delta'
                  placeholder='例如 100 或 -50'
                  type='number'
                  value={delta}
                  onChange={(e) => setDelta(e.target.value)}
                />
                {user && (
                  <p className='text-muted-foreground text-xs'>
                    当前余额 ${user.balance.toLocaleString()}
                  </p>
                )}
              </div>
            )}
            <div className='space-y-2'>
              <Label htmlFor='op-reason'>原因</Label>
              <Input
                id='op-reason'
                placeholder={pendingAction === 'balance-adjust' || pendingAction === 'blacklist' ? '至少 10 个字符' : '至少 5 个字符'}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setPendingAction(null)} disabled={submitting}>
              取消
            </Button>
            <Button
              variant={pendingAction === 'blacklist' ? 'destructive' : 'default'}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? '提交中...' : '确认执行'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
