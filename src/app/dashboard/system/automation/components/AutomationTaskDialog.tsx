'use client';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CRON_PRESETS, TASK_TYPE_OPTIONS } from '../constants';
import type { AutomationTask, AutomationTaskFormData, AutomationTaskType } from '../types';

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  editing: AutomationTask | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AutomationTaskFormData, reason: string) => Promise<boolean>;
}

interface DialogForm {
  name: string;
  task_type: AutomationTaskType;
  schedule: string;
  timeout_seconds: number;
  notify_on_success: boolean;
  notify_on_failure: boolean;
  notify_chat_id: string;
  // db_backup params
  r2_prefix: string;
  r2_keep_days: number;
  keep_local_days: number;
  // daily_report params
  day_offset: number;
  // shell params
  command: string;
  cwd: string;
  artifact_glob: string;
  // python params
  code: string;
}

const EMPTY_FORM: DialogForm = {
  name: '',
  task_type: 'db_backup',
  schedule: '0 3 * * *',
  timeout_seconds: 1800,
  notify_on_success: false,
  notify_on_failure: true,
  notify_chat_id: '',
  r2_prefix: 'backups/db',
  r2_keep_days: 30,
  keep_local_days: 7,
  day_offset: 1,
  command: '',
  cwd: '',
  artifact_glob: '',
  code: '',
};

const num = (v: unknown, fallback: number): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

function paramsFromForm(form: DialogForm): Record<string, unknown> {
  switch (form.task_type) {
    case 'db_backup':
      return {
        r2_prefix: form.r2_prefix.trim() || 'backups/db',
        r2_keep_days: num(form.r2_keep_days, 30),
        keep_local_days: num(form.keep_local_days, 7),
      };
    case 'daily_report':
      return { day_offset: num(form.day_offset, 1) };
    case 'shell':
      return {
        command: form.command,
        ...(form.cwd.trim() ? { cwd: form.cwd.trim() } : {}),
        ...(form.artifact_glob.trim() ? { artifact_glob: form.artifact_glob.trim() } : {}),
        ...(form.artifact_glob.trim() ? { r2_prefix: `artifacts/${form.name.trim() || 'task'}` } : {}),
      };
    case 'python':
      return { code: form.code };
    default:
      return {};
  }
}

