'use client';

import * as React from 'react';
import { useKBar } from 'kbar';
import { Button } from '@/components/ui/button';
import { SearchIcon } from 'lucide-react';

export default function SearchInput() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // 防止服务端渲染时出现错误
  if (!mounted) {
    return (
      <div className='w-full space-y-2'>
        <Button
          variant='outline'
          disabled
          className='bg-background text-muted-foreground relative h-9 w-full justify-start rounded-[0.5rem] text-sm font-normal shadow-none sm:pr-12 md:w-40 lg:w-64'
        >
          <SearchIcon className='mr-2 h-4 w-4' />
          Search...
        </Button>
      </div>
    );
  }

  return <SearchInputClient />;
}

function SearchInputClient() {
  const { query } = useKBar();

  return (
    <div className='w-full space-y-2'>
      <Button
        variant='outline'
        className='bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground relative h-9 w-full justify-start rounded-[0.5rem] text-sm font-normal shadow-none transition-colors sm:pr-12 md:w-40 lg:w-64'
        onClick={query.toggle}
      >
        <SearchIcon className='mr-2 h-4 w-4' />
        <span className='hidden sm:inline'>搜索页面...</span>
        <span className='sm:hidden'>搜索</span>
        <kbd className='bg-muted pointer-events-none absolute top-[0.3rem] right-[0.3rem] hidden h-6 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex'>
          <span className='text-xs'>⌘</span>K
        </kbd>
      </Button>
    </div>
  );
}
