export interface Role {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  userCount?: number;
}

export interface Permission {
  id: number;
  name: string;
  code: string;
  description?: string;
  parentId?: number;
  sortOrder?: number;
}

export interface FilterParams {
  name?: string;
  dateRange?: { from: Date; to: Date } | undefined;
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FormData {
  name: string;
  description: string;
}
