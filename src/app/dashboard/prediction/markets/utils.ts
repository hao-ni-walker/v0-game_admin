import { format } from 'date-fns';
import type { PredictionMarketUpdateData } from '@/service/request';

/** 紧凑美元格式：$1.2M / $35.0k / $128。 */
export function compactUsd(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—';
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}k`;
  return `$${v.toFixed(0)}`;
}

/** ISO 时间 → 'yyyy-MM-dd HH:mm'；空/非法 → '—'。 */
export function fmtDateTime(v: string | null | undefined): string {
  if (!v) return '—';
  try {
    return format(new Date(v), 'yyyy-MM-dd HH:mm');
  } catch {
    return '—';
  }
}

/** Polymarket 市场页链接（canonical /market/{slug} 形式）。 */
export function polymarketUrl(slug: string): string {
  return `https://polymarket.com/market/${slug}`;
}

/**
 * 市场是否已结束。Gamma 同步从不把 closed 置 true（全库 0 行），线上
 * 「结束」事实上由 end_date 判定，closed 仅作兜底；两者任一命中即视为已结算。
 */
export function isMarketEnded(m: { closed: boolean; end_date: string | null }): boolean {
  if (m.closed) return true;
  if (!m.end_date) return false;
  const t = new Date(m.end_date).getTime();
  return Number.isFinite(t) && t <= Date.now();
}

export interface BatchConfigForm {
  spread_bps: string;
  max_exposure_usdt: string;
  min_bet_usdt: string;
  max_bet_usdt: string;
  sort_order: string;
}

export type ParsedBatchConfig =
  | { status: 'ok'; body: PredictionMarketUpdateData }
  | { status: 'empty' }
  | { status: 'invalid'; message: string };

/**
 * 批量配置表单 → 提交体。与单市场弹窗语义不同：留空 = 不修改该字段
 * （保留各市场自身值），而不是清空回落全局默认——批量场景下误清几十个
 * 市场的覆盖值代价太高。全部留空返回 empty；min>max（仅当两者都填写时
 * 可比）返回 invalid。
 */
export function parseBatchConfigForm(form: BatchConfigForm): ParsedBatchConfig {
  const toNum = (raw: string): number | undefined => {
    const t = raw.trim();
    if (!t) return undefined;
    const n = Number(t);
    return Number.isFinite(n) ? n : undefined;
  };
  const invalidFields = (
    Object.keys(form) as Array<keyof BatchConfigForm>
  ).filter((k) => form[k].trim() !== '' && toNum(form[k]) === undefined);
  if (invalidFields.length) {
    return { status: 'invalid', message: '存在非数值输入，请检查后再提交' };
  }
  const body: PredictionMarketUpdateData = {};
  const assign = (k: keyof BatchConfigForm, v: number | undefined) => {
    if (v !== undefined) (body as Record<string, number>)[k] = v;
  };
  assign('spread_bps', toNum(form.spread_bps));
  assign('max_exposure_usdt', toNum(form.max_exposure_usdt));
  assign('min_bet_usdt', toNum(form.min_bet_usdt));
  assign('max_bet_usdt', toNum(form.max_bet_usdt));
  assign('sort_order', toNum(form.sort_order));
  if (Object.keys(body).length === 0) return { status: 'empty' };
  const min = toNum(form.min_bet_usdt);
  const max = toNum(form.max_bet_usdt);
  if (min !== undefined && max !== undefined && min > max) {
    return { status: 'invalid', message: '最小注单不能大于最大注单' };
  }
  return { status: 'ok', body };
}
