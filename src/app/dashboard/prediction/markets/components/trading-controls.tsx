'use client';
import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { apiRequest } from '@/service/api/base';

type Config = {
  enabled: boolean;
  require_pool_coverage: boolean;
  [key: string]: boolean | string | number;
};
const fields = [
  ['spread_bps', '默认点差（bps，200 = 2%）'],
  ['min_bet_usdt', '默认最小下注（USDT）'],
  ['max_bet_usdt', '默认单笔上限（USDT）'],
  ['max_exposure_usdt', '默认市场敞口上限（USDT）'],
  ['global_exposure_usdt', '平台预测敞口上限（USDT）'],
  ['price_floor', '停盘价带下限（0–1）'],
  ['price_ceiling', '停盘价带上限（0–1）'],
  ['quote_ttl_seconds', '报价有效期（秒，5–60）'],
  ['book_max_age_seconds', '订单簿最大年龄（秒，1–120）'],
  ['max_price_deviation_bps', '确认偏差上限（bps，100 = 1%）'],
  ['resolution_confirmation_seconds', '结果重复确认间隔（秒，30–3600）']
] as const;

export function TradingControls({ canWrite }: { canWrite: boolean }) {
  const [open, setOpen] = useState(false),
    [config, setConfig] = useState<Config | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function load() {
    setOpen(true);
    setBusy(true);
    setError('');
    setConfig(null);
    try {
      const r = await apiRequest<Config>(
        '/admin/prediction-markets/trading-config'
      );
      if (r.code !== 0 && r.code !== 200) throw new Error(r.message);
      if (!r.data) throw new Error('配置数据为空');
      setConfig(r.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!config) return;
    setBusy(true);
    setError('');
    try {
      const r = await apiRequest<Config>(
        '/admin/prediction-markets/trading-config',
        { method: 'PUT', body: JSON.stringify(config) }
      );
      if (r.code !== 0 && r.code !== 200) throw new Error(r.message);
      toast.success('预测交易配置已更新');
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Button size='sm' variant='outline' onClick={load}>
        <Settings2 className='mr-1 h-4 w-4' />
        交易设置
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle>预测市场交易设置</DialogTitle>
            <DialogDescription>
              点差按市场参考价 ×（1 + bps /
              10000）计算。逐市场非空参数覆盖默认值；暂停新下注不影响已有注单结算。
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p role='alert' className='text-destructive text-sm'>
              {error}
            </p>
          )}
          {!config ? (
            <p className='text-muted-foreground text-sm'>
              {busy ? '加载中…' : '无法加载配置'}
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void save();
              }}
            >
              <fieldset disabled={!canWrite || busy} className='space-y-4'>
                <Label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={config.enabled}
                    onChange={(e) =>
                      setConfig({ ...config, enabled: e.target.checked })
                    }
                  />
                  允许预测市场新下注
                </Label>
                <Label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={config.require_pool_coverage}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        require_pool_coverage: e.target.checked
                      })
                    }
                  />
                  要求资金池覆盖新增预测负债
                </Label>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  {fields.map(([key, label]) => (
                    <div key={key} className='space-y-1.5'>
                      <Label htmlFor={`prediction-${key}`}>{label}</Label>
                      <Input
                        id={`prediction-${key}`}
                        type='number'
                        required
                        min={0}
                        step='any'
                        value={String(config[key])}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            [key]: Number(e.target.value)
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </fieldset>
              <DialogFooter className='mt-6'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setOpen(false)}
                >
                  关闭
                </Button>
                {canWrite && (
                  <Button type='submit' disabled={busy}>
                    {busy ? '保存中…' : '保存交易设置'}
                  </Button>
                )}
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
