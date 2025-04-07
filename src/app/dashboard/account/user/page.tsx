'use client';

import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/common/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';
import { SearchParams } from 'nuqs/server';
import { searchParamsCache, serialize } from '@/lib/searchparams';
import { DataTableSkeleton } from '@/components/common/data-table-skeleton';

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export default function UserManagementPage(props: pageProps) {
  const [users, setUsers] = useState([]);
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    initKey();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const initKey = async () => {
    const searchParams = await props.searchParams;
    // Allow nested RSCs to access the search params (in a type-safe way)
    searchParamsCache.parse(searchParams);

    // This key is used for invoke suspense if any of the search params changed (used for filters).
    const curKey = serialize({ ...searchParams });
    setKey(curKey);
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='用户管理'
            description='管理所有用户'
          />
          <Link
            href='/dashboard/product/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <Plus className='mr-2 h-4 w-4' />新增用户
          </Link>
        </div>
        <Separator />
        {/* <ProductTableAction /> */}
        <Suspense
          key={key}
          fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}
        >
          <DataTable columns={columns} data={users} loading={loading} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
