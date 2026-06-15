import { NextResponse } from 'next/server';
import {
  AUTH_TOKEN_COOKIE,
  TENANT_SLUG_COOKIE,
} from '@/lib/auth/constants';

export async function POST() {
  const res = NextResponse.json({ success: true, data: null });
  res.cookies.delete(AUTH_TOKEN_COOKIE);
  res.cookies.delete(TENANT_SLUG_COOKIE);
  return res;
}
