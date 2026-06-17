'use client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Currency } from '../types';

interface Props {
  currencies: Currency[];
  active: Currency | null;
  onChange: (c: Currency) => void;
}

export function CurrencyTabs({ currencies, active, onChange }: Props) {
  if (currencies.length === 0) return null;
  return (
    <Tabs
      value={active?.symbol ?? ''}
      onValueChange={(v) => {
        const next = currencies.find((c) => c.symbol === v);
        if (next) onChange(next);
      }}
    >
      <TabsList>
        {currencies.map((c) => (
          <TabsTrigger key={c.id} value={c.symbol} className='cursor-pointer'>
            {c.code}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
