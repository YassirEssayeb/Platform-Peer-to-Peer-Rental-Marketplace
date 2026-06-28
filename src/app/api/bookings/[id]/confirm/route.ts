import { NextRequest, NextResponse } from 'next/server';
import { query, getRow } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { action } = await req.json();

  const booking = await getRow('SELECT * FROM bookings WHERE id = ?', [id]);
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  const b = booking as any;

  if (b.owner_id !== auth.id && auth.role !== 'admin') {
    return NextResponse.json({ error: 'Only the owner can confirm/reject bookings' }, { status: 403 });
  }

  if (b.status !== 'pending') {
    return NextResponse.json({ error: 'Booking is already ' + b.status }, { status: 400 });
  }

  if (action === 'approve') {
    await query('UPDATE bookings SET status = ? WHERE id = ?', ['approved', id]);
    return NextResponse.json({ success: true, message: 'Booking approved' });
  } else if (action === 'reject') {
    await query('UPDATE bookings SET status = ? WHERE id = ?', ['rejected', id]);
    return NextResponse.json({ success: true, message: 'Booking rejected' });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
