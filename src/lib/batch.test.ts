import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mapWithConcurrency, summarizeFailures } from './batch';

describe('summarizeFailures', () => {
  it('groups identical reasons and lists all codes up to three', () => {
    const text = summarizeFailures([
      { code: 'BTC', message: 'missing base odds' },
      { code: 'ETH', message: 'missing base odds' },
      { code: 'SOL', message: 'missing base odds' },
    ]);
    assert.equal(text, 'BTC、ETH、SOL：missing base odds');
  });

  it('truncates long groups and joins distinct reasons', () => {
    const text = summarizeFailures([
      { code: 'A', message: 'missing base odds' },
      { code: 'B', message: 'missing base odds' },
      { code: 'C', message: 'missing base odds' },
      { code: 'D', message: 'missing base odds' },
      { code: 'E', message: 'has trades' },
    ]);
    assert.match(text, /A、B、C 等 4 个：missing base odds/);
    assert.match(text, /E：has trades/);
  });

  it('returns an empty string when nothing failed', () => {
    assert.equal(summarizeFailures([]), '');
  });
});

describe('mapWithConcurrency', () => {
  it('keeps input order and never exceeds the concurrency limit', async () => {
    const items = [1, 2, 3, 4, 5, 6, 7];
    let active = 0;
    let maxActive = 0;
    const results = await mapWithConcurrency(items, 3, async (item) => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;
      return item * 10;
    });

    assert.deepEqual(
      results.map((result) => (result.ok ? result.value : 'failed')),
      [10, 20, 30, 40, 50, 60, 70],
    );
    assert.ok(maxActive <= 3, `max concurrency was ${maxActive}`);
    assert.equal(maxActive, 3);
  });

  it('captures a thrown item without aborting the rest of the batch', async () => {
    const processed: number[] = [];
    const results = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async (item) => {
      processed.push(item);
      if (item === 2) throw new Error('network down');
      return item;
    });

    assert.equal(processed.length, 5);
    assert.equal(results[0].ok, true);
    assert.equal(results[1].ok, false);
    assert.equal(results[2].ok, true);
    assert.equal(results[4].ok, true);
  });

  it('handles an empty input', async () => {
    const results = await mapWithConcurrency([], 5, async (item) => item);
    assert.deepEqual(results, []);
  });
});
