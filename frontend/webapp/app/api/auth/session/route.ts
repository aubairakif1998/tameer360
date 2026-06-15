import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_TOKEN_COOKIE } from '@/lib/auth/constants';
import type { AuthUser } from '@/lib/auth/types';

const BACKEND_URL =
  process.env.BACKEND_API_URL ?? 'http://localhost:4000/api/v1';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({
      success: true,
      data: { user: null },
    });
  }

  const response = await fetch(`${BACKEND_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  const payload = await response.json();

  if (!response.ok || !payload.success) {
    return NextResponse.json({
      success: true,
      data: { user: null },
    });
  }

  return NextResponse.json({
    success: true,
    data: { user: payload.data as AuthUser },
  });
}
