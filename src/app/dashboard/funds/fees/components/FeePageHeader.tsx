'use client';
import { RefreshCw, Plus, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
  onRefresh: () => void;
  onCreate: () => void;
  onPreview: () => void;
  loading: boolean;
  canWrite: boolean;
}

export function FeePageHeader({ onRefresh, onCreate, onPreview, loading, canWrite }: Props) {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <div className='flex items-center gap-2'>
          <h1 className='text-3xl font-bold tracking-tight'>费率管理</h1>
          <Badge variant='destructive'>未生效</Badge>
        </div>
        <p className='text-muted-foreground mt-2'>
          按类型/作用域/时间窗口管理费率，支持预览解析。
          <span className='text-destructive'>
            此处配置未接入实际扣费，仅存储与试算；实际提现费率在「币种管理」的链资产费率中配置。
          </span>
        </p>
      </div>
      <div className='flex items-center gap-2'>
        <Button variant='outline' onClick={onRefresh} disabled={loading} className='cursor-pointer'>
          <RefreshCw className={loading ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />
          刷新
        </Button>
        <Button variant='outline' onClick={onPreview} className='cursor-pointer'>
          <Calculator className='mr-2 h-4 w-4' />
          预览费率
        </Button>
        {canWrite && (
          <Button onClick={onCreate} className='cursor-pointer'>
            <Plus className='mr-2 h-4 w-4' />
            新增费率
          </Button>
        )}
      </div>
    </div>
  );
}
