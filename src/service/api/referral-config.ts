import { apiRequest } from './base';

export interface ReferralRewardConfig {
  commission_rate: number;
  reward_share_rate: number;
  effective_reward_rate: number;
}

export class ReferralConfigAPI {
  static get() {
    return apiRequest<ReferralRewardConfig>('/admin/referral-config');
  }

  static update(data: { commission_rate: number; reason: string }) {
    return apiRequest<ReferralRewardConfig>('/admin/referral-config', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
}
