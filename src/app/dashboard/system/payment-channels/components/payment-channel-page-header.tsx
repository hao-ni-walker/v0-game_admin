import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/shared/heading';

interface PaymentChannelPageHeaderProps {
  onCreateChannel: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

export function PaymentChannelPageHeader({
  onCreateChannel,
  onRefresh,
  loading
}: PaymentChannelPageHeaderProps) {
  return (
    <div className='flex items-center justify-between'>
      <Heading
        title='支付渠道管理'
        description='管理充值和提现渠道,配置费率和限额'
      />
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
        <Button size='sm' onClick={onCreateChannel}>
          <Plus className='mr-2 h-4 w-4' />
          新增渠道
        </Button>
      </div>
    </div>
  );
}
