import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PageContainer({
  children,
  scrollable = true
}: {
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  return (
    <>
      {scrollable ? (
        <ScrollArea
          className='h-[calc(100dvh-52px)] w-full max-w-full min-w-0'
          viewportClassName='[&>div]:!block [&>div]:!w-full [&>div]:!max-w-full [&>div]:!min-w-0'
        >
          <div className='flex min-h-full w-full max-w-full min-w-0 flex-1 flex-col overflow-x-hidden p-4 md:px-6'>
            {children}
          </div>
        </ScrollArea>
      ) : (
        <div className='flex min-h-full w-full max-w-full min-w-0 flex-1 flex-col overflow-x-hidden p-4 md:px-6'>
          {children}
        </div>
      )}
    </>
  );
}
