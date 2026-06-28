import { NextRequest, NextResponse } from 'next/server';
import { query, getRow } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { datesOverlap, calculateCost } from '@/lib/bookingUtils';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role') || 'renter';

  let sql: string;
  let params: any[];

  if (auth.role === 'admin') {
    sql = `SELECT b.*, p.name as product_name, p.images, p.daily_price,
           renter.name as renter_name, owner.name as owner_name
           FROM bookings b
           JOIN products p ON b.product_id = p.id
           JOIN users renter ON b.renter_id = renter.id
           JOIN users owner ON b.owner_id = owner.id
           ORDER BY b.created_at DESC`;
    params = [];
  } else if (role === 'owner') {
    sql = `SELECT b.*, p.name as product_name, p.images, p.daily_price,
           renter.name as renter_name, renter.avatar as renter_avatar
           FROM bookings b
           JOIN products p ON b.product_id = p.id
           JOIN users renter ON b.renter_id = renter.id
           WHERE b.owner_id = ?
           ORDER BY b.created_at DESC`;
    params = [auth.id];
  } else {
    sql = `SELECT b.*, p.name as product_name, p.images, p.daily_price,
           owner.name as owner_name, owner.avatar as owner_avatar
           FROM bookings b
           JOIN products p ON b.product_id = p.id
           JOIN users owner ON b.owner_id = owner.id
           WHERE b.renter_id = ?
           ORDER BY b.created_at DESC`;
    params = [auth.id];
  }

  const bookings = await query(sql, params);
  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { product_id, start_date, end_date } = await req.json();

  if (!product_id || !start_date || !end_date) {
    return NextResponse.json({ error: 'Product, start date, and end date are required' }, { status: 400 });
  }

  if (new Date(start_date) < new Date(new Date().toISOString().split('T')[0])) {
    return NextResponse.json({ error: 'Start date cannot be in the past' }, { status: 400 });
  }

  if (new Date(end_date) < new Date(start_date)) {
    return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
  }

  const product = await getRow(
    'SELECT p.*, u.id as owner_id FROM products p JOIN users u ON p.owner_id = u.id WHERE p.id = ? AND p.status = ?',
    [product_id, 'approved']
  );

  if (!product) {
    return NextResponse.json({ error: 'Product not found or not available' }, { status: 404 });
  }

  if ((product as any).owner_id === auth.id) {
    return NextResponse.json({ error: 'You cannot rent your own product' }, { status: 400 });
  }

  /**
   * BOOKING CONFLICT PREVENTION ALGORITHM
   *
   * Step 1: Fetch all approved/pending bookings for this product
   * Step 2: Check if any existing booking overlaps with the requested dates
   * Step 3: If overlap found, reject the booking
   *
   * Overlap condition: (StartA <= EndB) AND (StartB <= EndA)
   */
  const existingBookings = await query(
    `SELECT start_date, end_date FROM bookings
     WHERE product_id = ? AND status IN ('approved', 'pending')`,
    [product_id]
  );

  for (const booking of existingBookings as any[]) {
    const existingStart = booking.start_date instanceof Date
      ? booking.start_date.toISOString().split('T')[0]
      : booking.start_date;
    const existingEnd = booking.end_date instanceof Date
      ? booking.end_date.toISOString().split('T')[0]
      : booking.end_date;

    if (datesOverlap(start_date, end_date, existingStart, existingEnd)) {
      return NextResponse.json({
        error: 'This product is already booked for the selected dates. Please choose different dates.',
      }, { status: 409 });
    }
  }

  const { totalDays, totalCost } = calculateCost(
    parseFloat((product as any).daily_price),
    (product as any).weekly_price ? parseFloat((product as any).weekly_price) : null,
    start_date,
    end_date
  );

  const COMMISSION_RATE = 0.05;
  const commission = Math.round(totalCost * COMMISSION_RATE * 100) / 100;

  await query(
    `INSERT INTO bookings (product_id, renter_id, owner_id, start_date, end_date, total_days, total_cost, commission, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [product_id, auth.id, (product as any).owner_id, start_date, end_date, totalDays, totalCost, commission]
  );

  return NextResponse.json({ success: true, totalDays, totalCost, commission, message: 'Booking request sent to owner' });
}
