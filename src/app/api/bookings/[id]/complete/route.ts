import { NextRequest, NextResponse } from 'next/server';
import { query, getRow } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const booking = await getRow('SELECT * FROM bookings WHERE id = ?', [id]);
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  const b = booking as any;

  if (b.renter_id !== auth.id && auth.role !== 'admin') {
    return NextResponse.json({ error: 'Only the renter can mark as completed' }, { status: 403 });
  }

  if (b.status !== 'approved') {
    return NextResponse.json({ error: 'Booking must be approved first' }, { status: 400 });
  }

  await query('UPDATE bookings SET status = ? WHERE id = ?', ['completed', id]);

  const product = await getRow('SELECT * FROM products WHERE id = ?', [b.product_id]);
  const ownerPayout = b.total_cost - b.commission;
  const depositReturn = parseFloat((product as any).security_deposit) || 0;

  await query(
    'INSERT INTO payments (booking_id, user_id, amount, type, status) VALUES (?, ?, ?, ?, ?)',
    [id, b.renter_id, b.total_cost, 'rental', 'completed']
  );
  await query(
    'INSERT INTO payments (booking_id, user_id, amount, type, status) VALUES (?, ?, ?, ?, ?)',
    [id, b.owner_id, ownerPayout, 'rental', 'completed']
  );
  await query(
    'INSERT INTO payments (booking_id, user_id, amount, type, status) VALUES (?, ?, ?, ?, ?)',
    [id, 1, b.commission, 'commission', 'completed']
  );

  await query('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?', [ownerPayout, b.owner_id]);

  return NextResponse.json({ success: true, message: 'Rental completed successfully' });
}
