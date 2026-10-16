import type { Currency, CurrencyFormData, CurrencySyncStatus, CurrencyUpdateData } from '@/service/api/currency';

export type { Currency, CurrencyFormData, CurrencySyncStatus, CurrencyUpdateData };

export interface CurrencyFilters {
  search: string;
  is_tradeable: 'all' | 'true' | 'false';
}

export interface CurrencyComposeState {
  open: boolean;
  mode: 'create' | 'edit';
  editing: Currency | null;
}
