import type { Currency } from '@/service/api/currency';
import type { FeeConfig, FeeCreateData, FeeUpdateData, FeePreviewResult, FeeType, FeeScope } from '@/service/api/fee';

export type { Currency, FeeConfig, FeeCreateData, FeeUpdateData, FeePreviewResult, FeeType, FeeScope };

export interface FeeComposeState {
  open: boolean;
  mode: 'create' | 'edit';
  editing: FeeConfig | null;
}

export interface FeePreviewState {
  open: boolean;
}
