'use client';

import * as React from 'react';
import { Download, Bell, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FilterBar } from './components/FilterBar';
import { KPICards } from './components/KPICards';
import { TrendChart } from './components/TrendChart';
import { BreakdownCharts } from './components/BreakdownCharts';
import { TransactionTable } from './components/TransactionTable';
import {
  revenueApi,
  RevenueSummary,
  TrendDataPoint,
  BreakdownItem,
  Transaction,
  BreakdownType
} from '@/service/api/revenue';
import { DashboardFilter } from '@/types/revenue-dashboard';
import { toast } from 'sonner';

export default function GameRevenueDashboardPage() {
  const [loading, setLoading] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState<Date>(new Date());

  // Filters
  const [filters, setFilters] = React.useState<DashboardFilter>({
    dateRange: {
      from: new Date(new Date().setDate(new Date().getDate() - 7)),
      to: new Date()
    },
    games: [],
    servers: [],
    channels: [],
    platforms: [],
    userId: '',
    minAmount: '',
    maxAmount: ''
  });

  // Data States
  const [summaryData, setSummaryData] = React.useState<RevenueSummary | null>(
    null
  );
  const [trendData, setTrendData] = React.useState<TrendDataPoint[]>([]);
  const [breakdownData, setBreakdownData] = React.useState<BreakdownItem[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [totalTransactions, setTotalTransactions] = React.useState(0);

  // View States
  const [trendPeriod, setTrendPeriod] = React.useState<'hour' | 'day' | 'week'>(
    'day'
  );
  const [breakdownType, setBreakdownType] =
    React.useState<BreakdownType>('game');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [txQuickFilter, setTxQuickFilter] = React.useState({
    bizType: 'all',
    onlyLarge: false,
    onlyFailed: false
  });

  // Fetch Data
  const fetchData = React.useCallback(
    async (isFullReload = false) => {
      setLoading(true);
      try {
        // In a real app, we would pass filters to these API calls
        const [summary, trend, breakdown, txResult] = await Promise.all([
          revenueApi.getSummary(),
          revenueApi.getTrend(trendPeriod),
          revenueApi.getBreakdown(breakdownType),
          revenueApi.getTransactions({ page, pageSize, ...txQuickFilter })
        ]);

        setSummaryData(summary);
        setTrendData(trend);
        setBreakdownData(breakdown);
        setTransactions(txResult.data);
        setTotalTransactions(txResult.total);
        setLastUpdated(new Date());

        if (isFullReload) {
          toast.success('Dashboard updated');
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    },
    [trendPeriod, breakdownType, page, pageSize, txQuickFilter]
  );

  // Initial Load
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleFilterSearch = () => {
    setPage(1); // Reset to first page on new search
    fetchData(true);
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: {
        from: new Date(new Date().setDate(new Date().getDate() - 7)),
        to: new Date()
      },
      games: [],
      servers: [],
      channels: [],
      platforms: [],
      userId: '',
      minAmount: '',
      maxAmount: ''
    });
    // Optional: Auto search on reset or wait for user to click Apply
    // fetchData();
  };

  const handleExport = () => {
    toast.success(
      'Export started. You will receive a notification when ready.'
    );
  };

  return (
    <div className='flex h-full flex-col space-y-6 p-4 pt-6 md:p-8'>
      {/* 1. Header Area */}
      <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>
            Game Revenue Dashboard
          </h2>
          <p className='text-muted-foreground'>
            Overview of game performance and revenue streams.
            <span className='ml-2 text-xs'>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={handleExport}>
            <Download className='mr-2 h-4 w-4' />
            Export View
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => toast.info('Subscribed to daily report')}
          >
            <Mail className='mr-2 h-4 w-4' />
            Subscribe
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => toast.info('Alert config opened')}
          >
            <Bell className='mr-2 h-4 w-4' />
            Alerts
          </Button>
        </div>
      </div>

      <Separator />

      {/* 2. Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        onSearch={handleFilterSearch}
        onReset={handleResetFilters}
        loading={loading}
      />

      {/* 3. KPI Cards */}
      <KPICards data={summaryData} loading={loading} />

      {/* 4. Charts Section */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-6'>
        {/* Trend Chart (Left 4/6) */}
        <TrendChart
          data={trendData}
          loading={loading}
          period={trendPeriod}
          onPeriodChange={setTrendPeriod}
        />

        {/* Breakdown Chart (Right 2/6) */}
        <BreakdownCharts
          data={breakdownData}
          loading={loading}
          activeTab={breakdownType}
          onTabChange={setBreakdownType}
          onItemClick={(item) => {
            // Example of drill-down or filter update
            toast.message(`Selected ${item.name}`, {
              description: 'Applying filter...'
            });
            // In real app, update filters.games or filters.channels here
          }}
        />
      </div>

      {/* 5. Transaction Table */}
      <div className='space-y-2'>
        <h3 className='text-lg font-semibold tracking-tight'>
          Transaction Details
        </h3>
        <TransactionTable
          data={transactions}
          total={totalTransactions}
          loading={loading}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          quickFilter={txQuickFilter}
          onQuickFilterChange={(k, v) =>
            setTxQuickFilter((prev) => ({ ...prev, [k]: v }))
          }
        />
      </div>
    </div>
  );
}
