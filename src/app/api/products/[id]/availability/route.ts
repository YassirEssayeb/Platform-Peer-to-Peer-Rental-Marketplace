import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Booking Conflict Prevention Algorithm
 *
 * Returns all booked date ranges for a product so the frontend
 * can grey them out on the calendar.
 *
 * The conflict check: two ranges [rs, re] and [es, ee] overlap
 * when rs <= ee AND es <= re.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const bookings = await query(
    `SELECT start_date, end_date FROM bookings
     WHERE product_id = ? AND status IN ('approved', 'pending')
     ORDER BY start_date ASC`,
    [id]
  );

  const bookedRanges = (bookings as any[]).map((b) => ({
    start: b.start_date instanceof Date ? b.start_date.toISOString().split('T')[0] : b.start_date,
    end: b.end_date instanceof Date ? b.end_date.toISOString().split('T')[0] : b.end_date,
  }));

  const bookedDates: string[] = [];
  for (const range of bookedRanges) {
    const start = new Date(range.start);
    const end = new Date(range.end);
    const current = new Date(start);
    while (current <= end) {
      bookedDates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
  }

  return NextResponse.json({ bookedDates, bookedRanges });
}
