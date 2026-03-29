import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollText } from 'lucide-react';

interface TemplatePageHeaderProps {
  onRefresh: () => void;
  loading?: boolean;
}

export function TemplatePageHeader({
  onRefresh,
  loading = false
}: TemplatePageHeaderProps) {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <ScrollText className='text-primary h-6 w-6' />
        <h1 className='text-2xl font-bold'>通知模板</h1>
      </div>
      <div className='flex items-center gap-2'>
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
      </div>
    </div>
  );
}
