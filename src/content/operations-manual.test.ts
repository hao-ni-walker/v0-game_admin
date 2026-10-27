import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { resolve } from 'node:path';
import { MANUAL_MARKDOWN, MANUAL_TOC, MANUAL_UPDATED_AT } from './operations-manual';

/**
 * Guards the bundled copy of docs/product_operations_manual.md. The source
 * file only exists in the monorepo checkout (not on the standalone Vercel
 * build), so the comparison is skipped there.
 */
const sourcePath = resolve(process.cwd(), '../docs/product_operations_manual.md');

describe('bundled operations manual', () => {
  it('matches the source manual byte for byte', { skip: !existsSync(sourcePath) }, () => {
    assert.equal(
      MANUAL_MARKDOWN,
      readFileSync(sourcePath, 'utf-8'),
      'pnpm manual:sync 没跑：src/content/operations-manual.ts 落后于 docs/product_operations_manual.md'
    );
  });

  it('extracts level-2/3 headings for the in-page table of contents', () => {
    assert.ok(MANUAL_TOC.length > 20, `only ${MANUAL_TOC.length} headings`);
    for (const heading of MANUAL_TOC) {
      assert.equal(heading.level === 2 || heading.level === 3, true, heading.title);
      assert.ok(heading.title.trim().length > 0);
    }
  });

  it('carries the manual version date', () => {
    assert.match(String(MANUAL_UPDATED_AT), /^\d{4}-\d{2}-\d{2}$/);
  });
});
