'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
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
import PageContainer from '@/components/layout/page-container';
import { PageHeader } from '@/components/table/page-header';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { SettlementAPI, type SettlementException } from '@/service/api/settlement';

// PRD §7.4 结算异常类型
const exceptionTypes = [
  { type: '价格数据源异常', handling: '暂停结算，人工确认价格后手动触发' },
  { type: '系统延迟导致超时', handling: '以实际结算时刻价格为准，记录延迟原因' },
  { type: '用户投诉结算有误', handling: '调取审计日志核查，7 日内答复' },
  { type: '批量结算中途失败', handling: '事务回滚，全部订单恢复待结算状态，重新执行' }
];

const EXCEPTION_TYPE_LABEL: Record<string, string> = {
  system_timeout: '系统延迟超时',
  price_source_error: '价格数据源异常',
  user_complaint: '用户投诉',
  batch_failure: '批量结算失败'
};

const STATUS_LABEL: Record<string, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决'
};

const STATUS_VARIANT: Record<string, 'destructive' | 'secondary' | 'default'> = {
  pending: 'destructive',
  processing: 'secondary',
  resolved: 'default'
};

export default function SettlementExceptionsPage() {
  const [exceptions, setExceptions] = useState<SettlementException[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExceptions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await SettlementAPI.getExceptions({ page: 1, limit: 50 });
      if (res.success) {
        setExceptions(res.data?.list || []);
      } else {
        toast.error(res.message || '获取异常结算列表失败');
        setExceptions([]);
      }
    } catch {
      toast.error('获取异常结算列表失败');
      setExceptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExceptions();
  }, [fetchExceptions]);

  const handleResolve = async (item: SettlementException) => {
    const resolution = window.prompt(
      `处理异常订单 #${item.id}\n请输入处理说明（将重置订单为待结算，由结算引擎重新结算）：`,
      '结算超时，重置订单重新结算'
    );
    if (!resolution) return;
    if (resolution.trim().length < 5) {
      toast.error('处理说明至少 5 个字符');
      return;
    }
    const res = await SettlementAPI.resolveException(item.id, { resolution });
    if (res.success) {
      toast.success('已处理，订单已重置为待结算');
      fetchExceptions();
    } else {
      toast.error(res.message || '处理失败');
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title='异常结算处理'
        description='处理价格数据源异常、系统延迟、用户投诉等结算异常'
      />

      {/* PRD §7.4 异常类型说明 */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>异常类型与处理方式</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>异常类型</TableHead>
                <TableHead>处理方式</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exceptionTypes.map((item) => (
                <TableRow key={item.type}>
                  <TableCell className='font-medium'>{item.type}</TableCell>
                  <TableCell className='text-muted-foreground'>
                    {item.handling}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 异常结算列表 */}
      <Card>
        <CardHeader className='flex-row items-center justify-between space-y-0'>
          <div>
            <CardTitle>异常结算列表</CardTitle>
            <CardDescription>
              当前仅检测「系统延迟超时」类型（订单卡在 settling 状态）
            </CardDescription>
          </div>
          <Button variant='outline' size='sm' onClick={fetchExceptions} disabled={loading}>
            <RefreshCw className='mr-2 h-4 w-4' />
            刷新
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>订单ID</TableHead>
                <TableHead>周期</TableHead>
                <TableHead>异常类型</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>到期时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className='text-muted-foreground h-32 text-center'>
                    加载中...
                  </TableCell>
                </TableRow>
              ) : exceptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='text-muted-foreground h-32 text-center'>
                    <AlertCircle className='mx-auto mb-2 h-6 w-6' />
                    暂无异常结算记录
                  </TableCell>
                </TableRow>
              ) : (
                exceptions.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className='font-medium'>#{item.id}</TableCell>
                    <TableCell>{item.period}</TableCell>
                    <TableCell>
                      <Badge variant='secondary'>
                        {EXCEPTION_TYPE_LABEL[item.exceptionType] || item.exceptionType}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-muted-foreground max-w-md'>
                      {item.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[item.status] || 'default'}>
                        {STATUS_LABEL[item.status] || item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='whitespace-nowrap'>
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleResolve(item)}
                        disabled={item.status !== 'pending'}
                      >
                        处理
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
