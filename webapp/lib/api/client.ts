import type { ApiErrorResponse, ApiResponse } from "./types";

export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type FetchOptions = RequestInit & {
  tenantSlug?: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiResponse<T> | ApiErrorResponse;

  if (!response.ok || !body.success) {
    const error = body.success
      ? { code: "HTTP_ERROR", message: response.statusText }
      : body.error;
    throw new ApiClientError(error.code, error.message, response.status);
  }

  return body.data;
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { tenantSlug, headers, ...rest } = options;

  const response = await fetch(`/api/v1${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(tenantSlug ? { "X-Tenant-Slug": tenantSlug } : {}),
      ...headers,
    },
  });

  return parseResponse<T>(response);
}

export async function apiFetchPaginated<T>(
  path: string,
  options: FetchOptions = {},
): Promise<{
  items: T[];
  meta: NonNullable<ApiResponse<T[]>["meta"]>;
}> {
  const { tenantSlug, headers, ...rest } = options;

  const response = await fetch(`/api/v1${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(tenantSlug ? { "X-Tenant-Slug": tenantSlug } : {}),
      ...headers,
    },
  });

  const body = (await response.json()) as ApiResponse<T[]> | ApiErrorResponse;

  if (!response.ok || !body.success) {
    const error = body.success
      ? { code: "HTTP_ERROR", message: response.statusText }
      : body.error;
    throw new ApiClientError(error.code, error.message, response.status);
  }

  return {
    items: body.data,
    meta: body.meta ?? {
      page: 1,
      limit: body.data.length,
      total: body.data.length,
    },
  };
}

export const api = {
  health: () => apiFetch<import("./types").HealthStatus>("/health"),
  getTenantBranding: (slug: string) =>
    apiFetch<import("./types").TenantBranding>(
      `/platform/tenants/${slug}/branding`,
      { tenantSlug: slug },
    ),
};

export { customersApi } from "./customers";
export { materialTypesApi } from "./material-types";
export { ordersApi } from "./orders";
export { vehiclesApi } from "./vehicles";
export { dispatchesApi } from "./dispatches";
export { paymentsApi } from "./payments";
export { dashboardApi } from "./dashboard";
export { inventoryApi } from "./inventory";
export { productionApi } from "./production";
export { reportsApi } from "./reports";
export { platformApi } from "./platform";
