'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';

interface SaveBarProps {
  reason: string;
  onReasonChange: (next: string) => void;
  onSave: () => void;
  saving: boolean;
  dirty: boolean;
  canWrite: boolean;
}

export function SaveBar({
  reason,
  onReasonChange,
  onSave,
  saving,
  dirty,
  canWrite,
}: SaveBarProps) {
  const disabled = !canWrite || !dirty || reason.trim().length === 0 || saving;
  return (
    <div className='flex items-center gap-2'>
      <Input
        placeholder='修改原因（必填，记入审计）'
        value={reason}
        onChange={(e) => onReasonChange(e.target.value)}
        disabled={!canWrite || saving}
        className='w-72'
      />
      <Button onClick={onSave} disabled={disabled}>
        <Save className='mr-2 h-4 w-4' />
        {saving ? '保存中…' : '保存'}
      </Button>
    </div>
  );
}
