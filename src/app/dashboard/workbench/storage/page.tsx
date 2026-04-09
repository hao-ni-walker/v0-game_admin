'use client';

import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { STORAGE_BUCKETS } from '@/constants/storage-buckets';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

export default function WorkbenchStorageIndexPage() {
  return (
    <PageContainer scrollable>
      <div className='space-y-6 p-4 md:p-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold'>存储管理</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bucket 目录</CardTitle>
          </CardHeader>
          <CardContent>
            {STORAGE_BUCKETS.length === 0 ? (
              <div className='space-y-2 text-sm text-muted-foreground'>
                <p>尚未配置 Bucket 目录。</p>
                <p>
                  请在 <code className='rounded bg-muted px-1 py-0.5'>src/constants/storage-buckets.ts</code>{' '}
                  填写 <code className='rounded bg-muted px-1 py-0.5'>STORAGE_BUCKETS</code> 列表。
                </p>
              </div>
            ) : (
              <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
                {STORAGE_BUCKETS.map((b) => (
                  <Card key={b.name} className='overflow-hidden'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='flex items-center gap-2 text-base'>
                        <Database className='h-4 w-4' />
                        <span className='truncate'>{b.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      <div className='text-xs text-muted-foreground'>
                        <div className='font-mono'>bucket: {b.name}</div>
                        {b.description ? <div className='mt-1'>{b.description}</div> : null}
                      </div>
                      <Button asChild className='w-full' variant='outline'>
                        <Link href={`/dashboard/workbench/storage/${encodeURIComponent(b.name)}`}>进入</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

