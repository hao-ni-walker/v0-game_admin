'use client';

import { ServerErrorPage } from '@/components/ui/error-pages';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 上报到 Sentry（DSN 未配置时为 no-op）
    Sentry.captureException(error);
  }, [error]);

  return <ServerErrorPage />;
}
