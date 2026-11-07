// 充值订单豆腐块（统计卡片）口径：剔除终态失败单。
//
// 背景：生产近 7 天 73/75 笔为 failed（其中含 $6.7e15 级坏数据），旧逻辑
// 对列表无差别求和把「充值总额」炸成天文数字。终态失败 = failed +
// timeout（后端 expired，用户从未付成钱），二者在 UI 同为红色系，一律
// 不计入统计；pending/processing/success 正常计入。
// 金额沿用具象口径：当前页订单求和（与旧版一致，仅去污染）。
// 笔数优先用 BFF 附带的 count_total（剔除失败后的全量数），缺失时回落
// 全量 total（宁可口径回退也不挡列表展示）。

import type { DepositOrder, DepositOrderStats } from '../types';

/** 终态失败状态：不计入豆腐块统计 */
export const EXCLUDED_STATUSES: ReadonlySet<string> = new Set([
  'failed',
  'timeout'
]);

export function isCountedOrder(order: DepositOrder): boolean {
  return !EXCLUDED_STATUSES.has(order.status);
}

interface ComputeDepositStatsOptions {
  /** BFF 附带的剔除失败后全量笔数（可选） */
  countTotal?: number;
  /** 后端返回的全量 total（含失败），countTotal 缺失时回落用 */
  fallbackTotal?: number;
}

export function computeDepositStats(
  orders: DepositOrder[],
  options: ComputeDepositStatsOptions = {}
): DepositOrderStats {
  const counted = orders.filter(isCountedOrder);

  const orderCount =
    typeof options.countTotal === 'number' && options.countTotal >= 0
      ? options.countTotal
      : typeof options.fallbackTotal === 'number' && options.fallbackTotal >= 0
        ? options.fallbackTotal
        : counted.length;

  return {
    orderCount,
    totalAmount: counted.reduce((sum, order) => sum + (order.amount || 0), 0),
    totalActualAmount: counted.reduce(
      (sum, order) => sum + (order.actualAmount || 0),
      0
    ),
    totalBonusAmount: counted.reduce(
      (sum, order) => sum + (order.bonusAmount || 0),
      0
    )
  };
}
