import type { DateRange } from 'react-day-picker';

/**
 * 运营报表项接口
 */
export interface OperationReportItem {
  stat_date: string; // 统计时间
  visit_count: number; // 访问人数
  register_count: number; // 注册人数
  new_user_paid_conversion_rate: string | null; // 新用户付费转化率
  new_user_deposit_amount: string; // 新用户充值金额
  new_user_deposit_count: number; // 新用户充值人数
  first_deposit_amount: string; // 首充金额
  first_deposit_count: number; // 首充人数
  first_deposit_user_amount: string; // 首充用户充值金额
  deposit_amount: string; // 充值金额
  deposit_count: number; // 充值人数
  deposit_order_count: number; // 充值笔数
  arpu_first_deposit: string | null; // ARPU（首充用户）
  arpu: string | null; // ARPU
  withdraw_amount: string; // 提现金额
  withdraw_count: number; // 提现人数
  total_revenue: string; // 总营收
  profit_ratio: string | null; // 收益比
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
