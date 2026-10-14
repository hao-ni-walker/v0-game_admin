'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, SendHorizonal, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import PageContainer from '@/components/layout/page-container';
import { PermissionGuard } from '@/components/auth/permission-guard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/table/page-header';
import { usePermissions } from '@/hooks/use-permissions';
import { AlertConfigAPI, type AlertConfig } from '@/service/request';

const CHAT_ID_PATTERN = /^-?\d+$/;

function parseChatId(raw: string): number | null | undefined {
  const value = raw.trim();
  if (value === '') return null;
  if (!CHAT_ID_PATTERN.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function SourceBadge({ overridden }: { overridden: boolean }) {
  return overridden ? (
    <Badge>后台配置</Badge>
  ) : (
    <Badge variant='outline'>环境变量默认</Badge>
  );
}

export default function AlertConfigPage() {
  const canWrite = usePermissions().hasPermission('risk:write');
  const [config, setConfig] = useState<AlertConfig | null>(null);
  const [chatIdInput, setChatIdInput] = useState('');
  const [dedupeInput, setDedupeInput] = useState(300);
  const [reason, setReason] = useState('调整告警通知配置');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await AlertConfigAPI.get();
      if (response.success && response.data) {
        setConfig(response.data);
        setChatIdInput(
          response.data.alert_telegram_chat_id === null
            ? ''
            : String(response.data.alert_telegram_chat_id)
        );
        setDedupeInput(response.data.alert_dedupe_seconds);
      } else {
        toast.error(response.message || '获取告警通知配置失败');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const parsedChatId = useMemo(() => parseChatId(chatIdInput), [chatIdInput]);
  const chatIdValid = parsedChatId !== undefined;
  const dedupeValid = Number.isInteger(dedupeInput) && dedupeInput >= 0;

  const chatIdChanged =
    config !== null && parsedChatId !== config.alert_telegram_chat_id;
  const dedupeChanged =
    config !== null && dedupeInput !== config.alert_dedupe_seconds;
  const dirty = chatIdChanged || dedupeChanged;
  const canSave =
    dirty && chatIdValid && dedupeValid && reason.trim().length > 0;

  const save = async () => {
    if (!canSave) {
      toast.error('请检查群 chat id（整数）、去重窗口（≥0）并填写调整原因');
      return;
    }
    setSaving(true);
    try {
      const response = await AlertConfigAPI.update({
        ...(chatIdChanged ? { alert_telegram_chat_id: parsedChatId } : {}),
        ...(dedupeChanged ? { alert_dedupe_seconds: dedupeInput } : {}),
        reason: reason.trim()
      });
      if (response.success) {
        toast.success('告警通知配置已保存，即时生效');
        await load();
      } else {
        toast.error(response.message || '保存失败');
      }
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    if (!chatIdValid) {
      toast.error('群 chat id 格式不正确');
      return;
    }
    setTesting(true);
    try {
      const response = await AlertConfigAPI.test(parsedChatId ?? null);
      if (!response.success || !response.data) {
        toast.error(response.message || '发送测试消息失败');
        return;
      }
      if (response.data.ok) {
        toast.success(
          `测试消息已发送到 ${response.data.chat_id}，请到群里确认`
        );
      } else {
        toast.error(`发送失败：${response.data.error ?? '未知错误'}`);
      }
    } finally {
      setTesting(false);
    }
  };

  const chatOverridden =
    config?.overridden_keys.includes('alert_telegram_chat_id') ?? false;
  const dedupeOverridden =
    config?.overridden_keys.includes('alert_dedupe_seconds') ?? false;

  return (
    <PermissionGuard permissions='risk:read'>
      <PageContainer>
        <PageHeader
          title='告警通知'
          description='后端异常告警与自动化任务通知发往的 Telegram 群；保存后即时生效，无需重启'
        />

        <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Bell className='h-5 w-5' />
                Telegram 告警群
              </CardTitle>
              <CardDescription>
                群 chat id 为负数（超级群以 -100
                开头）；留空保存即关闭告警（仅写日志）
              </CardDescription>
            </CardHeader>
            <CardContent className='grid gap-5'>
              <div className='grid gap-2'>
                <Label htmlFor='alert-chat-id'>告警群 chat id</Label>
                <Input
                  id='alert-chat-id'
                  inputMode='numeric'
                  placeholder='例如 -1004431575506'
                  value={chatIdInput}
                  disabled={loading || !canWrite}
                  aria-invalid={!chatIdValid}
                  onChange={(event) => setChatIdInput(event.target.value)}
                />
                {!chatIdValid && (
                  <p className='text-destructive text-xs'>
                    请输入整数 chat id，或留空
                  </p>
                )}
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='alert-dedupe'>去重窗口（秒）</Label>
                <Input
                  id='alert-dedupe'
                  type='number'
                  min={0}
                  step={1}
                  value={dedupeInput}
                  disabled={loading || !canWrite}
                  onChange={(event) =>
                    setDedupeInput(Number(event.target.value))
                  }
                />
                <p className='text-muted-foreground text-xs'>
                  同一异常（类型 + 路由）在窗口内只告警一次，避免 500 风暴刷屏
                </p>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='alert-reason'>调整原因</Label>
                <Input
                  id='alert-reason'
                  value={reason}
                  maxLength={200}
                  disabled={loading || !canWrite}
                  onChange={(event) => setReason(event.target.value)}
                />
              </div>
              {canWrite && (
                <div className='flex justify-end gap-2'>
                  <Button
                    variant='outline'
                    onClick={sendTest}
                    disabled={loading || testing || !chatIdValid}
                  >
                    <SendHorizonal className='h-4 w-4' />
                    {testing ? '发送中...' : '发送测试消息'}
                  </Button>
                  <Button
                    onClick={save}
                    disabled={loading || saving || !canSave}
                  >
                    {saving ? '保存中...' : '保存配置'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <ShieldCheck className='h-5 w-5' />
                当前状态
              </CardTitle>
              <CardDescription>后台配置优先于环境变量默认值</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='rounded-lg border p-4 text-sm'>
                <div className='flex items-center justify-between'>
                  <p className='text-muted-foreground'>生效的告警群</p>
                  <SourceBadge overridden={chatOverridden} />
                </div>
                <p className='mt-2 font-mono font-medium'>
                  {config?.alert_telegram_chat_id ?? '未配置（告警仅写日志）'}
                </p>
              </div>
              <div className='rounded-lg border p-4 text-sm'>
                <div className='flex items-center justify-between'>
                  <p className='text-muted-foreground'>生效的去重窗口</p>
                  <SourceBadge overridden={dedupeOverridden} />
                </div>
                <p className='mt-2 font-medium'>
                  {config ? `${config.alert_dedupe_seconds} 秒` : '-'}
                </p>
              </div>
              <div className='rounded-lg border p-4 text-sm'>
                <div className='flex items-center justify-between'>
                  <p className='text-muted-foreground'>Telegram Bot</p>
                  {config?.bot_ready ? (
                    <Badge>已就绪</Badge>
                  ) : (
                    <Badge variant='destructive'>未就绪</Badge>
                  )}
                </div>
                {config && !config.bot_ready && (
                  <p className='text-muted-foreground mt-2 text-xs'>
                    后端启动中或 TELEGRAM_BOT_TOKEN 未配置，此时无法发送
                  </p>
                )}
              </div>
              <ul className='text-muted-foreground list-disc space-y-1 pl-4 text-xs'>
                <li>
                  先把 @PredictXGoBot 拉进群，再用「发送测试消息」验证输入框里的
                  id（可在保存前验证）
                </li>
                <li>
                  取群 id 可用 @getidsbot；网页版链接里的数字需补上 -100 前缀
                </li>
                <li>「Chat not found」通常是 id 错或 bot 不在群内</li>
                <li>
                  Grafana 指标告警的联系点不读取此配置，仍需在 Grafana
                  界面单独设置
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </PermissionGuard>
  );
}
