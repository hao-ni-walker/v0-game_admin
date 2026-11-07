import { test } from 'node:test';
import assert from 'node:assert/strict';

import { computeDepositStats, isCountedOrder } from './stats';
import type { DepositOrder } from '../types';

function makeOrder(
  status: DepositOrder['status'],
  amount: number,
  actualAmount: number | null = null
): DepositOrder {
  return {
    id: 1,
    orderNo: 'D1',
    channelOrderNo: null,
    userId: 1,
    paymentChannelId: 1,
    paymentChannelName: 'TON',
    paymentChannelCode: 'TON',
    amount,
    fee: 0,
    bonusAmount: 0,
    actualAmount: actualAmount ?? (status === 'success' ? amount : 0),
    status,
    currency: 'USD',
    ipAddress: null,
    remark: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    updatedAt: new Date().toISOString()
  };
}

test('failed 与 timeout 不计入金额统计', () => {
  const orders = [
    makeOrder('success', 100, 100),
    makeOrder('failed', 6744443164121390), // 生产坏数据形态
    makeOrder('timeout', 50),
    makeOrder('pending', 20),
    makeOrder('processing', 10)
  ];
  const stats = computeDepositStats(orders);
  // 100 + 20 + 10：失败/超时的大额不污染总额
  assert.equal(stats.totalAmount, 130);
  assert.equal(stats.totalActualAmount, 100); // 仅 success 有实收
});

test('orderCount 优先用 count_total（全量剔除失败口径）', () => {
  const stats = computeDepositStats([makeOrder('success', 1, 1)], {
    countTotal: 36
  });
  assert.equal(stats.orderCount, 36);
});

test('count_total 缺失时回落全量 total，而非当前页条数', () => {
  const stats = computeDepositStats(
    [makeOrder('success', 1, 1), makeOrder('failed', 2)],
    { fallbackTotal: 85 }
  );
  assert.equal(stats.orderCount, 85);
});

test('两者皆缺时用当前页剔除失败后条数', () => {
  const stats = computeDepositStats([
    makeOrder('success', 1, 1),
    makeOrder('failed', 2),
    makeOrder('timeout', 3)
  ]);
  assert.equal(stats.orderCount, 1);
});

test('isCountedOrder 边界', () => {
  assert.equal(isCountedOrder(makeOrder('success', 1)), true);
  assert.equal(isCountedOrder(makeOrder('pending', 1)), true);
  assert.equal(isCountedOrder(makeOrder('processing', 1)), true);
  assert.equal(isCountedOrder(makeOrder('failed', 1)), false);
  assert.equal(isCountedOrder(makeOrder('timeout', 1)), false);
});

test('空列表安全', () => {
  const stats = computeDepositStats([], { countTotal: 0 });
  assert.deepEqual(stats, {
    orderCount: 0,
    totalAmount: 0,
    totalActualAmount: 0,
    totalBonusAmount: 0
  });
});
