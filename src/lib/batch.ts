/**
 * Pure helpers for admin batch operations. Kept free of React/server imports
 * so they can be covered by the lightweight `node --test` suite.
 */

export interface BatchFailure {
  code: string;
  message: string;
}

/** Group per-item failures by reason so a 100-item batch produces one toast. */
export function summarizeFailures(failures: BatchFailure[]): string {
  const groups = new Map<string, string[]>();
  for (const failure of failures) {
    groups.set(failure.message, [
      ...(groups.get(failure.message) ?? []),
      failure.code,
    ]);
  }
  return Array.from(groups.entries())
    .map(([message, codes]) =>
      codes.length > 3
        ? `${codes.slice(0, 3).join('、')} 等 ${codes.length} 个：${message}`
        : `${codes.join('、')}：${message}`
    )
    .join('；');
}

export type BatchResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: unknown };

/**
 * Run `worker` over `items` with at most `limit` in flight, capturing thrown
 * errors per item instead of aborting the batch. Results keep input order.
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<BatchResult<R>[]> {
  const results = new Array<BatchResult<R>>(items.length);
  if (items.length === 0) return results;

  const width = Math.min(Math.max(1, limit), items.length);
  let cursor = 0;

  const runners = Array.from({ length: width }, async () => {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      try {
        results[index] = { ok: true, value: await worker(items[index], index) };
      } catch (error) {
        results[index] = { ok: false, error };
      }
    }
  });

  await Promise.all(runners);
  return results;
}
