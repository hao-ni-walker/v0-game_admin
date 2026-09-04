'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: 32 }}>
        <h1>页面出现问题</h1>
        <p>错误已记录，请稍后重试。</p>
        <button type="button" onClick={() => reset()}>
          重新加载
        </button>
      </body>
    </html>
  );
}
