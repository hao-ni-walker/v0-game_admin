'use client';

import { useEffect, useMemo, useState } from 'react';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { SystemConfig, SystemConfigUpdatePayload } from '../types';
import {
  getCatalogEntry,
  catalogFields,
  collectUncataloguedTopKeys,
  getPathValue,
  setPathValue,
  formatFieldValue
} from '../field-catalog';

interface SystemConfigEditDialogProps {
  open: boolean;
  config: SystemConfig | null;
  onOpenChange: (open: boolean) => void;
  onUpdate: (
    id: number,
    payload: SystemConfigUpdatePayload
  ) => Promise<boolean>;
}

/**
 * 系统配置编辑弹窗 — 按业务语言目录逐字段编辑。
 *
 * 关键语义：只把「原本存在」或「本次被编辑」的字段写回 JSON，
 * 未配置的字段继续保持缺省（= 走环境变量/代码默认值），
 * 避免一次保存把所有兜底值固化进 DB。
 * 未收录进目录的顶层键走原始 JSON 兜底区，保证不丢数据。
 */
export function SystemConfigEditDialog({
  open,
  config,
  onOpenChange,
  onUpdate
}: SystemConfigEditDialogProps) {
  const entry = config ? getCatalogEntry(config.config_key) : undefined;

  // 目录内字段的草稿：path -> 输入串（number/string/url）或布尔
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [boolDrafts, setBoolDrafts] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  // 未收录顶层键的兜底 JSON
  const [extraJson, setExtraJson] = useState('');
  // 无目录 / 非 JSON 行的整值编辑
  const [rawText, setRawText] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const original = useMemo(() => {
    if (!config || config.config_type !== 'json') return null;
    try {
      const parsed = JSON.parse(config.config_value);
      return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }, [config]);

  useEffect(() => {
    if (!open || !config) return;
    setTouched(new Set());
    setReason('');
    if (entry && original) {
      const d: Record<string, string> = {};
      const b: Record<string, boolean> = {};
      for (const f of catalogFields(entry)) {
        const v = getPathValue(original, f.path);
        if (f.type === 'boolean') {
          b[f.path] = Boolean(v);
        } else {
          d[f.path] = v === undefined || v === null ? '' : String(v);
        }
      }
      setDrafts(d);
      setBoolDrafts(b);
      const extras: Record<string, unknown> = {};
      for (const k of collectUncataloguedTopKeys(entry, original)) {
        extras[k] = original[k];
      }
      setExtraJson(Object.keys(extras).length ? JSON.stringify(extras, null, 2) : '');
      setRawText('');
    } else {
      setDrafts({});
      setBoolDrafts({});
      setExtraJson('');
      setRawText(config.config_value);
    }
  }, [open, config, entry, original]);

  if (!config) return null;

  const markTouched = (path: string) =>
    setTouched((prev) => new Set(prev).add(path));

  const handleSave = async () => {
    let nextValue = config.config_value;

    if (entry && original) {
      // 逐字段合并：仅写回「已存在」或「本次编辑过」的路径
      const next: Record<string, unknown> = {};
      for (const f of catalogFields(entry)) {
        const existed = getPathValue(original, f.path) !== undefined;
        const edited = touched.has(f.path);
        if (!existed && !edited) continue;
        if ((f.readOnly || f.dead) && edited) {
          toast.error(`「${f.name}」运行时不读取，不可在此修改`);
          return;
        }
        if (f.dead) {
          // 死字段：保留原值原样写回，不接受编辑
          setPathValue(next, f.path, getPathValue(original, f.path));
          continue;
        }
        if (f.type === 'boolean') {
          setPathValue(next, f.path, boolDrafts[f.path] ?? Boolean(getPathValue(original, f.path)));
        } else {
          const raw = (drafts[f.path] ?? '').trim();
          if (f.type === 'number') {
            const n = Number(raw);
            if (raw === '' || !Number.isFinite(n)) {
              toast.error(`「${f.name}」需要填写有效数字`);
              return;
            }
            setPathValue(next, f.path, n);
          } else {
            setPathValue(next, f.path, raw);
          }
        }
      }
      if (extraJson.trim()) {
        try {
          const extras = JSON.parse(extraJson);
          if (typeof extras !== 'object' || extras === null || Array.isArray(extras)) {
            throw new Error('not an object');
          }
          Object.assign(next, extras);
        } catch {
          toast.error('未收录字段的 JSON 格式有误，请检查');
          return;
        }
      }
      nextValue = JSON.stringify(next, null, 2);
    } else {
      // 无目录兜底：整值编辑。JSON 行要求可解析；其余类型原样提交。
      if (config.config_type === 'json') {
        try {
          JSON.parse(rawText);
        } catch {
          toast.error('JSON 格式有误，请检查后再保存');
          return;
        }
      }
      if (rawText === config.config_value) {
        toast.info('内容没有变化');
        return;
      }
      nextValue = rawText;
    }

    setSaving(true);
    const ok = await onUpdate(config.id, {
      config_value: nextValue,
      version: config.version,
      reason: reason.trim() || undefined
    });
    setSaving(false);
    if (ok) onOpenChange(false);
    // 失败（含版本冲突）保持弹窗打开，错误消息由 hook toast 展示
  };

  const renderCatalogEditor = () => (
    <div className='space-y-5'>
      {entry!.groups.map((group) => (
        <div key={group.name} className='space-y-3'>
          <div className='text-sm font-semibold'>{group.name}</div>
          <div className='grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2'>
            {group.fields.map((field) => {
              const existed = original
                ? getPathValue(original, field.path) !== undefined
                : false;
              const edited = touched.has(field.path);
              return (
                <div key={field.path} className='space-y-1.5'>
                  <Label className='flex items-center gap-1.5 text-xs'>
                    <span className={field.dead ? 'text-muted-foreground line-through decoration-muted-foreground/50' : ''}>
                      {field.name}
                    </span>
                    {field.unit && !field.dead && (
                      <span className='text-muted-foreground'>({field.unit})</span>
                    )}
                    {field.readOnly && <Lock className='h-3 w-3' />}
                    {field.dead && (
                      <Badge variant='destructive' className='h-4 px-1 text-[10px]'>
                        不读取
                      </Badge>
                    )}
                    {!field.dead && !existed && !edited && (
                      <Badge variant='outline' className='h-4 px-1 text-[10px]'>
                        未配置
                      </Badge>
                    )}
                    {!field.dead && edited && (
                      <Badge className='h-4 px-1 text-[10px]'>已修改</Badge>
                    )}
                  </Label>
                  {field.type === 'boolean' ? (
                    <div className='flex h-9 items-center gap-2'>
                      <Switch
                        checked={boolDrafts[field.path] ?? false}
                        disabled={field.readOnly || field.dead}
                        onCheckedChange={(v) => {
                          setBoolDrafts((prev) => ({ ...prev, [field.path]: v }));
                          markTouched(field.path);
                        }}
                      />
                      <span className='text-muted-foreground text-xs'>
                        {boolDrafts[field.path] ? '开启' : '关闭'}
                      </span>
                    </div>
                  ) : (
                    <Input
                      value={drafts[field.path] ?? ''}
                      disabled={field.readOnly || field.dead}
                      placeholder={
                        field.dead
                          ? '运行时不读取此参数'
                          : existed
                            ? ''
                            : '留空 = 使用系统默认值'
                      }
                      onChange={(e) => {
                        setDrafts((prev) => ({ ...prev, [field.path]: e.target.value }));
                        markTouched(field.path);
                      }}
                    />
                  )}
                  {field.hint && (
                    <p
                      className='text-muted-foreground line-clamp-2 text-xs'
                      title={field.hint}
                    >
                      {field.hint}
                    </p>
                  )}
                  <p className='text-muted-foreground/70 font-mono text-[10px]'>
                    {field.path}
                    {existed && !edited
                      ? ` = ${formatFieldValue(getPathValue(original, field.path))}`
                      : ''}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {extraJson && (
        <>
          <Separator />
          <div className='space-y-1.5'>
            <Label className='text-xs'>
              未收录字段（原始 JSON，一般无需改动）
            </Label>
            <Textarea
              value={extraJson}
              onChange={(e) => setExtraJson(e.target.value)}
              className='font-mono text-xs'
              rows={Math.min(10, extraJson.split('\n').length + 1)}
            />
          </div>
        </>
      )}
    </div>
  );

  const renderRawEditor = () =>
    config.config_type === 'json' ? (
      <Textarea
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        className='min-h-[260px] font-mono text-xs'
        placeholder='{ ... }'
      />
    ) : (
      <Input value={rawText} onChange={(e) => setRawText(e.target.value)} />
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[85vh] flex-col sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex flex-wrap items-center gap-2'>
            {entry ? entry.name : '编辑配置'}
            <Badge variant='outline' className='font-mono text-xs font-normal'>
              {config.config_key}
            </Badge>
            <Badge variant='secondary'>v{config.version}</Badge>
          </DialogTitle>
          <DialogDescription>
            {entry
              ? entry.description
              : '该配置未收录业务字段目录，请以原始值方式编辑（JSON）。'}
            {entry && !entry.live && entry.note && (
              <span className='mt-1 block text-amber-600 dark:text-amber-400'>
                {entry.note}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className='flex min-h-0 flex-1 flex-col overflow-y-auto pr-3'>
          <div className='py-2'>
            {entry && original
              ? renderCatalogEditor()
              : entry && !original
                ? (
                    <div className='text-destructive py-8 text-center text-sm'>
                      当前值不是合法 JSON 对象，无法逐字段编辑；请在下方按原始值修改。
                    </div>
                  )
                : renderRawEditor()}
            {entry && !original && renderRawEditor()}
          </div>
        </div>

        <DialogFooter className='flex-col gap-2 sm:flex-col'>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder='变更原因（选填，写入审计日志）'
            className='text-sm'
          />
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => onOpenChange(false)} disabled={saving}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? '保存中…' : '保存'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
