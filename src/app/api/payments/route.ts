import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payments = await query(
    `SELECT p.*, b.product_id, b.start_date, b.end_date
     FROM payments p
     LEFT JOIN bookings b ON p.booking_id = b.id
     WHERE p.user_id = ?
     ORDER BY p.created_at DESC`,
    [auth.id]
  );

  return NextResponse.json({ payments });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { amount } = await req.json();

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  await query(
    'INSERT INTO payments (booking_id, user_id, amount, type, status) VALUES (?, ?, ?, ?, ?)',
    [0, auth.id, amount, 'deposit', 'completed']
  );
  await query('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?', [amount, auth.id]);

  return NextResponse.json({ success: true, message: 'Payment simulation completed' });
}
