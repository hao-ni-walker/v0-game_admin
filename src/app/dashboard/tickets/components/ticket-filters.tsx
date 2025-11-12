import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import type { TicketListParams } from '@/service/api/ticket';

interface TicketFiltersProps {
  filters: TicketListParams;
  onSearch: (filters: Partial<TicketListParams>) => void;
  onReset: () => void;
  loading?: boolean;
}

export function TicketFilters({
  filters,
  onSearch,
  onReset,
  loading
}: TicketFiltersProps) {
  const [keyword, setKeyword] = useState(filters.keyword || '');
  const [status, setStatus] = useState<string>(filters.statuses?.[0] || 'all');
  const [priority, setPriority] = useState<string>(
    filters.priorities?.[0] || 'all'
  );

  const handleSearch = () => {
    const searchFilters: Partial<TicketListParams> = {};
    if (keyword) searchFilters.keyword = keyword;
    if (status && status !== 'all') searchFilters.statuses = [status as any];
    if (priority && priority !== 'all')
      searchFilters.priorities = [priority as any];
    onSearch(searchFilters);
  };

  const handleReset = () => {
    setKeyword('');
    setStatus('all');
    setPriority('all');
    onReset();
  };

  return (
    <div className='bg-card flex items-center gap-2 rounded-lg border p-4'>
      <Input
        placeholder='搜索标题...'
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className='w-64'
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className='w-40'>
          <SelectValue placeholder='状态' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>全部状态</SelectItem>
          <SelectItem value='open'>待处理</SelectItem>
          <SelectItem value='in_progress'>处理中</SelectItem>
          <SelectItem value='pending'>挂起</SelectItem>
          <SelectItem value='resolved'>已解决</SelectItem>
          <SelectItem value='closed'>已关闭</SelectItem>
        </SelectContent>
      </Select>

      <Select value={priority} onValueChange={setPriority}>
        <SelectTrigger className='w-40'>
          <SelectValue placeholder='优先级' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>全部优先级</SelectItem>
          <SelectItem value='low'>低</SelectItem>
          <SelectItem value='normal'>普通</SelectItem>
          <SelectItem value='high'>高</SelectItem>
          <SelectItem value='urgent'>紧急</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={handleSearch} disabled={loading}>
        <Search className='mr-2 h-4 w-4' />
        搜索
      </Button>

      <Button variant='outline' onClick={handleReset} disabled={loading}>
        重置
      </Button>
    </div>
  );
}
