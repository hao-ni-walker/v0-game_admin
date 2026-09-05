import { format } from 'date-fns';

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
