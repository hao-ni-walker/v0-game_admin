'use client';
import { useEffect, useMemo, useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Currency } from '../types';

interface Props {
  currencies: Currency[];
  active: Currency | null;
  onChange: (c: Currency) => void;
}

/** 441 个币种塞 tabs 会溢出不可点：在架币种保留可换行快捷 chips（日常操作集），
 *  全量币种改走可搜索下拉。 */
export function CurrencyTabs({ currencies, active, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const tradeable = useMemo(
    () => currencies.filter((c) => c.is_tradeable),
    [currencies]
  );

  // 选中的币被下架/删除后自动回落到第一个在架币
  useEffect(() => {
    if ((!active || !currencies.some((c) => c.id === active.id)) && tradeable.length > 0) {
      onChange(tradeable[0]);
    }
  }, [active, currencies, tradeable, onChange]);

  if (currencies.length === 0) return null;

  return (
    <div className='space-y-2'>
      {tradeable.length > 0 && (
        <div className='flex flex-wrap gap-1.5'>
          {tradeable.map((c) => {
            const isActive = active?.id === c.id;
            return (
              <button
                key={c.id}
                type='button'
                onClick={() => onChange(c)}
                aria-pressed={isActive}
                className={cn(
                  'cursor-pointer rounded-md border px-2.5 py-1 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input bg-background hover:bg-muted text-muted-foreground'
                )}
              >
                {c.code}
              </button>
            );
          })}
        </div>
      )}

      <div className='flex items-center gap-2'>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              role='combobox'
              aria-expanded={open}
              className='w-72 cursor-pointer justify-between'
            >
              <span className='truncate'>
                {active ? `${active.code} · ${active.name}` : '选择币种'}
              </span>
              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-80 p-0' align='start'>
            <Command>
              <CommandInput placeholder='搜索代码 / 名称…' />
              <CommandList>
                <CommandEmpty>无匹配币种</CommandEmpty>
                <CommandGroup heading='在架'>
                  {tradeable.map((c) => (
                    <CurrencyOption
                      key={c.id}
                      currency={c}
                      selected={active?.id === c.id}
                      onSelect={() => {
                        onChange(c);
                        setOpen(false);
                      }}
                    />
                  ))}
                </CommandGroup>
                <CommandGroup heading='未上架 / 候选'>
                  {currencies
                    .filter((c) => !c.is_tradeable)
                    .map((c) => (
                      <CurrencyOption
                        key={c.id}
                        currency={c}
                        selected={active?.id === c.id}
                        onSelect={() => {
                          onChange(c);
                          setOpen(false);
                        }}
                      />
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {active && (
          <Badge variant={active.is_tradeable ? 'default' : 'secondary'}>
            {active.is_tradeable ? '在架' : '候选'}
          </Badge>
        )}
        <span className='text-muted-foreground text-xs'>
          共 {currencies.length} 个币种（在架 {tradeable.length}）
        </span>
      </div>
    </div>
  );
}

function CurrencyOption({
  currency,
  selected,
  onSelect,
}: {
  currency: Currency;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <CommandItem
      value={`${currency.code} ${currency.name} ${currency.symbol}`}
      onSelect={onSelect}
      className={cn('cursor-pointer', selected && 'bg-accent')}
    >
      <span className='w-16 shrink-0 text-sm font-semibold'>{currency.code}</span>
      <span className='text-muted-foreground truncate text-xs'>{currency.name}</span>
      {selected && <Badge variant='outline' className='ml-auto text-[10px]'>当前</Badge>}
    </CommandItem>
  );
}
