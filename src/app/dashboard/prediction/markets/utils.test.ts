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
