export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export function successResponse<T>(
  data: T,
  meta?: PaginationMeta,
): ApiResponse<T> {
  return meta ? { success: true, data, meta } : { success: true, data };
}
