// Adapter: backend /admin/withdraw/{id} detail payload → admin-console
// WithdrawOrder shape. Shared by the withdraw-orders proxy routes so the
// detail drawer and the post-audit response render the same fields.

import type {
  UserWallet,
  WithdrawOrder,
} from '@/app/dashboard/funds/withdrawals/types';

type OrderStatus = WithdrawOrder['status'];
type AuditStatus = NonNullable<WithdrawOrder['auditStatus']>;
type PayoutStatus = NonNullable<WithdrawOrder['payoutStatus']>;

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

// Backend withdrawal state machine: validating → pending_confirm → processing
// → broadcasting → completed / failed / pending_review (plus rejected from the
// review console). The console's own states are audit-centric; auto-payout
// mid-flight rows all map to 出款中.
function mapOrderStatus(status: string | null | undefined): OrderStatus {
  switch ((status || '').toLowerCase()) {
    case 'validating':
    case 'pending_review':
      return 'pending_audit';
    case 'processing':
      return 'audit_passed';
    case 'broadcasting':
      return 'payout_processing';
    case 'completed':
      return 'success';
    case 'rejected':
      return 'rejected';
    case 'failed':
      return 'failed';
    default:
      return 'payout_processing';
  }
}

function mapAuditStatus(
  status: string | null | undefined,
  reviewedBy: string | null | undefined
): AuditStatus {
  if (!reviewedBy) return 'pending';
  return (status || '').toLowerCase() === 'rejected' ? 'rejected' : 'approved';
}

function mapPayoutStatus(status: string | null | undefined): PayoutStatus {
  switch ((status || '').toLowerCase()) {
    case 'completed':
      return 'success';
    case 'rejected':
    case 'failed':
      return 'failed';
    case 'pending_review':
      return 'pending';
    default:
      return 'processing';
  }
}

export interface BackendWithdrawDetail {
  withdraw_id: string | number;
  user_id: string | number;
  user_masked?: string;
  asset?: string | null;
  chain?: string | null;
  amount_usd: number;
  fee?: number | null;
  arrival_amount?: number | null;
  arrival_amount_asset?: number | null;
  to_address?: string | null;
  status?: string | null;
  tx_hash?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: number | string | null;
  review_reason?: string | null;
  created_at: number | string;
  updated_at?: number | string | null;
  wallet?: {
    balance: number;
    frozen_balance: number;
    withdrawable?: number;
    total_deposit?: number;
    total_withdraw?: number;
  } | null;
}

export function normalizeWithdrawOrder(
  item: BackendWithdrawDetail
): WithdrawOrder {
  const id = Number(item.withdraw_id || 0);
  const status = item.status || '';
  const isCompleted = status.toLowerCase() === 'completed';
  const channelName = [item.asset || 'USDT', item.chain]
    .filter(Boolean)
    .join(' · ');
  const createdAt = toIso(item.created_at);
  const updatedAt = toIso(item.updated_at || item.created_at);

  return {
    id,
    orderNo: `WD${id}`,
    channelOrderNo: item.tx_hash || null,
    userId: Number(item.user_id || 0),
    username: item.user_masked || undefined,
    paymentChannelId: 0,
    paymentChannelName: channelName,
    paymentChannelCode: item.asset || 'USDT',
    channelType: 'usdt',
    amount: Number(item.amount_usd || 0),
    fee: Number(item.fee || 0),
    actualAmount:
      item.arrival_amount_asset !== null && item.arrival_amount_asset !== undefined
        ? Number(item.arrival_amount_asset)
        : item.arrival_amount !== null && item.arrival_amount !== undefined
          ? Number(item.arrival_amount)
        : null,
    status: mapOrderStatus(status),
    currency: item.asset || 'USDT',
    accountNumber: item.to_address || '',
    auditStatus: mapAuditStatus(status, item.reviewed_by),
    auditorName: item.reviewed_by || null,
    auditAt: item.reviewed_at ? toIso(item.reviewed_at) : null,
    auditRemark: item.review_reason || null,
    payoutStatus: mapPayoutStatus(status),
    // Manual-first payout policy: everything passing the review console is
    // paid by hand, auto rows never reach it.
    payoutMethod: 'manual',
    payoutAt: isCompleted ? updatedAt : null,
    ipAddress: null,
    remark: item.review_reason || null,
    createdAt,
    completedAt: isCompleted ? updatedAt : null,
    updatedAt,
  };
}

export function normalizeWithdrawWallet(
  item: BackendWithdrawDetail
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
    withdrawable: Number(wallet.withdrawable ?? wallet.balance ?? 0),
    totalDeposit: Number(wallet.total_deposit || 0),
    totalWithdraw: Number(wallet.total_withdraw || 0),
    currency: item.asset || 'USDT',
    status: 'active',
    createdAt: toIso(item.created_at),
    updatedAt: toIso(item.updated_at || item.created_at),
  };
}
