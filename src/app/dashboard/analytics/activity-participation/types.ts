import { DateRange } from 'react-day-picker';
import { UserActivityRecordFilters as ServiceFilters } from '@/service/api/user-activity-records';

export type { UserActivityRecord } from '@/service/api/user-activity-records';

export interface ActivityParticipationFilters
  extends Omit<ServiceFilters, 'start_time' | 'end_time'> {
  dateRange?: DateRange;
}
