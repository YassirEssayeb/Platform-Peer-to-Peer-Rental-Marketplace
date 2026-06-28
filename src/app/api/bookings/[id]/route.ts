import { NextRequest, NextResponse } from 'next/server';
import { query, getRow } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const booking = await getRow(
    `SELECT b.*, p.name as product_name, p.images, p.daily_price, p.description,
     renter.name as renter_name, renter.email as renter_email, renter.phone as renter_phone,
     owner.name as owner_name, owner.email as owner_email, owner.phone as owner_phone
     FROM bookings b
     JOIN products p ON b.product_id = p.id
     JOIN users renter ON b.renter_id = renter.id
     JOIN users owner ON b.owner_id = owner.id
     WHERE b.id = ?`,
    [id]
  );

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  const b = booking as any;
  if (b.renter_id !== auth.id && b.owner_id !== auth.id && auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ booking });
}
