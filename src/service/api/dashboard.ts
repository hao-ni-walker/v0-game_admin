import { apiRequest } from './base';

// 后端 /dashboard/metrics 原始结构
interface DashboardMetricsRaw {
  server_time: number;
  risk: {
    net_exposure_total: number;
    net_exposure_by_period: Record<string, number>;
    risk_level: string;
    max_payout_pressure: number;
  };
  business: {
    today_volume: number;
    today_profit: number;
    today_orders: number;
    pending_orders: number;
    online_users: number;
  };
  pool: {
    balance: number;
    pool_level: string;
    frozen_amount: number;
    available_amount: number;
  };
  alerts: Array<{ level: string; type?: string; message: string; timestamp?: string }>;
}

export interface DashboardAlert {
  type: 'red' | 'orange' | 'yellow' | 'blue';
  message: string;
  timestamp: string;
}

export interface DashboardOrderFlow {
  id: string;
  userId: string;
  direction: 'up' | 'down';
  period: string;
  amount: number;
  time: string;
}

// 仪表板相关 API
export class DashboardAPI {
  // 获取仪表板统计数据（本地 BFF）
  static async getStats() {
    return apiRequest('/dashboard/stats');
  }

  // 获取实时核心指标 + 预警（后端 /dashboard/metrics）
  static async getMetrics(): Promise<{
    success: boolean;
    data?: {
      netRiskExposure: number;
      todayVolume: number;
      todayProfit: number;
      onlineUsers: number;
      pendingOrders: number;
      fundPoolBalance: number;
      riskLevel: string;
      maxPayoutPressure: number;
    };
    alerts: DashboardAlert[];
    message?: string;
  }> {
    const res = await apiRequest<DashboardMetricsRaw>('/admin/dashboard/metrics');
    if (!res.success || !res.data) {
      return { success: false, alerts: [], message: res.message || '获取仪表盘数据失败' };
    }
    const r = res.data;
    const levelMap: Record<string, DashboardAlert['type']> = {
      red: 'red', critical: 'red', high: 'red',
      orange: 'orange', warn: 'orange',
      yellow: 'yellow', warning: 'yellow',
      blue: 'blue', info: 'blue',
    };
    const alerts: DashboardAlert[] = (r.alerts || []).map((a) => ({
      type: levelMap[a.level] || levelMap[a.type || ''] || 'blue',
      message: a.message,
      timestamp: a.timestamp || new Date().toLocaleString(),
    }));
    return {
      success: true,
      data: {
        netRiskExposure: r.risk?.net_exposure_total ?? 0,
        todayVolume: r.business?.today_volume ?? 0,
        todayProfit: r.business?.today_profit ?? 0,
        onlineUsers: r.business?.online_users ?? 0,
        pendingOrders: r.business?.pending_orders ?? 0,
        fundPoolBalance: r.pool?.balance ?? 0,
        riskLevel: r.risk?.risk_level ?? 'normal',
        maxPayoutPressure: r.risk?.max_payout_pressure ?? 0,
      },
      alerts,
    };
  }

  // 获取实时订单流（后端 /dashboard/order-stream）
  static async getOrderStream(limit = 20): Promise<{
    success: boolean;
    data?: DashboardOrderFlow[];
    message?: string;
  }> {
    const res = await apiRequest<{ orders: Array<{
      order_id: string;
      user_id_masked: string;
      period: string;
      direction: string;
      amount: number;
      created_at: number;
    }> }>(`/admin/dashboard/order-stream?limit=${limit}`);
    if (!res.success || !res.data) {
      return { success: false, message: res.message || '获取订单流失败' };
    }
    const orders = (res.data.orders || []).map((o) => ({
      id: o.order_id,
      userId: o.user_id_masked,
      direction: (o.direction === 'up' ? 'up' : 'down') as 'up' | 'down',
      period: o.period,
      amount: Number(o.amount) || 0,
      time: o.created_at ? new Date(o.created_at * 1000).toLocaleTimeString() : '',
    }));
    return { success: true, data: orders };
  }
}

