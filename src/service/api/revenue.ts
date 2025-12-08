import { faker } from '@faker-js/faker';

// --- Types ---

export interface RevenueSummary {
  gmv: number;
  gmvChange: number; // Percentage, e.g., 0.12 for +12%
  payingUsers: number;
  payingUsersChange: number;
  newPayingUsers: number;
  newPayingUsersChange: number;
  returningPayingUsers: number;
  returningPayingUsersChange: number;
  arppu: number;
  arppuChange: number;
  topPlayerRevenue: number;
  topPlayerChange: number;
}

export interface TrendDataPoint {
  time: string;
  gmv: number;
  orders: number;
  payingUsers: number;
}

export interface BreakdownItem {
  id: string;
  name: string;
  gmv: number;
  orders: number;
  payingUsers: number;
  percentage: number;
}

export type BreakdownType = 'game' | 'server' | 'channel' | 'payTier';

export interface Transaction {
  id: string;
  recordId: string;
  orderId?: string;
  userId: string;
  game?: string;
  server?: string;
  channel: string;
  bizType: 'recharge' | 'withdraw' | 'wallet';
  transactionType?: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'processing';
  createTime: string;
  completeTime?: string;
}

export interface TransactionParams {
  page: number;
  pageSize: number;
  bizType?: string;
  status?: string;
  channel?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

// --- Mock Data Generators ---

const generateTrendData = (
  period: 'hour' | 'day' | 'week'
): TrendDataPoint[] => {
  const points = period === 'hour' ? 24 : period === 'day' ? 30 : 12;
  const data: TrendDataPoint[] = [];
  const now = new Date();

  for (let i = 0; i < points; i++) {
    let timeLabel = '';
    if (period === 'hour') {
      const d = new Date(now);
      d.setHours(d.getHours() - (points - 1 - i));
      timeLabel = `${d.getHours()}:00`;
    } else if (period === 'day') {
      const d = new Date(now);
      d.setDate(d.getDate() - (points - 1 - i));
      timeLabel = d.toISOString().split('T')[0];
    } else {
      timeLabel = `Week ${i + 1}`;
    }

    data.push({
      time: timeLabel,
      gmv: faker.number.int({ min: 1000, max: 50000 }),
      orders: faker.number.int({ min: 10, max: 500 }),
      payingUsers: faker.number.int({ min: 5, max: 300 })
    });
  }
  return data;
};

const generateBreakdownData = (type: BreakdownType): BreakdownItem[] => {
  const count = type === 'payTier' ? 5 : 10;
  const items: BreakdownItem[] = [];
  let totalGmv = 0;

  for (let i = 0; i < count; i++) {
    const gmv = faker.number.int({ min: 1000, max: 100000 });
    totalGmv += gmv;
    items.push({
      id: faker.string.uuid(),
      name:
        type === 'game'
          ? `Game ${String.fromCharCode(65 + i)}`
          : type === 'server'
            ? `Server ${i + 1}`
            : type === 'channel'
              ? `Channel ${i + 1}`
              : `Tier ${i + 1}`,
      gmv,
      orders: faker.number.int({ min: 10, max: 1000 }),
      payingUsers: faker.number.int({ min: 5, max: 500 }),
      percentage: 0
    });
  }

  items.forEach((item) => {
    item.percentage = Number((item.gmv / totalGmv).toFixed(4));
  });

  return items.sort((a, b) => b.gmv - a.gmv);
};

const generateTransactions = (count: number): Transaction[] => {
  const transactions: Transaction[] = [];
  const bizTypes: ('recharge' | 'withdraw' | 'wallet')[] = [
    'recharge',
    'withdraw',
    'wallet'
  ];
  const statuses: ('success' | 'failed' | 'processing')[] = [
    'success',
    'failed',
    'processing'
  ];

  for (let i = 0; i < count; i++) {
    const bizType = faker.helpers.arrayElement(bizTypes);
    transactions.push({
      id: faker.string.uuid(),
      recordId: faker.string.alphanumeric(10),
      orderId: bizType !== 'wallet' ? faker.string.numeric(12) : undefined,
      userId: faker.string.numeric(8),
      game: faker.datatype.boolean()
        ? `Game ${faker.string.alpha(1).toUpperCase()}`
        : undefined,
      server: faker.datatype.boolean()
        ? `S${faker.number.int({ min: 1, max: 100 })}`
        : undefined,
      channel: `Channel ${faker.number.int({ min: 1, max: 5 })}`,
      bizType,
      transactionType:
        bizType === 'wallet'
          ? faker.helpers.arrayElement(['bet', 'win', 'deposit'])
          : undefined,
      amount: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
      currency: 'USD',
      status: faker.helpers.arrayElement(statuses),
      createTime: faker.date.recent().toISOString(),
      completeTime: faker.date.recent().toISOString()
    });
  }
  return transactions;
};

// --- API Service ---

export const revenueApi = {
  getSummary: async (): Promise<RevenueSummary> => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate latency
    return {
      gmv: faker.number.int({ min: 100000, max: 500000 }),
      gmvChange: faker.number.float({ min: -0.2, max: 0.2, fractionDigits: 2 }),
      payingUsers: faker.number.int({ min: 1000, max: 5000 }),
      payingUsersChange: faker.number.float({
        min: -0.2,
        max: 0.2,
        fractionDigits: 2
      }),
      newPayingUsers: faker.number.int({ min: 100, max: 500 }),
      newPayingUsersChange: faker.number.float({
        min: -0.2,
        max: 0.2,
        fractionDigits: 2
      }),
      returningPayingUsers: faker.number.int({ min: 900, max: 4500 }),
      returningPayingUsersChange: faker.number.float({
        min: -0.2,
        max: 0.2,
        fractionDigits: 2
      }),
      arppu: faker.number.float({ min: 20, max: 100, fractionDigits: 2 }),
      arppuChange: faker.number.float({
        min: -0.2,
        max: 0.2,
        fractionDigits: 2
      }),
      topPlayerRevenue: faker.number.float({
        min: 500,
        max: 5000,
        fractionDigits: 2
      }),
      topPlayerChange: faker.number.float({
        min: -0.2,
        max: 0.2,
        fractionDigits: 2
      })
    };
  },

  getTrend: async (
    period: 'hour' | 'day' | 'week' = 'day'
  ): Promise<TrendDataPoint[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return generateTrendData(period);
  },

  getBreakdown: async (type: BreakdownType): Promise<BreakdownItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return generateBreakdownData(type);
  },

  getTransactions: async (
    params: TransactionParams
  ): Promise<{ data: Transaction[]; total: number }> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      data: generateTransactions(params.pageSize),
      total: 1000 // Mock total
    };
  },

  getTransactionDetail: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      id,
      fee: faker.number.float({ min: 0.1, max: 5 }),
      bonus_amount: faker.number.float({ min: 0, max: 10 }),
      ip: faker.internet.ipv4(),
      device: faker.internet.userAgent(),
      remark: faker.lorem.sentence()
    };
  }
};
