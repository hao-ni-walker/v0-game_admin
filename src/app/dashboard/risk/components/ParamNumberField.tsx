'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ParamNumberFieldProps {
  label: string;
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  min?: number;
  suffix?: string;
}

export function ParamNumberField({
  label,
  value,
  onChange,
  disabled,
  min = 0,
  suffix,
}: ParamNumberFieldProps) {
  return (
    <div className='flex flex-col gap-1.5'>
      {label && <Label className='text-xs text-muted-foreground'>{label}</Label>}
      <div className='flex items-center gap-1'>
        <Input
          type='number'
          inputMode='decimal'
          min={min}
          value={Number.isFinite(value) ? value : ''}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className='w-32'
        />
        {suffix && <span className='text-xs text-muted-foreground'>{suffix}</span>}
      </div>
    </div>
  );
}
