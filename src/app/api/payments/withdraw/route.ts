import { NextRequest, NextResponse } from 'next/server';
import { query, getRow } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { amount } = await req.json();

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const user = await getRow('SELECT wallet_balance FROM users WHERE id = ?', [auth.id]);
  if (!user || (user as any).wallet_balance < amount) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
  }

  await query('UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?', [amount, auth.id]);
  await query(
    'INSERT INTO payments (booking_id, user_id, amount, type, status) VALUES (?, ?, ?, ?, ?)',
    [0, auth.id, amount, 'withdrawal', 'completed']
  );

  return NextResponse.json({ success: true, message: 'Withdrawal completed' });
}
