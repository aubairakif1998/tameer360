import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_TOKEN_COOKIE,
  TENANT_SLUG_COOKIE,
} from '@/lib/auth/constants';

const BACKEND_URL =
  process.env.BACKEND_API_URL ?? 'http://localhost:4000/api/v1';

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
): Promise<NextResponse> {
  const path = pathSegments.join('/');
  const url = new URL(`${BACKEND_URL}/${path}`);

  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  const isPlatformRoute = path.startsWith('platform/');
  if (!isPlatformRoute) {
    const tenantSlug = request.cookies.get(TENANT_SLUG_COOKIE)?.value;
    if (tenantSlug) {
      headers.set('X-Tenant-Slug', tenantSlug);
    }
  }

  const auth =
    request.headers.get('authorization') ??
    (request.cookies.get(AUTH_TOKEN_COOKIE)?.value
      ? `Bearer ${request.cookies.get(AUTH_TOKEN_COOKIE)?.value}`
      : null);
  if (auth) {
    headers.set('Authorization', auth);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text();
  }

  const response = await fetch(url.toString(), init);
  const data = await response.text();

  return new NextResponse(data, {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}
