import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_TOKEN_COOKIE,
  TENANT_SLUG_COOKIE,
} from '@/lib/auth/constants';

const BACKEND_URL =
  process.env.BACKEND_API_URL ?? 'http://localhost:4000/api/v1';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const response = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = await response.json();

  if (!response.ok || !payload.success) {
    return NextResponse.json(payload, { status: response.status });
  }

  const { accessToken, user } = payload.data as {
    accessToken: string;
    user: { tenantSlug: string | null; role: string };
  };

  const res = NextResponse.json({ success: true, data: { user } });
  res.cookies.set(AUTH_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  if (user.tenantSlug) {
    res.cookies.set(TENANT_SLUG_COOKIE, user.tenantSlug, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  } else {
    res.cookies.delete(TENANT_SLUG_COOKIE);
  }

  return res;
}
