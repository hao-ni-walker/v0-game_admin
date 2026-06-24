// 导出通用 API 工具
export { apiRequest, buildSearchParams } from './api/base';

// 导出所有 API 类
export { AuthAPI } from './api/auth';
export { UserAPI } from './api/user';
export { RoleAPI } from './api/role';
export { PermissionAPI } from './api/permission';
export { DashboardAPI } from './api/dashboard';
export { LogAPI, OperationLogAPI } from './api/log';
export { SystemConfigAPI } from './api/system-config';
export { MessageAPI } from './api/message';
export { BroadcastAPI } from './api/broadcast';
export type { BroadcastFormData, BroadcastCreateResult, BroadcastApproveResult } from './api/broadcast';
export { CurrencyAPI } from './api/currency';
export type { Currency, CurrencyListResult, CurrencyFormData, CurrencyUpdateData } from './api/currency';
export { OddsAPI } from './api/odds';
export type { OddsConfig, OddsConfigListResult, ResolvedPeriod, ResolvedOddsResult, OddsUpsertData, OddsUpdateData } from './api/odds';
export { FeeAPI } from './api/fee';
export type { FeeConfig, FeeConfigListResult, FeeCreateData, FeeUpdateData, FeePreviewResult, FeeType, FeeScope } from './api/fee';
export { RiskParamAPI } from './api/risk-params';
export type { RiskParamItem, RiskParamListResult, RiskParamUpsertData } from './api/risk-params';
export { SettlementAPI } from './api/settlement';
export type { SettlementRecord, SettlementRecordsResult, SettlementAuditRecord, SettlementAuditResult } from './api/settlement';
export { FundPoolAPI } from './api/fund-pool';
export type { FundPoolStatus } from './api/fund-pool';
export { MarketControlAPI } from './api/market-control';
export type { RiskStatus, PeriodRiskStatus, RiskEventItem, RiskEventsResult } from './api/market-control';
export { TradeObservabilityAPI } from './api/trade-observability';
export type {
  TradeFailureItem,
  TradeFailuresResult,
  TradeFailureQuery,
  TradeOrderItem,
  TradeOrdersResult,
  TradeOrderQuery
} from './api/trade-observability';
