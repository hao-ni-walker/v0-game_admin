import type { DateRange } from 'react-day-picker';

/**
 * 盈亏报表项接口
 */
export interface OperationReportItem {
  stat_date: string; // 统计时间
  order_count: number; // 交易笔数
  active_user_count: number; // 活跃交易用户
  register_count: number; // 新注册用户
  total_bet: string; // 总下注
  total_payout: string; // 总赔付
  platform_income: string; // 平台盈利
  deposit_amount: string; // 充值金额
  withdraw_amount: string; // 提现金额
  net_cashflow: string; // 净现金流
}

/**
 * 运营报表筛选条件
 */
export interface OperationReportFilters {
  start_date?: string; // 开始日期
  end_date?: string; // 结束日期
  dateRange?: DateRange | undefined; // 日期范围
}

/**
 * 运营报表响应数据
 */
export interface OperationReportResponse {
  items: OperationReportItem[];
  total: number;
  summary: any | null;
}
