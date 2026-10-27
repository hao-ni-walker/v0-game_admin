import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isMarketEnded } from './utils';

describe('isMarketEnded', () => {
  it('closed flag alone means ended', () => {
    assert.equal(isMarketEnded({ closed: true, end_date: null }), true);
  });

  it('end_date in the past means ended even when closed is still false (Gamma never flips it)', () => {
    assert.equal(isMarketEnded({ closed: false, end_date: '2026-10-26T03:59:00Z' }), true);
  });

  it('end_date in the future means ongoing', () => {
    assert.equal(isMarketEnded({ closed: false, end_date: '2099-01-01T00:00:00Z' }), false);
  });

  it('null end_date and not closed means ongoing', () => {
    assert.equal(isMarketEnded({ closed: false, end_date: null }), false);
  });

  it('invalid date string does not throw and counts as ongoing', () => {
    assert.equal(isMarketEnded({ closed: false, end_date: 'not-a-date' }), false);
  });
});

import { parseBatchConfigForm } from './utils';

describe('parseBatchConfigForm', () => {
  it('all-empty form means nothing to change', () => {
    assert.deepEqual(
      parseBatchConfigForm({
        spread_bps: '',
        max_exposure_usdt: '',
        min_bet_usdt: '',
        max_bet_usdt: '',
        sort_order: '',
      }),
      { status: 'empty' }
    );
  });

  it('only filled fields land in the body (blank = leave each market untouched)', () => {
    const parsed = parseBatchConfigForm({
      spread_bps: ' 250 ',
      max_exposure_usdt: '',
      min_bet_usdt: '',
      max_bet_usdt: '',
      sort_order: '10',
    });
    assert.equal(parsed.status, 'ok');
    if (parsed.status === 'ok') {
      assert.deepEqual(parsed.body, { spread_bps: 250, sort_order: 10 });
    }
  });

  it('rejects min > max when both filled', () => {
    const parsed = parseBatchConfigForm({
      spread_bps: '',
      max_exposure_usdt: '',
      min_bet_usdt: '50',
      max_bet_usdt: '10',
      sort_order: '',
    });
    assert.equal(parsed.status, 'invalid');
  });

  it('rejects non-numeric input', () => {
    const parsed = parseBatchConfigForm({
      spread_bps: 'abc',
      max_exposure_usdt: '',
      min_bet_usdt: '',
      max_bet_usdt: '',
      sort_order: '',
    });
    assert.equal(parsed.status, 'invalid');
  });

  it('single-sided bet limits are allowed (compared server-side against existing values)', () => {
    const parsed = parseBatchConfigForm({
      spread_bps: '',
      max_exposure_usdt: '',
      min_bet_usdt: '2',
      max_bet_usdt: '',
      sort_order: '',
    });
    assert.equal(parsed.status, 'ok');
  });
});
