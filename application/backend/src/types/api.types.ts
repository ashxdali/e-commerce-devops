export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  [key: string]: unknown;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: ApiErrorDetail[] | Record<string, unknown>;
  stack?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T = unknown> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}
