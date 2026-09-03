'use client';

import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ExternalLink, Loader2, Search, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface ChainItem {
  time: number; // unix seconds
  asset: string;
  amount: number;
  event_id: string;
  sender?: string | null;
  in_progress: boolean;
  credited: boolean;
  deposit_id?: number | null;
  tx_url?: string;
}

interface ChainSection {
  rail: 'TON' | 'TRON';
  address: string;
  address_explorer_url: string;
  items: ChainItem[];
  fetch_failed: boolean;
  uncredited_count: number;
}

interface ChainCheckData {
  user_id: number;
  sections?: ChainSection[];
  // 兼容旧结构(TON 单链)的字段
  address?: string | null;
  address_explorer_url?: string;
  chain?: ChainItem[];
  uncredited_count?: number;
}

/**
 * 链上查证：单用户链上到账（TON + TRON）⇄ 已入账对比（单用户版对账）。
 * 客诉"我充了没到账"时，这里一步定位：链上有钱但未入账 → 查对应链的
 * 监控；链上没钱 → 用户实际没转或转错地址。
 */
export function ChainCheckDialog({
  open,
  onOpenChange,
  initialUserId
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUserId?: number | null;
}) {
  const [userIdInput, setUserIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ChainCheckData | null>(null);

  useEffect(() => {
    if (open && initialUserId) {
      setUserIdInput(String(initialUserId));
    }
  }, [open, initialUserId]);

  const runCheck = useCallback(async () => {
    if (!/^\d+$/.test(userIdInput.trim())) {
      toast.error('请输入有效的用户 ID');
      return;
    }
    setLoading(true);
    setData(null);
    try {
      const res = await fetch(
        `/api/admin/deposit-chain-check?user_id=${userIdInput.trim()}`,
        { cache: 'no-store' }
      );
      const payload = await res.json();
      if (!res.ok || payload.code !== 0) {
        toast.error(payload.message || '查询失败');
        return;
      }
      setData(payload.data as ChainCheckData);
    } catch {
      toast.error('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }, [userIdInput]);

  const sections: ChainSection[] =
    data?.sections ??
    (data?.address
      ? [{
          rail: 'TON' as const,
          address: data.address!,
          address_explorer_url: data.address_explorer_url || '',
          items: data.chain || [],
          fetch_failed: false,
          uncredited_count: data.uncredited_count || 0
        }]
      : []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>链上查证（TON / TRON）</DialogTitle>
          <DialogDescription>
            拉取该用户各链专属收款地址的最近到账，并与已入账记录比对。链上有钱但显示"未入账"
            → 检查对应链的监控；链上无记录 → 用户未实际转账或转错地址。
          </DialogDescription>
        </DialogHeader>

        <div className='flex items-center gap-2'>
          <Input
            placeholder='用户 ID'
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runCheck()}
            className='w-40'
          />
          <Button onClick={runCheck} disabled={loading}>
            {loading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Search className='mr-2 h-4 w-4' />
            )}
            查询
          </Button>
        </div>

        {data && sections.length === 0 && (
          <div className='rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground'>
            该用户没有任何链上收款地址（从未打开过充值页）。
          </div>
        )}

        {sections.map((section) => (
          <div key={section.rail} className='space-y-3'>
            <div className='rounded-md border bg-muted/40 p-3 text-xs'>
              <div className='flex items-center gap-2'>
                <Badge variant='outline'>{section.rail}</Badge>
                <span className='break-all font-mono'>{section.address}</span>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6 shrink-0'
                  onClick={() => {
                    navigator.clipboard.writeText(section.address);
                    toast.success('已复制');
                  }}
                >
                  <Copy className='h-3 w-3' />
                </Button>
                <a
                  href={section.address_explorer_url}
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex shrink-0 items-center gap-1 text-blue-600 hover:underline'
                >
                  <ExternalLink className='h-3 w-3' />
                  区块浏览器
                </a>
              </div>
              <div className='mt-1'>
                {section.fetch_failed ? (
                  <span className='font-medium text-orange-600'>
                    ⚠️ 链上查询失败——本次结果不完整，请稍后重试
                  </span>
                ) : section.uncredited_count > 0 ? (
                  <span className='font-medium text-red-600'>
                    ⚠️ {section.uncredited_count} 笔{section.rail} 链上到账未入账 —— 请检查{' '}
                    {section.rail} 监控
                  </span>
                ) : (
                  <span className='text-green-600'>
                    ✓ {section.rail} 链上到账均已入账（或确认中）
                  </span>
                )}
              </div>
            </div>

            {section.items.length > 0 && (
              <div className='max-h-72 overflow-y-auto rounded-md border'>
                <table className='w-full text-xs'>
                  <thead className='bg-muted/50 sticky top-0'>
                    <tr>
                      <th className='p-2 text-left'>时间</th>
                      <th className='p-2 text-left'>资产</th>
                      <th className='p-2 text-right'>金额</th>
                      <th className='p-2 text-left'>状态</th>
                      <th className='p-2 text-left'>交易</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.items.map((item) => (
                      <tr
                        key={`${section.rail}-${item.event_id}-${item.amount}`}
                        className='border-t'
                      >
                        <td className='p-2'>
                          {item.time
                            ? format(new Date(item.time * 1000), 'MM-dd HH:mm:ss', {
                                locale: zhCN
                              })
                            : '—'}
                        </td>
                        <td className='p-2'>{item.asset}</td>
                        <td className='p-2 text-right font-mono'>{item.amount}</td>
                        <td className='p-2'>
                          {item.credited ? (
                            <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>
                              已入账{item.deposit_id ? ` #${item.deposit_id}` : ''}
                            </Badge>
                          ) : item.in_progress ? (
                            <Badge className='bg-blue-100 text-blue-800 hover:bg-blue-100'>
                              链上确认中
                            </Badge>
                          ) : (
                            <Badge className='bg-red-100 text-red-800 hover:bg-red-100'>
                              未入账
                            </Badge>
                          )}
                        </td>
                        <td className='p-2'>
                          <a
                            href={
                              item.tx_url ||
                              `https://tonscan.org/transaction/${item.event_id}`
                            }
                            target='_blank'
                            rel='noreferrer'
                            className='inline-flex items-center gap-1 font-mono text-blue-600 hover:underline'
                          >
                            {item.event_id.slice(0, 10)}…
                            <ExternalLink className='h-3 w-3' />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!section.fetch_failed && section.items.length === 0 && (
              <div className='text-xs text-muted-foreground'>
                {section.rail} 链上暂无到账记录。
              </div>
            )}
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
}
