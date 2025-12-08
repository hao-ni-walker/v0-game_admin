import { DateRange } from 'react-day-picker';

export interface DashboardFilter {
  dateRange: DateRange | undefined;
  games: string[];
  servers: string[];
  channels: string[];
  platforms: string[];
  userId: string;
  minAmount: string;
  maxAmount: string;
}

export interface FilterBarProps {
  filters: DashboardFilter;
  onFilterChange: (newFilters: DashboardFilter) => void;
  onSearch: () => void;
  onReset: () => void;
  loading?: boolean;
}