export function AutomationTaskDialog({ open, mode, editing, onOpenChange, onSubmit }: Props) {
  const [form, setForm] = useState<DialogForm>(EMPTY_FORM);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setReason('');
    if (mode === 'edit' && editing) {
      const p = editing.params || {};
      setForm({
        name: editing.name,
        task_type: editing.task_type,
        schedule: editing.schedule,
        timeout_seconds: editing.timeout_seconds,
        notify_on_success: editing.notify_on_success,
        notify_on_failure: editing.notify_on_failure,
        notify_chat_id: editing.notify_chat_id ?? '',
        r2_prefix: typeof p.r2_prefix === 'string' ? p.r2_prefix : 'backups/db',
        r2_keep_days: num(p.r2_keep_days, 30),
        keep_local_days: num(p.keep_local_days, 7),
        day_offset: num(p.day_offset, 1),
        command: typeof p.command === 'string' ? p.command : '',
        cwd: typeof p.cwd === 'string' ? p.cwd : '',
        artifact_glob: typeof p.artifact_glob === 'string' ? p.artifact_glob : '',
        code: typeof p.code === 'string' ? p.code : '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, mode, editing]);

  const update = <K extends keyof DialogForm>(k: K, v: DialogForm[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const typeHint = TASK_TYPE_OPTIONS.find((o) => o.value === form.task_type)?.hint;

  const valid =
    form.name.trim().length > 0 &&
    form.schedule.trim().length >= 5 &&
    reason.trim().length > 0 &&
    (form.task_type !== 'shell' || form.command.trim().length > 0) &&
    (form.task_type !== 'python' || form.code.trim().length > 0);

  const handleSubmit = async () => {
    if (!valid) return;
    setSubmitting(true);
    const payload: AutomationTaskFormData = {
      name: form.name.trim(),
      task_type: form.task_type,
      schedule: form.schedule.trim(),
      enabled: true,
      params: paramsFromForm(form),
      timeout_seconds: num(form.timeout_seconds, 1800),
      notify_on_success: form.notify_on_success,
      notify_on_failure: form.notify_on_failure,
      ...(form.notify_chat_id.trim() ? { notify_chat_id: form.notify_chat_id.trim() } : { notify_chat_id: null }),
    };
    const ok = await onSubmit(payload, reason.trim());
    setSubmitting(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[85vh] sm:max-w-[640px]'>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? '编辑自动化任务' : '新建自动化任务'}</DialogTitle>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-4 overflow-y-auto py-2 pr-1'>
          <div className='col-span-1 space-y-1'>
            <Label>任务名称</Label>
            <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder='每日数据库备份' />
          </div>
          <div className='col-span-1 space-y-1'>
            <Label>任务类型</Label>
            <Select value={form.task_type} onValueChange={(v) => update('task_type', v as AutomationTaskType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {typeHint && <p className='text-muted-foreground col-span-2 text-xs'>{typeHint}</p>}

          <div className='col-span-1 space-y-1'>
            <Label>常用调度</Label>
            <Select value='' onValueChange={(v) => v && update('schedule', v)}>
              <SelectTrigger>
                <SelectValue placeholder='选择预设' />
              </SelectTrigger>
              <SelectContent>
                {CRON_PRESETS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='col-span-1 space-y-1'>
            <Label>Cron 表达式（UTC）</Label>
            <Input value={form.schedule} onChange={(e) => update('schedule', e.target.value)} placeholder='0 3 * * *' className='font-mono' />
          </div>
          <div className='col-span-1 space-y-1'>
            <Label>超时（秒）</Label>
            <Input type='number' min={10} max={86400} value={form.timeout_seconds} onChange={(e) => update('timeout_seconds', Number(e.target.value))} />
          </div>

          {form.task_type === 'db_backup' && (
            <>
              <div className='col-span-1 space-y-1'>
                <Label>R2 存储前缀</Label>
                <Input value={form.r2_prefix} onChange={(e) => update('r2_prefix', e.target.value)} placeholder='backups/db' />
              </div>
              <div className='col-span-1 space-y-1'>
                <Label>R2 保留天数</Label>
                <Input type='number' min={1} value={form.r2_keep_days} onChange={(e) => update('r2_keep_days', Number(e.target.value))} />
              </div>
              <div className='col-span-1 space-y-1'>
                <Label>本地保留天数</Label>
                <Input type='number' min={1} value={form.keep_local_days} onChange={(e) => update('keep_local_days', Number(e.target.value))} />
              </div>
              <p className='text-muted-foreground col-span-1 self-end text-xs'>R2 凭证由服务端 R2_* 环境变量配置</p>
            </>
          )}

          {form.task_type === 'daily_report' && (
            <div className='col-span-1 space-y-1'>
              <Label>报表日期偏移（天）</Label>
              <Input type='number' min={0} max={30} value={form.day_offset} onChange={(e) => update('day_offset', Number(e.target.value))} />
              <p className='text-muted-foreground text-xs'>1 = 统计昨天（建议配合每天早晨的 cron）</p>
            </div>
          )}

          {form.task_type === 'shell' && (
            <>
              <div className='col-span-2 space-y-1'>
                <Label>Shell 命令</Label>
                <Textarea rows={4} value={form.command} onChange={(e) => update('command', e.target.value)} placeholder='pg_dump --version' className='font-mono text-xs' />
              </div>
              <div className='col-span-1 space-y-1'>
                <Label>工作目录（可选）</Label>
                <Input value={form.cwd} onChange={(e) => update('cwd', e.target.value)} placeholder='/app/backups' />
              </div>
              <div className='col-span-1 space-y-1'>
                <Label>产物 glob（可选，上传 R2）</Label>
                <Input value={form.artifact_glob} onChange={(e) => update('artifact_glob', e.target.value)} placeholder='export-*.csv' />
              </div>
            </>
          )}

          {form.task_type === 'python' && (
            <div className='col-span-2 space-y-1'>
              <Label>Python 代码</Label>
              <Textarea
                rows={8}
                value={form.code}
                onChange={(e) => update('code', e.target.value)}
                placeholder={'# 可用上下文: db(SQLAlchemy Session), settings, notify(text), r2\n# 赋值 result = ... 会记录到执行输出\nrows = db.execute("select count(*) from users").scalar()\nnotify(f"users={rows}")\nresult = rows'}
                className='font-mono text-xs'
              />
            </div>
          )}

          <div className='col-span-2 space-y-2 rounded-md border p-3'>
            <p className='text-sm font-medium'>Telegram 通知</p>
            <div className='flex items-center gap-6'>
              <div className='flex items-center gap-2'>
                <Switch checked={form.notify_on_failure} onCheckedChange={(v) => update('notify_on_failure', v)} />
                <Label>失败时通知</Label>
              </div>
              <div className='flex items-center gap-2'>
                <Switch checked={form.notify_on_success} onCheckedChange={(v) => update('notify_on_success', v)} />
                <Label>成功时通知</Label>
              </div>
            </div>
            <div className='space-y-1'>
              <Label>目标 Chat ID（可选）</Label>
              <Input value={form.notify_chat_id} onChange={(e) => update('notify_chat_id', e.target.value)} placeholder='留空使用 ALERT_TELEGRAM_CHAT_ID' />
              <p className='text-muted-foreground text-xs'>频道需先将 Bot 设为管理员；每日报表任务始终发送到该 Chat ID</p>
            </div>
          </div>

          <div className='col-span-2 space-y-1'>
            <Label>修改原因（必填，记入审计）</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder='例如：新增每日备份任务' />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={submitting}>取消</Button>
          <Button onClick={handleSubmit} disabled={submitting || !valid}>{submitting ? '保存中…' : '保存'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
