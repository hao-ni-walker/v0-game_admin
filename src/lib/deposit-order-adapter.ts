// Adapter: backend /admin/deposit/records/{id} detail payload → admin-console
// DepositOrder shape. Status semantics mirror the list BFF's toStatusCode
// (deposit-orders route): broadcasting/confirming → 支付中, unknown/awaiting
// → 待支付, so the drawer badge always agrees with the list badge.

import type {
  DepositOrder,
  DepositOrderStatus,
  UserWallet,
} from '@/app/dashboard/funds/deposits/types';

function toIso(value: unknown): string {
  if (typeof value === 'number' && value > 0) {
    return new Date(value * 1000).toISOString();
  }
  if (typeof value === 'string' && value) {
    const ts = Date.parse(value);
    if (!Number.isNaN(ts)) return new Date(ts).toISOString();
  }
  return new Date().toISOString();
}

function mapStatus(status: string | null | undefined): DepositOrderStatus {
  switch ((status || '').toLowerCase()) {
    case 'completed':
    case 'confirmed':
    case 'success':
      return 'success';
    case 'failed':
      return 'failed';
    case 'expired':
    case 'timeout':
      return 'timeout';
    case 'broadcasting':
    case 'confirming':
      return 'processing';
    default:
      return 'pending';
  }
}

// Same channel-label collapsing as the list BFF's toChannelLabel: fiat rails
// (method fiat/paypal/apple pay, chain NULL) collapse to "Fiat"; crypto chains
// pass through.
function toChannelLabel(item: BackendDepositDetail): string {
  const method = String(item.method || '').toLowerCase();
  if (method === 'fiat' || method === 'paypal' || method === 'apple pay') {
    return 'Fiat';
  }
  if (item.chain) return String(item.chain);
  if (item.method) return String(item.method);
  if (item.asset) return String(item.asset);
  return 'TON';
}

export interface BackendDepositDetail {
  deposit_id: string | number;
  user_id: string | number;
  user_masked?: string;
  method?: string | null;
  chain?: string | null;
  asset?: string | null;
  amount: number;
  amount_usd?: number | null;
  received_amount?: number | null;
  status?: string | null;
  tx_hash?: string | null;
  external_tx_id?: string | null;
  platform_address?: string | null;
  memo?: string | null;
  sender_address?: string | null;
  credited?: boolean;
  credited_rate?: number | null;
  confirmations?: number;
  created_at: number | string;
  updated_at?: number | string | null;
  wallet?: {
    balance: number;
    frozen_balance: number;
    total_deposit?: number;
    total_withdraw?: number;
  } | null;
}

export function normalizeDepositOrder(
  item: BackendDepositDetail
): DepositOrder {
  const id = Number(item.deposit_id || 0);
  const status = mapStatus(item.status);
  const isCompleted = status === 'success';
  const createdAt = toIso(item.created_at);
  const updatedAt = toIso(item.updated_at || item.created_at);
  const amount = Number(item.amount_usd || item.amount || 0);

  return {
    id,
    // No synthetic prefix — the list BFF renders order_no as the bare id too.
    orderNo: String(id),
    // tx_hash is the human-readable on-chain hash; the opaque dedup key
    // (external_tx_id) backs the 链上凭证 block via remark, like the list.
    channelOrderNo: item.tx_hash || item.external_tx_id || null,
    userId: Number(item.user_id || 0),
    username: item.user_masked || undefined,
    paymentChannelId: 0,
    paymentChannelName: toChannelLabel(item),
    paymentChannelCode: item.method || undefined,
    amount,
    fee: 0,
    bonusAmount: 0,
    actualAmount: isCompleted ? amount : null,
    status,
    currency: 'USD',
    ipAddress: null,
    remark: item.tx_hash || item.external_tx_id || null,
    platformAddress: item.platform_address || null,
    createdAt,
    completedAt: isCompleted ? updatedAt : null,
    updatedAt,
  };
}

export function normalizeDepositWallet(
  item: BackendDepositDetail
): UserWallet | undefined {
  const wallet = item.wallet;
  if (!wallet) return undefined;
  const userId = Number(item.user_id || 0);
  return {
    id: userId,
    userId,
    balance: Number(wallet.balance || 0),
    frozenBalance: Number(wallet.frozen_balance || 0),
    bonusBalance: 0,
    totalDeposit: Number(wallet.total_deposit || 0),
    totalWithdraw: Number(wallet.total_withdraw || 0),
    currency: 'USD',
    status: 'active',
    createdAt: toIso(item.created_at),
    updatedAt: toIso(item.updated_at || item.created_at),
  };
}
