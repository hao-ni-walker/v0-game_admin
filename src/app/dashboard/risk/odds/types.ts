import type { Currency } from '@/service/api/currency';
import type { OddsConfig, ResolvedPeriod, OddsUpsertData, OddsUpdateData } from '@/service/api/odds';

export type { Currency, OddsConfig, ResolvedPeriod, OddsUpsertData, OddsUpdateData };

export interface BaseEditState {
  open: boolean;
  period: string | null;
}

export interface WindowComposeState {
  open: boolean;
}
