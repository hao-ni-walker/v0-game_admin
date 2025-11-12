import { Ticket, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TicketPageHeaderProps {
  onCreateTicket: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

export function TicketPageHeader({
  onCreateTicket,
  onRefresh,
  loading
}: TicketPageHeaderProps) {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center space-x-2'>
        <Ticket className='h-6 w-6' />
        <h1 className='text-2xl font-bold'>工单管理</h1>
      </div>
      <div className='flex items-center space-x-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
          />
          刷新
        </Button>
        <Button onClick={onCreateTicket} size='sm'>
          <Plus className='mr-2 h-4 w-4' />
          创建工单
        </Button>
      </div>
    </div>
  );
}
