import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formToJson, parseForm, LimitsForm, TIER_NAMES } from './useLimitsConfig';

// 回归：此前 formToJson 把六个等级打包成一个裸键 `tiers` 提交，后端
// order_guard 只读 `limits.user_tier.*` 分键，且 parseForm 也认不出 `tiers`，
// 导致等级限额保存后既不生效、刷新又回弹。
describe('formToJson 键形', () => {
  const form: LimitsForm = parseForm([
    { key: 'limits.user_tier.L0', value: { single: 20, daily: 100, open_positions: 5 } },
    { key: 'limits.platform.per_period', value: 5000000 },
  ]);

  it('每个等级单独一个 limits.user_tier.{tier} 键，不产生裸键 tiers', () => {
    const json = formToJson(form);
    assert.ok(!('tiers' in json), `不应存在打包键 tiers：${JSON.stringify(Object.keys(json))}`);
    for (const tier of TIER_NAMES) {
      assert.ok(`limits.user_tier.${tier}` in json, `缺少键 limits.user_tier.${tier}`);
    }
  });

  it('写读闭环：formToJson 的键能被 parseForm 原样解析回来', () => {
    const roundTrip = parseForm(
      Object.entries(formToJson(form)).map(([key, value]) => ({ key, value })),
    );
    assert.deepEqual(roundTrip, form);
  });
});
