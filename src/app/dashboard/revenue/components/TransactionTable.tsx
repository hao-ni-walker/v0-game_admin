'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { revenueApi, Transaction } from '@/service/api/revenue';
import { Copy, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';

interface TransactionTableProps {
  data: Transaction[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  quickFilter: {
    bizType: string;
    onlyLarge: boolean;
    onlyFailed: boolean;
  };
  onQuickFilterChange: (key: string, value: any) => void;
}

export function TransactionTable({
  data,
  total,
  loading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  quickFilter,
  onQuickFilterChange
}: TransactionTableProps) {
  const [selectedTransaction, setSelectedTransaction] =
    React.useState<Transaction | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailData, setDetailData] = React.useState<any>(null);

  const handleRowClick = async (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailLoading(true);
    try {
      const detail = await revenueApi.getTransactionDetail(transaction.id);
      setDetailData(detail);
    } catch (error) {
      console.error('Failed to fetch details', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'default'; // primary
      case 'failed':
        return 'destructive';
      case 'processing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className='space-y-4'>
      {/* Quick Filters */}
      <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
        <div className='flex items-center gap-2'>
          <div className='flex items-center overflow-hidden rounded-md border'>
            {['all', 'recharge', 'withdraw', 'wallet'].map((type) => (
              <button
                key={type}
                className={`hover:bg-muted px-4 py-2 text-sm font-medium transition-colors ${quickFilter.bizType === type ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-background'}`}
                onClick={() => onQuickFilterChange('bizType', type)}
              >
                {type === 'all'
                  ? 'All'
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant={quickFilter.onlyLarge ? 'secondary' : 'outline'}
            size='sm'
            onClick={() =>
              onQuickFilterChange('onlyLarge', !quickFilter.onlyLarge)
            }
            className={
              quickFilter.onlyLarge
                ? 'border-orange-200 bg-orange-100 text-orange-900 hover:bg-orange-200 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-100'
                : ''
            }
          >
            Large Amount {'>'} $1000
          </Button>
          <Button
            variant={quickFilter.onlyFailed ? 'destructive' : 'outline'}
            size='sm'
            onClick={() =>
              onQuickFilterChange('onlyFailed', !quickFilter.onlyFailed)
            }
          >
            Failed Only
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[100px]'>Type</TableHead>
              <TableHead className='w-[180px]'>Order ID</TableHead>
              <TableHead className='w-[120px]'>User ID</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead className='text-right'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='data-[state=open]:bg-accent -ml-3 h-8'
                >
                  Amount
                  <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='w-[180px]'>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className='h-24 text-center'>
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='h-24 text-center'>
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow
                  key={row.id}
                  className='hover:bg-muted/50 cursor-pointer'
                  onClick={() => handleRowClick(row)}
                >
                  <TableCell className='font-medium'>
                    <Badge variant='outline' className='text-xs uppercase'>
                      {row.bizType}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground font-mono text-xs'>
                    {row.orderId || '-'}
                  </TableCell>
                  <TableCell>{row.userId}</TableCell>
                  <TableCell>{row.channel}</TableCell>
                  <TableCell className='text-right font-medium'>
                    {row.amount.toLocaleString()} {row.currency}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(row.status) as any}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-muted-foreground text-xs'>
                    {new Date(row.createTime).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-end gap-4'>
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground text-sm'>Rows per page</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(val) => onPageSizeChange(Number(val))}
          >
            <SelectTrigger className='w-[70px]'>
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='10'>10</SelectItem>
              <SelectItem value='20'>20</SelectItem>
              <SelectItem value='50'>50</SelectItem>
              <SelectItem value='100'>100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='text-muted-foreground flex items-center gap-2 text-sm'>
          Page {page} of {Math.ceil(total / pageSize)}
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(page + 1)}
            disabled={page >= Math.ceil(total / pageSize) || loading}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Details Sheet */}
      <Sheet
        open={!!selectedTransaction}
        onOpenChange={(open) => !open && setSelectedTransaction(null)}
      >
        <SheetContent className='w-[400px] sm:w-[540px]'>
          <SheetHeader>
            <SheetTitle>Transaction Details</SheetTitle>
            <SheetDescription>
              Transaction ID: {selectedTransaction?.id}
            </SheetDescription>
          </SheetHeader>
          {selectedTransaction && (
            <ScrollArea className='mt-6 h-[calc(100vh-120px)] pr-4'>
              <div className='space-y-6'>
                <div className='grid gap-4'>
                  <div className='space-y-1'>
                    <label className='text-muted-foreground text-sm font-medium'>
                      Amount
                    </label>
                    <div className='text-2xl font-bold'>
                      {selectedTransaction.amount}{' '}
                      {selectedTransaction.currency}
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-1'>
                      <label className='text-muted-foreground text-sm font-medium'>
                        Status
                      </label>
                      <div>
                        <Badge
                          variant={
                            getStatusColor(selectedTransaction.status) as any
                          }
                        >
                          {selectedTransaction.status}
                        </Badge>
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <label className='text-muted-foreground text-sm font-medium'>
                        Type
                      </label>
                      <div className='capitalize'>
                        {selectedTransaction.bizType}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className='grid gap-4 text-sm'>
                  <div className='grid grid-cols-3 items-center'>
                    <span className='text-muted-foreground font-medium'>
                      Order ID
                    </span>
                    <div className='col-span-2 flex items-center gap-2'>
                      <span className='font-mono'>
                        {selectedTransaction.orderId || '-'}
                      </span>
                      {selectedTransaction.orderId && (
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-6 w-6'
                          onClick={() =>
                            copyToClipboard(selectedTransaction.orderId!)
                          }
                        >
                          <Copy className='h-3 w-3' />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className='grid grid-cols-3 items-center'>
                    <span className='text-muted-foreground font-medium'>
                      User ID
                    </span>
                    <div className='col-span-2'>
                      {selectedTransaction.userId}
                    </div>
                  </div>
                  <div className='grid grid-cols-3 items-center'>
                    <span className='text-muted-foreground font-medium'>
                      Channel
                    </span>
                    <div className='col-span-2'>
                      {selectedTransaction.channel}
                    </div>
                  </div>
                  {selectedTransaction.game && (
                    <div className='grid grid-cols-3 items-center'>
                      <span className='text-muted-foreground font-medium'>
                        Game
                      </span>
                      <div className='col-span-2'>
                        {selectedTransaction.game}
                      </div>
                    </div>
                  )}
                  {selectedTransaction.server && (
                    <div className='grid grid-cols-3 items-center'>
                      <span className='text-muted-foreground font-medium'>
                        Server
                      </span>
                      <div className='col-span-2'>
                        {selectedTransaction.server}
                      </div>
                    </div>
                  )}
                  <div className='grid grid-cols-3 items-center'>
                    <span className='text-muted-foreground font-medium'>
                      Create Time
                    </span>
                    <div className='col-span-2'>
                      {new Date(
                        selectedTransaction.createTime
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>

                {detailLoading ? (
                  <div className='text-muted-foreground py-4 text-center'>
                    Loading extra details...
                  </div>
                ) : detailData ? (
                  <div className='bg-muted space-y-4 rounded-lg p-4 text-sm'>
                    <h4 className='font-medium'>Additional Info</h4>
                    <div className='grid grid-cols-2 gap-2'>
                      <span className='text-muted-foreground'>Fee:</span>
                      <span>{detailData.fee}</span>
                      <span className='text-muted-foreground'>Bonus:</span>
                      <span>{detailData.bonus_amount}</span>
                      <span className='text-muted-foreground'>IP:</span>
                      <span>{detailData.ip}</span>
                      <span className='text-muted-foreground'>Device:</span>
                      <span className='truncate' title={detailData.device}>
                        {detailData.device}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Separator() {
  return <div className='bg-border my-4 h-[1px] w-full' />;
}
