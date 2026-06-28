import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getRow } from '@/lib/db';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await getRow(
    'SELECT id, name, email, role, city, avatar, wallet_balance FROM users WHERE id = ? AND is_active = 1',
    [auth.id]
  );

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}
