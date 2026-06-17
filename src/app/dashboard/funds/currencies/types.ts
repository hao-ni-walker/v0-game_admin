import type { Currency, CurrencyFormData, CurrencyUpdateData } from '@/service/api/currency';

export type { Currency, CurrencyFormData, CurrencyUpdateData };

export interface CurrencyFilters {
  search: string;
  is_tradeable: 'all' | 'true' | 'false';
}

export interface CurrencyComposeState {
  open: boolean;
  mode: 'create' | 'edit';
  editing: Currency | null;
}
